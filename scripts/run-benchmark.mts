/**
 * Experiment harness for Anatomy3D-QB (02-protokol-evaluasi.md §4).
 *
 * Runs the REAL RAG pipeline in-process (lib/rag/*) — not over HTTP — so that
 * every run is reproducible from one command, and writes:
 *   research/runs/<run-id>/manifest.json   environment + code/dataset versions
 *   research/runs/<run-id>/items.jsonl     per-item answers, chips, citations, metrics
 *   research/runs/<run-id>/metrics.json    aggregate metrics, one block per condition
 *
 * Conditions (E1): B1 no-RAG, B2 RAG without vocabulary grounding, B3 full
 * pipeline. See scripts/lib/pipeline-variants.mts.
 *
 * Usage (run from apps/frontend):
 *   pnpm exec tsx scripts/run-benchmark.mts --index <pinecone-index> \
 *     [--conditions B1,B2,B3] \
 *     [--dataset ../../research/benchmark/anatomy3d-qb.candidates.ndjson] \
 *     [--run-id <id>] [--limit 20] [--repeat 3] [--topk 6] \
 *     [--chat-model openai/gpt-4o-mini] [--embed-model openai/text-embedding-3-small] \
 *     [--doc-id medrag-anatomy_gray]
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { createEmbeddings } from "@/lib/rag/providers";
import { queryChunks } from "@/lib/rag/vectorstore";
import type { RagSettings, ChatRequestBody, RagStreamEvent, ObjectRef, Citation } from "@/types/rag";
import { runCondition, type Condition } from "./lib/pipeline-variants.mts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, "..");
const REPO = path.resolve(APP, "..", "..");

// --- args -------------------------------------------------------------------
const argv = process.argv.slice(2);
const arg = (name: string, def?: string): string | undefined => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const DATASET = path.resolve(arg("dataset", path.join(REPO, "research/benchmark/anatomy3d-qb.candidates.ndjson"))!);
const RUN_ID = arg("run-id") ?? new Date().toISOString().replace(/[:.]/g, "-");
const LIMIT = Number(arg("limit", "0"));
/** Take the first N items of each type (F/R/A) — balanced pilot. */
const PER_TYPE = Number(arg("per-type", "0"));
/** Restrict to a subset of types, e.g. --types A. */
const TYPES = (arg("types", "") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const REPEAT = Number(arg("repeat", "1"));
const TOPK = Number(arg("topk", "6"));
const DOC_ID = arg("doc-id", "medrag-anatomy_gray")!;
const conditions = (arg("conditions", "B3") ?? "B3")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean) as Condition[];
const RUN_DIR = path.join(REPO, "research", "runs", RUN_ID);

// --- env --------------------------------------------------------------------
function loadEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  const p = path.join(APP, ".env.local");
  if (!fs.existsSync(p)) return out;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}
const env = loadEnv();
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY ?? env.OPENROUTER_API_KEY ?? "";
const PINECONE_KEY = process.env.PINECONE_API_KEY ?? env.PINECONE_API_KEY ?? "";
const INDEX = arg("index") ?? process.env.PINECONE_INDEX ?? env.PINECONE_INDEX ?? "";
const CHAT_MODEL = arg("chat-model", "openai/gpt-4o-mini")!;
/** The live index is 1024-dim, seeded with bge-m3 — override only to match a different index. */
const EMBED_MODEL = arg("embed-model", "baai/bge-m3")!;

if (!OPENROUTER_KEY || !PINECONE_KEY || !INDEX) {
  console.error("Missing credentials/index. Need OPENROUTER_API_KEY, PINECONE_API_KEY and --index (or PINECONE_INDEX).");
  process.exit(2);
}

const settings: RagSettings = {
  openRouterKey: OPENROUTER_KEY,
  chatModel: CHAT_MODEL,
  embedModel: EMBED_MODEL,
  pineconeKey: PINECONE_KEY,
  pineconeIndex: INDEX,
  promptPrefs: { language: "en" },
};

