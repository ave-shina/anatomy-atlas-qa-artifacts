/**
 * Apply the manual stand-in verdicts (review/standin-verdicts.json) to the
 * claude review artifacts, replacing ONLY the REVIEW_ERROR rows left by the
 * credit-exhausted API run (2026-09-22). Raw entries are stamped
 * source=agent-standin(harness:glm-5.3-flash) so the CSV notes and the
 * aggregator can distinguish API verdicts from stand-ins.
 *
 * Usage (from apps/frontend):
 *   node scripts/apply-standin-verdicts.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..", "..");
const REVIEW_DIR = path.join(REPO, "research", "benchmark", "review");
const RAW = path.join(REVIEW_DIR, "gold-verdicts-claude.raw.jsonl");
const CSV = path.join(REVIEW_DIR, "gold-verdicts-claude.csv");
const STANDIN = JSON.parse(fs.readFileSync(path.join(REVIEW_DIR, "standin-verdicts.json"), "utf8")).verdicts;

const rows = fs.readFileSync(RAW, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const last = new Map();
for (const r of rows) last.set(r.id, r);

const bad = Object.keys(STANDIN).filter((id) => {
  const cur = last.get(id);
  if (!cur) return true;
  // allow overwriting a REVIEW_ERROR row or a previous stand-in verdict; never an API verdict
  return !("error" in cur) && !(typeof cur.source === "string" && cur.source.startsWith("agent-standin"));
});
if (bad.length) {
  console.error(`REFUSING: these ids hold API verdicts or are missing (not overwritable): ${bad.join(", ")}`);
  process.exit(1);
}

const stamped = Object.entries(STANDIN).map(([id, v]) => ({ id, source: "agent-standin(harness:glm-5.3-flash)", ...v }));
for (const v of stamped) last.set(v.id, v);

// raw: replace the error rows in place, keep original order of first appearance
const order = [...new Set(rows.map((r) => r.id))];
const errs = new Map(stamped.map((v) => [v.id, v]));
fs.writeFileSync(RAW, order.map((id) => JSON.stringify(errs.get(id) ?? last.get(id))).join("\n") + "\n");

// csv: rebuild exactly like run-review.mts
const csvNote = (v) => {
  const flags = [];
  if (v.weak_gold_chunk === 1) flags.push("weak_gold_chunk");
  if (v.no_gold_chunk === 1) flags.push("no_gold_chunk");
  if (v.arbitrary_pair === 1) flags.push("arbitrary_pair");
  const text = (v.notes ?? "").replace(/[\r\n;]+/g, " ").replace(/"/g, "'").trim();
  return [...flags, text].filter(Boolean).join("; ");
};
const q = (s) => (s === 0 || s === 1 ? String(s) : "");
fs.writeFileSync(CSV, "item_id,must_ok,optional_ok,query_ok,notes\n");
fs.appendFileSync(CSV, order.map((id) => {
  const v = last.get(id);
  if ("error" in v) return `${id},,,,REVIEW_ERROR: ${String(v.error).replace(/[\r\n]+/g, " ").slice(0, 120)}`;
  return `${id},${q(v.must_ok)},${q(v.optional_ok)},${q(v.query_ok)},"${csvNote(v)}"`;
}).join("\n") + "\n");

console.log(`applied ${stamped.length} stand-in verdicts; raw+csv rewritten (${order.length} items)`);
