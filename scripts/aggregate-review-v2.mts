/**
 * Aggregate the gold-review panel WITH the out-of-family AI arbiter
 * (docs/05 §11 amendment, 2026-09-22: benchmark validation is fully automated,
 * no human votes).
 *
 * Final-gold rule (v2), mirroring the v1.1 arbitration flow with the human
 * arbitrator replaced by an out-of-family frontier model:
 *   per item, per binary column — trio unanimous → consensus value;
 *   item non-unanimous in ANY column (the same 56-item set as v1.1)
 *   → arbiter's verdict for all of that item's columns.
 *
 * Inputs  research/benchmark/review/gold-verdicts-{glm,deepseek,qwen}.csv  (trio, v1.1)
 *         research/benchmark/review/gold-verdicts-claude.csv               (arbiter, same frozen packet/rubric)
 *         research/benchmark/review/gold-verdicts.template.csv             (canonical frozen order)
 *         research/benchmark/review/gold-verdicts-arbitration.csv          (superseded author-ratified layer — flip comparison only)
 *         research/benchmark/review/gold-verdicts-final.json               (superseded final — flip comparison only)
 * Outputs research/benchmark/review/gold-verdicts-arbitration-claude.csv   (arbiter verdicts for the non-unanimous items)
 *         research/benchmark/review/gold-verdicts-final-v2.json            (rule meta + 100 verdict triples)
 *         research/benchmark/review/review-agreement-v2.json               (4-rater agreement + arbiter-vs-consensus + flips)
 *
 * Usage (from apps/frontend):
 *   pnpm exec tsx scripts/aggregate-review-v2.mts [--review-dir research/benchmark/review] [--tag v3] [--prev-final gold-verdicts-final.json]
 *
 * The flips table vs a superseded final is computed only when that file exists
 * (--prev-final, default gold-verdicts-final.json) — a first aggregation in a
 * fresh review dir has no predecessor and skips it.
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

const TRIO = ["glm", "deepseek", "qwen"] as const;
const ARBITER = "claude";
const ARBITER_MODEL = "anthropic/claude-sonnet-5";
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

const votes = new Map<string, Map<string, Row>>();
for (const r of [...TRIO, ARBITER]) votes.set(r, readCsv(`gold-verdicts-${r}.csv`));
const itemIds = [...readCsv("gold-verdicts.template.csv").keys()]; // canonical frozen order
const invalid = itemIds.flatMap((id) => {
  const bad: string[] = [];
  for (const r of [...TRIO, ARBITER]) {
    const row = votes.get(r)!.get(id);
    if (!row) { bad.push(`${r}:${id}:missing`); continue; }
    for (const col of COLS) if (row[col] !== "0" && row[col] !== "1") bad.push(`${r}:${id}:${col}="${row[col]}"`);
  }
  return bad;
});
if (invalid.length) {
  console.error(`ERROR: ${invalid.length} invalid/missing verdict cell(s) — complete all rater CSVs first (rerun run-review.mts to retry REVIEW_ERROR rows):`);
  console.error(invalid.slice(0, 20).join(", ") + (invalid.length > 20 ? " ..." : ""));
  process.exit(1);
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** Multi-rater agreement: observed agreement + Gwet AC1 + Fleiss κ (binary, r raters). */
function agreementStats(column: string, raters: string[]) {
  const ratings = itemIds.map((id) => raters.map((r) => Number(votes.get(r)!.get(id)![column])));
  const r = ratings[0].length;
  const n = ratings.length;
  let sumAgree = 0;
  const marg: [number, number] = [0, 0];
  for (const row of ratings) {
    const ones = row.filter((v) => v === 1).length;
    sumAgree += (ones * (ones - 1)) / 2 + ((r - ones) * (r - ones - 1)) / 2;
    marg[1] += ones;
    marg[0] += r - ones;
  }
  const Pa = (2 * sumAgree) / (n * r * (r - 1));
  const p1 = marg[1] / (n * r);
  const PeGwet = 2 * p1 * (1 - p1);
  const ac1 = (Pa - PeGwet) / (1 - PeGwet);
  const PeFleiss = (marg[0] / (n * r)) ** 2 + (marg[1] / (n * r)) ** 2;
  const fleiss = (Pa - PeFleiss) / (1 - PeFleiss);
  return { n, raters: r, observed_agreement: Number(Pa.toFixed(4)), gwet_ac1: Number(ac1.toFixed(4)), fleiss_kappa: Number(fleiss.toFixed(4)), positive_rate: Number(p1.toFixed(4)) };
}

