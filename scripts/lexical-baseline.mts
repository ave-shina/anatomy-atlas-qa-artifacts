/**
 * Lexical no-LLM chip baseline (condition L) — post-hoc, no API calls.
 *
 * Chips = structure names literally occurring in a B3 answer text, matched
 * with {@link annotatePrecise} (the same longest-match word-boundary matcher
 * the client uses as its lexical fallback). Scored against gold with the
 * exact chipMetrics formulas from run-benchmark.mts, on the same eligible set
 * (items with a non-empty gold `must` and a successful generation).
 *
 * Purpose: isolates the [[obj:]] marker contract. B3's chips come from model
 * markers in the SAME answer text; condition L shows what a pure lexical
 * extractor would get from that text, i.e. how much of B3's chip quality is
 * the marker contract vs. the prose itself.
 *
 * Usage (from apps/frontend):
 *   pnpm exec tsx scripts/lexical-baseline.mts \
 *     --runs ft-glm-r1,ft-deepseek-r1,ft-qwen-r1 \
 *     --gold-patch ../../research/benchmark/gold-v3-anervous003.patch.json
 *
 * --gold-patch applies a gold patch POST-HOC (items whose must set was emptied
 * drop out of chip scoring) so the eligible set matches analyze-run.mts --gold-patch.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { annotatePrecise } from "../src/lib/rag/grounding";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..", "..");

const argv = process.argv.slice(2);
const arg = (name: string, def?: string): string | undefined => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const RUNS = (arg("runs", "trio-glm-r1,trio-deepseek-r1,trio-qwen-r1")!).split(",");
const BASE_COND = arg("cond", "B3")!;
/** Matcher cap; the frozen lexical-baseline artifacts used the default 24.
 *  Pass --limit Infinity to match the uncapped shipped system. */
const LIMIT = arg("limit", "24") === "Infinity" ? Infinity : Number(arg("limit", "24"));
// Post-hoc gold patch (see header) — applied to every run's items below.
const GOLD_PATCH = arg("gold-patch");
const patchedMust = (() => {
  if (!GOLD_PATCH || GOLD_PATCH === "none") return null;
  const patch = JSON.parse(fs.readFileSync(path.resolve(GOLD_PATCH), "utf8")) as {
    items: { item_id: string; v3_gold_structures_must: string[] }[];
  };
  return new Map(patch.items.map((p) => [p.item_id, p.v3_gold_structures_must]));
})();

const meshArtifact = JSON.parse(
  fs.readFileSync(path.join(REPO, "research/benchmark/mesh-keys.json"), "utf8"),
);
const MESH_KEYS = new Set<string>(meshArtifact.meshKeys.map((r: { key: string }) => r.key));
const VOCAB_KEYS = new Set<string>([
  ...meshArtifact.meshKeys.map((r: { key: string }) => r.key),
  ...meshArtifact.vocabWithoutMesh.map((r: { key: string }) => r.key),
]);

type Item = {
  id: string; type: string; system: string;
  gold_structures_must: string[]; gold_structures_optional?: string[];
  conditions: Record<string, { error: string | null; answer: string }[]>;
};

