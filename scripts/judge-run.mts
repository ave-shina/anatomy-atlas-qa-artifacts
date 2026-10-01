/**
 * LLM-as-judge for citation validity and faithfulness (02-protokol-evaluasi.md §2.2),
 * plus a manual-verification sheet for the human spot-check (≥20%).
 *
 * For each item/condition it takes the first non-errored generation, reconstructs
 * the cited chunks from the LOCAL pack (by docId:chunkIndex), and asks a judge
 * model for strict JSON. Nothing is fabricated: chunks come from the pack, the
 * answer/citations come from the run.
 *
 * Outputs into the run dir:
 *   judge.jsonl                 per-item judge verdicts (appended per item —
 *                               a killed cell resumes: ids already present are
 *                               skipped, prior error rows are re-judged)
 *   judge.metrics.json          mean citation validity + faithfulness (+ CI);
 *                               written only at the end = cell-complete marker
 *   manual-verification.csv     empty human columns for the ≥20% audit
 *
 * If judge.metrics.json already exists the cell is complete: the run is a
 * no-op (delete both files to force a re-judge).
 *
 * Usage (from apps/frontend):
 *   pnpm exec tsx scripts/judge-run.mts --run pilot-f50 [--condition B3] \
 *     [--judge-model openai/gpt-4o-mini] [--limit 0] [--sample 0.2]
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
const RUN = arg("run")!;
const COND = arg("condition", "B3")!;
const JUDGE_MODEL = arg("judge-model", "openai/gpt-4o-mini")!;
/** Optional filename suffix so a second judge can co-exist (multi-judge panel). */
const SUFFIX = arg("suffix", "") ?? "";
const LIMIT = Number(arg("limit", "0"));
const SAMPLE = Number(arg("sample", "0.2"));
if (!RUN) { console.error("Need --run <run-id>."); process.exit(2); }