/** Cohen κ between the arbiter and the trio majority (2-rater, binary). */
function cohenKappaVsConsensus(column: string, consensus: Map<string, string>) {
  const pairs = itemIds.map((id) => [Number(votes.get(ARBITER)!.get(id)![column]), Number(consensus.get(id)!.get(column))] as [number, number]);
  const po = mean(pairs.map(([a, b]) => (a === b ? 1 : 0)));
  const pA = mean(pairs.map(([a]) => a));
  const pB = mean(pairs.map(([, b]) => b));
  const pe = pA * pB + (1 - pA) * (1 - pB);
  return { observed: Number(po.toFixed(4)), kappa: Number(((po - pe) / (1 - pe)).toFixed(4)) };
}

// item is non-unanimous if ANY of the 3 columns splits across the trio (same rule as aggregate-review.mts)
const nonUnanimous = new Set<string>();
for (const id of itemIds) {
  for (const col of COLS) {
    const vs = TRIO.map((r) => votes.get(r)!.get(id)![col]);
    if (new Set(vs).size > 1) { nonUnanimous.add(id); break; }
  }
}

// trio majority per item/column (>=2/3; always defined — trio votes are complete)
const consensus = new Map<string, Map<string, string>>();
for (const id of itemIds) {
  const cols = new Map<string, string>();
  for (const col of COLS) {
    const vs = TRIO.map((r) => votes.get(r)!.get(id)![col]);
    const ones = vs.filter((v) => v === "1").length;
    cols.set(col, ones >= 2 ? "1" : "0");
  }
  consensus.set(id, cols);
}

// ---- final gold v2 --------------------------------------------------------
const finalVerdicts: Record<string, number[]> = {};
for (const id of itemIds) {
  const unanimous = !nonUnanimous.has(id);
  finalVerdicts[id] = COLS.map((col) =>
    unanimous ? Number(consensus.get(id)!.get(col)) : Number(votes.get(ARBITER)!.get(id)![col]),
  );
}

const arbRows = itemIds.filter((id) => nonUnanimous.has(id));
const isStandin = (notes: string) => notes.includes("agent-standin(harness:glm-5.3-flash)");
const standinCount = itemIds.filter((id) => isStandin(votes.get(ARBITER)!.get(id)!.notes)).length;
fs.writeFileSync(
  path.join(REVIEW_DIR, tagged("gold-verdicts-arbitration-claude.csv")),
  ["item_id,must_ok,optional_ok,query_ok,notes"]
    .concat(arbRows.map((id) => {
      const r = votes.get(ARBITER)!.get(id)!;
      const prefix = isStandin(r.notes)
        ? "AI-arbiter(agent-standin,harness:glm-5.3-flash)"
        : `AI-arbiter(${ARBITER_MODEL})`;
      const body = isStandin(r.notes) ? r.notes.replace(/^.*?agent-standin\(harness:glm-5\.3-flash\)\s*/, "") : r.notes;
      return `${id},${r.must_ok},${r.optional_ok},${r.query_ok},"${prefix}; ${body.replace(/"/g, "'")}"`;
    }))
    .join("\n") + "\n",
);

const FINAL_NAME = `gold-verdicts-final-${TAG || "v2"}.json`;
fs.writeFileSync(
  path.join(REVIEW_DIR, FINAL_NAME),
  JSON.stringify({
    rule: "trio unanimous -> consensus value; non-unanimous item (any column) -> arbiter verdict (docs/05 §11, 2026-09-22)",
    arbiter: {
      model: ARBITER_MODEL,
      coverage: { api: itemIds.length - standinCount, agent_standin: standinCount },
      standin_disclosure: "items whose claude-API verdict is missing carry an agent-standin(harness:glm-5.3-flash) notes prefix — the in-session coding agent, blinded to panel votes, same rubric; NOT out-of-family",
    },
    panel: TRIO.map((r) => `openrouter:${r}`),
    verdicts: finalVerdicts,
  }, null, 2) + "\n",
);