// --- mesh-keys (for hallucination + wrong-link metrics) ---------------------
const meshArtifact = JSON.parse(
  fs.readFileSync(path.join(REPO, "research/benchmark/mesh-keys.json"), "utf8"),
);
const MESH_KEYS = new Set<string>(meshArtifact.meshKeys.map((r: { key: string }) => r.key));
/** Full controlled vocabulary = renderable keys ∪ vocabulary keys without a mesh. */
const VOCAB_KEYS = new Set<string>([
  ...meshArtifact.meshKeys.map((r: { key: string }) => r.key),
  ...meshArtifact.vocabWithoutMesh.map((r: { key: string }) => r.key),
]);

// --- dataset ----------------------------------------------------------------
type Item = {
  id: string;
  type: "F" | "R" | "A";
  system: string;
  query: string;
  history?: { role: "user" | "assistant"; text: string }[];
  gold_structures_must: string[];
  gold_structures_optional: string[];
  gold_chunk_ids: string[];
  expects_clarification: boolean;
};
const items: Item[] = fs
  .readFileSync(DATASET, "utf8")
  .split("\n")
  .filter((l) => l.trim())
  .map((l) => JSON.parse(l) as Item);
const typePool = TYPES.length ? items.filter((it) => TYPES.includes(it.type)) : items;
const selected = PER_TYPE > 0
  ? (["F", "R", "A"] as const).flatMap((t) => typePool.filter((it) => it.type === t).slice(0, PER_TYPE))
  : LIMIT > 0
    ? typePool.slice(0, LIMIT)
    : typePool;

const sha256 = (p: string) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const gitSha = (() => {
  try { return execSync("git rev-parse HEAD", { cwd: REPO }).toString().trim(); } catch { return null; }
})();

// --- one generation pass (handles clarification rounds) ---------------------
type GenResult = {
  answer: string;
  objects: ObjectRef[];
  citations: Citation[];
  clarificationRounds: { question: string; candidates: string[]; picked: string }[];
  error: string | null;
};

async function generate(condition: Condition, item: Item): Promise<GenResult> {
  const gold = new Set(item.gold_structures_must);
  const out: GenResult = { answer: "", objects: [], citations: [], clarificationRounds: [], error: null };
  let clarifyRound: 0 | 1 | 2 = 0;
  let clarifiedKey: string | undefined;

  for (let attempt = 0; attempt < 3; attempt++) {
    const body: ChatRequestBody = {
      question: item.query,
      history: (item.history ?? []).map((t) => ({ role: t.role, text: t.text })),
      docIds: [DOC_ID],
      clarifyRound,
      clarifiedKey,
    };
    let text = "";
    let objects: ObjectRef[] = [];
    let citations: Citation[] = [];
    let clarify: { question: string; candidates: { key: string }[]; round: 1 | 2 } | null = null;
    let error: string | null = null;

    // 429 (rate limit) is transient: retry the whole attempt with exponential
    // backoff instead of recording the item as failed. Other errors fail fast.
    for (let rate = 0; ; rate++) {
      text = "";
      objects = [];
      citations = [];
      clarify = null;
      error = null;
      try {
        for await (const ev of runCondition(condition, settings, body) as AsyncGenerator<RagStreamEvent>) {
          if (ev.type === "token") text += ev.text;
          else if (ev.type === "objects") objects = ev.keys;
          else if (ev.type === "citations") citations = ev.items;
          else if (ev.type === "clarification") clarify = { question: ev.question, candidates: ev.candidates, round: ev.round };
          else if (ev.type === "error") error = ev.message;
        }
      } catch (e) {
        error = e instanceof Error ? e.message : String(e);
      }
      if (!error || !error.includes("429") || rate >= 5) break;
      const waitMs = 15000 * 2 ** rate; // 15s, 30s, 60s, 120s, 240s (≈8 min worst case)
      console.log(`  429 on ${item.id}/${condition}; backoff ${waitMs / 1000}s`);
      await new Promise((r) => setTimeout(r, waitMs));
    }

    out.answer = text;
    out.objects = objects;
    out.citations = citations;
    out.error = error;
    if (error || !clarify) return out;

    const keys = clarify.candidates.map((c) => c.key);
    const picked = keys.find((k) => gold.has(k)) ?? keys[0];
    out.clarificationRounds.push({ question: clarify.question, candidates: keys, picked });
    if (!picked) return out;
    clarifyRound = clarify.round;
    clarifiedKey = picked;
  }
  return out;
}

