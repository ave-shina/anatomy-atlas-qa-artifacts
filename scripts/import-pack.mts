/**
 * Import a pre-vectorized pack (NDJSON, e.g. public/starter-pack/*.ndjson)
 * into a Pinecone index — the same machinery the app uses, without HTTP.
 *
 * The pack carries its own float32 vectors, so no embedding API is called and
 * no cost is incurred. The target index dimension MUST equal the pack's dim.
 *
 * Usage (from apps/frontend):
 *   pnpm exec tsx scripts/import-pack.mts --index <name> [--create] \
 *     [--file public/starter-pack/medrag-anatomy_gray.ndjson]
 *
 *   --create  create the index (pack dim, cosine, serverless aws/us-east-1)
 *             when it does not exist, then wait until ready.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pinecone } from "@pinecone-database/pinecone";

import { upsertChunks, type ChunkMeta } from "@/lib/rag/vectorstore";
import type { RagSettings } from "@/types/rag";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, "..");

const argv = process.argv.slice(2);
const arg = (name: string, def?: string): string | undefined => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const CREATE = argv.includes("--create");
const FILE = path.resolve(arg("file", "public/starter-pack/medrag-anatomy_gray.ndjson")!);
const INDEX = arg("index") ?? "";

const env: Record<string, string> = {};
for (const line of fs.readFileSync(path.join(APP, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const PINECONE_KEY = process.env.PINECONE_API_KEY ?? env.PINECONE_API_KEY ?? "";
if (!PINECONE_KEY || !INDEX) {
  console.error("Need PINECONE_API_KEY and --index <name>.");
  process.exit(2);
}

const lines = fs.readFileSync(FILE, "utf8").split("\n").filter((l) => l.trim());
const header = JSON.parse(lines[0]) as { model: string; dim: number; count: number; docId: string; docName: string };
console.log(`pack: ${path.relative(APP, FILE)} — ${header.count} chunks, dim ${header.dim}, model ${header.model}`);

const pc = new Pinecone({ apiKey: PINECONE_KEY });
try {
  const desc = await pc.describeIndex(INDEX);
  if (desc.dimension !== header.dim) {
    console.error(`Index "${INDEX}" is dim ${desc.dimension}, pack is dim ${header.dim}. Aborting.`);
    process.exit(3);
  }
  console.log(`index "${INDEX}" exists (dim ${desc.dimension}).`);
} catch {
  if (!CREATE) {
    console.error(`Index "${INDEX}" does not exist. Re-run with --create.`);
    process.exit(3);
  }
  console.log(`creating index "${INDEX}" (dim ${header.dim})…`);
  await pc.createIndex({
    name: INDEX,
    dimension: header.dim,
    metric: "cosine",
    spec: { serverless: { cloud: "aws", region: "us-east-1" } },
  });
  for (let i = 0; i < 60; i++) {
    const d = await pc.describeIndex(INDEX);
    if (d.status?.ready) break;
    await new Promise((r) => setTimeout(r, 2000));
  }
  console.log("index ready.");
}

const settings: RagSettings = {
  openRouterKey: env.OPENROUTER_API_KEY ?? "",
  chatModel: "",
  embedModel: header.model,
  pineconeKey: PINECONE_KEY,
  pineconeIndex: INDEX,
};

function decodeVector(b64: string): number[] {
  const buf = Buffer.from(b64, "base64");
  return Array.from(new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4));
}

let done = 0;
const BATCH = 100;
for (let i = 1; i < lines.length; i += BATCH) {
  const batch = lines.slice(i, i + BATCH).map((l) => {
    const rec = JSON.parse(l) as { id: string; v: string; m: unknown };
    return { id: rec.id, vector: decodeVector(rec.v), meta: rec.m as ChunkMeta };
  });
  await upsertChunks(settings, batch);
  done += batch.length;
  process.stdout.write(`\r${done}/${lines.length - 1} chunks`);
}
process.stdout.write("\n");
console.log(`done: ${done} chunks upserted into "${INDEX}" (${header.docId}).`);
