#!/usr/bin/env node
/**
 * Fill curation45-decisions.csv from the GLM-5.3 proposals (agent-filled).
 *
 * PROVENANCE: these rows are AGENT-proposed decisions (source: glm-5.3 top pick
 * or its none_adequate verdict, adjudicated by the coding agent). The author
 * reviewed the blind worksheet and approved in bulk; this is NOT a recorded
 * per-item blind human decision. The `author_override` column lets the author
 * change any row after the reveal; `prescreen_agreement` is filled at reveal.
 *
 * Deterministic rules:
 *   picks[0] is one of the old gold chunk ids -> keep_current (v1 set already
 *       contains it; GLM re-endorsed the old gold)
 *   picks[0] is a new candidate            -> chunk, chosen = picks[0].chunk_id
 *   picks empty && none_adequate           -> none
 *   picks empty && !none_adequate          -> keep_current if old adequacy in
 *       {adequate, partial} else none (flag: glm_gap)
 *   picks non-empty && none_adequate       -> resolve as picks, flag glm_contradiction
 *   none + relation-arbitrariness note     -> flag consider_item_flawed
 *
 * Output: curation45-decisions.csv (overwrites), gold-v2-chunk45.patch.json
 * Usage: node fill-decisions.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const props = JSON.parse(fs.readFileSync(path.join(HERE, "proposals-glm53.json"), "utf8"));
const items = JSON.parse(fs.readFileSync(path.join(HERE, "weak45.items.json"), "utf8"));
const oldById = new Map(items.map((i) => [i.id, i]));

const FILLED_BY = "agent(harness:glm-5.3-flash)";
const SOURCE = "glm-5.3-proposal+agent-adjudication; author bulk-approved after reading worksheet";

const rows = [];
const patch = [];
for (const it of props.results) {
  const v1 = it.old_gold_chunk_ids;
  const v1Set = new Set(v1);
  let decision, chosen = "", note = it.note ?? "", flag = "";
  const picks = it.picks ?? [];
  const pickIsOld = picks.length > 0 && v1Set.has(picks[0].chunk_id);

  if (picks.length > 0 && pickIsOld) {
    decision = "keep_current";
    note = `GLM re-endorsed old gold id ${picks[0].chunk_id}: ${picks[0].reason}`;
    flag = "pick_is_old_chunk";
  } else if (picks.length > 0) {
    decision = "chunk";
    chosen = picks[0].chunk_id;
    note = picks[0].reason;
  } else if (it.none_adequate) {
    decision = "none";
    flag = /relation|link|both structures|unrelated/i.test(note) ? "consider_item_flawed" : "";
  } else if (["adequate", "partial"].includes(it.old_top_adequacy)) {
    decision = "keep_current";
    note = `GLM: old top ${it.old_top_adequacy} — ${it.old_top_reason}`;
    flag = "glm_gap";
  } else {
    decision = "none";
    flag = "glm_gap";
  }
  if (picks.length > 0 && it.none_adequate) flag = [flag, "glm_contradiction"].filter(Boolean).join("+");

  rows.push({ item_id: it.item_id, decision, chosen_chunk_id: chosen, notes: note, flag });
  const v2 =
    decision === "chunk" ? [chosen]
    : decision === "none" ? []
    : v1; // keep_current
  patch.push({
    item_id: it.item_id,
    decision,
    v1_gold_chunk_ids: v1,
    v2_gold_chunk_ids: v2,
    flag,
    rationale: note,
  });
}

const csv = ["item_id,decision,chosen_chunk_id,notes,flag,filled_by,source,prescreen_agreement,author_override"];
for (const r of rows) {
  const esc = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;
  csv.push(
    [r.item_id, r.decision, r.chosen_chunk_id, esc(r.notes), r.flag, FILLED_BY, esc(SOURCE), "", ""].join(","),
  );
}
fs.writeFileSync(path.join(HERE, "curation45-decisions.csv"), csv.join("\n") + "\n");

const out = {
  purpose:
    "curated45 gold v2 PATCH (draft) — agent-proposed decisions, author bulk-approved. Apply only after author confirms; v1 ndjson stays frozen.",
  date: new Date().toISOString(),
  decisions_csv: "curation45-decisions.csv",
  provenance: { filled_by: FILLED_BY, source: SOURCE },
  scope: "gold_chunk_ids only — queries, structures, briefs untouched",
  items: patch,
};
fs.writeFileSync(path.join(HERE, "gold-v2-chunk45.patch.json"), JSON.stringify(out, null, 2) + "\n");

const dist = rows.reduce((m, r) => ((m[r.decision] = (m[r.decision] ?? 0) + 1), m), {});
const flags = rows.reduce((m, r) => (r.flag ? ((m[r.flag] = (m[r.flag] ?? 0) + 1), m) : m), {});
console.log(`decisions filled: ${rows.length} | distribution: ${JSON.stringify(dist)}`);
console.log(`flags: ${JSON.stringify(flags)}`);
console.log(`patch: gold-v2-chunk45.patch.json (${patch.filter((p) => JSON.stringify(p.v1_gold_chunk_ids) !== JSON.stringify(p.v2_gold_chunk_ids)).length} items changed)`);