// --- metrics ----------------------------------------------------------------
function chipMetrics(objects: ObjectRef[], item: Item) {
  const must = new Set(item.gold_structures_must);
  const optional = new Set(item.gold_structures_optional ?? []);
  const keys = [...new Set(objects.map((o) => o.key))];
  const tp = keys.filter((k) => must.has(k));
  const tpOpt = keys.filter((k) => must.has(k) || optional.has(k));
  const precision = keys.length ? tp.length / keys.length : must.size === 0 ? 1 : 0;
  const precisionOptional = keys.length ? tpOpt.length / keys.length : 1;
  const recall = must.size ? tp.length / must.size : 1;
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
  const f1Optional = precisionOptional + recall ? (2 * precisionOptional * recall) / (precisionOptional + recall) : 0;
  return {
    chip_precision: precision,
    chip_precision_optional: precisionOptional,
    chip_recall: recall,
    chip_f1: f1,
    chip_f1_optional: f1Optional,
    // Key not in the controlled vocabulary at all (structure does not exist).
    hallucinated: keys.filter((k) => !VOCAB_KEYS.has(k)),
    // Real structure, but no renderable mesh in the GLB (e.g. Z-Anatomy ".g" group nodes).
    non_renderable: keys.filter((k) => VOCAB_KEYS.has(k) && !MESH_KEYS.has(k)),
    // Renderable structure neither required nor listed as an acceptable extra.
    wrong_link: keys.filter((k) => MESH_KEYS.has(k) && !must.has(k) && !optional.has(k)),
    extra_optional: keys.filter((k) => optional.has(k)),
    missed_link: [...must].filter((k) => !keys.includes(k)),
    chip_keys: keys,
  };
}
function retrievalMetrics(retrieved: string[], gold: string[]) {
  const g = new Set(gold);
  // No gold chunks -> not scoreable; null keeps the item out of run averages
  // (it used to count as perfect recall and inflated the aggregate).
  if (!g.size) return { recall_at_3: null, recall_at_6: null, recall_at_10: null, mrr: null, retrieved };
  const ranks = retrieved.map((id, i) => (g.has(id) ? i + 1 : 0)).filter((r) => r > 0);
  const recallAt = (k: number) => retrieved.slice(0, k).filter((id) => g.has(id)).length / gold.length;
  return {
    recall_at_3: recallAt(3),
    recall_at_6: recallAt(6),
    recall_at_10: recallAt(10),
    mrr: ranks.length ? 1 / Math.min(...ranks) : 0,
    retrieved,
  };
}

// --- run (incremental + resumable) ------------------------------------------
const embeddings = createEmbeddings(settings);
type RunRecord = {
  id: string;
  type: string;
  system: string;
  query: string;
  gold_structures_must: string[];
  expects_clarification: boolean;
  retrieval: unknown;
  conditions: Record<string, unknown[]>;
};

const manifest = {
  runId: RUN_ID,
  date: new Date().toISOString(),
  gitSha,
  conditions,
  docId: DOC_ID,
  chatModel: CHAT_MODEL,
  embedModel: EMBED_MODEL,
  pineconeIndex: INDEX,
  topK: TOPK,
  repeat: REPEAT,
  limit: LIMIT,
  perType: PER_TYPE,
  types: TYPES,
  dataset: { path: path.relative(REPO, DATASET), sha256: sha256(DATASET), items: items.length },
  meshKeys: {
    path: "research/benchmark/mesh-keys.json",
    sha256: sha256(path.join(REPO, "research/benchmark/mesh-keys.json")),
    keys: MESH_KEYS.size,
  },
};

