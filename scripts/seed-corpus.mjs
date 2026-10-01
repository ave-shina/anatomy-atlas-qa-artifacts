/**
 * Seed the MedRAG textbook corpus into Pinecone so the app's RAG chat has a
 * built-in knowledge base (no PDF upload needed).
 *
 * Usage:
 *   PINECONE_API_KEY=... OPENROUTER_API_KEY=... \
 *   pnpm exec node scripts/seed-corpus.mjs [Title1 Title2 ...]
 *
 * The HF rows API is aggressively rate-limited, so prefer reading from a
 * local parquet export (the whole-corpus file is one download):
 *   curl -sL "https://huggingface.co/api/datasets/MedRAG/textbooks/parquet/default/train/0.parquet" -o medrag.parquet
 *   pnpm exec node scripts/seed-corpus.mjs --parquet medrag.parquet [Title1 ...]
 *
 * Starter-pack export (no Pinecone needed — writes pre-vectorized NDJSON the
 * app can import into a user's own index, see /api/knowledge/starter-pack):
 *   OPENROUTER_API_KEY=... pnpm exec node scripts/seed-corpus.mjs --export [dir-or-file.ndjson] [Title1 ...]
 * Default output: public/starter-pack/<docId>.ndjson — one JSON header line
 * {format,version,model,dim,count,docId,docName} followed by one line per
 * vector {id, v: base64 float32 values, m: ChunkMeta}.
 *
 * Both at once (one embedding pass, one bill):
 *   OPENROUTER_API_KEY=... PINECONE_API_KEY=... \
 *   pnpm exec node scripts/seed-corpus.mjs --upsert --export [dir-or-file.ndjson] [Title1 ...]
 *
 * Env vars:
 *   PINECONE_API_KEY   (required for seeding, not for --export)
 *   OPENROUTER_API_KEY (required)
 *   PINECONE_INDEX     (default: anatomy-atlas)
 *   EMBED_MODEL        (default: baai/bge-m3 — must match the seeded index
 *                       dimension; changing it requires a re-seed)
 *
 * Titles default to ["Anatomy_Gray"]. See
 * https://huggingface.co/datasets/MedRAG/textbooks for the full list.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { asyncBufferFromFile, parquetMetadataAsync, parquetReadObjects } from "hyparquet";
import { Pinecone } from "@pinecone-database/pinecone";

const DATASET = "MedRAG/textbooks";
const HF_ROWS_API = "https://datasets-server.huggingface.co/rows";
const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const ROWS_PER_PAGE = 100;
const EMBED_BATCH = 64;
const UPSERT_BATCH = 100;

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX ?? "anatomy-atlas";
// Must match the seeded index dimension (anatomy-atlas = baai/bge-m3, 1024-dim);
// changing it requires a re-seed.
const EMBED_MODEL = process.env.EMBED_MODEL ?? "baai/bge-m3";

const argv = process.argv.slice(2);
const parquetIdx = argv.indexOf("--parquet");
const PARQUET_FILE = parquetIdx >= 0 ? argv[parquetIdx + 1] : null;
if (parquetIdx >= 0) argv.splice(parquetIdx, 2);
// --upsert: with --export, ALSO upsert to Pinecone (one embedding pass).
// Parse BEFORE --export: --export consumes the following token as its path.
const upsertIdx = argv.indexOf("--upsert");
const ALSO_UPSERT = upsertIdx >= 0;
if (upsertIdx >= 0) argv.splice(upsertIdx, 1);
const exportIdx = argv.indexOf("--export");
const EXPORT_ARG = exportIdx >= 0 ? argv[exportIdx + 1] : null;
if (exportIdx >= 0) argv.splice(exportIdx, EXPORT_ARG ? 2 : 1);
// --export with no value → default dir inside the app's public/ assets.
const EXPORT_DIR = exportIdx >= 0 ? (EXPORT_ARG ?? "public/starter-pack") : null;
if (EXPORT_ARG && EXPORT_ARG.startsWith("--")) {
  console.error(
    `--export needs its output path before other flags (got "${EXPORT_ARG}").`,
  );
  process.exit(2);
}
const TITLES = argv.length > 0 ? argv : ["Anatomy_Gray"];

/** HF dataset titles are all-caps-with-underscores; show the real names. */
const DISPLAY_NAMES = { "Anatomy_Gray": "Gray's Anatomy" };

if (!OPENROUTER_API_KEY) {
  console.error("Missing OPENROUTER_API_KEY environment variable.");
  process.exit(1);
}
if ((!EXPORT_DIR || ALSO_UPSERT) && !PINECONE_API_KEY) {
  console.error("Missing PINECONE_API_KEY environment variable.");
  process.exit(1);
}

/* ---- structure vocabulary (port of src/lib/rag/grounding.ts) ---- */

