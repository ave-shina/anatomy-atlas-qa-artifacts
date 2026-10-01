#!/usr/bin/env node
/**
 * Extract the 45 weak-gold-chunk items flagged by the v1.1 consensus review
 * into a working set for the curated45 re-evaluation.
 *
 * Inputs (read-only):
 *   review/gold-verdicts-consensus.csv   — consensus notes flag `weak_gold_chunk`
 *   anatomy3d-qb.v1.ndjson               — frozen v1 benchmark items
 *   ../../apps/frontend/public/starter-pack/medrag-anatomy_gray.ndjson — corpus (for old chunk texts)
 *
 * Output:
 *   weak45.items.json — per item: id/type/system/query, gold structures,
 *                       old gold_chunk_ids, old top-chunk text, gold_answer_brief.
 *
 * Usage: node extract-weak45.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BENCH = path.dirname(HERE); // research/benchmark
const CORPUS = path.join(BENCH, "../../apps/frontend/public/starter-pack/medrag-anatomy_gray.ndjson");

const rows = fs
  .readFileSync(path.join(BENCH, "review/gold-verdicts-consensus.csv"), "utf8")
  .split("\n")
  .filter((l) => l.trim() && !l.startsWith("item_id,"))
  .map((l) => l.split(","));
const weakIds = rows.filter((r) => r[4] && r[4].includes("weak_gold_chunk")).map((r) => r[0]);
const nonUnanimous = new Set(
  rows.filter((r) => r[4] && r[4].includes("non_unanimous")).map((r) => r[0]),
);

const items = new Map();
for (const line of fs.readFileSync(path.join(BENCH, "anatomy3d-qb.v1.ndjson"), "utf8").split("\n")) {
  if (!line.trim()) continue;
  const it = JSON.parse(line);
  items.set(it.id, it);
}

// corpus text lookup (second line onward; first line is the header record)
const corpusText = new Map();
{
  const lines = fs.readFileSync(CORPUS, "utf8").split("\n");
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const c = JSON.parse(lines[i]);
    corpusText.set(c.id, c.m.text);
  }
}

const out = [];
const missing = [];
for (const id of weakIds) {
  const it = items.get(id);
  if (!it) {
    missing.push(id);
    continue;
  }
  out.push({
    id: it.id,
    type: it.type,
    system: it.system,
    query: it.query,
    gold_structures_must: it.gold_structures_must ?? [],
    gold_chunk_ids: it.gold_chunk_ids ?? [],
    gold_answer_brief: it.gold_answer_brief ?? "",
    non_unanimous: nonUnanimous.has(id),
    old_top_chunk_text: corpusText.get(it.gold_chunk_ids?.[0]) ?? null,
  });
}

out.sort((a, b) => a.id.localeCompare(b.id));
fs.writeFileSync(path.join(HERE, "weak45.items.json"), JSON.stringify(out, null, 2) + "\n");

const byType = out.reduce((m, x) => ((m[x.type] = (m[x.type] ?? 0) + 1), m), {});
const noChunks = out.filter((x) => !x.gold_chunk_ids.length).map((x) => x.id);
console.log(`weak45 items extracted: ${out.length}`);
console.log(`by type: ${JSON.stringify(byType)}`);
console.log(`non-unanimous (went to arbitration): ${out.filter((x) => x.non_unanimous).length}`);
console.log(`items with no gold_chunk_ids: ${noChunks.length ? noChunks.join(", ") : "none"}`);
console.log(`missing from v1 ndjson: ${missing.length ? missing.join(", ") : "none"}`);
