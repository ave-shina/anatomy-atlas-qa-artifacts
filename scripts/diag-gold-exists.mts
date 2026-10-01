/**
 * Diagnostic (read-only): fetch gold chunk ids directly from the Pinecone
 * index to distinguish "ranked below top-K" from "id not in the index at
 * all" (stale reference). Never writes to the index.
 *
 * Usage (from apps/frontend):
 *   pnpm exec tsx scripts/diag-gold-exists.mts --index anatomy-atlas \
 *     --dataset ../../research/benchmark/anatomy3d-qb.v3-citenothing-retest.ndjson
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pinecone } from "@pinecone-database/pinecone";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, "..");
const REPO = path.resolve(APP, "..", "..");

const argv = process.argv.slice(2);
const arg = (name: string, def?: string): string | undefined => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const INDEX = arg("index") ?? "";
const DATASET = path.resolve(arg("dataset", path.join(REPO, "research/benchmark/anatomy3d-qb.v3-citenothing-retest.ndjson"))!);

const env: Record<string, string> = {};
for (const line of fs.readFileSync(path.join(APP, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const PINECONE_KEY = process.env.PINECONE_API_KEY ?? env.PINECONE_API_KEY ?? "";
if (!PINECONE_KEY || !INDEX) { console.error("Need PINECONE key and --index."); process.exit(2); }

const items = fs.readFileSync(DATASET, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l))
  .filter((it: { gold_chunk_ids?: string[] }) => (it.gold_chunk_ids?.length ?? 0) > 0);

const pinecone = new Pinecone({ apiKey: PINECONE_KEY });
const desc = await pinecone.describeIndex(INDEX);
const idx = pinecone.Index(INDEX).namespace("");

const want = new Map<string, string[]>(); // chunkId -> item ids
for (const it of items) for (const g of it.gold_chunk_ids as string[]) want.set(g, [...(want.get(g) ?? []), it.id]);

const allIds = [...want.keys()];
console.error(`items=${items.length} unique gold ids=${allIds.length}`);
if (!allIds.length) process.exit(2);
const res = await idx.fetch({ ids: allIds });
const found = new Set(Object.keys(res.records ?? {}));

for (const it of items) {
  const states = (it.gold_chunk_ids as string[]).map((g) => (found.has(g) ? "in-index" : "NOT-IN-INDEX"));
  console.log(`${it.id}\t${(it.gold_chunk_ids as string[]).map((g, i) => `${g}=${states[i]}`).join(" ")}`);
}
