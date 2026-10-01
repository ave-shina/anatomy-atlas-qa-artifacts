#!/usr/bin/env node
/**
 * Candidate retrieval for the curated45 gold-chunk repair.
 *
 * DO NOT RUN: this is a historical step of the gold-curation pipeline.
 * candidates.json (the output it wrote) is FROZEN provenance — it was
 * produced against the ORIGINAL corpus pack, which was vectorized with
 * openai/text-embedding-3-small (1536-dim) and carried text capped at 400
 * characters. The committed pack has since been re-seeded with baai/bge-m3
 * (1024-dim, full text), so re-running this would either refuse (model
 * guard below) or silently mix embedding generations.
 *
 * Embeds the weak-item queries with the corpus pack's own embedding model
 * (read from the pack header, so the vectors are comparable) via OpenRouter,
 * then ranks all corpus chunks by cosine similarity and keeps the top-K per
 * item.
 *
 * Deterministic given the API: no sampling, no randomness. Provenance
 * (corpus sha256, model, date) is recorded in the output.
 *
 * Inputs:
 *   weak45.items.json
 *   ../../apps/frontend/public/starter-pack/medrag-anatomy_gray.ndjson
 *   OPENROUTER_API_KEY (env or apps/frontend/.env.local)
 *
 * Output:
 *   candidates.json — per item: query + top-K {chunk_id, page, chunk_index, text, cosine}
 *
 * Usage: node retrieve-candidates.mjs [--topk 8]
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(HERE, "../../../apps/frontend");
const CORPUS = path.join(APP, "public/starter-pack/medrag-anatomy_gray.ndjson");
const TOPK = Number(process.argv.includes("--topk") ? process.argv[process.argv.indexOf("--topk") + 1] : 8);

function loadEnv() {
  const out = {};
  const p = path.join(APP, ".env.local");
  if (!fs.existsSync(p)) return out;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}
const env = loadEnv();
const KEY = process.env.OPENROUTER_API_KEY ?? env.OPENROUTER_API_KEY;
if (!KEY) {
  console.error("Missing OPENROUTER_API_KEY (env or apps/frontend/.env.local)");
  process.exit(2);
}

// --- corpus ------------------------------------------------------------
const lines = fs.readFileSync(CORPUS, "utf8").split("\n").filter((l) => l.trim());
const header = JSON.parse(lines[0]);
// Queries must be embedded with the SAME model as the corpus vectors, so read
// it from the pack header instead of hardcoding a slug — the pack's model may
// legitimately change (re-seed), and this keeps the script honest either way.
const EMBED_MODEL = header.model;
if (!EMBED_MODEL) {
  console.error(`Pack header has no "model" field — refusing.`);
  process.exit(2);
}
if (!header.dim) {
  console.error(`Pack header has no "dim" field — refusing.`);
  process.exit(2);
}
const corpus = lines.slice(1).map((l) => {
  const c = JSON.parse(l);
  return { id: c.id, page: c.m.page, chunkIndex: c.m.chunkIndex, text: c.m.text, vec: decodeF32(c.v) };
});
const corpusSha = crypto.createHash("sha256").update(fs.readFileSync(CORPUS)).digest("hex");

function decodeF32(b64) {
  return Array.from(new Float32Array(Uint8Array.from(Buffer.from(b64, "base64")).buffer));
}

// --- queries -----------------------------------------------------------
const items = JSON.parse(fs.readFileSync(path.join(HERE, "weak45.items.json"), "utf8"));

async function embed(texts) {
  const res = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: EMBED_MODEL, input: texts }),
  });
  if (!res.ok) throw new Error(`embeddings ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

// batch to keep request bodies modest
const BATCH = 10;
const qvecs = [];
for (let i = 0; i < items.length; i += BATCH) {
  const batch = items.slice(i, i + BATCH).map((it) => it.query);
  const v = await embed(batch);
  qvecs.push(...v);
  console.error(`embedded queries ${i + 1}..${i + batch.length}`);
}

function cosine(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot; // both sides unit-normalized by the embed model, so dot = cosine
}

const out = {
  purpose: "curated45 candidate retrieval — top-K corpus chunks per weak-gold item",
  date: new Date().toISOString(),
  embed_model: EMBED_MODEL,
  corpus: { path: "apps/frontend/public/starter-pack/medrag-anatomy_gray.ndjson", sha256: corpusSha, chunks: corpus.length },
  topk: TOPK,
  items: [],
};

for (let i = 0; i < items.length; i++) {
  const it = items[i];
  const scored = corpus
    .map((c) => ({ id: c.id, page: c.page, chunkIndex: c.chunkIndex, text: c.text, cosine: cosine(qvecs[i], c.vec) }))
    .sort((a, b) => b.cosine - a.cosine)
    .slice(0, TOPK);
  out.items.push({
    id: it.id,
    type: it.type,
    system: it.system,
    query: it.query,
    gold_structures_must: it.gold_structures_must,
    old_gold_chunk_ids: it.gold_chunk_ids,
    candidates: scored,
  });
}

fs.writeFileSync(path.join(HERE, "candidates.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`candidates.json written: ${out.items.length} items x top-${TOPK}`);
