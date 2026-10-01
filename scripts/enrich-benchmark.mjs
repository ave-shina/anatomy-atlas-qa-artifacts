/**
 * Curation assist for Anatomy3D-QB: harvest a short reference answer for items
 * that have gold chunks, flag items needing review, and emit a curation
 * worksheet. Output stays schema-valid (only `gold_answer_brief` and `notes`
 * are filled); `gold_answer_brief` is a deterministic harvest (word overlap),
 * not model output. Verdicts are recorded by the AI-assisted review
 * (`research/benchmark/review/`, see PROVENANCE.md); human curation + κ remain
 * future work.
 *
 * Usage (from apps/frontend):
 *   node scripts/enrich-benchmark.mjs [--in <candidates.ndjson>] [--out <v1.ndjson>]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, "..");
const REPO = path.resolve(APP, "..", "..");
const BENCH = path.join(REPO, "research", "benchmark");

const argv = process.argv.slice(2);
const arg = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const IN = path.resolve(arg("in", path.join(BENCH, "anatomy3d-qb.candidates.ndjson")));
const OUT = path.resolve(arg("out", path.join(BENCH, "anatomy3d-qb.v1.ndjson")));
const CSV = OUT.replace(/\.ndjson$/, ".curation.csv");

// --- pack chunk text by id --------------------------------------------------
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

const items = fs.readFileSync(IN, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));

const words = (s) => (String(s ?? "").toLowerCase().match(/[a-z]{3,}/g) ?? []);
function bestSentence(text, display) {
  const sentences = text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length > 20);
  if (!sentences.length) return text.slice(0, 300).trim();
  const target = new Set(words(display));
  let best = sentences[0], bestScore = -1;
  for (const s of sentences) {
    const sw = words(s);
    const score = sw.filter((w) => target.has(w)).length / (sw.length || 1);
    if (score > bestScore) { best = s; bestScore = score; }
  }
  return best.length > 320 ? best.slice(0, 317) + "…" : best;
}

// display lookup from anatomy.json
const anatomy = JSON.parse(fs.readFileSync(path.join(APP, "src/data/anatomy.json"), "utf8"));
const structures = Array.isArray(anatomy) ? anatomy : (anatomy.structures ?? []);
const canon = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const displayByKey = new Map();
for (const s of structures) { const k = canon(s?.name); if (k && !displayByKey.has(k)) displayByKey.set(k, s.name); }

let enriched = 0, flagged = 0;
const rows = [["item_id", "type", "system", "query", "gold_must", "gold_optional", "gold_answer_brief", "n_gold_chunks", "flags"]];
for (const it of items) {
  const flags = [];
  if (!it.gold_chunk_ids?.length && it.gold_structures_must?.length) flags.push("no_gold_chunks");
  if (!it.gold_structures_optional?.length && it.gold_structures_must?.length) flags.push("no_optional");
  if (it.needs_curation) flags.push("needs_curation");
  if (it.expects_clarification) flags.push("clarification");

  if ((it.gold_answer_brief === null || it.gold_answer_brief === undefined) && it.gold_structures_must?.length && it.gold_chunk_ids?.length) {
    const text = chunkText.get(it.gold_chunk_ids[0]) ?? "";
    const display = displayByKey.get(it.gold_structures_must[0]) ?? it.gold_structures_must[0];
    const brief = bestSentence(text, display);
    if (brief) {
      it.gold_answer_brief = brief;
      it.notes = (it.notes ? it.notes + " " : "") + "[auto] gold_answer_brief harvested from top gold chunk; verify against corpus.";
      enriched++;
    }
  }
  if (flags.length) flagged++;
  rows.push([
    it.id, it.type, it.system, it.query,
    (it.gold_structures_must ?? []).join(" "), (it.gold_structures_optional ?? []).join(" "),
    it.gold_answer_brief ?? "", it.gold_chunk_ids?.length ?? 0, flags.join("|"),
  ]);
}

const csvField = (v) => `"${String(v).replace(/"/g, '""')}"`;
fs.writeFileSync(OUT, items.map((it) => JSON.stringify(it)).join("\n") + "\n");
fs.writeFileSync(CSV, rows.map((r) => r.map(csvField).join(",")).join("\n") + "\n");

console.log(`items=${items.length}  enriched_answer_brief=${enriched}  flagged=${flagged}`);
console.log(`written: ${path.relative(REPO, OUT)}`);
console.log(`written: ${path.relative(REPO, CSV)}`);