function chipMetrics(keys: string[], item: Item) {
  const must = new Set(item.gold_structures_must);
  const optional = new Set(item.gold_structures_optional ?? []);
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

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const r4 = (x: number) => Number(x.toFixed(4));

function wilcoxon(a: number[], b: number[]) {
  const d = a.map((x, i) => x - b[i]).filter((x) => x !== 0);
  const n = d.length;
  if (n === 0) return { n: 0, p: 1 };
  const abs = d.map((v) => Math.abs(v));
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
  // Abramowitz–Stegun erf approximation.
  const phi = (zz: number) => {
    const t = 1 / (1 + 0.2316419 * Math.abs(zz));
    const dd = 0.3989423 * Math.exp((-zz * zz) / 2);
    const p = dd * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return zz > 0 ? 1 - p : p;
  };
  return { n, wPlus, p: Math.min(1, 2 * (1 - phi(Math.abs(z)))) };
}

const outDir = path.resolve(
  arg("out-dir", path.join(REPO, "research", "runs", "lexical-baseline"))!,
);
fs.mkdirSync(outDir, { recursive: true });
const summary: Record<string, unknown> = { condition: "L (lexical, post-hoc over B3 answers)", matcher: "annotatePrecise", matcher_limit: LIMIT === Infinity ? "Infinity" : LIMIT, base_cond: BASE_COND, runs: {} };

for (const run of RUNS) {
  const items: Item[] = fs
    .readFileSync(path.join(REPO, "research", "runs", run, "items.jsonl"), "utf8")
    .split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
  if (patchedMust) {
    for (const it of items) {
      const must = patchedMust.get(it.id);
      if (must) it.gold_structures_must = must;
    }
  }
  const detail: (Record<string, unknown> | null)[] = [];
  const perItemL: (number | null)[] = [];
  const perItemB3: (number | null)[] = [];
  for (const it of items) {
    const gen = (it.conditions[BASE_COND] ?? [])[0];
    const eligible = it.gold_structures_must.length > 0;
    if (!gen || gen.error || !eligible) {
      detail.push(null);
      perItemL.push(null);
      perItemB3.push(null);
      continue;
    }
    const keys = annotatePrecise(gen.answer, LIMIT);
    const m = chipMetrics(keys, it);
    detail.push({ id: it.id, type: it.type, n_keys: keys.length, keys, ...m });
    perItemL.push(m.chip_f1_optional);
    perItemB3.push(Number(gen.chip_f1_optional ?? 0));
  }
  const idx = perItemL.map((v, i) => (v !== null ? i : -1)).filter((i) => i >= 0);
  const d = (i: number) => detail[i] as {
    chip_precision: number; chip_precision_optional: number; chip_recall: number;
    chip_f1: number; wrong_link: string[]; non_renderable: string[]; hallucinated: string[];
  };
  const byType: Record<string, { n: number; chip_f1_optional: number; chip_recall: number; chip_precision_optional: number }> = {};
  for (const t of ["F", "R", "A"]) {
    const ti = idx.filter((i) => items[i].type === t);
    if (!ti.length) continue;
    byType[t] = {
      n: ti.length,
      chip_f1_optional: mean(ti.map((i) => perItemL[i]!)),
      chip_recall: mean(ti.map((i) => d(i).chip_recall)),
      chip_precision_optional: mean(ti.map((i) => d(i).chip_precision_optional)),
    };
  }
  const paired = wilcoxon(idx.map((i) => perItemL[i]!), idx.map((i) => perItemB3[i]!));
  const agg = {
    n_items: items.length,
    n_chip_scored: idx.length,
    chip_precision: mean(idx.map((i) => d(i).chip_precision)),
    chip_precision_optional: mean(idx.map((i) => d(i).chip_precision_optional)),
    chip_recall: mean(idx.map((i) => d(i).chip_recall)),
    chip_f1: mean(idx.map((i) => d(i).chip_f1)),
    chip_f1_optional: mean(idx.map((i) => perItemL[i]!)),
    wrong_link_total: idx.reduce((a, i) => a + d(i).wrong_link.length, 0),
    non_renderable_total: idx.reduce((a, i) => a + d(i).non_renderable.length, 0),
    hallucinated_total: idx.reduce((a, i) => a + d(i).hallucinated.length, 0),
    byType,
  };
  fs.writeFileSync(path.join(outDir, `${run}.items.jsonl`), detail.filter((x) => x !== null).map((x) => JSON.stringify(x)).join("\n") + "\n");
  summary.runs[run] = {
    ...agg,
    paired_vs_B3_f1opt: { n: paired.n, mean_diff: r4(mean(idx.map((i) => perItemL[i]! - perItemB3[i]!))), wilcoxon_p: Number(paired.p.toPrecision(3)) },
  };
  console.log(`${run}: F1opt=${agg.chip_f1_optional.toFixed(3)} Popt=${agg.chip_precision_optional.toFixed(3)} R=${agg.chip_recall.toFixed(3)} (n=${agg.n_chip_scored})  Δ vs B3=${(mean(idx.map((i) => perItemL[i]! - perItemB3[i]!))).toFixed(3)}  p=${paired.p.toExponential(2)}`);
  console.log(`   byType F=${byType.F?.chip_f1_optional.toFixed(3)} R=${byType.R?.chip_f1_optional.toFixed(3)} A=${byType.A?.chip_f1_optional.toFixed(3)}  wrong_links=${agg.wrong_link_total}`);
}

fs.writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
console.log(`written: ${path.relative(REPO, outDir)}/summary.json (+ per-run .items.jsonl)`);
