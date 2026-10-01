/**
 * Briefs v3 — re-harvest gold_answer_brief from FULLTEXT corpus chunks.
 *
 * Background: the original corpus pack stored chunk text capped at 400
 * characters, and enrich-benchmark.mjs harvested 244 gold_answer_briefs from
 * that capped text (marked with the "[auto] gold_answer_brief harvested"
 * note in the v1/v2 datasets). After the fulltext re-seed
 * (research/docs/06-corpus-fulltext-reseed.md) those briefs are re-harvested
 * from the same chunks' full text with the IDENTICAL algorithm
 * (bestSentence, word-overlap, ≤320 chars) — only the text source changes.
 *
 * FROZEN, never written by this script:
 *   research/benchmark/anatomy3d-qb.candidates.ndjson  (run dataset)
 *   research/benchmark/anatomy3d-qb.v1.ndjson          (released v1 set)
 *   research/benchmark/anatomy3d-qb.v2.ndjson          (run dataset, canonical)
 * The 48 briefs that came from anatomy.json descriptions (no [auto] note)
 * are copied through untouched.
 *
 * Usage (from apps/frontend, AFTER the fulltext re-seed):
 *   node scripts/reharvest-briefs-v3.mjs
 *   # --dataset / --pack / --out to override defaults
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
const DATASET = path.resolve(arg("dataset", path.join(BENCH, "anatomy3d-qb.v2.ndjson")));
const PACK = path.resolve(arg("pack", path.join(APP, "public/starter-pack/medrag-anatomy_gray.ndjson")));
const OUT = path.resolve(arg("out", path.join(BENCH, "gold-answer-briefs.v3.ndjson")));
/**
 * Items whose gold chunks the curated45 v2 patch removed still carry a brief
 * harvested (in v1) from their THEN-top gold chunk. Re-harvest those from the
 * same chunk's fulltext — the patch file records every v1 gold chunk list.
 */
const PATCH_FILE = path.resolve(arg("patch", path.join(BENCH, "curation45/gold-v2-chunk45.patch.json")));

// --- identical to enrich-benchmark.mjs; keep in sync ------------------------
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

// --- pack chunk text by id (fulltext after the re-seed) ---------------------
const header = JSON.parse(fs.readFileSync(PACK, "utf8").split("\n")[0]);
const chunkText = new Map();
{
  const lines = fs.readFileSync(PACK, "utf8").split("\n");
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const d = JSON.parse(lines[i]);
    chunkText.set(d.id, String(d.m?.text ?? ""));
  }
}

// display lookup from anatomy.json (current vocabulary)
const anatomy = JSON.parse(fs.readFileSync(path.join(APP, "src/data/anatomy.json"), "utf8"));
const structures = Array.isArray(anatomy) ? anatomy : (anatomy.structures ?? []);
const canon = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const displayByKey = new Map();
for (const s of structures) { const k = canon(s?.name); if (k && !displayByKey.has(k)) displayByKey.set(k, s.name); }

const items = fs.readFileSync(DATASET, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));

const patch = JSON.parse(fs.readFileSync(PATCH_FILE, "utf8"));
const v1ChunksById = new Map(patch.items.map((p) => [p.item_id, p.v1_gold_chunk_ids ?? []]));

const AUTO_NOTE = "[auto] gold_answer_brief harvested";
let reharvested = 0, changed = 0, descKept = 0, missingChunk = 0;
const rows = [];
for (const it of items) {
  const isAuto = (it.notes ?? "").includes(AUTO_NOTE);
  if (!isAuto) {
    // description-derived (or null) brief — frozen as-is
    if (it.gold_answer_brief) descKept++;
    rows.push({
      id: it.id,
      type: it.type,
      gold_answer_brief: it.gold_answer_brief ?? null,
      brief_source: it.gold_answer_brief ? "v1-desc-unchanged" : "none",
      changed: false,
    });
    continue;
  }
  const chunkId = it.gold_chunk_ids?.[0] ?? v1ChunksById.get(it.id)?.[0];
  const text = chunkText.get(chunkId);
  if (text === undefined) { missingChunk++; console.error(`missing chunk ${chunkId} for ${it.id}`); continue; }
  const display = displayByKey.get(it.gold_structures_must?.[0]) ?? it.gold_structures_must?.[0];
  const brief = bestSentence(text, display ?? "");
  const isChanged = brief !== it.gold_answer_brief;
  if (isChanged) changed++;
  reharvested++;
  rows.push({
    id: it.id,
    type: it.type,
    gold_answer_brief: brief,
    brief_source: it.gold_chunk_ids?.[0]
      ? "v3-fulltext-reharvest"
      : "v3-fulltext-reharvest-v1chunk",
    changed: isChanged,
  });
}

fs.writeFileSync(OUT, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
console.log(`pack header        : model=${header.model} dim=${header.dim} count=${header.count}`);
console.log(`items              : ${items.length}`);
console.log(`re-harvested       : ${reharvested} (changed: ${changed}, unchanged: ${reharvested - changed})`);
console.log(`desc briefs kept   : ${descKept}`);
console.log(`missing chunks     : ${missingChunk}${missingChunk ? "  (NOT written — fix before use)" : ""}`);
console.log(`written            : ${path.relative(REPO, OUT)}`);
