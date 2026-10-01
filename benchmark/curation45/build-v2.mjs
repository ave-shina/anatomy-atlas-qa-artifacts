#!/usr/bin/env node
/**
 * Emit anatomy3d-qb.v2.ndjson: the v1 benchmark with curated45 gold v2 applied
 * (gold_chunk_ids only; everything else byte-identical content, plus a
 * status/notes annotation on the 45 touched items). v1 stays frozen.
 *
 * Usage: node build-v2.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BENCH = path.dirname(HERE);
const patch = JSON.parse(fs.readFileSync(path.join(HERE, "gold-v2-chunk45.patch.json"), "utf8"));
const pById = new Map(patch.items.map((p) => [p.item_id, p]));

const out = [];
for (const line of fs.readFileSync(path.join(BENCH, "anatomy3d-qb.v1.ndjson"), "utf8").split("\n")) {
  if (!line.trim()) continue;
  const it = JSON.parse(line);
  const p = pById.get(it.id);
  if (p) {
    it.gold_chunk_ids = p.v2_gold_chunk_ids;
    it.status = "curated45_v2";
    it.notes = `${it.notes || ""} [curated45 v2 2026-09-26] gold_chunk_ids ${p.decision}${p.v2_gold_chunk_ids.length ? " -> " + p.v2_gold_chunk_ids.join(",") : " (none)"}; ${p.rationale}`.trim();
  }
  out.push(JSON.stringify(it));
}
fs.writeFileSync(path.join(BENCH, "anatomy3d-qb.v2.ndjson"), out.join("\n") + "\n");
console.log(`anatomy3d-qb.v2.ndjson written: ${out.length} items, ${patch.items.length} touched`);