const canonicalize = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

function normalizeName(name) {
  let n = (name || "").trim();
  const m = n.match(/^(.+)\.([oe])(\d*)([lr])$/i);
  if (m) {
    const role = m[2].toLowerCase() === "o" ? "Origin" : "Insertion";
    return `${role} of ${m[1]}`;
  }
  return n.replace(/\.([si])$/, "").replace(/\.([lr])$/, "");
}

async function buildMatchers() {
  const anatomy = JSON.parse(
    await readFile(new URL("../src/data/anatomy.json", import.meta.url), "utf8"),
  );
  const byKey = new Map();
  for (const s of anatomy.structures) {
    const display = normalizeName(s.name);
    const key = canonicalize(display);
    if (!key || key.length < 4 || display.includes("?")) continue;
    if (!byKey.has(key)) byKey.set(key, { key, display: display.toLowerCase() });
  }
  return [...byKey.values()]
    .map((e) => [e.display, e.key])
    .sort((a, b) => b[0].length - a[0].length);
}

function annotateText(text, matchers, limit = 24) {
  const lower = text.toLowerCase();
  const keys = new Set();
  for (const [needle, key] of matchers) {
    if (lower.includes(needle)) {
      keys.add(key);
      if (keys.size >= limit) break;
    }
  }
  return [...keys];
}

/* ---- corpus sources ---- */

/** Read rows for `titles` from a local parquet export (avoids HF rate limits). */
async function readRowsFromParquet(path, titles) {
  const wanted = new Set(titles);
  const src = await asyncBufferFromFile(path);
  const meta = await parquetMetadataAsync(src);
  const total = Number(meta.num_rows);
  const out = [];
  const WINDOW = 20000;
  for (let start = 0; start < total; start += WINDOW) {
    const rows = await parquetReadObjects({
      file: src,
      rowFormat: "object",
      rowStart: start,
      rowEnd: Math.min(start + WINDOW, total),
    });
    for (const r of rows) {
      if (wanted.has(r.title)) {
        out.push({ id: r.id, title: r.title, content: r.content, contents: r.contents });
      }
    }
  }
  return out;
}

/** Fallback: HF datasets-server rows API (rate-limited for anonymous use). */
async function fetchRows(title) {
  const rows = [];
  let offset = 0;
  while (true) {
    const url = `${HF_ROWS_API}?dataset=${encodeURIComponent(DATASET)}&config=default&split=train&offset=${offset}&length=${ROWS_PER_PAGE}&where=${encodeURIComponent(`"title"='${title}'`)}`;

    // Anonymous quota is per-IP and bursty crawls trip it fast — back off
    // like embed() does instead of losing the whole run to one 429.
    let res;
    for (let attempt = 0; ; attempt++) {
      res = await fetch(url);
      const retryable = res.status === 429 || res.status >= 500;
      if (res.ok || !retryable || attempt >= 5) break;
      const wait = Math.min(90_000, 10_000 * 2 ** attempt) + Math.random() * 2_000;
      console.log(`  ⏳ HF rows API ${res.status} — retry ${attempt + 1}/5 in ${Math.round(wait / 1000)}s`);
      await new Promise((r) => setTimeout(r, wait));
    }
    if (!res.ok) {
      throw new Error(`HF rows API ${res.status}: ${await res.text()}`);
    }

    const json = await res.json();
    const batch = json.rows ?? [];
    for (const r of batch) rows.push(r.row);
    if (batch.length < ROWS_PER_PAGE || json.num_rows_total <= offset + batch.length) break;
    offset += batch.length;
    await new Promise((r) => setTimeout(r, 400)); // stay under the burst limit
  }
  return rows;
}

/* ---- embeddings via OpenRouter (OpenAI-compatible) ---- */

async function embed(texts) {
  // OpenRouter providers intermittently return 429/5xx ("engine overloaded");
  // retry with exponential backoff instead of aborting the whole seed.
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${OPENROUTER_BASE}/embeddings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: EMBED_MODEL, input: texts }),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
    }
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt >= 5) {
      throw new Error(`OpenRouter embeddings ${res.status}: ${await res.text()}`);
    }
    const wait = Math.min(60_000, 2_000 * 2 ** attempt) + Math.random() * 1_000;
    console.log(`\n  ⏳ ${res.status} — retry ${attempt + 1}/5 in ${Math.round(wait / 1000)}s`);
    await new Promise((r) => setTimeout(r, wait));
  }
}

/* ---- starter pack encoding ---- */

/** float32 → base64 (compact, lossless vs what Pinecone stores). */
function encodeVector(vector) {
  return Buffer.from(new Float32Array(vector).buffer).toString("base64");
}

/* ---- main ---- */

