/**
 * Statistical analysis for an experiment run (02-protokol-evaluasi.md §5).
 *
 * Reads research/runs/<run>/{items.jsonl,manifest.json} and writes
 * analysis.json next to them:
 *   - per-condition point estimates with bootstrap 95% CI (resampling items)
 *   - per-type (F/R/A) and per-system breakdowns
 *   - paired comparisons between conditions: Wilcoxon signed-rank (continuous
 *     chip F1) and exact McNemar (binary "linked the gold structure").
 *
 * No external dependencies; the bootstrap is seeded for reproducibility.
 *
 * Usage (from apps/frontend):
 *   pnpm exec tsx scripts/analyze-run.mts --run pilot-f50 [--bootstrap 10000]
 *     [--gold-patch ../../research/benchmark/gold-v3-anervous003.patch.json]
 *
 * --gold-patch applies a gold patch POST-HOC (the run dataset itself is never
 * modified): items whose `gold_structures_must` was emptied by the patch (e.g.
 * the vocabulary migration that dropped a mesh) fall out of chip scoring the
 * same way natively gold-less items do. Opt-in — omit it to reproduce the run
 * dataset's own scoring.
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
const RUN = arg("run")!;
const B = Number(arg("bootstrap", "10000"));
if (!RUN) {
  console.error("Need --run <run-id>.");
  process.exit(2);
}
const RUN_DIR = path.join(REPO, "research", "runs", RUN);
const manifest = JSON.parse(fs.readFileSync(path.join(RUN_DIR, "manifest.json"), "utf8"));
const conditions: string[] = manifest.conditions;
const items: {
  id: string; type: string; system: string;
  gold_structures_must: string[]; gold_structures_optional?: string[]; expects_clarification?: boolean;
  conditions: Record<string, {
    error: string | null; chip_f1: number; chip_f1_optional: number;
    chip_precision: number; chip_precision_optional: number; chip_recall: number;
    hallucinated: string[]; non_renderable: string[]; wrong_link: string[];
    clarificationRounds?: { picked: string }[];
  }[]>;
}[] = fs
  .readFileSync(path.join(RUN_DIR, "items.jsonl"), "utf8")
  .split("\n")
  .filter((l) => l.trim())
  .map((l) => JSON.parse(l));

// --- post-hoc gold patch (see header) ---------------------------------------
const goldPatchPath = arg("gold-patch");
if (goldPatchPath && goldPatchPath !== "none") {
  const patch = JSON.parse(fs.readFileSync(path.resolve(goldPatchPath), "utf8")) as {
    items: { item_id: string; v3_gold_structures_must: string[] }[];
  };
  const patchedMust = new Map(patch.items.map((p) => [p.item_id, p.v3_gold_structures_must]));
  let patched = 0;
  for (const it of items) {
    const must = patchedMust.get(it.id);
    if (must) {
      it.gold_structures_must = must;
      patched++;
    }
  }
  console.log(`gold patch: ${patched} item(s) re-keyed from ${path.basename(goldPatchPath)}`);
}

// --- helpers ----------------------------------------------------------------
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(12345);
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
/** Clarification-path behaviour for type-A items (expected vs issued). */
function clarStats(rec: (typeof items)[number], cond: string) {
  const ok = (rec.conditions[cond] ?? []).filter((r) => !r.error);
  if (!ok.length) return { issued: 0, hit: null as number | null };
  const issued = mean(ok.map((r) => ((r.clarificationRounds?.length ?? 0) > 0 ? 1 : 0)));
  const goldSet = new Set([...(rec.gold_structures_must ?? []), ...(rec.gold_structures_optional ?? [])]);
  const withClar = ok.filter((r) => (r.clarificationRounds?.length ?? 0) > 0);
  const hits = withClar.filter((r) => (r.clarificationRounds ?? []).some((cr) => goldSet.has(cr.picked))).length;
  return { issued, hit: withClar.length ? hits / withClar.length : null };
}

