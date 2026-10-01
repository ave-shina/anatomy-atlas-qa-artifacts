/**
 * Diagnostic (read-only): for each item in --dataset, embed the query and
 * query the index at topK=50, then report the rank of each gold chunk id.
 * Rank >50 or absent => the gold chunk is effectively unreachable by the
 * deployed retriever, not merely outside top-6.
 *
 * Usage (from apps/frontend):
 *   pnpm exec tsx scripts/diag-gold-rank.mts --index anatomy-atlas \
 *     --dataset ../../research/benchmark/anatomy3d-qb.v3-citenothing-retest.ndjson
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createEmbeddings } from "@/lib/rag/providers";
import { queryChunks } from "@/lib/rag/vectorstore";
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
const TOPK = Number(arg("topk", "50"));
const DATASET = path.resolve(arg("dataset", path.join(REPO, "research/benchmark/anatomy3d-qb.v3-citenothing-retest.ndjson"))!);
const DOC_ID = "medrag-anatomy_gray";

const env: Record<string, string> = {};
for (const line of fs.readFileSync(path.join(APP, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const PINECONE_KEY = process.env.PINECONE_API_KEY ?? env.PINECONE_API_KEY ?? "";
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY ?? env.OPENROUTER_API_KEY ?? "";
if (!PINECONE_KEY || !INDEX) { console.error("Need PINECONE key and --index."); process.exit(2); }

const settings: RagSettings = {
  openRouterKey: OPENROUTER_KEY,
  chatModel: "",
  embedModel: "baai/bge-m3",
  pineconeKey: PINECONE_KEY,
  pineconeIndex: INDEX,
};

const items = fs.readFileSync(DATASET, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l))
  .filter((it) => (it.gold_chunk_ids?.length ?? 0) > 0 && it.type !== "A" || (it.type === "A" && !it.expects_clarification));

const embeddings = createEmbeddings(settings);
for (const it of items) {
  const vector = await embeddings.embedQuery(it.query);
  const chunks = await queryChunks(settings, { vector, docIds: [DOC_ID], topK: TOPK });
  const ids = chunks.map((c) => `${c.docId}:${c.chunkIndex}`);
  const ranks = (it.gold_chunk_ids as string[]).map((g) => {
    const r = ids.indexOf(g);
    return r >= 0 ? `#${r + 1}` : "absent";
  });
  const top1 = ids[0] ?? "-";
  console.log(`${it.id}\tgold=[${(it.gold_chunk_ids as string[]).join(",")}] rank=${ranks.join(",")} top1=${top1}`);
}
