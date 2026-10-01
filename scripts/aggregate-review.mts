/**
 * Aggregate the 3-reviewer gold-verdict panel into a consensus (docs/05
 * rencana-evaluasi-ulang-trio.md T1 step 2).
 *
 * Inputs  research/benchmark/review/gold-verdicts-{glm,deepseek,qwen}.csv
 *         research/benchmark/review/gold-verdicts.csv            (v1, deepseek single-reviewer — consistency check only)
 * Outputs research/benchmark/review/gold-verdicts-consensus.csv  (template header; per-column verdict = majority >=2/3)
 *         research/benchmark/review/review-agreement.json        (%unanimous, Fleiss kappa per column, v1 consistency, qualitative flags)
 *         research/benchmark/review/gold-verdicts-arbitration.csv        (non-unanimous items, empty verdict columns for the researcher)
 *         research/benchmark/review/gold-verdicts-arbitration-detail.json (per-rater votes for those items, read-only reference)
 *
 * Usage (from apps/frontend):
 *   pnpm exec tsx scripts/aggregate-review.mts [--review-dir research/benchmark/review] [--tag v3]
 *
 * The v1-consistency check (gold-verdicts.csv) runs only when that file exists
 * in the review dir — later-era dirs (e.g. review-v3) have no v1 verdicts.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..", "..");

const argv = process.argv.slice(2);
const arg = (name: string, def?: string): string | undefined => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const REVIEW_DIR = path.resolve(REPO, arg("review-dir", "research/benchmark/review"));
const TAG = arg("tag", "");
const tagged = (name: string) => (TAG ? name.replace(/(\.\w+)$/, `-${TAG}$1`) : name);

// kimi-k2.6 was swapped for qwen3.8-flash mid-plan (docs/05 D9, 2026-09-20).
const REVIEWERS = ["glm", "deepseek", "qwen"] as const;
const COLS = ["must_ok", "optional_ok", "query_ok"] as const;
const FLAGS = ["weak_gold_chunk", "no_gold_chunk", "arbitrary_pair"] as const;

type Row = { item_id: string; must_ok: string; optional_ok: string; query_ok: string; notes: string };

function readCsv(file: string): Map<string, Row> {
  const text = fs.readFileSync(path.join(REVIEW_DIR, file), "utf8");
  const lines = text.split("\n").filter((l) => l.trim());
  const header = lines[0].split(",");
  const idx = (name: string) => header.indexOf(name);
  const out = new Map<string, Row>();
  // CSV rows may carry quoted notes with commas — tiny state machine, no deps.
  for (const line of lines.slice(1)) {
    const fields: string[] = [];
    let cur = "", inQ = false;
    for (const ch of line) {
      if (ch === '"') inQ = !inQ;
      else if (ch === "," && !inQ) { fields.push(cur); cur = ""; }
      else cur += ch;
    }
    fields.push(cur);
    const get = (name: string) => (idx(name) >= 0 ? (fields[idx(name)] ?? "").trim() : "");
    out.set(get("item_id"), {
      item_id: get("item_id"), must_ok: get("must_ok"), optional_ok: get("optional_ok"),
      query_ok: get("query_ok"), notes: get("notes"),
    });
  }
  return out;
}

const votes = new Map<string, Map<string, Row>>(); // reviewer -> item_id -> row
for (const r of REVIEWERS) votes.set(r, readCsv(`gold-verdicts-${r}.csv`));
const v1 = fs.existsSync(path.join(REVIEW_DIR, "gold-verdicts.csv")) ? readCsv("gold-verdicts.csv") : null;

const itemIds = [...readCsv("gold-verdicts.template.csv").keys()]; // canonical frozen order
const missing = itemIds.filter((id) => REVIEWERS.some((r) => !votes.get(r)!.has(id)));
if (missing.length) {
  console.error(`ERROR: ${missing.length} item(s) missing from a reviewer CSV: ${missing.slice(0, 5).join(", ")}...`);
  process.exit(1);
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** Fleiss kappa over items where every rater cast a valid 0/1 vote. */
function fleissKappa(rows: string[][]): number | null {
  const items = rows.filter((row) => row.every((v) => v === "0" || v === "1"));
  const N = items.length, n = REVIEWERS.length;
  if (!N) return null;
  const catTotals = [0, 0];
  let pSum = 0;
  for (const row of items) {
    const zeros = row.filter((v) => v === "0").length;
    const ones = n - zeros;
    catTotals[0] += zeros;
    catTotals[1] += ones;
    pSum += (zeros * zeros + ones * ones - n) / (n * (n - 1));
  }
  const pBar = pSum / N;
  const pTilde = catTotals.reduce((a, c) => a + (c / (N * n)) ** 2, 0);
  if (pTilde === 1) return 1; // perfect agreement
  return (pBar - pTilde) / (1 - pTilde);
}

const nonUnanimous = new Set<string>();
for (const id of itemIds) {
  for (const col of COLS) {
    const vs = REVIEWERS.map((r) => votes.get(r)!.get(id)![col]);
    if (new Set(vs).size > 1) { nonUnanimous.add(id); break; }
  }
}

const perColumn: Record<string, unknown> = {};
for (const col of COLS) {
  const allVotes: string[][] = [];
  let unanimous = 0;
  for (const id of itemIds) {
    const vs = REVIEWERS.map((r) => votes.get(r)!.get(id)![col]);
    allVotes.push(vs);
    if (new Set(vs).size === 1) unanimous++;
  }
  const oneRate = Object.fromEntries(REVIEWERS.map((r) =>
    [r, Number(mean(itemIds.map((id) => (votes.get(r)!.get(id)![col] === "1" ? 1 : 0))).toFixed(4))]));
  perColumn[col] = {
    unanimous_pct: Number((unanimous / itemIds.length).toFixed(4)),
    unanimous_items: unanimous,
    fleiss_kappa: fleissKappa(allVotes) === null ? null : Number(fleissKappa(allVotes)!.toFixed(4)),
    reviewer_1_rate: oneRate,
  };
}

