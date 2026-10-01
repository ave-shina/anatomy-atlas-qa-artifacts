/**
 * Author-vs-consensus agreement for the human gold review kit.
 *
 * Inputs  research/benchmark/review/gold-verdicts-author.csv   (author verdicts)
 *         research/benchmark/review/gold-verdicts-{glm,deepseek,qwen}.csv (trio)
 *         research/benchmark/review/gold-verdicts-arbitration-claude.csv  (arbiter)
 * Rule    v2 (docs/05 §11): trio unanimous -> panel value; else arbiter value.
 * Output  research/benchmark/review/author-review-agreement.json
 *
 * Usage (from apps/frontend):
 *   node scripts/author-agreement.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..", "..");
const REVIEW = path.join(REPO, "research", "benchmark", "review");

const COLS = ["must_ok", "optional_ok", "query_ok"];
const readCsv = (p) =>
  fs.readFileSync(p, "utf8").split("\n").filter(Boolean)
    .map((l) => l.split(","))
    .filter((c) => c[0] !== "item_id")
    .map((c) => ({ id: c[0], must_ok: c[1], optional_ok: c[2], query_ok: c[3], notes: c.slice(4).join(",") }));

const author = new Map(readCsv(path.join(REVIEW, "gold-verdicts-author.csv")).map((r) => [r.id, r]));
const panel = ["glm", "deepseek", "qwen"].map((r) => readCsv(path.join(REVIEW, `gold-verdicts-${r}.csv`)));
const arbiter = new Map(readCsv(path.join(REVIEW, "gold-verdicts-arbitration-claude.csv")).map((r) => [r.id, r]));

const kappa = (a, b) => {
  const n = a.length;
  if (!n) return null;
  const po = a.filter((v, i) => v === b[i]).length / n;
  const pe = [0, 1].map((k) => (a.filter((v) => v === k).length / n) * (b.filter((v) => v === k).length / n)).reduce((x, y) => x + y, 0);
  return pe === 1 ? null : Number(((po - pe) / (1 - pe)).toFixed(4));
};

const out = { rule: "v2: trio unanimous -> panel value, else arbiter (docs/05 §11)", columns: {}, disagreements: [] };
for (const col of COLS) {
  const au = [], co = [];
  let nonUnanimous = 0;
  for (const [id, row] of author) {
    const v = row[col]?.trim();
    if (v !== "0" && v !== "1") continue;
    const votes = panel.map((p) => new Map(p.map((r) => [r.id, r])).get(id)?.[col]?.trim()).filter((x) => x === "0" || x === "1");
    if (votes.length < 3) continue;
    const unanimous = votes.every((x) => x === votes[0]);
    const consensus = unanimous ? votes[0] : (arbiter.get(id)?.[col] ?? "").trim();
    if (!unanimous) nonUnanimous++;
    if (consensus !== "0" && consensus !== "1") continue;
    au.push(Number(v));
    co.push(Number(consensus));
    if (v !== consensus) out.disagreements.push({ id, column: col, author: v, consensus });
  }
  const agree = au.filter((v, i) => v === co[i]).length;
  out.columns[col] = {
    n: au.length,
    agreement: au.length ? Number((agree / au.length).toFixed(4)) : null,
    cohens_kappa: kappa(au, co),
    non_unanimous_items_included: nonUnanimous,
  };
}
out.disagreements.sort((a, b) => a.id.localeCompare(b.id));

fs.writeFileSync(path.join(REVIEW, "author-review-agreement.json"), JSON.stringify(out, null, 2) + "\n");
console.log(JSON.stringify(out.columns, null, 2));
console.log(`disagreements: ${out.disagreements.length} -> research/benchmark/review/author-review-agreement.json`);