const matchers = await buildMatchers();
console.log(`Vocabulary: ${matchers.length} structure names.`);
const target = EXPORT_DIR
  ? ALSO_UPSERT
    ? `starter pack "${EXPORT_DIR}" + index "${PINECONE_INDEX}"`
    : `starter pack "${EXPORT_DIR}"`
  : `index "${PINECONE_INDEX}"`;
console.log(
  `Seeding titles: ${TITLES.join(", ")} → ${target} (embed: ${EMBED_MODEL})`,
);

let index;
if (!EXPORT_DIR || ALSO_UPSERT) {
  const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
  try {
    const desc = await pc.describeIndex(PINECONE_INDEX);
    index = pc.index(PINECONE_INDEX);
    console.log(`Index exists (dim=${desc.dimension}, host=${desc.host}).`);
  } catch {
    console.error(
      `Index "${PINECONE_INDEX}" not found. Create it first (Verify in the app does this automatically).`,
    );
    process.exit(1);
  }
}

const docIdByTitle = new Map();
let totalVectors = 0;

for (const title of TITLES) {
  console.log(`\n=== ${title}: loading rows…`);
  const rows = PARQUET_FILE
    ? await readRowsFromParquet(PARQUET_FILE, [title])
    : await fetchRows(title);
  if (rows.length === 0) {
    console.log(`${title}: no rows found — skipping.`);
    continue;
  }
  const docId = `medrag-${title.toLowerCase()}`;
  const docName = `${DISPLAY_NAMES[title] ?? title.replace(/_/g, " ")} (MedRAG)`;
  docIdByTitle.set(title, docId);
  const uploadedAt = Date.now();

  console.log(`${title}: ${rows.length} chunks, annotating + embedding…`);
  const vectors = [];
  let done = 0;
  for (let i = 0; i < rows.length; i += EMBED_BATCH) {
    const batch = rows.slice(i, i + EMBED_BATCH);
    const inputs = batch.map(
      (r) => r.content ?? r.contents ?? "",
    );
    const embeddings = await embed(inputs);
    batch.forEach((r, j) => {
      const chunkIndex = i + j;
      vectors.push({
        id: `${docId}:${chunkIndex}`,
        vector: embeddings[j],
        meta: {
          docId,
          docName,
          page: 0, // MedRAG chunks carry no page numbers
          chunkIndex,
          // Full chunk text — the exact string the embedding was computed on.
          // This is what the answer prompt and the judge context are built
          // from; UI citation snippets are trimmed for display only
          // (chat.ts SNIPPET_LEN).
          text: String(inputs[j]),
          structureKeys: annotateText(String(inputs[j]), matchers),
          uploadedAt,
        },
      });
    });
    done += batch.length;
    process.stdout.write(`\r  embedded ${done}/${rows.length}`);
    await new Promise((r) => setTimeout(r, 250));
  }
  console.log();

  if (EXPORT_DIR) {
    const outPath = EXPORT_ARG && EXPORT_ARG.endsWith(".ndjson")
      ? EXPORT_ARG
      : path.join(EXPORT_DIR, `${docId}.ndjson`);
    await mkdir(path.dirname(outPath), { recursive: true });
    const header = {
      format: "anatomy-atlas-starter-pack",
      version: 1,
      model: EMBED_MODEL,
      dim: vectors[0].vector.length,
      count: vectors.length,
      docId,
      docName,
    };
    const lines = [JSON.stringify(header)];
    for (const v of vectors) {
      lines.push(
        JSON.stringify({ id: v.id, v: encodeVector(v.vector), m: v.meta }),
      );
    }
    await writeFile(outPath, lines.join("\n") + "\n");
    console.log(`${title}: wrote ${vectors.length} vectors → ${outPath}`);
    totalVectors += vectors.length;
    if (!ALSO_UPSERT) continue;
  }

  console.log(`${title}: upserting ${vectors.length} vectors…`);
  for (let i = 0; i < vectors.length; i += UPSERT_BATCH) {
    const batch = vectors.slice(i, i + UPSERT_BATCH);
    await index.upsert({
      records: batch.map((v) => ({
        id: v.id,
        values: v.vector,
        metadata: v.meta,
      })),
    });
    process.stdout.write(`\r  upserted ${Math.min(i + UPSERT_BATCH, vectors.length)}/${vectors.length}`);
  }
  console.log();
  if (!EXPORT_DIR) totalVectors += vectors.length;
}

const action = EXPORT_DIR ? (ALSO_UPSERT ? "Exported + seeded" : "Exported") : "Seeded";
console.log(`\nDone. ${action} ${totalVectors} vectors across ${docIdByTitle.size} document(s).`);
if (!EXPORT_DIR || ALSO_UPSERT) {
  const stats = await index.describeIndexStats();
  console.log("Index stats:", JSON.stringify(stats.totalRecordCount ?? stats.namespaces, null, 2));
}