/** Mean over a run's repeats, or null when every generation errored. */
function itemValue(rec: (typeof items)[number], cond: string, key: keyof (typeof items)[number]["conditions"][string][number]): number | null {
  const reps = rec.conditions[cond] ?? [];
  const vals = reps.filter((r) => !r.error).map((r) => Number(r[key] ?? 0));
  return vals.length ? mean(vals) : null;
}
function bootstrapCI(values: number[], resamples: number) {
  if (values.length === 0) return { lo: 0, hi: 0 };
  const means: number[] = [];
  for (let b = 0; b < resamples; b++) {
    let s = 0;
    for (let i = 0; i < values.length; i++) s += values[Math.floor(rand() * values.length)];
    means.push(s / values.length);
  }
  means.sort((a, b) => a - b);
  const q = (p: number) => means[Math.min(means.length - 1, Math.max(0, Math.floor(p * means.length)))];
  return { lo: q(0.025), hi: q(0.975) };
}
// Normal CDF via Abramowitz–Stegun erf approximation.
function phi(z: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}
function wilcoxon(a: number[], b: number[]) {
  const d = a.map((x, i) => x - b[i]).filter((x) => x !== 0);
  const n = d.length;
  if (n === 0) return { n: 0, p: 1 };
  const abs = d.map((x) => Math.abs(x));
  const order = abs.map((v, i) => ({ v, i })).sort((x, y) => x.v - y.v);
  const ranks = new Array(n).fill(0);
  let i = 0;
  while (i < n) {
    let j = i;
    while (j + 1 < n && order[j + 1].v === order[i].v) j++;
    const rank = (i + j + 2) / 2; // average rank (1-based)
    for (let k = i; k <= j; k++) ranks[order[k].i] = rank;
    i = j + 1;
  }
  let wPlus = 0;
  for (let k = 0; k < n; k++) if (d[k] > 0) wPlus += ranks[k];
  const mu = (n * (n + 1)) / 4;
  const sigma = Math.sqrt((n * (n + 1) * (2 * n + 1)) / 24);
  const z = (wPlus - mu - Math.sign(wPlus - mu) * 0.5) / sigma;
  return { n, wPlus, p: Math.min(1, 2 * (1 - phi(Math.abs(z)))) };
}
function binomTwoSided(b: number, c: number) {
  const n = b + c;
  if (n === 0) return 1;
  const logFact = (k: number) => { let s = 0; for (let i = 2; i <= k; i++) s += Math.log(i); return s; };
  const p0 = 0.5;
  let p = 0;
  const kMin = Math.min(b, c);
  for (let k = 0; k <= kMin; k++) p += Math.exp(logFact(n) - logFact(k) - logFact(n - k) + n * Math.log(p0));
  return Math.min(1, 2 * p);
}
function mcnemar(a: number[], b: number[], thr = 1) {
  // "correct" = item reached the threshold (default: fully linked, chip F1 = 1)
  let bc = 0, cb = 0, both = 0, neither = 0;
  for (let i = 0; i < a.length; i++) {
    const A = a[i] >= thr, Bv = b[i] >= thr;
    if (A && !Bv) bc++;
    else if (!A && Bv) cb++;
    else if (A && Bv) both++;
    else neither++;
  }
  return { b: bc, c: cb, both, neither, p: binomTwoSided(bc, cb) };
}

// --- per-condition metrics --------------------------------------------------
const CONDS = conditions;
/**
 * Chip metrics need a non-empty gold `must`. Type-A ambiguity items have none
 * (they are scored through the clarification path instead), so they are
 * excluded here and reported separately.
 */
const eligible = items.map((it, i) => (it.gold_structures_must.length > 0 ? i : -1)).filter((i) => i >= 0);
const summary: Record<string, unknown> = {};
for (const cond of CONDS) {
  const val = (key: Parameters<typeof itemValue>[2]) => items.map((it) => itemValue(it, cond, key));
  const f1 = val("chip_f1");
  const f1o = val("chip_f1_optional");
  const pr = val("chip_precision");
  const prO = val("chip_precision_optional");
  const rc = val("chip_recall");
  // Chip metrics over items that have a gold `must` AND a successful generation.
  const scored = eligible.filter((i) => f1[i] !== null);
  const g = (arr: (number | null)[]) => scored.map((i) => arr[i] as number);
  const agg = (key: "hallucinated" | "non_renderable" | "wrong_link") =>
    scored.reduce((a, i) => a + (items[i].conditions[cond] ?? []).reduce((s, r) => s + r[key].length, 0), 0);
  const byType: Record<string, { n: number; chip_f1: number; chip_f1_optional: number; chip_recall: number }> = {};
  for (const type of ["F", "R", "A"]) {
    const idx = scored.filter((i) => items[i].type === type);
    if (!idx.length) continue;
    byType[type] = {
      n: idx.length,
      chip_f1: mean(idx.map((i) => f1[i] as number)),
      chip_f1_optional: mean(idx.map((i) => f1o[i] as number)),
      chip_recall: mean(idx.map((i) => rc[i] as number)),
    };
  }
  const bySystem: Record<string, { n: number; chip_f1_optional: number; chip_recall: number }> = {};
  for (const sys of [...new Set(scored.map((i) => items[i].system))]) {
    const idx = scored.filter((i) => items[i].system === sys);
    bySystem[sys] = { n: idx.length, chip_f1_optional: mean(idx.map((i) => f1o[i] as number)), chip_recall: mean(idx.map((i) => rc[i] as number)) };
  }
  const aItems = items.filter((it) => it.type === "A");
  const clarification = aItems.length
    ? {
        n: aItems.length,
        expected_rate: mean(aItems.map((it) => (it.expects_clarification ? 1 : 0))),
        issued_rate: mean(aItems.map((it) => clarStats(it, cond).issued)),
        correct_rate: mean(
          aItems.map((it) => {
            const issued = clarStats(it, cond).issued >= 0.5 ? 1 : 0;
            const exp = it.expects_clarification ? 1 : 0;
            return issued === exp ? 1 : 0;
          }),
        ),
        candidate_hit_rate: mean(
          aItems.map((it) => clarStats(it, cond).hit).filter((x): x is number => x !== null),
        ),
      }
    : null;
  summary[cond] = {
    n: items.length,
    n_chip_scored: scored.length,
    clarification,
    chip_precision: mean(g(pr)),
    chip_precision_optional: mean(g(prO)),
    chip_recall: mean(g(rc)),
    chip_f1: mean(g(f1)),
    chip_f1_optional: mean(g(f1o)),
    ci95_f1: bootstrapCI(g(f1), B),
    ci95_f1_optional: bootstrapCI(g(f1o), B),
    hallucinated_total: agg("hallucinated"),
    non_renderable_total: agg("non_renderable"),
    wrong_link_total: agg("wrong_link"),
    byType,
    bySystem,
  };
}

