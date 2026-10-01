/**
 * Offline chip re-scoring under a different chip cap (no API calls).
 *
 * The ft-era runs executed with MAX_OBJECT_CHIPS = 12, and 27–41 of 330
 * records per run saturated the cap, so the frozen chip metrics describe a
 * truncated chip set. This script re-extracts chips from the RETAINED answer
 * texts with the same per-condition recipe at run time, under an arbitrary
 * cap, and re-aggregates with analyze-run.mts's exact procedure (seeded
 * bootstrap, identical RNG consumption order) into analysis-uncapped.json —
 * the frozen items.jsonl / metrics.json / analysis.json are never modified.
 *
 * Per-condition extraction recipe (mirrors the run-time pipelines):
 *   B1/B2 — raw [[obj:key]] markers only, no vocabulary filter
 *           (pipeline-variants.mts).
 *   B3    — markers, then structure-name fallback (annotatePrecise) on the
 *           marker-stripped text, deduped markers-first, vocabulary-filtered
 *           (chat.ts objects event).
 *
 * Usage (from apps/frontend):
 *   pnpm exec tsx scripts/rescore-chips-uncapped.mts \
 *     --runs ft-glm-r1,ft-deepseek-r1,ft-qwen-r1 \
 *     [--cap 12|Infinity] [--out analysis-uncapped.json] \
 *     [--gold-patch ../../research/benchmark/gold-v3-anervous003.patch.json]
 *
 * Verify first: `--cap 12` must reproduce the frozen analysis.json point
 * estimates (and CIs — same seed) before the uncapped numbers are trusted.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { annotatePrecise, vocabDisplay } from "@/lib/rag/grounding";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..", "..");
const argv = process.argv.slice(2);
const arg = (name: string, def?: string): string | undefined => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const RUNS = (arg("runs", "") ?? "").split(",").filter(Boolean);
const CAP = arg("cap", "Infinity") === "Infinity" ? Infinity : Number(arg("cap"));
const B = Number(arg("bootstrap", "10000"));
const OUT_NAME = arg("out", "analysis-uncapped.json")!;
const GOLD_PATCH = arg("gold-patch", path.join(REPO, "research/benchmark/gold-v3-anervous003.patch.json"))!;
if (!RUNS.length) {
  console.error("Need --runs <run-id,...>.");
  process.exit(2);
}

// --- scorer artifacts (same source as run-benchmark.mts / posthoc-analysis) --
const meshArtifact = JSON.parse(
  fs.readFileSync(path.join(REPO, "research/benchmark/mesh-keys.json"), "utf8"),
);
const MESH_KEYS = new Set<string>(meshArtifact.meshKeys.map((r: { key: string }) => r.key));
const VOCAB_KEYS = new Set<string>([
  ...meshArtifact.meshKeys.map((r: { key: string }) => r.key),
  ...meshArtifact.vocabWithoutMesh.map((r: { key: string }) => r.key),
]);

// --- extraction (mirrors chat.ts / pipeline-variants.mts) --------------------
const OBJ_MARKER_PATTERN = "\\[\\[obj:\\s*([a-z0-9]+)\\s*\\]\\]";
function extractObjectKeys(text: string): string[] {
  const keys: string[] = [];
  const re = new RegExp(OBJ_MARKER_PATTERN, "gi");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const key = m[1].toLowerCase();
    if (!keys.includes(key)) keys.push(key);
  }
  return keys;
}
function chipKeys(condition: string, answer: string): string[] {
  if (condition !== "B3") {
    return [...new Set(extractObjectKeys(answer))].slice(0, CAP);
  }
  // chat.ts objects event: markers first, lexical fallback on the stripped
  // text, dedup, vocabulary filter, then the cap.
  const stripped = answer.replace(new RegExp(OBJ_MARKER_PATTERN, "gi"), " ");
  return [
    ...new Set([...extractObjectKeys(answer), ...annotatePrecise(stripped, CAP)]),
  ]
    .filter((k) => vocabDisplay(k) !== undefined)
    .slice(0, CAP);
}

// --- per-record chip metrics (mirrors run-benchmark.mts chipMetrics) ---------
function chipMetrics(keys: string[], must: string[], optional: string[]) {
  const mustSet = new Set(must);
  const optSet = new Set(optional);
  const uniq = [...new Set(keys)];
  const tp = uniq.filter((k) => mustSet.has(k));
  const tpOpt = uniq.filter((k) => mustSet.has(k) || optSet.has(k));
  const precision = uniq.length ? tp.length / uniq.length : mustSet.size === 0 ? 1 : 0;
  const precisionOptional = uniq.length ? tpOpt.length / uniq.length : 1;
  const recall = mustSet.size ? tp.length / mustSet.size : 1;
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
  const f1Optional =
    precisionOptional + recall ? (2 * precisionOptional * recall) / (precisionOptional + recall) : 0;
  return {
    chip_precision: precision,
    chip_precision_optional: precisionOptional,
    chip_recall: recall,
    chip_f1: f1,
    chip_f1_optional: f1Optional,
    hallucinated: uniq.filter((k) => !VOCAB_KEYS.has(k)),
    non_renderable: uniq.filter((k) => VOCAB_KEYS.has(k) && !MESH_KEYS.has(k)),
    wrong_link: uniq.filter((k) => MESH_KEYS.has(k) && !mustSet.has(k) && !optSet.has(k)),
    chip_keys: uniq,
  };
}

// --- aggregation (mirrors analyze-run.mts, incl. RNG consumption order) ------
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

// --- gold patch (post-hoc, mirrors analyze-run.mts) --------------------------
const patchedMust = (() => {
  if (!GOLD_PATCH || GOLD_PATCH === "none") return null;
  const patch = JSON.parse(fs.readFileSync(path.resolve(GOLD_PATCH), "utf8")) as {
    items: { item_id: string; v3_gold_structures_must: string[] }[];
  };
  return new Map(patch.items.map((p) => [p.item_id, p.v3_gold_structures_must]));
})();

type Rec = {
  error: string | null;
  answer?: string;
} & Partial<ReturnType<typeof chipMetrics>>;

for (const RUN of RUNS) {
  const RUN_DIR = path.join(REPO, "research", "runs", RUN);
  const manifest = JSON.parse(fs.readFileSync(path.join(RUN_DIR, "manifest.json"), "utf8"));
  const conditions: string[] = manifest.conditions;
  type Item = {
    id: string; type: string; system: string;
    gold_structures_must: string[]; gold_structures_optional?: string[]; expects_clarification?: boolean;
    conditions: Record<string, Rec[]>;
  };
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
  // items.jsonl does not carry gold_structures_optional — join from the run
  // dataset (posthoc-analysis.mts pattern).
  const optionalOf = new Map<string, string[]>();
  const dspath = path.join(REPO, manifest.dataset.path);
  for (const line of fs.readFileSync(dspath, "utf8").split("\n")) {
    if (!line.trim()) continue;
    const d = JSON.parse(line);
    if (!optionalOf.has(d.id)) optionalOf.set(d.id, d.gold_structures_optional ?? []);
  }

  // Re-extract + recompute per-record chip metrics from retained answers.
  for (const it of items) {
    const optional = it.gold_structures_optional ?? optionalOf.get(it.id) ?? [];
    for (const cond of conditions) {
      for (const rec of it.conditions[cond] ?? []) {
        if (rec.error) continue;
        Object.assign(rec, chipMetrics(chipKeys(cond, rec.answer ?? ""), it.gold_structures_must, optional));
      }
    }
  }

  const eligible = items.map((it, i) => (it.gold_structures_must.length > 0 ? i : -1)).filter((i) => i >= 0);
  const summary: Record<string, unknown> = {};
  for (const cond of conditions) {
    const itemValue = (key: keyof ReturnType<typeof chipMetrics>): (number | null)[] =>
      items.map((it) => {
        const reps = (it.conditions[cond] ?? []) as (Rec & Record<string, unknown>)[];
        const vals = reps.filter((r) => !r.error).map((r) => Number(r[key] ?? 0));
        return vals.length ? mean(vals) : null;
      });
    const f1 = itemValue("chip_f1");
    const f1o = itemValue("chip_f1_optional");
    const pr = itemValue("chip_precision");
    const prO = itemValue("chip_precision_optional");
    const rc = itemValue("chip_recall");
    const scored = eligible.filter((i) => f1[i] !== null);
    const g = (arr: (number | null)[]) => scored.map((i) => arr[i] as number);
    const agg = (key: "hallucinated" | "non_renderable" | "wrong_link") =>
      scored.reduce((a, i) => a + (items[i].conditions[cond] ?? []).reduce((s, r) => s + (r[key] as string[]).length, 0), 0);
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
    summary[cond] = {
      n: items.length,
      n_chip_scored: scored.length,
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

  // B2+V: vocabulary validation applied post hoc to the uncapped raw B2
  // markers (posthoc-analysis.mts's factorial condition, uncapped).
  const b2v = eligible
    .map((i) => {
      const it = items[i];
      const rec = (it.conditions["B2"] ?? []).find((r) => !r.error);
      if (!rec) return null;
      const optional = it.gold_structures_optional ?? optionalOf.get(it.id) ?? [];
      const validated = chipKeys("B2", rec.answer ?? "").filter((k) => VOCAB_KEYS.has(k));
      return chipMetrics(validated, it.gold_structures_must, optional);
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  const b2plusV = b2v.length
    ? {
        n: b2v.length,
        chip_f1_optional: mean(b2v.map((m) => m.chip_f1_optional)),
        chip_recall: mean(b2v.map((m) => m.chip_recall)),
        chip_precision_optional: mean(b2v.map((m) => m.chip_precision_optional)),
      }
    : null;
  const pairs: [string, string][] = [];
  for (let i = 0; i < conditions.length; i++)
    for (let j = i + 1; j < conditions.length; j++) pairs.push([conditions[i], conditions[j]]);
  const comparisons = pairs.map(([A, Bc]) => {
    const val = (cond: string, key: "chip_f1" | "chip_f1_optional" | "chip_recall") =>
      items.map((it) => {
        const reps = it.conditions[cond] ?? [];
        const vals = reps.filter((r) => !r.error).map((r) => Number(r[key] ?? 0));
        return vals.length ? mean(vals) : null;
      });
    const aF1all = val(A, "chip_f1");
    const bF1all = val(Bc, "chip_f1");
    const aF1oAll = val(A, "chip_f1_optional");
    const bF1oAll = val(Bc, "chip_f1_optional");
    const aRCall = val(A, "chip_recall");
    const bRCall = val(Bc, "chip_recall");
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
    chipCap: CAP === Infinity ? "Infinity" : CAP,
    note:
      "Chip keys re-extracted offline from the retained answer texts under the " +
      `chip cap = ${CAP === Infinity ? "no cap" : CAP} (runs executed with cap 12); ` +
      "aggregation mirrors analyze-run.mts (seeded bootstrap, gold v3 patch applied). " +
      "Frozen items.jsonl / metrics.json / analysis.json untouched.",
    conditions: summary,
    comparisons,
    b2plusV,
  };
  const OUT = path.join(RUN_DIR, OUT_NAME);
  fs.writeFileSync(OUT, JSON.stringify(analysis, null, 2) + "\n");

  // --- print: new vs frozen analysis.json -----------------------------------
  console.log(`\n== ${RUN} (cap = ${CAP === Infinity ? "∞" : CAP}) → ${path.relative(REPO, OUT)}`);
  const frozenPath = path.join(RUN_DIR, "analysis.json");
  const frozen = fs.existsSync(frozenPath)
    ? (JSON.parse(fs.readFileSync(frozenPath, "utf8")) as { conditions: Record<string, Record<string, any>> })
    : null;
  for (const cond of conditions) {
    const s = summary[cond] as Record<string, any>;
    const f = frozen?.conditions?.[cond] as Record<string, any> | undefined;
    const fmt = (v: number) => v.toFixed(3);
    console.log(
      `${cond}: F1opt=${fmt(s.chip_f1_optional)} [${fmt(s.ci95_f1_optional.lo)}, ${fmt(s.ci95_f1_optional.hi)}]  ` +
        `R=${fmt(s.chip_recall)}  Popt=${fmt(s.chip_precision_optional)}  n=${s.n_chip_scored}` +
        (f
          ? `   | frozen: F1opt=${fmt(f.chip_f1_optional)} R=${fmt(f.chip_recall)} Popt=${fmt(f.chip_precision_optional)} n=${f.n_chip_scored}`
          : ""),
    );
    console.log(
      `     strict F1=${fmt(s.chip_f1)} P=${fmt(s.chip_precision)}  halluc=${s.hallucinated_total} wrong=${s.wrong_link_total} nonRender=${s.non_renderable_total}` +
        (f ? `   | frozen: F1=${fmt(f.chip_f1)} P=${fmt(f.chip_precision)} halluc=${f.hallucinated_total} wrong=${f.wrong_link_total} nonRender=${f.non_renderable_total}` : ""),
    );
  }
  for (const c of comparisons) {
    console.log(`${c.a} vs ${c.b}: ΔF1opt=${c.mean_diff_f1_optional.toFixed(3)} (Wx p=${c.wilcoxon_f1_optional.p.toExponential(1)})  McNemar p=${c.mcnemar_linked.p.toExponential(1)}`);
  }
  if (b2plusV) {
    const b2 = summary["B2"] as Record<string, number>;
    console.log(`B2+V uncapped: F1opt=${b2plusV.chip_f1_optional.toFixed(4)} (B2 uncapped ${(b2.chip_f1_optional as number).toFixed(4)}, Δ=${(b2plusV.chip_f1_optional - b2.chip_f1_optional).toFixed(4)})  R=${b2plusV.chip_recall.toFixed(4)}`);
  }
}
