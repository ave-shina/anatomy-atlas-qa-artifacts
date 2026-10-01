/**
 * Post-hoc analyses for the trio re-evaluation (offline, no API calls).
 *
 * Reads retained run artifacts + the released benchmark/mesh artifacts and
 * writes research/runs/posthoc.json:
 *   1. B2+V — raw-marker retrieval (B2) with the vocabulary validation applied
 *      post hoc to its chip keys (factorial isolation of the validation step).
 *   2. Reference coverage — content-token recall of the auto-harvested
 *      gold_answer_brief (released v1 set) in the answer, per condition.
 *   3. Fisher exact test on hallucinated links, B2 vs B3 (pooled links).
 *   4. Reviewer agreement addendum: Fleiss kappa (cross-check against
 *      aggregate-review.mts) + Gwet's AC1, robust under near-ceiling
 *      prevalence.
 *   5. Latency overhead B3 vs B2 per run (from metrics.json).
 *
 * Usage (from apps/frontend):
 *   pnpm exec tsx scripts/posthoc-analysis.mts --runs trio-glm-r1,trio-deepseek-r1,trio-qwen-r1
 *     [--briefs ../research/benchmark/gold-answer-briefs.v3.ndjson]
 *     [--gold-patch ../research/benchmark/gold-v3-anervous003.patch.json]
 *
 * --gold-patch applies a gold patch POST-HOC (items whose must set was emptied
 * drop out of chip scoring) so the B2+V eligible set matches analyze-run.mts.
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
const RUNS = (arg("runs", "") ?? "").split(",").filter(Boolean);
const B = Number(arg("bootstrap", "10000"));
/** Reference briefs source. Default: the frozen v1 set (truncated-corpus
 *  harvest); pass --briefs to score against a re-harvested set (e.g. the
 *  fulltext v3 file) without touching frozen artifacts. */
const BRIEFS_FILE = arg(
  "briefs",
  path.join(REPO, "research/benchmark/anatomy3d-qb.v1.ndjson"),
)!;
if (!RUNS.length) {
  console.error("Need --runs <run-id,...>.");
  process.exit(2);
}

// --- artifacts ---------------------------------------------------------------
const meshArtifact = JSON.parse(
  fs.readFileSync(path.join(REPO, "research/benchmark/mesh-keys.json"), "utf8"),
);
const MESH_KEYS = new Set<string>(meshArtifact.meshKeys.map((r: { key: string }) => r.key));
/** Same construction as run-benchmark.mts (renderable ∪ vocab-without-mesh). */
const VOCAB_KEYS = new Set<string>([
  ...meshArtifact.meshKeys.map((r: { key: string }) => r.key),
  ...meshArtifact.vocabWithoutMesh.map((r: { key: string }) => r.key),
]);
const v1Items: Record<string, { gold_answer_brief?: string; type: string }> = {};
for (const line of fs.readFileSync(BRIEFS_FILE, "utf8").split("\n")) {
  if (!line.trim()) continue;
  const d = JSON.parse(line);
  v1Items[d.id] = d;
}
/** Post-hoc gold patch (see header): re-key must sets before scoring. */
const GOLD_PATCH = arg("gold-patch");
const patchedMust = (() => {
  if (!GOLD_PATCH || GOLD_PATCH === "none") return null;
  const patch = JSON.parse(fs.readFileSync(path.resolve(GOLD_PATCH), "utf8")) as {
    items: { item_id: string; v3_gold_structures_must: string[] }[];
  };
  return new Map(patch.items.map((p) => [p.item_id, p.v3_gold_structures_must]));
})();
/**
 * items.jsonl does not carry gold_structures_optional — join it from the run's
 * dataset (path + sha256 recorded in the manifest) so relaxed metrics match
 * the canonical scorer.
 */
