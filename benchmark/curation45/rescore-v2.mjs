#!/usr/bin/env node
/**
 * Offline re-scoring of trio dense retrieval under gold v2 (curated45 patch).
 *
 * No API calls: ranks come from the stored `retrieval.retrieved` ids of each
 * trio-*-r1 run (the deployed B3 dense arm, top-6). v1 and v2 are recomputed
 * with identical code from the same ranks.
 *
 * Views (deliberate, to avoid mixing effects):
 *   S_both   — items with gold in BOTH v1 and v2 (292 - 30 newly gold-less).
 *              v1-vs-v2 delta here isolates the gold-fix effect alone.
 *   S_dropped— the 30 items that lose all gold under v2 (their v1 scores were
 *              measured against weak/arbitrary gold; reported, then excluded).
 *   S_curated— the 15 curated45 items that keep gold under v2 (descriptive,
 *              tiny n, wide CIs).
 *
 * Output: rescore-v2[-<prefix>]-results.json, rescore-v2[-<prefix>]-summary.md
 * Usage: node rescore-v2.mjs [--runs <id,id,id>] [--out-prefix <prefix>]
 *   Defaults reproduce the frozen trio artifacts (trio-*-r1, no prefix).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BENCH = path.dirname(HERE);
const RUNS = path.join(BENCH, "../runs");
const argv = process.argv.slice(2);
const arg = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const RUN_IDS = (arg("runs", "trio-glm-r1,trio-deepseek-r1,trio-qwen-r1"))
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const PREFIX = arg("out-prefix", "");
const B = 10000; // bootstrap resamples

const items = [];
for (const line of fs.readFileSync(path.join(BENCH, "anatomy3d-qb.v1.ndjson"), "utf8").split("\n")) {
  if (line.trim()) items.push(JSON.parse(line));
}
const patch = JSON.parse(fs.readFileSync(path.join(HERE, "gold-v2-chunk45.patch.json"), "utf8"));
const v2ById = new Map(patch.items.map((p) => [p.item_id, p.v2_gold_chunk_ids]));
const v1ById = new Map(items.map((i) => [i.id, i.gold_chunk_ids ?? []]));

const goldOf = (runItem) => {
  const v1 = v1ById.get(runItem.id) ?? [];
  const v2 = v2ById.has(runItem.id) ? v2ById.get(runItem.id) : v1;
  return { v1, v2 };
};

const metrics = (retrieved, gold) => {
  if (!gold.length) return null;
  const pos = new Set(gold);
  const frac = (k) => retrieved.slice(0, k).filter((id) => pos.has(id)).length / gold.length;
  let mrr = 0;
  for (let i = 0; i < retrieved.length; i++) {
    if (pos.has(retrieved[i])) {
      mrr = 1 / (i + 1);
      break;
    }
  }
  return { recall_at_3: frac(3), recall_at_6: frac(6), mrr };
};
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
const boot = (xs, metric) => {
  if (xs.length < 2) return { lo: null, hi: null };
  const vals = [];
  let seed = 12345;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let b = 0; b < B; b++) {
    const s = [];
    for (let i = 0; i < xs.length; i++) s.push(xs[Math.floor(rnd() * xs.length)]);
    vals.push(mean(s.map(metric)));
  }
  vals.sort((a, b) => a - b);
  return { lo: vals[Math.floor(0.025 * B)], hi: vals[Math.ceil(0.975 * B) - 1] };
};

// per run: per-item metric records under v1 and v2
// default invocation keeps the frozen trio-era date byte-identical; prefixed
// runs (e.g. --out-prefix ft on the fulltext era) stamp their own date.
const DATE = PREFIX ? new Date().toISOString().slice(0, 10) : "2026-09-26";
const results = { date: DATE, bootstrap: B, note: "ranks from stored dense retrieval (top-6); identical metric code for v1/v2", runs: {} };
const pooled = { both: { v1: {}, v2: {} } };

for (const rid of RUN_IDS) {
  const lines = fs.readFileSync(path.join(RUNS, rid, "items.jsonl"), "utf8").split("\n").filter((l) => l.trim());
  const rows = lines.map((l) => JSON.parse(l));
  const recs = [];
  for (const it of rows) {
    // a harness retrieval error leaves no stored ranks — the item has no
    // place in any view (none of the trio-era runs hit this path).
    if (!it.retrieval?.retrieved) continue;
    const g = goldOf(it);
    const m1 = metrics(it.retrieval.retrieved, g.v1);
    const m2 = metrics(it.retrieval.retrieved, g.v2);
    recs.push({ id: it.id, v1: m1, v2: m2, both: Boolean(m1 && m2) });
  }
  const both = recs.filter((r) => r.both);
  const dropped = recs.filter((r) => r.v1 && !r.v2);
  const curated = recs.filter((r) => r.v2 && v2ById.has(r.id));

  const agg = (rs, which) => ({
    n: rs.length,
    recall_at_3: mean(rs.map((r) => r[which].recall_at_3)),
    recall_at_6: mean(rs.map((r) => r[which].recall_at_6)),
    mrr: mean(rs.map((r) => r[which].mrr)),
  });

  const run = {
    v1_on_S_both: agg(both, "v1"),
    v2_on_S_both: agg(both, "v2"),
    v1_on_S_dropped: agg(dropped, "v1"),
    v2_on_S_curated: agg(curated, "v2"),
    v1_on_S_curated: agg(curated, "v1"),
    paired_delta_S_both: {},
  };
  for (const m of ["recall_at_3", "recall_at_6", "mrr"]) {
    const deltas = both.map((r) => r.v2[m] - r.v1[m]);
    const ci = boot(deltas, (x) => x);
    run.paired_delta_S_both[m] = {
      mean: mean(deltas),
      ci95: ci,
      improved: deltas.filter((d) => d > 0).length,
      worsened: deltas.filter((d) => d < 0).length,
    };
  }
  results.runs[rid] = run;

  for (const m of ["recall_at_3", "recall_at_6", "mrr"]) {
    pooled.both.v1[m] = (pooled.both.v1[m] ?? 0) + run.v1_on_S_both[m] / RUN_IDS.length;
    pooled.both.v2[m] = (pooled.both.v2[m] ?? 0) + run.v2_on_S_both[m] / RUN_IDS.length;
  }
}

results.pooled_mean_S_both = pooled.both;
const stem = (name) => PREFIX ? `${name}-${PREFIX}` : name;
fs.writeFileSync(path.join(HERE, `${stem("rescore-v2")}-results.json`), JSON.stringify(results, null, 2) + "\n");

// --- markdown summary ---
const md = [];
md.push(`# curated45 — Re-skoring Retrieval (gold v1 vs v2)`);
md.push("");
md.push(`Offline, dari rank dense tersimpan di \`research/runs/${RUN_IDS.join(",")}\` (arm deployed, top-6); kode metrik identik untuk v1/v2. Bootstrap ${B} resamples.`);
md.push("");
md.push(`**S_both** = item berkunci di v1 DAN v2 (292 − 30) — selisih v1→v2 murni efek perbaikan gold. **S_dropped** = 30 item yang jadi gold-less. **S_curated** = 15 item curated45 yang berkunci di v2.`);
md.push("");
md.push(`| Run | n | R@3 v1 | R@3 v2 | ΔR@3 | MRR v1 | MRR v2 | ΔMRR |`);
md.push(`|---|---|---|---|---|---|---|---|`);
for (const rid of RUN_IDS) {
  const r = results.runs[rid];
  md.push(
    `| ${rid} | ${r.v1_on_S_both.n} | ${r.v1_on_S_both.recall_at_3.toFixed(3)} | ${r.v2_on_S_both.recall_at_3.toFixed(3)} | **${r.paired_delta_S_both.recall_at_3.mean >= 0 ? "+" : ""}${r.paired_delta_S_both.recall_at_3.mean.toFixed(3)}** [${r.paired_delta_S_both.recall_at_3.ci95.lo >= 0 ? "+" : ""}${r.paired_delta_S_both.recall_at_3.ci95.lo.toFixed(3)}, ${r.paired_delta_S_both.recall_at_3.ci95.hi >= 0 ? "+" : ""}${r.paired_delta_S_both.recall_at_3.ci95.hi.toFixed(3)}] | ${r.v1_on_S_both.mrr.toFixed(3)} | ${r.v2_on_S_both.mrr.toFixed(3)} | **${r.paired_delta_S_both.mrr.mean >= 0 ? "+" : ""}${r.paired_delta_S_both.mrr.mean.toFixed(3)}** [${r.paired_delta_S_both.mrr.ci95.lo >= 0 ? "+" : ""}${r.paired_delta_S_both.mrr.ci95.lo.toFixed(3)}, ${r.paired_delta_S_both.mrr.ci95.hi >= 0 ? "+" : ""}${r.paired_delta_S_both.mrr.ci95.hi.toFixed(3)}] |`,
  );
}
md.push("");
md.push(`### S_curated (n=15, deskriptif)`);
md.push("");
md.push(`| Run | R@3 v1→v2 | MRR v1→v2 |`);
md.push(`|---|---|---|`);
for (const rid of RUN_IDS) {
  const r = results.runs[rid];
  md.push(`| ${rid} | ${r.v1_on_S_curated.recall_at_3.toFixed(3)} → ${r.v2_on_S_curated.recall_at_3.toFixed(3)} | ${r.v1_on_S_curated.mrr.toFixed(3)} → ${r.v2_on_S_curated.mrr.toFixed(3)} |`);
}
md.push("");
md.push(`### S_dropped (n=30): skor v1 terhadap kunci lemah`);
md.push("");
md.push(`| Run | R@3 | MRR |`);
md.push(`|---|---|---|`);
for (const rid of RUN_IDS) {
  const r = results.runs[rid];
  md.push(`| ${rid} | ${r.v1_on_S_dropped.recall_at_3.toFixed(3)} | ${r.v1_on_S_dropped.mrr.toFixed(3)} |`);
}
md.push("");
fs.writeFileSync(path.join(HERE, `${stem("rescore-v2")}-summary.md`), md.join("\n"));
console.log(md.slice(6, 10).join("\n"));
console.log(`\n${stem("rescore-v2")}-results.json + ${stem("rescore-v2")}-summary.md written`);
