/**
 * Build a focused review packet for gold verification.
 *
 * For a stratified sample of items it prints: the query, gold structures, an
 * excerpt of the top gold chunk, and the system (B3) answer + chips. A verifier
 * reads this and fills review/gold-verdicts.csv. This is the "review kit" the
 * human/LLM verifier works from — it does not decide anything by itself.
 *
 * Usage (from apps/frontend):
 *   node scripts/review-packet.mjs --run final-mini-r3 [--per-type-f 50 --per-type-r 25 --per-type-a 25]
 *     [--dataset research/benchmark/anatomy3d-qb.v1.ndjson] [--out-dir research/benchmark/review]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, "..");
const REPO = path.resolve(APP, "..", "..");

const argv = process.argv.slice(2);
const arg = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const RUN = arg("run", "final-mini-r3");
const PER_F = Number(arg("per-type-f", "50"));
const PER_R = Number(arg("per-type-r", "25"));
const PER_A = Number(arg("per-type-a", "25"));
const DATASET = path.resolve(REPO, arg("dataset", "research/benchmark/anatomy3d-qb.v1.ndjson"));
const OUT_DIR = path.resolve(REPO, arg("out-dir", "research/benchmark/review"));
fs.mkdirSync(OUT_DIR, { recursive: true });

// pack chunk text
const PACK = path.join(APP, "public/starter-pack/medrag-anatomy_gray.ndjson");
const chunkText = new Map();
{
  const lines = fs.readFileSync(PACK, "utf8").split("\n");
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const d = JSON.parse(lines[i]);
    chunkText.set(d.id, String(d.m?.text ?? ""));
  }
}

const items = fs.readFileSync(DATASET, "utf8")
  .split("\n").filter(Boolean).map((l) => JSON.parse(l));

const runItems = new Map(
  fs.readFileSync(path.join(REPO, "research/runs", RUN, "items.jsonl"), "utf8")
    .split("\n").filter(Boolean).map((l) => { const d = JSON.parse(l); return [d.id, d]; }),
);

function evenSample(arr, n) {
  if (arr.length <= n) return arr;
  const step = arr.length / n;
  const out = [];
  for (let i = 0; i < n; i++) out.push(arr[Math.floor(i * step)]);
  return out;
}
const byType = { F: [], R: [], A: [] };
for (const it of items) byType[it.type].push(it);
byType.A.sort((a, b) => Number(!!a.expects_clarification) - Number(!!b.expects_clarification));

const sample = [
  ...evenSample(byType.F, PER_F),
  ...evenSample(byType.R, PER_R),
  ...evenSample(byType.A, PER_A),
];

const clip = (s, n) => { s = String(s ?? "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n) + "…" : s; };

const packet = [];
for (const it of sample) {
  const rec = runItems.get(it.id);
  const b3 = rec?.conditions?.B3?.find((r) => !r.error);
  const chunkId = it.gold_chunk_ids?.[0];
  packet.push({
    id: it.id, type: it.type, system: it.system,
    query: it.query,
    history: it.history ?? null,
    gold_must: it.gold_structures_must,
    gold_optional: it.gold_structures_optional,
    gold_brief: it.gold_answer_brief,
    gold_chunk: clip(chunkText.get(chunkId) ?? "", 700),
    answer: clip(b3?.answer ?? "", 700),
    chips: b3?.chip_keys ?? [],
  });
}

fs.writeFileSync(path.join(OUT_DIR, "gold-packet.jsonl"), packet.map((p) => JSON.stringify(p)).join("\n") + "\n");
fs.writeFileSync(path.join(OUT_DIR, "gold-verdicts.template.csv"),
  ["item_id,must_ok,optional_ok,query_ok,notes"].concat(sample.map((it) => `${it.id},,,,`)).join("\n") + "\n");

// readable text
const txt = packet.map((p, i) =>
  `### [${i + 1}] ${p.id} (${p.type}/${p.system})\n` +
  `QUERY: ${p.query}\n` +
  (p.history ? `HISTORY: ${p.history.map((h) => `${h.role}: ${h.text}`).join(" | ")}\n` : "") +
  `GOLD must=${JSON.stringify(p.gold_must)} optional=${JSON.stringify(p.gold_optional)}\n` +
  `BRIEF: ${p.gold_brief ?? "(none)"}\n` +
  `CHUNK: ${p.gold_chunk || "(none)"}\n` +
  `ANSWER(B3): ${p.answer || "(none)"}\n` +
  `CHIPS(B3): ${JSON.stringify(p.chips)}\n`,
).join("\n");
fs.writeFileSync(path.join(OUT_DIR, "gold-packet.txt"), txt);

console.log(`sample n=${sample.length} (F ${Math.min(PER_F, byType.F.length)} R ${Math.min(PER_R, byType.R.length)} A ${Math.min(PER_A, byType.A.length)})`);
console.log(`written: ${path.join(OUT_DIR, "gold-packet.jsonl")}`);
console.log(`written: ${path.join(OUT_DIR, "gold-packet.txt")}`);
console.log(`written: ${path.join(OUT_DIR, "gold-verdicts.template.csv")}`);
