/**
 * LLM review panel for the gold benchmark (docs/05-rencana-evaluasi-ulang-trio.md T1).
 *
 * Reads the FROZEN review packet (review/gold-packet.jsonl, 100 items, includes the
 * B3 answer of final-mini-r3 as context — deliberate: the packet is the fixed input,
 * the verdict judges the GOLD/QUERY, not the answer) and asks one reviewer model for
 * strict JSON verdicts per item. Run once per panel member; aggregate with
 * aggregate-review.mts.
 *
 * Outputs (research/benchmark/review/):
 *   gold-verdicts-<label>.csv           header: item_id,must_ok,optional_ok,query_ok,notes
 *   gold-verdicts-<label>.raw.jsonl     per-item parsed JSON + errors (resume sidecar)
 *
 * Notes column reuses the v1 token vocabulary so counts stay comparable:
 * weak_gold_chunk, no_gold_chunk, arbitrary_pair.
 *
 * Usage (from apps/frontend):
 *   pnpm exec tsx scripts/run-review.mts --reviewer-model z-ai/glm-5.3-flash \
 *     [--label glm] [--out path.csv] [--limit 0] [--review-dir research/benchmark/review] [--packet gold-packet.jsonl]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ChatOpenAI } from "@langchain/openai";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, "..");
const REPO = path.resolve(HERE, "..", "..", "..");

const argv = process.argv.slice(2);
const arg = (name: string, def?: string): string | undefined => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const REVIEWER_MODEL = arg("reviewer-model")!;
const LABEL = arg("label") ?? REVIEWER_MODEL.split("/").pop()!.replace(/[^a-z0-9.-]/gi, "");
const REVIEW_DIR = path.resolve(REPO, arg("review-dir", "research/benchmark/review"));
const PACKET = path.resolve(REVIEW_DIR, arg("packet", "gold-packet.jsonl"));
const OUT = arg("out") ?? path.join(REVIEW_DIR, `gold-verdicts-${LABEL}.csv`);
const LIMIT = Number(arg("limit", "0"));
const MAX_TOKENS = Number(arg("max-tokens", "0")) || undefined;
if (!REVIEWER_MODEL) { console.error("Need --reviewer-model <slug>."); process.exit(2); }
fs.mkdirSync(REVIEW_DIR, { recursive: true });

const RAW_PATH = path.join(REVIEW_DIR, `gold-verdicts-${LABEL}.raw.jsonl`);
const env: Record<string, string> = {};
for (const line of fs.readFileSync(path.join(APP, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY ?? env.OPENROUTER_API_KEY ?? "";

const reviewer = new ChatOpenAI({
  model: REVIEWER_MODEL,
  apiKey: OPENROUTER_KEY,
  temperature: 0,
  maxRetries: 2,
  maxTokens: MAX_TOKENS, // verdict JSON is <300 tokens; a low cap avoids 402 "can only afford N tokens" on low credit
  modelKwargs: {
    // reasoning models (e.g. glm-5.3-flash since Oct 2026) otherwise burn the whole
    // token budget on reasoning and return empty content; exclude keeps content clean
    reasoning: { effort: "low", exclude: true },
  },
  configuration: { baseURL: "https://openrouter.ai/api/v1" },
});

const SYSTEM = `You are a strict reviewer verifying a benchmark question bank for a grounded anatomy QA system.
Each item gives: the QUERY (plus prior conversation HISTORY when present), the GOLD structures the generator marked as required ("gold must") and acceptable extras ("gold optional"), a GOLD reference-answer BRIEF, the GOLD retrieval CHUNK the item was built from, and — fixed context, NOT under review — the ANSWER and CHIPS of a reference RAG system.

Judge the GOLD and the QUERY only. Do not let the reference ANSWER influence your verdicts.

Decide three binary verdicts:
- must_ok: 1 if EVERY structure in "gold must" is a correct required target for the query (anatomy-correct and genuinely required by what is asked). 0 otherwise.
- optional_ok: 1 if the "gold optional" list is acceptable — extras plausibly related to the same passage/topic, none clearly wrong or unrelated. 1 when the list is empty.
- query_ok: 1 if the query is well-posed for its type: unambiguous and answerable as asked (F/R items), or a valid, resolvable ambiguity or a valid negative control (A items). 0 if garbled, unanswerable, or its target is unclear.

Also flag:
- weak_gold_chunk: 1 if the gold chunk relates only weakly to the query (e.g. a figure caption or mostly off-topic passage); else 0.
- no_gold_chunk: 1 if the gold chunk is empty/absent; else 0.
- arbitrary_pair: 1 for relational items whose structure pair is an arbitrary co-occurrence with no meaningful anatomical relationship; else 0.

Return ONLY minified JSON, no prose, matching exactly:
{"must_ok":<0|1>,"optional_ok":<0|1>,"query_ok":<0|1>,"weak_gold_chunk":<0|1>,"no_gold_chunk":<0|1>,"arbitrary_pair":<0|1>,"notes":"<short reason; required whenever any verdict or flag is 0/1-flagged>"}`;

type PacketItem = {
  id: string; type: string; system: string; query: string;
  history: { role: string; text: string }[] | null;
  gold_must: string[]; gold_optional: string[]; gold_brief: string;
  gold_chunk: string; answer: string; chips: string[];
};
const packet: PacketItem[] = fs
  .readFileSync(PACKET, "utf8")
  .split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
const selected = LIMIT > 0 ? packet.slice(0, LIMIT) : packet;

type Verdict = {
  must_ok?: number; optional_ok?: number; query_ok?: number;
  weak_gold_chunk?: number; no_gold_chunk?: number; arbitrary_pair?: number;
  notes?: string;
};
const done = new Map<string, Verdict | { error: string }>();
if (fs.existsSync(RAW_PATH)) {
  for (const l of fs.readFileSync(RAW_PATH, "utf8").split("\n").filter(Boolean)) {
    const d = JSON.parse(l) as { id: string } & (Verdict | { error: string });
    done.set(d.id, d as Verdict | { error: string });
  }
}

function buildPrompt(it: PacketItem) {
  return [
    `QUERY: ${it.query}`,
    it.history ? `HISTORY: ${it.history.map((h) => `${h.role}: ${h.text}`).join(" | ")}` : null,
    `GOLD must=${JSON.stringify(it.gold_must)} optional=${JSON.stringify(it.gold_optional)}`,
    `BRIEF: ${it.gold_brief || "(none)"}`,
    `CHUNK: ${it.gold_chunk || "(none)"}`,
    `ANSWER(reference system, context only): ${it.answer || "(none)"}`,
    `CHIPS(reference system, context only): ${JSON.stringify(it.chips)}`,
    `ITEM TYPE: ${it.type} (F factual / R relational / A ambiguity-or-negative)`,
  ].filter(Boolean).join("\n");
}

const csvNote = (v: Verdict) => {
  const flags: string[] = [];
  if (v.weak_gold_chunk === 1) flags.push("weak_gold_chunk");
  if (v.no_gold_chunk === 1) flags.push("no_gold_chunk");
  if (v.arbitrary_pair === 1) flags.push("arbitrary_pair");
  const text = (v.notes ?? "").replace(/[\r\n;]+/g, " ").replace(/"/g, "'").trim();
  return [...flags, text].filter(Boolean).join("; ");
};

fs.writeFileSync(OUT, "item_id,must_ok,optional_ok,query_ok,notes\n");
const appendCsv = (rows: { id: string; v: Verdict | { error: string } }[]) => {
  const lines = rows.map(({ id, v }) => {
    if ("error" in v) return `${id},,,,REVIEW_ERROR: ${String(v.error).replace(/[\r\n]+/g, " ").slice(0, 120)}`;
    const q = (s?: number) => (s === 0 || s === 1 ? String(s) : "");
    return `${id},${q(v.must_ok)},${q(v.optional_ok)},${q(v.query_ok)},"${csvNote(v)}"`;
  });
  fs.appendFileSync(OUT, lines.join("\n") + "\n");
};

let ok = 0, failed = 0, resumed = 0;
const pending = selected.filter((it) => !done.has(it.id) || "error" in done.get(it.id)!);
resumed = selected.length - pending.length;
const fresh: { id: string; v: Verdict | { error: string } }[] = [];
const t0 = new Date();
for (const [i, it] of pending.entries()) {
  let verdict: Verdict | { error: string } = { error: "unattempted" };
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await reviewer.invoke([["system", SYSTEM], ["human", buildPrompt(it)]]);
      const raw = String(res.content).replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1)) as Verdict;
      const b = (x: unknown) => (x === 0 || x === 1 ? (x as number) : null);
      verdict = {
        must_ok: b(parsed.must_ok) ?? undefined,
        optional_ok: b(parsed.optional_ok) ?? undefined,
        query_ok: b(parsed.query_ok) ?? undefined,
        weak_gold_chunk: b(parsed.weak_gold_chunk) ?? 0,
        no_gold_chunk: b(parsed.no_gold_chunk) ?? 0,
        arbitrary_pair: b(parsed.arbitrary_pair) ?? 0,
        notes: String(parsed.notes ?? ""),
      };
      if (verdict.must_ok === undefined || verdict.optional_ok === undefined || verdict.query_ok === undefined) {
        throw new Error(`missing verdict field in: ${raw.slice(0, 120)}`);
      }
      break;
    } catch (e) {
      verdict = { error: e instanceof Error ? e.message : String(e) };
    }
  }
  if (!("error" in verdict)) ok++; else failed++;
  done.set(it.id, verdict);
  fresh.push({ id: it.id, v: verdict });
  fs.appendFileSync(RAW_PATH, JSON.stringify({ id: it.id, ...verdict }) + "\n");
  fs.writeFileSync(OUT, "item_id,must_ok,optional_ok,query_ok,notes\n");
  appendCsv(selected.filter((s) => done.has(s.id)).map((s) => ({ id: s.id, v: done.get(s.id)! })));
  process.stdout.write(`\r${i + 1}/${pending.length} ${it.id}${" ".repeat(20)}`);
}
process.stdout.write("\n");

const mins = ((Date.now() - t0.getTime()) / 60000).toFixed(1);
console.log(`reviewer=${REVIEWER_MODEL} label=${LABEL}`);
console.log(`reviewed=${ok} failed=${failed} resumed=${resumed} total=${selected.length} (${mins} min)`);
if (failed) console.log(`WARNING: ${failed} items have REVIEW_ERROR rows — rerun the script to retry them (resume skips successes).`);
console.log(`written: ${path.relative(REPO, OUT)}`);
console.log(`written: ${path.relative(REPO, RAW_PATH)}`);