// --- paired comparisons -----------------------------------------------------
const pairs: [string, string][] = [];
for (let i = 0; i < CONDS.length; i++)
  for (let j = i + 1; j < CONDS.length; j++) pairs.push([CONDS[i], CONDS[j]]);
const comparisons = pairs.map(([A, Bc]) => {
  const aF1all = items.map((it) => itemValue(it, A, "chip_f1"));
  const bF1all = items.map((it) => itemValue(it, Bc, "chip_f1"));
  const aF1oAll = items.map((it) => itemValue(it, A, "chip_f1_optional"));
  const bF1oAll = items.map((it) => itemValue(it, Bc, "chip_f1_optional"));
  const aRCall = items.map((it) => itemValue(it, A, "chip_recall"));
  const bRCall = items.map((it) => itemValue(it, Bc, "chip_recall"));
  // Paired only over items with a successful generation in BOTH conditions.
  const idx = eligible.filter((i) => aF1all[i] !== null && bF1all[i] !== null);
  const aF1 = idx.map((i) => aF1all[i] as number);
  const bF1 = idx.map((i) => bF1all[i] as number);
  const aF1o = idx.map((i) => aF1oAll[i] as number);
  const bF1o = idx.map((i) => bF1oAll[i] as number);
  const aLink = idx.map((i) => aRCall[i] ?? 0);
  const bLink = idx.map((i) => bRCall[i] ?? 0);
  return {
    a: A,
    b: Bc,
    n_paired: idx.length,
    // Sign convention: mean(a - b); negative means condition `b` scores higher.
    mean_diff_f1: mean(aF1.map((x, i) => x - bF1[i])),
    wilcoxon_f1: wilcoxon(aF1, bF1),
    mean_diff_f1_optional: mean(aF1o.map((x, i) => x - bF1o[i])),
    wilcoxon_f1_optional: wilcoxon(aF1o, bF1o),
    mcnemar_linked: mcnemar(aLink, bLink, 0.5),
  };
});

const analysis = {
  runId: RUN,
  gitSha: manifest.gitSha,
  date: manifest.date,
  chatModel: manifest.chatModel,
  embedModel: manifest.embedModel,
  bootstrapResamples: B,
  conditions: summary,
  comparisons,
};
fs.writeFileSync(path.join(RUN_DIR, "analysis.json"), JSON.stringify(analysis, null, 2) + "\n");

// --- print ------------------------------------------------------------------
console.log(`run ${RUN} — ${items.length} items, models chat=${manifest.chatModel} embed=${manifest.embedModel}`);
for (const cond of CONDS) {
  const s = summary[cond] as { chip_f1: number; chip_f1_optional: number; chip_recall: number; ci95_f1_optional: { lo: number; hi: number }; hallucinated_total: number; wrong_link_total: number; non_renderable_total: number; clarification: { n: number; expected_rate: number; issued_rate: number; correct_rate: number; candidate_hit_rate: number } | null };
  console.log(
    `${cond}: F1opt=${s.chip_f1_optional.toFixed(3)} [${s.ci95_f1_optional.lo.toFixed(3)}, ${s.ci95_f1_optional.hi.toFixed(3)}]  ` +
      `recall=${s.chip_recall.toFixed(3)}  halluc=${s.hallucinated_total}  wrong=${s.wrong_link_total}  nonRender=${s.non_renderable_total}`,
  );
  if (s.clarification) {
    const c = s.clarification;
    console.log(
      `     A-items (n=${c.n}): expected=${c.expected_rate.toFixed(2)} issued=${c.issued_rate.toFixed(2)} ` +
        `correct=${c.correct_rate.toFixed(2)} candidate_hit=${c.candidate_hit_rate.toFixed(2)}`,
    );
  }
}
for (const c of comparisons) {
  console.log(`${c.a} vs ${c.b}: ΔF1=${c.mean_diff_f1.toFixed(3)} (Wx p=${c.wilcoxon_f1.p.toExponential(1)})  ΔF1opt=${c.mean_diff_f1_optional.toFixed(3)} (Wx p=${c.wilcoxon_f1_optional.p.toExponential(1)})  McNemar p=${c.mcnemar_linked.p.toExponential(1)}`);
}
console.log(`written: research/runs/${RUN}/analysis.json`);