// consensus per column: majority >=2/3 (blank only if <2 valid votes among raters)
const consensusRows = itemIds.map((id) => {
  const cols = COLS.map((col) => {
    const vs = REVIEWERS.map((r) => votes.get(r)!.get(id)![col]);
    const ones = vs.filter((v) => v === "1").length;
    const zeros = vs.filter((v) => v === "0").length;
    return ones >= 2 ? "1" : zeros >= 2 ? "0" : "";
  });
  const notes: string[] = [];
  for (const flag of FLAGS) {
    const n = REVIEWERS.filter((r) => votes.get(r)!.get(id)!.notes.includes(flag)).length;
    if (n >= 2) notes.push(flag);
  }
  if (nonUnanimous.has(id)) notes.push("non_unanimous_see_arbitration");
  return { id, cols, notes };
});

// qualitative flags supported by >=2/3 reviewers
const flags = Object.fromEntries(FLAGS.map((flag) => [
  flag,
  consensusRows.filter((r) => r.notes.includes(flag)).map((r) => r.id),
]));

// v1 (deepseek single-reviewer, frozen) consistency check — skipped without gold-verdicts.csv
const v1PerColumn: Record<string, { agreement_pct: number; agree: number; differ: number }> = {};
const v1DiffItems: Record<string, string[]> = {};
if (v1) {
  for (const [i, col] of COLS.entries()) {
    let agree = 0;
    const diffs: string[] = [];
    for (const r of consensusRows) {
      const v1v = v1.get(r.id)?.[col] ?? "";
      const cv = r.cols[i];
      if (v1v && cv && v1v === cv) agree++;
      else if (v1v && cv) diffs.push(r.id);
    }
    v1PerColumn[col] = { agreement_pct: Number((agree / itemIds.length).toFixed(4)), agree, differ: diffs.length };
    v1DiffItems[col] = diffs;
  }
}

fs.writeFileSync(
  path.join(REVIEW_DIR, tagged("gold-verdicts-consensus.csv")),
  ["item_id,must_ok,optional_ok,query_ok,notes"]
    .concat(consensusRows.map((r) => `${r.id},${r.cols.join(",")},"${r.notes.join("; ")}"`))
    .join("\n") + "\n",
);

const arbIds = itemIds.filter((id) => nonUnanimous.has(id));
fs.writeFileSync(
  path.join(REVIEW_DIR, tagged("gold-verdicts-arbitration.csv")),
  ["item_id,must_ok,optional_ok,query_ok,notes"]
    .concat(arbIds.map((id) => `${id},,,,"researcher arbitration: item non-unanimous across reviewers"`))
    .join("\n") + "\n",
);
fs.writeFileSync(
  path.join(REVIEW_DIR, tagged("gold-verdicts-arbitration-detail.json")),
  JSON.stringify(arbIds.map((id) => ({
    id,
    per_rater: Object.fromEntries(REVIEWERS.map((r) => [r, {
      ...Object.fromEntries(COLS.map((c) => [c, votes.get(r)!.get(id)![c]])),
      notes: votes.get(r)!.get(id)!.notes,
    }])),
  })), null, 2) + "\n",
);

const consensusRates: Record<string, number | null> = {};
for (const [i, col] of COLS.entries()) {
  const vals = consensusRows.map((r) => r.cols[i]).filter((v) => v === "0" || v === "1").map(Number);
  consensusRates[col] = vals.length === itemIds.length ? Number(mean(vals).toFixed(4)) : null;
}

fs.writeFileSync(path.join(REVIEW_DIR, tagged("review-agreement.json")), JSON.stringify({
  reviewers: REVIEWERS,
  items: itemIds.length,
  consensus_rule: "majority >=2/3 per binary column",
  per_column: perColumn,
  consensus_rates: consensusRates,
  qualitative_flags: Object.fromEntries(Object.entries(flags).map(([k, v]) => [k, { count: v.length, items: v }])),
  ...(v1 ? { v1_consistency: { per_column: v1PerColumn, differing_items: v1DiffItems } } : {}),
  arbitration: { count: arbIds.length, items: arbIds, file: tagged("gold-verdicts-arbitration.csv") },
}, null, 2) + "\n");

console.log(`items=${itemIds.length} reviewers=${REVIEWERS.join(",")}`);
for (const col of COLS) {
  const c = perColumn[col] as { unanimous_pct: number; fleiss_kappa: number | null };
  const v1Part = v1 ? ` v1_agree=${(v1PerColumn[col].agreement_pct * 100).toFixed(0)}%` : "";
  console.log(`${col}: unanimous=${(c.unanimous_pct * 100).toFixed(0)}% kappa=${c.fleiss_kappa} consensus_rate=${consensusRates[col]}${v1Part}`);
}
for (const [k, v] of Object.entries(flags)) console.log(`${k}: ${(v as string[]).length}`);
console.log(`arbitration items (non-unanimous): ${arbIds.length}${arbIds.length ? " -> " + arbIds.join(", ") : ""}`);
console.log(`written: ${tagged("gold-verdicts-consensus.csv")}, ${tagged("review-agreement.json")}` + (arbIds.length ? `, ${tagged("gold-verdicts-arbitration.csv")} + ${tagged("gold-verdicts-arbitration-detail.json")}` : ""));
