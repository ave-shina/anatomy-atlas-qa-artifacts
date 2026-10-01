#!/usr/bin/env node
/**
 * Candidate retrieval for the v3 gold refresh.
 *
 * Embeds the 38 chunk-less item queries with the corpus pack's own embedding
 * model (read from the pack header) via OpenRouter, then ranks all corpus
 * chunks by cosine similarity and keeps the top-K per item.
 *
 * Differences from ../curation45/retrieve-candidates.mjs:
 *   - input is v3/replace38.json (not weak45.items.json)
 *   - runs against the CURRENT fulltext pack (baai/bge-m3, uncapped text) —
 *     the curated45 candidates were produced against the truncated corpus,
 *     so this re-screen may rescue items the old pass could not
 *
 * Deterministic given the API: no sampling, no randomness. Provenance
 * (corpus sha256, model, date) is recorded in the output.
 *
 * Inputs:
 *   ../v3/replace38.json
 *   ../../apps/frontend/public/starter-pack/medrag-anatomy_gray.ndjson
 *   OPENROUTER_API_KEY (env or apps/frontend/.env.local)
 *
 * Output:
 *   ../v3/candidates38.json — per item: query + top-K {chunk_id, page, chunk_index, text, cosine}
 *
 * Usage: node retrieve-candidates-v3.mjs [--topk 8]
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
// it from the pack header instead of hardcoding a slug.
const EMBED_MODEL = header.model;
if (!EMBED_MODEL || !header.dim) {
  console.error(`Pack header missing "model"/"dim" — refusing.`);
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
const spec = JSON.parse(fs.readFileSync(path.join(HERE, "replace38.json"), "utf8"));
const items = spec.items;

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
  purpose: "v3 gold refresh candidate retrieval — top-K corpus chunks per chunk-less item",
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
    expects_clarification: it.expects_clarification,
    candidates: scored,
  });
}

fs.writeFileSync(path.join(HERE, "candidates38.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`candidates38.json written: ${out.items.length} items x top-${TOPK} (embed ${EMBED_MODEL}, corpus sha ${corpusSha.slice(0, 12)})`);