const RUN_DIR = path.join(REPO, "research", "runs", RUN);
const env: Record<string, string> = {};
for (const line of fs.readFileSync(path.join(APP, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY ?? env.OPENROUTER_API_KEY ?? "";

// --- local pack → chunk text by id ------------------------------------------
const PACK = path.join(APP, "public/starter-pack/medrag-anatomy_gray.ndjson");
const chunkText = new Map<string, string>();
{
  const lines = fs.readFileSync(PACK, "utf8").split("\n");
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const d = JSON.parse(lines[i]) as { id: string; m: { text?: string } };
    chunkText.set(d.id, String(d.m?.text ?? ""));
  }
}

const judge = new ChatOpenAI({
  model: JUDGE_MODEL,
  apiKey: OPENROUTER_KEY,
  temperature: 0,
  maxRetries: 2,
  configuration: { baseURL: "https://openrouter.ai/api/v1" },
});

const SYSTEM = `You are a strict evaluator for a grounded anatomy question-answering system.
You are given a QUESTION, the system ANSWER, and the numbered CONTEXT chunks the answer cited.
Judge ONLY whether the cited passages support the answer's claims. Do not use outside knowledge to excuse a claim.

Return ONLY minified JSON, no prose, matching exactly:
{"citations":[{"n":<int>,"valid":<bool>,"reason":"<short>"}],"faithfulness":<1-5>,"unsupported":["<claim>", ...]}

Rules:
- For every citation number that appears in the answer, decide if its cited chunk supports the sentence(s) that carry that citation.
- faithfulness 5 = every factual claim is supported by the cited context; 1 = mostly unsupported.
- "unsupported" lists factual claims with no supporting cited context (empty array if none).`;

type Item = {
  id: string; type: string; system: string; query: string;
  retrieval?: { retrieved?: string[] };
  conditions: Record<string, {
    error: string | null; answer: string;
    citations: { n: number; docId: string; page: number; snippet: string }[];
  }[]>;
};
const items: Item[] = fs
  .readFileSync(path.join(RUN_DIR, "items.jsonl"), "utf8")
  .split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
const selected = LIMIT > 0 ? items.slice(0, LIMIT) : items;

function buildPrompt(it: Item, rep: Item["conditions"][string][number]) {
  // citations carry no chunk id; in B3 (no clarification) citation [n] is the
  // chunk at retrieval rank n, so reconstruct full text from the local pack.
  const retrieved = it.retrieval?.retrieved ?? [];
  const ctx = rep.citations
    .map((c) => {
      const fullId = retrieved[c.n - 1];
      const text = fullId ? chunkText.get(fullId) ?? "" : "";
      return `[${c.n}] (source ${c.docId}, page ${c.page})\n${text || c.snippet}`;
    })
    .join("\n\n---\n\n");
  return `QUESTION: ${it.query}\n\nANSWER:\n${rep.answer}\n\nCITED CONTEXT:\n${ctx || "(none)"}`;
}

// --- resumable per-item output ----------------------------------------------
const JSONL_PATH = path.join(RUN_DIR, `judge${SUFFIX}.jsonl`);
const METRICS_PATH = path.join(RUN_DIR, `judge${SUFFIX}.metrics.json`);
if (fs.existsSync(METRICS_PATH)) {
  console.log(`cell already complete (${METRICS_PATH}); no-op. Delete it (and the .jsonl) to force a re-judge.`);
  process.exit(0);
}

// Rows from a previous partial run count as done — except error rows, which
// get re-judged (a fresh row replaces them in the file; the stale line is
// dropped below so metrics never double-count an id).
type JudgeRow = {
  id?: string; type?: string; system?: string;
  citation_validity?: number | null; citations_judged?: number;
  faithfulness?: number | null; unsupported?: string[];
  verdicts?: { n: number; valid: boolean; reason?: string }[];
  skipped?: boolean; reason?: string; error?: string; raw?: string;
};
const rows: JudgeRow[] = [];
if (fs.existsSync(JSONL_PATH)) {
  for (const line of fs.readFileSync(JSONL_PATH, "utf8").split("\n")) {
    if (!line.trim()) continue;
    const r = JSON.parse(line) as { id?: string; error?: string };
    if (r.error) continue;
    rows.push(r);
  }
  console.log(`resume: ${rows.length} rows already judged in ${path.basename(JSONL_PATH)}`);
}
fs.writeFileSync(JSONL_PATH, rows.map((r) => JSON.stringify(r)).join("\n") + (rows.length ? "\n" : ""));
const doneIds = new Set(rows.map((r) => r.id).filter(Boolean) as string[]);

for (const [i, it] of selected.entries()) {
  if (doneIds.has(it.id)) continue;
  const rep = (it.conditions[COND] ?? []).find((r) => !r.error);
  if (!rep || !rep.answer.trim() || rep.citations.length === 0) {
    rows.push({ id: it.id, skipped: true, reason: !rep ? "no successful generation" : rep.citations.length ? "empty answer" : "no citations" });
    fs.appendFileSync(JSONL_PATH, JSON.stringify(rows[rows.length - 1]) + "\n");
    process.stdout.write(`\r${i + 1}/${selected.length} ${it.id} (skipped)          `);
    continue;
  }
  let parsed: { citations?: { n: number; valid: boolean; reason?: string }[]; faithfulness?: number; unsupported?: string[] } | null = null;
  let raw = "";
  try {
    const res = await judge.invoke([["system", SYSTEM], ["human", buildPrompt(it, rep)]]);
    raw = String(res.content);
    const json = raw.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    parsed = JSON.parse(json.slice(json.indexOf("{"), json.lastIndexOf("}") + 1));
  } catch (e) {
    rows.push({ id: it.id, error: e instanceof Error ? e.message : String(e), raw: raw.slice(0, 200) });
    fs.appendFileSync(JSONL_PATH, JSON.stringify(rows[rows.length - 1]) + "\n");
    process.stdout.write(`\r${i + 1}/${selected.length} ${it.id} (judge error)          `);
    continue;
  }
  const valid = parsed?.citations?.filter((c) => c.valid).length ?? 0;
  const total = parsed?.citations?.length ?? 0;
  rows.push({
    id: it.id, type: it.type, system: it.system,
    citation_validity: total ? valid / total : null,
    citations_judged: total,
    faithfulness: parsed?.faithfulness ?? null,
    unsupported: parsed?.unsupported ?? [],
    verdicts: parsed?.citations ?? [],
  });
  fs.appendFileSync(JSONL_PATH, JSON.stringify(rows[rows.length - 1]) + "\n");
  process.stdout.write(`\r${i + 1}/${selected.length} ${it.id}                    `);
}
process.stdout.write("\n");

const scored = rows.filter((r) => (r as { citation_validity?: number | null }).citation_validity !== undefined &&
  (r as { citation_validity?: number | null }).citation_validity !== null && !(r as { skipped?: boolean }).skipped) as {
  citation_validity: number; faithfulness: number | null;
}[];
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const cv = scored.map((r) => r.citation_validity);
const ff = scored.map((r) => r.faithfulness).filter((x): x is number => x !== null);
// totals over ALL rows (resumed + this session), not just the newly appended
const totalJudged = rows.filter((r) => !r.skipped && r.error === undefined).length;
const totalFailed = rows.filter((r) => r.error !== undefined).length;
const totalSkipped = rows.filter((r) => r.skipped).length;

fs.writeFileSync(
  METRICS_PATH,
  JSON.stringify({
    runId: RUN, condition: COND, judgeModel: JUDGE_MODEL,
    judged: totalJudged, failed: totalFailed, skipped: totalSkipped,
    citation_validity_mean: mean(cv), faithfulness_mean: mean(ff),
    note: "LLM judge; run the manual-verification.csv audit (>=20%) before reporting.",
  }, null, 2) + "\n",
);

// manual-verification sheet: deterministic sample by item index
const human: string[] = ["item_id,type,system,citation_validity_judge,faithfulness_judge,citation_validity_human,faithfulness_human,notes"];
const n = Math.max(1, Math.ceil(selected.length * SAMPLE));
for (let i = 0; i < selected.length; i += Math.max(1, Math.floor(selected.length / n))) {
  const r = rows[i] as { id?: string; type?: string; system?: string; citation_validity?: number; faithfulness?: number };
  human.push([r.id ?? "", r.type ?? "", r.system ?? "", r.citation_validity ?? "", r.faithfulness ?? "", "", "", ""].join(","));
}
fs.writeFileSync(path.join(RUN_DIR, `manual-verification${SUFFIX}.csv`), human.join("\n") + "\n");

console.log(`judged=${totalJudged} failed=${totalFailed} skipped=${totalSkipped}`);
console.log(`citation_validity=${mean(cv).toFixed(3)}  faithfulness=${mean(ff).toFixed(3)}`);
console.log(`written: research/runs/${RUN}/{judge${SUFFIX}.jsonl,judge${SUFFIX}.metrics.json,manual-verification${SUFFIX}.csv}`);
