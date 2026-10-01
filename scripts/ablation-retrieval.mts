/**
 * RQ3 ablation — ontology-aware retrieval (dense vs structureKeys boost).
 *
 * For each item: retrieve top-N dense, then re-rank with a soft boost from the
 * structureKeys that overlap structures named in the query. Compare retrieval
 * metrics (recall@k, MRR, nDCG@10) with a paired Wilcoxon test. Retrieval-only:
 * no generation, no cost beyond embeddings.
 *
 * Usage (from apps/frontend):
 *   pnpm exec tsx scripts/ablation-retrieval.mts --index anatomy-atlas \
 *     [--boost 0.5] [--topk 20] [--types F,R] [--out research/benchmark/ablation-structurekeys.json]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createEmbeddings } from "@/lib/rag/providers";
import { queryChunks } from "@/lib/rag/vectorstore";
import { annotatePrecise } from "@/lib/rag/grounding";
import type { RagSettings } from "@/types/rag";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, "..");
const REPO = path.resolve(APP, "..", "..");

const argv = process.argv.slice(2);
const arg = (name: string, def?: string): string | undefined => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const INDEX = arg("index") ?? "";
const BOOST = Number(arg("boost", "0.5"));
const TOPK = Number(arg("topk", "20"));
const TYPES = (arg("types", "F,R,A") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const OUT = path.resolve(arg("out", path.join(REPO, "research/benchmark/ablation-structurekeys.json"))!);
const DATASET = arg("dataset", "anatomy3d-qb.v1.ndjson")!;
const DOC_ID = "medrag-anatomy_gray";

const env: Record<string, string> = {};
for (const line of fs.readFileSync(path.join(APP, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY ?? env.OPENROUTER_API_KEY ?? "";
const PINECONE_KEY = process.env.PINECONE_API_KEY ?? env.PINECONE_API_KEY ?? "";
if (!OPENROUTER_KEY || !PINECONE_KEY || !INDEX) { console.error("Need keys and --index."); process.exit(2); }

const settings: RagSettings = {
  openRouterKey: OPENROUTER_KEY,
  chatModel: "",
  embedModel: "baai/bge-m3",
  pineconeKey: PINECONE_KEY,
  pineconeIndex: INDEX,
};

const items = fs.readFileSync(path.join(REPO, "research/benchmark", DATASET), "utf8")
  .split("\n").filter(Boolean).map((l) => JSON.parse(l))
  .filter((it) => TYPES.includes(it.type) && (it.gold_chunk_ids?.length ?? 0) > 0);

// --- helpers ----------------------------------------------------------------
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
function metrics(ranking: string[], gold: string[]) {
  const g = new Set(gold);
  const ranks = ranking.map((id, i) => (g.has(id) ? i + 1 : 0)).filter((r) => r > 0);
  const recallAt = (k: number) => (gold.length ? ranking.slice(0, k).filter((id) => g.has(id)).length / gold.length : 1);
  const dcg = ranking.slice(0, 10).reduce((s, id, i) => s + (g.has(id) ? 1 / Math.log2(i + 2) : 0), 0);
  const ideal = Array.from({ length: Math.min(gold.length, 10) }, (_, i) => 1 / Math.log2(i + 2)).reduce((a, b) => a + b, 0);
  return {
    recall_at_3: recallAt(3), recall_at_6: recallAt(6), recall_at_10: recallAt(10),
    mrr: ranks.length ? 1 / Math.min(...ranks) : 0,
    ndcg_at_10: ideal ? dcg / ideal : 0,
  };
}
function wilcoxon(a: number[], b: number[]) {
  const d = a.map((x, i) => x - b[i]).filter((x) => x !== 0);
  const n = d.length;
  if (!n) return { n: 0, p: 1 };
  const order = d.map((v, i) => ({ v: Math.abs(v), i })).sort((x, y) => x.v - y.v);
  const ranks = new Array(n).fill(0);
  let i = 0;
  while (i < n) { let j = i; while (j + 1 < n && order[j + 1].v === order[i].v) j++;
    const r = (i + j + 2) / 2; for (let k = i; k <= j; k++) ranks[order[k].i] = r; i = j + 1; }
  let wPlus = 0; for (let k = 0; k < n; k++) if (d[k] > 0) wPlus += ranks[k];
  const mu = (n * (n + 1)) / 4, sigma = Math.sqrt((n * (n + 1) * (2 * n + 1)) / 24);
  const z = (wPlus - mu - Math.sign(wPlus - mu) * 0.5) / sigma;
  const phi = (zz: number) => { const t = 1 / (1 + 0.2316419 * Math.abs(zz));
    const dd = 0.3989423 * Math.exp((-zz * zz) / 2);
    const p = dd * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return zz > 0 ? 1 - p : p; };
  return { n, p: Math.min(1, 2 * (1 - phi(Math.abs(z)))) };
}

// --- run --------------------------------------------------------------------
const embeddings = createEmbeddings(settings);
const perItem: unknown[] = [];
const denseArr: Record<string, number[]> = { recall_at_3: [], recall_at_6: [], recall_at_10: [], mrr: [], ndcg_at_10: [] };
const boostArr: Record<string, number[]> = { recall_at_3: [], recall_at_6: [], recall_at_10: [], mrr: [], ndcg_at_10: [] };
let boostedChanged = 0;

for (const [i, it] of items.entries()) {
  const vector = await embeddings.embedQuery(it.query);
  const chunks = await queryChunks(settings, { vector, docIds: [DOC_ID], topK: TOPK });
  const dense = chunks.map((c) => ({ id: `${c.docId}:${c.chunkIndex}`, score: c.score, keys: c.structureKeys ?? [] }));
  const qKeys = new Set(annotatePrecise(it.query));
  const boosted = dense
    .map((c) => ({ ...c, bscore: c.score + BOOST * c.keys.filter((k) => qKeys.has(k)).length }))
    .sort((a, b) => b.bscore - a.bscore);
  const denseRank = dense.map((c) => c.id);
  const boostRank = boosted.map((c) => c.id);
  if (denseRank.join() !== boostRank.join()) boostedChanged++;

  const md = metrics(denseRank, it.gold_chunk_ids);
  const mb = metrics(boostRank, it.gold_chunk_ids);
  for (const k of Object.keys(denseArr)) { denseArr[k].push(md[k as keyof typeof md]); boostArr[k].push(mb[k as keyof typeof mb]); }
  perItem.push({ id: it.id, type: it.type, q_keys: [...qKeys], dense: md, boosted: mb });
  process.stdout.write(`\r${i + 1}/${items.length} ${it.id}          `);
}
process.stdout.write("\n");

const summary = {
  index: INDEX, boost: BOOST, topK: TOPK, items: items.length, types: TYPES,
  dataset: DATASET,
  rankings_changed: boostedChanged,
  dense: Object.fromEntries(Object.entries(denseArr).map(([k, v]) => [k, mean(v)])),
  boosted: Object.fromEntries(Object.entries(boostArr).map(([k, v]) => [k, mean(v)])),
  wilcoxon: {
    recall_at_6: wilcoxon(boostArr.recall_at_6, denseArr.recall_at_6),
    mrr: wilcoxon(boostArr.mrr, denseArr.mrr),
    ndcg_at_10: wilcoxon(boostArr.ndcg_at_10, denseArr.ndcg_at_10),
  },
  note: "LLM/retrieval ablation: retrieval-only, no generation. Label as automated analysis.",
};
fs.writeFileSync(OUT, JSON.stringify({ summary, perItem }, null, 2) + "\n");

console.log(`items=${items.length} rankings_changed=${boostedChanged}`);
console.log("dense :", summary.dense);
console.log("boost :", summary.boosted);
console.log("wilcoxon(boost vs dense):", summary.wilcoxon);
console.log(`written: ${path.relative(REPO, OUT)}`);