fs.mkdirSync(RUN_DIR, { recursive: true });
fs.writeFileSync(path.join(RUN_DIR, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
const itemsPath = path.join(RUN_DIR, "items.jsonl");
if (!fs.existsSync(itemsPath)) fs.writeFileSync(itemsPath, "");
const doneIds = new Set<string>(
  fs.readFileSync(itemsPath, "utf8").split("\n").filter(Boolean).map((l) => (JSON.parse(l) as { id: string }).id),
);
const pending = selected.filter((it) => !doneIds.has(it.id));
if (doneIds.size) console.log(`resume: ${doneIds.size} done, ${pending.length} pending`);

for (const [i, item] of pending.entries()) {
  const goldChunks = item.gold_chunk_ids ?? [];
  let retrieval: Record<string, unknown>;
  try {
    const vector = await embeddings.embedQuery(item.query);
    const chunks = await queryChunks(settings, { vector, docIds: [DOC_ID], topK: TOPK });
    const ids = chunks.map((c) => `${c.docId}:${c.chunkIndex}`);
    retrieval = { ...retrievalMetrics(ids, goldChunks), scores: chunks.map((c) => Number(c.score.toFixed(4))) };
  } catch (e) {
    retrieval = { error: e instanceof Error ? e.message : String(e) };
  }

  const perCondition: Record<string, unknown[]> = {};
  for (const condition of conditions) {
    const repeats: unknown[] = [];
    for (let r = 0; r < REPEAT; r++) {
      const t0 = performance.now();
      const gen = await generate(condition, item);
      repeats.push({ ...gen, durationMs: Math.round(performance.now() - t0), ...chipMetrics(gen.objects, item) });
    }
    perCondition[condition] = repeats;
  }

  const rec: RunRecord = {
    id: item.id,
    type: item.type,
    system: item.system,
    query: item.query,
    gold_structures_must: item.gold_structures_must,
    expects_clarification: item.expects_clarification,
    retrieval,
    conditions: perCondition,
  };
  fs.appendFileSync(itemsPath, JSON.stringify(rec) + "\n");
  process.stdout.write(`\r${doneIds.size + i + 1}/${selected.length} ${item.id}                    `);
}
process.stdout.write("\n");

const records: RunRecord[] = fs
  .readFileSync(itemsPath, "utf8")
  .split("\n")
  .filter(Boolean)
  .map((l) => JSON.parse(l) as RunRecord);

// --- aggregate per condition ------------------------------------------------
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
type Repeat = {
  chip_f1: number; chip_f1_optional: number; chip_precision: number; chip_precision_optional: number; chip_recall: number;
  hallucinated: string[]; non_renderable: string[]; wrong_link: string[]; extra_optional: string[]; missed_link: string[];
  error: string | null; durationMs: number; clarificationRounds: unknown[];
};
const condMetrics: Record<string, unknown> = {};
for (const condition of conditions) {
  const flat = records.flatMap((r) => r.conditions[condition] as Repeat[]);
  condMetrics[condition] = {
    generations: flat.length,
    ok: flat.filter((r) => !r.error).length,
    failed: flat.filter((r) => r.error).length,
    chip_precision: mean(flat.map((r) => r.chip_precision)),
    chip_precision_optional: mean(flat.map((r) => r.chip_precision_optional)),
    chip_recall: mean(flat.map((r) => r.chip_recall)),
    chip_f1: mean(flat.map((r) => r.chip_f1)),
    chip_f1_optional: mean(flat.map((r) => r.chip_f1_optional)),
    hallucinated_total: flat.reduce((a, r) => a + r.hallucinated.length, 0),
    non_renderable_total: flat.reduce((a, r) => a + r.non_renderable.length, 0),
    wrong_link_total: flat.reduce((a, r) => a + r.wrong_link.length, 0),
    extra_optional_total: flat.reduce((a, r) => a + r.extra_optional.length, 0),
    missed_link_total: flat.reduce((a, r) => a + r.missed_link.length, 0),
    clarification_runs: flat.filter((r) => r.clarificationRounds.length > 0).length,
    mean_duration_ms: mean(flat.map((r) => r.durationMs)),
  };
}
const aggregate = {
  runId: RUN_ID,
  items: selected.length,
  conditions,
  perCondition: condMetrics,
  retrieval: {
    recall_at_3: mean(records.map((r) => (r.retrieval as { recall_at_3?: number | null }).recall_at_3).filter((x): x is number => x != null)),
    recall_at_6: mean(records.map((r) => (r.retrieval as { recall_at_6?: number | null }).recall_at_6).filter((x): x is number => x != null)),
    recall_at_10: mean(records.map((r) => (r.retrieval as { recall_at_10?: number | null }).recall_at_10).filter((x): x is number => x != null)),
    mrr: mean(records.map((r) => (r.retrieval as { mrr?: number | null }).mrr).filter((x): x is number => x != null)),
  },
};

fs.writeFileSync(path.join(RUN_DIR, "metrics.json"), JSON.stringify(aggregate, null, 2) + "\n");

console.log("per-condition:", condMetrics);
console.log("retrieval:", aggregate.retrieval);
console.log(`written: research/runs/${RUN_ID}/`);
