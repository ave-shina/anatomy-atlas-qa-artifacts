/**
 * Aggregate the 3x3 triangle-judge panel into research/runs/triangle-summary.json
 * (docs/05-rencana-evaluasi-ulang-trio.md T6).
 *
 * Reads, per judged-run R in --runs and per judge J in --judges:
 *   research/runs/<R>/judge-<J>.jsonl         per-item verdicts
 *   research/runs/<R>/judge-<J>.metrics.json  means (from judge-run.mts --suffix -<J>)
 *
 * Matrix orientation: rows = judged model (the run), columns = judge.
 *   headline    = mean of the 6 off-diagonal cells (no model judged by itself)
 *   self_bias   = per model: diagonal cell minus the mean of the off-diagonal cells
 *                 in its ROW (what other judges gave it) — Panickssery-style
 *                 measured self-preference, reported separately, never folded in
 *   interjudge  = pairwise agreement over items judged by both, cross cells only
 *                 (a judge never scores its own run in these pairs)
 *
 * Usage (from apps/frontend):
 *   pnpm exec tsx scripts/aggregate-triangle.mts \
 *     --runs trio-glm-r1,trio-deepseek-r1,trio-qwen-r1 --judges glm,deepseek,qwen
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
const RUNS = (arg("runs", "trio-glm-r3,trio-deepseek-r3,trio-kimi-r3")!).split(",").map((s) => s.trim());
const JUDGES = (arg("judges", "glm,deepseek,kimi")!).split(",").map((s) => s.trim());
if (RUNS.length !== JUDGES.length) {
  console.error("Triangle expects the same number of runs and judges (rows and columns).");
  process.exit(2);
}

type Metrics = {
  runId: string; condition: string; judgeModel: string;
  judged: number; failed: number; skipped: number;
  citation_validity_mean: number; faithfulness_mean: number;
};
type JudgeRow = {
  id?: string; skipped?: boolean;
  citation_validity?: number | null; faithfulness?: number | null;
};

const metrics: Record<string, Record<string, Metrics>> = {};
const perItem: Record<string, Record<string, Map<string, JudgeRow>>> = {};
for (const run of RUNS) {
  metrics[run] = {};
  perItem[run] = {};
  for (const judge of JUDGES) {
    const mPath = path.join(REPO, "research", "runs", run, `judge-${judge}.metrics.json`);
    if (!fs.existsSync(mPath)) { console.error(`missing ${path.relative(REPO, mPath)}`); process.exit(1); }
    metrics[run][judge] = JSON.parse(fs.readFileSync(mPath, "utf8")) as Metrics;
    const jPath = path.join(REPO, "research", "runs", run, `judge-${judge}.jsonl`);
    const map = new Map<string, JudgeRow>();
    for (const l of fs.readFileSync(jPath, "utf8").split("\n").filter(Boolean)) {
      const d = JSON.parse(l) as JudgeRow & { id: string };
      if (!d.skipped && d.citation_validity !== undefined && d.citation_validity !== null) map.set(d.id, d);
    }
    perItem[run][judge] = map;
  }
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
// run dir name -> chat model label ("trio-glm-r1"/"ft-glm-r1" -> "glm"); suffix may be -r1/-r3/…
const modelName = (run: string) => run.replace(/^(trio|ft|v3-merged)-/, "").replace(/-r\d+$/, "");
const cell = (run: string, judge: string, key: "citation_validity_mean" | "faithfulness_mean") => metrics[run][judge][key];

const offDiagonal = (key: "citation_validity_mean" | "faithfulness_mean") =>
  mean(RUNS.flatMap((run) => JUDGES.filter((j) => j !== modelName(run)).map((j) => cell(run, j, key))));

// row-wise self-bias: diagonal minus the row's off-diagonal mean
type Pair = { cv: number; ff: number };
const selfBias: Record<string, {
  diagonal: Pair; row_offdiag_mean: Pair; delta: Pair;
  row_offdiag_mean_by: Record<string, Pair>; delta_by: Record<string, Pair>;
}> = {};
for (const run of RUNS) {
  const model = modelName(run);
  const diagJ = JUDGES.find((j) => j === model)!;
  const others = JUDGES.filter((j) => j !== model);
  const mk = (key: "citation_validity_mean" | "faithfulness_mean") => {
    const diagonal = cell(run, diagJ, key);
    const by = Object.fromEntries(others.map((j) => [j, cell(run, j, key)]));
    return { diagonal, by, rowOff: mean(Object.values(by)) };
  };
  const cv = mk("citation_validity_mean");
  const ff = mk("faithfulness_mean");
  const num = (x: number) => Number(x.toFixed(4));
  const pair = (c: number, f: number): Pair => ({ cv: num(c), ff: num(f) });
  selfBias[model] = {
    diagonal: pair(cv.diagonal, ff.diagonal),
    row_offdiag_mean: pair(cv.rowOff, ff.rowOff),
    delta: pair(cv.diagonal - cv.rowOff, ff.diagonal - ff.rowOff),
    row_offdiag_mean_by: Object.fromEntries(others.map((j) => [j, pair(cv.by[j], ff.by[j])])),
    delta_by: Object.fromEntries(others.map((j) => [j, pair(cv.diagonal - cv.by[j], ff.diagonal - ff.by[j])])),
  };
}

// spearman rank correlation
function spearman(xs: number[], ys: number[]): number | null {
  const n = xs.length;
  if (n < 3) return null;
  const rank = (arr: number[]) => {
    const order = arr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
    const r = new Array(n).fill(0);
    for (let i = 0; i < n;) {
      let j = i;
      while (j + 1 < n && order[j + 1].v === order[i].v) j++;
      const avg = (i + j + 2) / 2;
      for (let k = i; k <= j; k++) r[order[k].i] = avg;
      i = j + 1;
    }
    return r;
  };
  const rx = rank(xs), ry = rank(ys);
  const mx = mean(rx), my = mean(ry);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    num += (rx[i] - mx) * (ry[i] - my);
    dx += (rx[i] - mx) ** 2;
    dy += (ry[i] - my) ** 2;
  }
  return dx && dy ? num / Math.sqrt(dx * dy) : null;
}

// pairwise inter-judge agreement over shared items, CROSS cells only
const interjudge: Record<string, unknown> = {};
for (let a = 0; a < JUDGES.length; a++) {
  for (let b = a + 1; b < JUDGES.length; b++) {
    const ja = JUDGES[a], jb = JUDGES[b];
    const sharedRuns = RUNS.filter((run) => modelName(run) !== ja && modelName(run) !== jb);
    const cvA: number[] = [], cvB: number[] = [], ffA: number[] = [], ffB: number[] = [];
    for (const run of sharedRuns) {
      for (const [id, ra] of perItem[run][ja]) {
        const rb = perItem[run][jb].get(id);
        if (!rb) continue;
        cvA.push(ra.citation_validity!); cvB.push(rb.citation_validity!);
        if (ra.faithfulness != null && rb.faithfulness != null) { ffA.push(ra.faithfulness); ffB.push(rb.faithfulness); }
      }
    }
    const binAgree = mean(cvA.map((v, i) => ((v > 0.5) === (cvB[i] > 0.5) ? 1 : 0)));
    interjudge[`${ja}+${jb}`] = {
      shared_runs: sharedRuns,
      n_pairs: cvA.length,
      citation_validity: {
        meanA: mean(cvA), meanB: mean(cvB),
        binary_agreement: Number(binAgree.toFixed(4)),
        spearman: spearman(cvA, cvB), mean_abs_diff: mean(cvA.map((v, i) => Math.abs(v - cvB[i]))),
      },
      faithfulness: {
        meanA: mean(ffA), meanB: mean(ffB),
        within_1: mean(ffA.map((v, i) => (Math.abs(v - ffB[i]) <= 1 ? 1 : 0))),
        spearman: spearman(ffA, ffB),
      },
    };
  }
}

const num4 = (x: number) => Number(x.toFixed(4));
const summary = {
  runs: RUNS,
  judges: JUDGES,
  condition: "B3",
  matrix: {
    citation_validity: Object.fromEntries(RUNS.map((run) =>
      [run, Object.fromEntries(JUDGES.map((j) => [j, num4(cell(run, j, "citation_validity_mean"))]))])),
    faithfulness: Object.fromEntries(RUNS.map((run) =>
      [run, Object.fromEntries(JUDGES.map((j) => [j, num4(cell(run, j, "faithfulness_mean"))]))])),
    per_cell_n: Object.fromEntries(RUNS.map((run) =>
      [run, Object.fromEntries(JUDGES.map((j) => {
        const m = metrics[run][j];
        return [j, { judged: m.judged, failed: m.failed, skipped: m.skipped }];
      }))])),
  },
  headline_offdiagonal: {
    citation_validity: num4(offDiagonal("citation_validity_mean")),
    // Must use modelName(): a bare "-r3$" strip leaves "-r1" on run ids, the
    // judge filter then matches nothing and the mean silently includes all
    // nine cells (self-judged included) instead of the six cross cells.
    faithfulness: num4(offDiagonal("faithfulness_mean")),
  },
  self_bias_rowwise: selfBias,
  interjudge_cross_only: interjudge,
  note: "Headline = off-diagonal mean (no model judged by itself). Diagonal cells = measured self-preference (Panickssery et al. 2024), reported separately, never folded into the headline. Inter-judge agreement uses cross cells only. NOT human annotation.",
};

const out = path.resolve(arg("out", path.join(REPO, "research", "runs", "triangle-summary.json"))!);
fs.writeFileSync(out, JSON.stringify(summary, null, 2) + "\n");
console.log(`written: ${path.relative(REPO, out)}`);

console.log(`matrix (rows=run, cols=judge) citation_validity:`);
for (const run of RUNS) console.log(`  ${run}: ${JUDGES.map((j) => `${j}=${cell(run, j, "citation_validity_mean").toFixed(3)}`).join("  ")}`);
console.log(`headline off-diagonal: cv=${summary.headline_offdiagonal.citation_validity} ff=${summary.headline_offdiagonal.faithfulness}`);
for (const [m, s] of Object.entries(selfBias)) {
  console.log(`self-bias ${m}: Δcv=${s.delta.cv} Δff=${s.delta.ff}`);
}
console.log(`written: ${path.relative(REPO, out)}`);
