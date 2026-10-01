/**
 * Quantify generation stochasticity from a repeat-3 run (variance study).
 *
 * Reads <run>/items.jsonl (conditions.B3 = one generation per repeat) and, for
 * comparison, the base single-draw run restricted to the same item ids.
 * Writes <run>/variance-summary.json.
 *
 * Metrics:
 *   per_repeat_agg   aggregate chip F1 (relaxed) of each repeat draw
 *   per_item_std     mean per-item sample std across the 3 draws
 *   se_single_draw   std of item F1 / sqrt(n) — sampling SE of ONE draw's aggregate
 *   base_same_ids    base run aggregate on the same ids (a 4th independent draw)
 *
 * Usage (from apps/frontend):
 *   pnpm exec tsx scripts/analyze-repeat3.mts --run trio-glm-repeat3 --base trio-glm-r1
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
const RUN = arg("run", "trio-glm-repeat3")!;
const BASE = arg("base", "trio-glm-r1")!;

type Gen = { error: string | null; chip_f1_optional: number; chip_f1: number };
type Item = { id: string; conditions: Record<string, Gen[]> };

const load = (run: string): Item[] =>
  fs
    .readFileSync(path.join(REPO, "research", "runs", run, "items.jsonl"), "utf8")
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l));

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const std = (xs: number[]) => {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1));
};
const r4 = (x: number) => Number(x.toFixed(4));

const items = load(RUN);
const reps = items.map((d) => d.conditions.B3 ?? []);
const n = items.length;

// per-repeat aggregate (draw k over all items that succeeded in draw k)
const perRepeatAgg = [0, 1, 2].map((k) => {
  const ok = reps.map((g) => g[k]).filter((g) => g && !g.error);
  return { n_ok: ok.length, f1_opt: r4(mean(ok.map((g) => g.chip_f1_optional))), f1_strict: r4(mean(ok.map((g) => g.chip_f1))) };
});

// per-item variability across the 3 draws (only items with >=2 ok gens)
const itemStd: number[] = [];
const itemRange: number[] = [];
let itemsMulti = 0;
for (const g of reps) {
  const ok = g.filter((x) => x && !x.error).map((x) => x.chip_f1_optional);
  if (ok.length >= 2) {
    itemsMulti++;
    itemStd.push(std(ok));
    itemRange.push(Math.max(...ok) - Math.min(...ok));
  }
}
const allOkF1 = reps.flat().filter((g) => g && !g.error).map((g) => g.chip_f1_optional);
const seSingle = Math.sqrt(mean(allOkF1.map((v) => (v - mean(allOkF1)) ** 2)) / allOkF1.length);

// base single-draw run restricted to the same ids
const base = load(BASE).filter((d) => items.some((i) => i.id === d.id));
const baseF1 = base
  .map((d) => (d.conditions.B3 ?? [])[0])
  .filter((g) => g && !g.error)
  .map((g) => g.chip_f1_optional);

const summary = {
  run: RUN,
  base: BASE,
  condition: "B3",
  n_items: n,
  repeats: 3,
  per_repeat_agg: perRepeatAgg,
  agg_spread_f1opt: r4(Math.max(...perRepeatAgg.map((r) => r.f1_opt)) - Math.min(...perRepeatAgg.map((r) => r.f1_opt))),
  per_item_mean_std: r4(mean(itemStd)),
  per_item_mean_range: r4(mean(itemRange)),
  items_with_multiple_ok: itemsMulti,
  se_single_draw: r4(seSingle),
  base_same_ids: { n_ok: baseF1.length, f1_opt: r4(mean(baseF1)) },
  note: "Generation-stochasticity quantification for the repeat-1 limitation (docs/05 D5). se_single_draw = sampling SE of one draw's aggregate; agg_spread = observed spread across 3 independent aggregate draws.",
};

const out = path.join(REPO, "research", "runs", RUN, "variance-summary.json");
fs.writeFileSync(out, JSON.stringify(summary, null, 2) + "\n");
console.log(JSON.stringify(summary, null, 2));
console.log(`written: ${path.relative(REPO, out)}`);
