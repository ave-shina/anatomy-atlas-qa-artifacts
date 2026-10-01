#!/usr/bin/env node
/**
 * Apply the author's at-reveal rulings to curation45-decisions.csv and rebuild
 * gold-v2-chunk45.patch.json (final) from the CSV as source of truth.
 *
 * Rulings (2026-09-26, after seeing chunk texts; "setuju semua"):
 *   A-skeletal-001      none -> chunk medrag-anatomy_gray:1537
 *   F-fasciae-004       none -> chunk medrag-anatomy_gray:1880
 *   F-regions-011       none -> chunk medrag-anatomy_gray:2417
 *   F-cardiovascular-004 keep_current -> none
 *   F-visceral-001      chunk:2626 -> none
 *
 * Usage: node apply-overrides.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

const RULINGS = {
  "A-skeletal-001": { decision: "chunk", chosen_chunk_id: "medrag-anatomy_gray:1537" },
  "F-fasciae-004": { decision: "chunk", chosen_chunk_id: "medrag-anatomy_gray:1880" },
  "F-regions-011": { decision: "chunk", chosen_chunk_id: "medrag-anatomy_gray:2417" },
  "F-cardiovascular-004": { decision: "none", chosen_chunk_id: "" },
  "F-visceral-001": { decision: "none", chosen_chunk_id: "" },
};

const csvPath = path.join(HERE, "curation45-decisions.csv");
const lines = fs.readFileSync(csvPath, "utf8").split("\n").filter(Boolean);
const head = lines[0].split(",");
const parse = (line) => {
  const cols = line.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map((s) => s.replace(/,$/, ""));
  return Object.fromEntries(head.map((h, i) => [h, (cols[i] ?? "").replace(/^"|"$/g, "").replace(/""/g, '"')]));
};

const out = [head.join(",")];
let applied = 0;
for (const line of lines.slice(1)) {
  const o = parse(line);
  const r = RULINGS[o.item_id];
  if (r) {
    o.author_override = `2026-09-26: ${o.decision}${o.chosen_chunk_id ? ":" + o.chosen_chunk_id : ""} -> ${r.decision}${r.chosen_chunk_id ? ":" + r.chosen_chunk_id : ""} (author ruling after reading chunk texts)`;
    o.decision = r.decision;
    o.chosen_chunk_id = r.chosen_chunk_id;
    o.flag = (o.flag ? o.flag + "+" : "") + "author_ruling";
    applied++;
  }
  out.push(head.map((h) => `"${String(o[h] ?? "").replace(/"/g, '""')}"`).join(","));
}
fs.writeFileSync(csvPath, out.join("\n") + "\n");

// --- rebuild patch from CSV (source of truth) ---
const items = JSON.parse(fs.readFileSync(path.join(HERE, "weak45.items.json"), "utf8"));
const v1ById = new Map(items.map((i) => [i.id, i.gold_chunk_ids]));
const patch = [];
for (const line of out.slice(1)) {
  const o = parse(line);
  const v1 = v1ById.get(o.item_id);
  const v2 =
    o.decision === "chunk" ? [o.chosen_chunk_id]
    : o.decision === "none" ? []
    : v1; // keep_current
  patch.push({
    item_id: o.item_id,
    decision: o.decision,
    v1_gold_chunk_ids: v1,
    v2_gold_chunk_ids: v2,
    flag: o.flag,
    rationale: o.notes,
    author_override: o.author_override || null,
  });
}

fs.writeFileSync(
  path.join(HERE, "gold-v2-chunk45.patch.json"),
  JSON.stringify(
    {
      purpose: "curated45 gold v2 PATCH — FINAL. Applied to anatomy3d-qb.v1.ndjson gold_chunk_ids only.",
      date: "2026-09-26",
      provenance:
        "flags from consensus review v1.1; candidates = top-8 text-embedding-3-small retrieval; proposals = z-ai/glm-5.3 (temp 0, advisory, in-family disclosure); pre-screen = coding agent harness glm-5.3-flash (advisory, in-family); decisions agent-filled + author bulk-approved; 5 conflicts ruled by author after reading chunk texts (author_override column).",
      scope: "gold_chunk_ids only — queries, gold structures, briefs, expects_clarification untouched",
      stats: {
        items: patch.length,
        changed: patch.filter((p) => JSON.stringify(p.v1_gold_chunk_ids) !== JSON.stringify(p.v2_gold_chunk_ids)).length,
        decisions: patch.reduce((m, p) => ((m[p.decision] = (m[p.decision] ?? 0) + 1), m), {}),
      },
      items: patch,
    },
    null,
    2,
  ) + "\n",
);

console.log(`overrides applied: ${applied}`);
console.log(`patch FINAL rebuilt: ${patch.length} items`);