const datasetOf = new Map<string, { gold_structures_optional?: string[] }>();
for (const RUN of RUNS) {
  const manifest = JSON.parse(fs.readFileSync(path.join(REPO, "research/runs", RUN, "manifest.json"), "utf8"));
  const dspath = path.join(REPO, manifest.dataset.path);
  for (const line of fs.readFileSync(dspath, "utf8").split("\n")) {
    if (!line.trim()) continue;
    const d = JSON.parse(line);
    if (!datasetOf.has(d.id)) datasetOf.set(d.id, d);
  }
}

// --- shared helpers (mirrors analyze-run.mts) --------------------------------
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
function bootstrapCI(values: number[], resamples: number, seed = 12345) {
  if (!values.length) return { lo: 0, hi: 0 };
  const rand = rng(seed);
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
    const rank = (i + j + 2) / 2;
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
function fisherExact2x2(a: number, b: number, c: number, d: number) {
  const n = a + b + c + d;
  const logFact = (k: number): number => {
    let s = 0;
    for (let i = 2; i <= k; i++) s += Math.log(i);
    return s;
  };
  // Table with x in cell a: rows (x, a+b-x), (a+c-x, d-a+x).
  const logP = (x: number) =>
    logFact(a + b) + logFact(c + d) + logFact(a + c) + logFact(b + d) -
    logFact(n) - logFact(x) - logFact(a + b - x) - logFact(a + c - x) - logFact(d - a + x);
  const obs = logP(a);
  let p = 0;
  for (let x = Math.max(0, a - d); x <= Math.min(a + b, a + c); x++) {
    const lp = logP(x);
    if (lp <= obs + 1e-9) p += Math.exp(lp);
  }
  return Math.min(1, p);
}

// --- chip metrics (mirrors run-benchmark.mts formulas) -----------------------
type Item = {
  id: string; type: string; system: string;
  gold_structures_must: string[]; gold_structures_optional?: string[];
  conditions: Record<string, { error: string | null; answer?: string; chip_keys?: string[] }[]>;
};
function chipMetricsFromKeys(rawKeys: string[], item: Item) {
  const must = new Set(item.gold_structures_must);
  const optional = new Set(item.gold_structures_optional ?? datasetOf.get(item.id)?.gold_structures_optional ?? []);
  const keys = [...new Set(rawKeys)];
  const tp = keys.filter((k) => must.has(k));
  const tpOpt = keys.filter((k) => must.has(k) || optional.has(k));
  const precision = keys.length ? tp.length / keys.length : must.size === 0 ? 1 : 0;
  const precisionOptional = keys.length ? tpOpt.length / keys.length : 1;
  const recall = must.size ? tp.length / must.size : 1;
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
  const f1Optional = precisionOptional + recall ? (2 * precisionOptional * recall) / (precisionOptional + recall) : 0;
  return {
    chip_precision: precision,
    chip_precision_optional: precisionOptional,
    chip_recall: recall,
    chip_f1: f1,
    chip_f1_optional: f1Optional,
    hallucinated: keys.filter((k) => !VOCAB_KEYS.has(k)),
    non_renderable: keys.filter((k) => VOCAB_KEYS.has(k) && !MESH_KEYS.has(k)),
    wrong_link: keys.filter((k) => MESH_KEYS.has(k) && !must.has(k) && !optional.has(k)),
  };
}

// --- reference coverage ------------------------------------------------------
const STOP = new Set(
  ("a an the and or of to in on at by for with from as is are was were be been being it its this that these those " +
    "which what who whom whose where when how why not no yes can could may might will would shall should must do does " +
    "did done have has had having than then so such also into onto over under between among through during before after " +
    "above below up down out off again further once here there all any both each few more most other some only own same " +
    "very s t just don now his her him she he they them their we our us you your i me my mine mr fig figure table").split(" "),
);
function tokens(s: string): string[] {
  return (s.toLowerCase().match(/[a-z]+/g) ?? []).filter((w) => w.length >= 3 && !STOP.has(w));
}
/** Content-token recall of the brief in the answer, excluding query-given words. */
function referenceCoverage(brief: string, answer: string, query: string): number | null {
  const q = new Set(tokens(query));
  const briefTok = [...new Set(tokens(brief))].filter((w) => !q.has(w));
  if (!briefTok.length) return null;
  const ans = new Set(tokens(answer));
  return briefTok.filter((w) => ans.has(w)).length / briefTok.length;
}

// --- per-run analysis ---------------------------------------------------------
type RunOut = {
  runId: string;
  b2plusV: { n: number; precision: number; precision_optional: number; recall: number; f1: number; f1_optional: number; ci95_f1_optional: { lo: number; hi: number }; hallucinated_total: number; non_renderable_total: number; wrong_link_total: number } | null;
  coverage: Record<string, { n: number; mean: number; ci95: { lo: number; hi: number } }> | null;
  coverage_pairs: { b1_vs_b3_wilcoxon_p: number; b2_vs_b3_wilcoxon_p: number } | null;
  coverage_sentence_subset: Record<string, { n: number; mean: number }> | null;
  fisher_hallucination_b2_vs_b3: { b2_halluc: number; b2_links: number; b3_halluc: number; b3_links: number; p: number } | null;
  latency_b3_minus_b2_ms: number | null;
};
const out: Record<string, unknown> = { vocabKeys: VOCAB_KEYS.size, meshKeys: MESH_KEYS.size, runs: {} as RunOut[] };
const runsOut: Record<string, RunOut> = {};
for (const RUN of RUNS) {
  const RUN_DIR = path.join(REPO, "research", "runs", RUN);
  const items: Item[] = fs
    .readFileSync(path.join(RUN_DIR, "items.jsonl"), "utf8")
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l));
  if (patchedMust) {
    for (const it of items) {
      const must = patchedMust.get(it.id);
      if (must) it.gold_structures_must = must;
    }
  }
  const metrics = JSON.parse(fs.readFileSync(path.join(RUN_DIR, "metrics.json"), "utf8"));
  const runOut: RunOut = { runId: RUN, b2plusV: null, coverage: null, coverage_pairs: null, coverage_sentence_subset: null, fisher_hallucination_b2_vs_b3: null, latency_b3_minus_b2_ms: null };

  // 1. B2+V: vocabulary validation applied post hoc to raw B2 marker keys.
  const eligible = items.filter((it) => it.gold_structures_must.length > 0);
  const b2v = eligible
    .map((it) => {
      const rec = (it.conditions.B2 ?? []).find((r) => !r.error);
      if (!rec) return null;
      const validated = (rec.chip_keys ?? []).filter((k) => VOCAB_KEYS.has(k));
      return chipMetricsFromKeys(validated, it);
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  if (b2v.length) {
    runOut.b2plusV = {
      n: b2v.length,
      precision: mean(b2v.map((m) => m.chip_precision)),
      precision_optional: mean(b2v.map((m) => m.chip_precision_optional)),
      recall: mean(b2v.map((m) => m.chip_recall)),
      f1: mean(b2v.map((m) => m.chip_f1)),
      f1_optional: mean(b2v.map((m) => m.chip_f1_optional)),
      ci95_f1_optional: bootstrapCI(b2v.map((m) => m.chip_f1_optional), B, 54321),
      hallucinated_total: b2v.reduce((s, m) => s + m.hallucinated.length, 0),
      non_renderable_total: b2v.reduce((s, m) => s + m.non_renderable.length, 0),
      wrong_link_total: b2v.reduce((s, m) => s + m.wrong_link.length, 0),
    };
  }

  // 2. Reference coverage (F/R items with a brief in the released v1 set).
  const covRecs = items
    .map((it) => {
      if (it.type !== "F" && it.type !== "R") return null;
      const brief = v1Items[it.id]?.gold_answer_brief;
      if (!brief) return null;
      const perCond: Record<string, number | null> = {};
      for (const cond of ["B1", "B2", "B3"]) {
        const rec = (it.conditions[cond] ?? []).find((r) => !r.error);
        perCond[cond] = rec ? referenceCoverage(brief, rec.answer ?? "", it.query || "") : null;
      }
      return { id: it.id, perCond };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  const cov: Record<string, { n: number; mean: number; ci95: { lo: number; hi: number } }> = {};
  for (const cond of ["B1", "B2", "B3"]) {
    const vals = covRecs.map((r) => r.perCond[cond]).filter((v): v is number => v !== null);
    if (!vals.length) continue;
    cov[cond] = { n: vals.length, mean: mean(vals), ci95: bootstrapCI(vals, B, 999) };
  }
  const paired = (a: string, b: string) =>
    wilcoxon(
      covRecs.map((r) => r.perCond[a] ?? 0),
      covRecs.map((r) => r.perCond[b] ?? 0),
    ).p;
  runOut.coverage = cov;
  runOut.coverage_pairs = { b1_vs_b3_wilcoxon_p: paired("B1", "B3"), b2_vs_b3_wilcoxon_p: paired("B2", "B3") };
  // Robustness: briefs that are actual sentences (>= 8 content tokens) only.
  const sub: Record<string, { n: number; mean: number }> = {};
  for (const cond of ["B1", "B2", "B3"]) {
    const qTokens = new Set(tokens(""));
    void qTokens;
    const vals = covRecs
      .map((r) => {
        const brief = v1Items[r.id]?.gold_answer_brief ?? "";
        const qt = new Set(tokens(items.find((it) => it.id === r.id)?.query || ""));
        return [...new Set(tokens(brief))].filter((w) => !qt.has(w)).length >= 8 ? r.perCond[cond] : null;
      })
      .filter((v): v is number => v !== null);
    if (vals.length) sub[cond] = { n: vals.length, mean: mean(vals) };
  }
  runOut.coverage_sentence_subset = sub;

  // 3. Fisher exact on hallucinated links, B2 vs B3 (pooled unique keys).
  const linkCounts = (cond: string) => {
    let links = 0, halluc = 0;
    for (const it of items) {
      const rec = (it.conditions[cond] ?? []).find((r) => !r.error);
      if (!rec) continue;
      const keys = [...new Set(rec.chip_keys ?? [])];
      links += keys.length;
      halluc += keys.filter((k) => !VOCAB_KEYS.has(k)).length;
    }
    return { links, halluc };
  };
  const b2l = linkCounts("B2");
  const b3l = linkCounts("B3");
  runOut.fisher_hallucination_b2_vs_b3 = {
    b2_halluc: b2l.halluc, b2_links: b2l.links, b3_halluc: b3l.halluc, b3_links: b3l.links,
    p: fisherExact2x2(b2l.halluc, b2l.links - b2l.halluc, b3l.halluc, b3l.links - b3l.halluc),
  };

  // 5. Latency overhead.
  const lat = (c: string) => metrics.perCondition?.[c]?.mean_duration_ms;
  if (lat("B2") != null && lat("B3") != null) runOut.latency_b3_minus_b2_ms = lat("B3") - lat("B2");

  runsOut[RUN] = runOut;
  console.log(`\n== ${RUN}`);
  if (runOut.b2plusV) {
    const v = runOut.b2plusV;
    console.log(`B2+V: n=${v.n} F1opt=${v.f1_optional.toFixed(3)} [${v.ci95_f1_optional.lo.toFixed(3)}, ${v.ci95_f1_optional.hi.toFixed(3)}] Popt=${v.precision_optional.toFixed(3)} R=${v.recall.toFixed(3)} halluc=${v.hallucinated_total} wrong=${v.wrong_link_total} nonRend=${v.non_renderable_total}`);
  }
  for (const [c, v] of Object.entries(runOut.coverage ?? {})) console.log(`coverage ${c}: n=${v.n} ${v.mean.toFixed(3)} [${v.ci95.lo.toFixed(3)}, ${v.ci95.hi.toFixed(3)}]`);
  console.log(`coverage Wilcoxon B1→B3 p=${runOut.coverage_pairs?.b1_vs_b3_wilcoxon_p.toExponential(1)}  B2→B3 p=${runOut.coverage_pairs?.b2_vs_b3_wilcoxon_p.toExponential(1)}`);
  for (const [c, v] of Object.entries(runOut.coverage_sentence_subset ?? {})) console.log(`coverage(sentence-subset) ${c}: n=${v.n} ${v.mean.toFixed(3)}`);
  const f = runOut.fisher_hallucination_b2_vs_b3!;
  console.log(`halluc links B2 ${f.b2_halluc}/${f.b2_links} vs B3 ${f.b3_halluc}/${f.b3_links} — Fisher p=${f.p.toExponential(2)}`);
  if (runOut.latency_b3_minus_b2_ms != null) console.log(`latency B3−B2 = ${(runOut.latency_b3_minus_b2_ms / 1000).toFixed(1)} s`);
}

// --- 4. reviewer agreement addendum (Gwet AC1 + Fleiss kappa) -----------------
function readVerdicts(file: string) {
  const rows: Record<string, Record<string, 0 | 1>> = {};
  for (const line of fs.readFileSync(file, "utf8").split("\n").slice(1)) {
    if (!line.trim()) continue;
    // CSV: item_id,must_ok,optional_ok,query_ok,notes — notes may contain commas.
    const m = line.match(/^([^,]+),(\d),(\d),(\d),/);
    if (!m) continue;
    rows[m[1]] = { must_ok: Number(m[2]) as 0 | 1, optional_ok: Number(m[3]) as 0 | 1, query_ok: Number(m[4]) as 0 | 1 };
  }
  return rows;
}
const REVIEW_DIR = path.join(REPO, "research/benchmark/review");
const reviewers = ["glm", "deepseek", "qwen"].map((r) => readVerdicts(path.join(REVIEW_DIR, `gold-verdicts-${r}.csv`)));
const itemIds = Object.keys(reviewers[0]).filter((id) => reviewers.every((rv) => id in rv));
function agreementStats(column: string) {
  // n_ik = number of reviewers assigning item i to category k (binary).
  const ratings = itemIds.map((id) => reviewers.map((rv) => rv[id][column]));
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
  const Pe = 2 * p1 * (1 - p1); // Gwet's Pe for q=2: (1/(q-1)) * sum pi(1-pi)
  const ac1 = (Pa - Pe) / (1 - Pe);
  // Fleiss kappa (cross-check against aggregate-review.mts).
  const Pbar = (2 * sumAgree) / (n * r * (r - 1));
  const PeFleiss = (marg[0] / (n * r)) ** 2 + (marg[1] / (n * r)) ** 2;
  const fleiss = (Pbar - PeFleiss) / (1 - PeFleiss);
  return { n, raters: r, observed_agreement: Pa, gwet_ac1: ac1, fleiss_kappa: fleiss, positive_rate: p1 };
}
const agreement: Record<string, ReturnType<typeof agreementStats>> = {};
for (const col of ["must_ok", "optional_ok", "query_ok"]) agreement[col] = agreementStats(col);
out.reviewAgreement = { items: itemIds.length, perColumn: agreement };
console.log("\n== reviewer agreement");
for (const [col, s] of Object.entries(agreement))
  console.log(`${col}: n=${s.n} Fleiss κ=${s.fleiss_kappa.toFixed(3)}  Gwet AC1=${s.gwet_ac1.toFixed(3)}  positive_rate=${s.positive_rate.toFixed(2)}`);

out.runs = runsOut;
const OUT = path.resolve(arg("out", path.join(REPO, "research/runs/posthoc.json"))!);
fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
console.log(`\nwritten: ${path.relative(REPO, OUT)}`);