// ---- agreement stats ------------------------------------------------------
const fourRater = [...TRIO, ARBITER].map(String);
const perColumn: Record<string, unknown> = {};
for (const col of COLS) {
  const trioVotes = itemIds.map((id) => TRIO.map((r) => votes.get(r)!.get(id)![col]));
  const unanimous = trioVotes.filter((vs) => new Set(vs).size === 1).length;
  const arbUnanAgree = mean(itemIds.filter((id) => !nonUnanimous.has(id)).map((id) =>
    Number(votes.get(ARBITER)!.get(id)![col]) === Number(consensus.get(id)!.get(col)) ? 1 : 0));
  const arbArbAgree = mean(arbRows.map((id) =>
    Number(votes.get(ARBITER)!.get(id)![col]) === Number(consensus.get(id)!.get(col)) ? 1 : 0));
  perColumn[col] = {
    trio_unanimous_pct: Number((unanimous / itemIds.length).toFixed(4)),
    panel4: agreementStats(col, fourRater),
    arbiter_vs_trio_consensus: {
      ...cohenKappaVsConsensus(col, consensus),
      agreement_unanimous_items: Number(arbUnanAgree.toFixed(4)),
      agreement_non_unanimous_items: Number(arbArbAgree.toFixed(4)),
    },
    rater_1_rate: Object.fromEntries(fourRater.map((r) =>
      [r, Number(mean(itemIds.map((id) => (votes.get(r)!.get(id)![col] === "1" ? 1 : 0))).toFixed(4))])),
  };
}

const finalRates = Object.fromEntries(COLS.map((col, i) =>
  [col, Number(mean(itemIds.map((id) => finalVerdicts[id][i])).toFixed(4))]));

// flips vs a superseded earlier final (descriptive provenance only; skipped when absent)
const PREV_FINAL = arg("prev-final", "gold-verdicts-final.json");
const prevPath = path.join(REVIEW_DIR, PREV_FINAL!);
const hasPrev = fs.existsSync(prevPath);
let oldRates: Record<string, number> | null = null;
const flips: Record<string, string[]> = Object.fromEntries(COLS.map((c) => [c, []]));
if (hasPrev) {
  const oldFinal: Record<string, number[]> = JSON.parse(fs.readFileSync(prevPath, "utf8"));
  for (const id of itemIds) {
    COLS.forEach((col, i) => {
      if (oldFinal[id]?.[i] !== undefined && oldFinal[id][i] !== finalVerdicts[id][i]) flips[col].push(`${id}:${oldFinal[id][i]}->${finalVerdicts[id][i]}`);
    });
  }
  oldRates = Object.fromEntries(COLS.map((_, i) =>
    [COLS[i], Number(mean(itemIds.map((id) => oldFinal[id][i] ?? 0)).toFixed(4))]));
}

const AGREEMENT_NAME = `review-agreement-${TAG || "v2"}.json`;
fs.writeFileSync(path.join(REVIEW_DIR, AGREEMENT_NAME), JSON.stringify({
  raters: fourRater,
  arbiter: { label: ARBITER, model: ARBITER_MODEL, role: "out-of-family arbiter; replaces the withdrawn author-ratified arbitration layer", coverage: { api: itemIds.length - standinCount, agent_standin: standinCount } },
  items: itemIds.length,
  final_gold_rule: "trio unanimous -> consensus; non-unanimous item -> arbiter verdict",
  per_column: perColumn,
  final_gold_rates_v2: finalRates,
  ...(hasPrev ? {
    superseded_final_rates: oldRates,
    flips_vs_superseded: Object.fromEntries(COLS.map((c) => [c, { count: flips[c].length, items: flips[c] }])),
  } : {}),
  arbitration: { count: arbRows.length, items: arbRows, file: tagged("gold-verdicts-arbitration-claude.csv") },
}, null, 2) + "\n");

console.log(`items=${itemIds.length} raters=${fourRater.join(",")} arbiter=${ARBITER_MODEL}`);
for (const col of COLS) {
  const c = perColumn[col] as { trio_unanimous_pct: number; panel4: { fleiss_kappa: number; gwet_ac1: number; observed_agreement: number }; arbiter_vs_trio_consensus: { kappa: number; observed: number } };
  console.log(`${col}: unanimous=${(c.trio_unanimous_pct * 100).toFixed(0)}% κ4=${c.panel4.fleiss_kappa} AC1_4=${c.panel4.gwet_ac1} | claude-vs-consensus agree=${c.arbiter_vs_trio_consensus.observed} κ=${c.arbiter_vs_trio_consensus.kappa}`);
}
console.log(`final gold v2 rates: ${JSON.stringify(finalRates)}` + (hasPrev ? ` (superseded: ${JSON.stringify(oldRates)})` : ""));
if (hasPrev) for (const col of COLS) console.log(`flips vs superseded final [${col}]: ${flips[col].length}`);
console.log(`written: ${tagged("gold-verdicts-arbitration-claude.csv")}, ${FINAL_NAME}, ${AGREEMENT_NAME}`);
