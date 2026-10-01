#!/usr/bin/env node
/**
 * GLM-5.3 proposal pass for the curated45 gold-chunk repair.
 *
 * For each weak item, z-ai/glm-5.3 reads the query + top-8 retrieved candidates
 * and (a) rates the OLD gold chunk's adequacy, (b) proposes up to 3 replacement
 * candidates with one-line reasons, or declares none adequate.
 *
 * Disclosure note: glm-5.3 is in-family with review-trio member glm-5.3-flash;
 * its output is a PROPOSAL only. The human author validates blind; the final
 * verdict is theirs. Recorded here so the provenance chain stays explicit.
 *
 * Inputs:  candidates.json
 * Output:  proposals-glm53.json
 *
 * Usage: node propose-glm.mjs [--model z-ai/glm-5.3] [--concurrency 4]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(HERE, "../../../apps/frontend");
const MODEL = process.argv.includes("--model") ? process.argv[process.argv.indexOf("--model") + 1] : "z-ai/glm-5.3";
const CONC = Number(process.argv.includes("--concurrency") ? process.argv[process.argv.indexOf("--concurrency") + 1] : 4);

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

const data = JSON.parse(fs.readFileSync(path.join(HERE, "candidates.json"), "utf8"));

const SYSTEM = `You are assisting a benchmark curation task for a medical RAG dataset (Gray's Anatomy, 41st ed.).
A gold chunk is the passage that SHOULD contain the information needed to answer a question.
Adequacy criteria:
- The chunk must actually CONTAIN the information the query asks for (definition, location, function, relations — whatever is asked), not merely mention a structure's name.
- Figure-caption dumps, bare anatomical term lists, tables of labels, and passing mentions are NOT adequate.
- The chunk should be self-contained enough that a correct short reference answer could be written from it alone.
You are strict: "weak" means the information is absent or incidental, not that the chunk is imperfect.`;

function userPrompt(it) {
  const cands = it.candidates
    .map((c, i) => `[C${i + 1}] id=${c.id} (page ${c.page}, chunk ${c.chunkIndex}, cosine ${c.cosine.toFixed(4)})\n${c.text}`)
    .join("\n\n");
  const oldIds = it.old_gold_chunk_ids.join(", ");
  return `ITEM ${it.id} (${it.type}/${it.system})
QUERY: ${it.query}
MUST-HAVE STRUCTURES: ${it.gold_structures_must.join(", ")}
CURRENT GOLD CHUNK IDS (flagged weak by a review panel): ${oldIds}
CURRENT TOP GOLD CHUNK TEXT:
${it.candidates.find((c) => c.id === it.old_gold_chunk_ids[0])?.text ?? "(not in top-8)"}

RETRIEVED CANDIDATES:
${cands}

TASK — respond with ONLY this JSON object, no markdown fence:
{
  "item_id": "${it.id}",
  "old_top_adequacy": "adequate" | "partial" | "inadequate",
  "old_top_reason": "<=25 words",
  "picks": [ { "chunk_id": "<id of one of C1..C8>", "reason": "<=25 words why this is the best reference passage" } ],
  "none_adequate": true | false,
  "note": "<=25 words, optional: anything the validator must know"
}
Rules: at most 3 picks, best first. Only ids from C1..C8. If no candidate meets the adequacy criteria, picks=[] and none_adequate=true. Never pick a chunk merely for name overlap.`;
}

function extractJson(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]);
  } catch {
    return null;
  }
}

async function callModel(it, attempt) {
  const body = {
    model: MODEL,
    temperature: 0,
    max_tokens: 4000,
    reasoning: { effort: "low" }, // keep the reasoning budget from starving the JSON content
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: userPrompt(it) + (attempt > 0 ? "\n\nREMINDER: output ONLY the raw JSON object." : "") },
    ],
  };
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  const choice = json.choices?.[0] ?? {};
  const text = choice.message?.content ?? "";
  if (!text.trim()) {
    console.error(
      `  [diag] empty content: finish_reason=${choice.finish_reason} usage=${JSON.stringify(json.usage?.completion_tokens_details ?? {})} total_completion=${json.usage?.completion_tokens}`,
    );
  }
  return { text, usage: json.usage ?? null };
}

async function processItem(it) {
  let parsed = null;
  let raw = "";
  let usage = null;
  for (let attempt = 0; attempt < 2 && !parsed; attempt++) {
    try {
      const r = await callModel(it, attempt);
      raw = r.text;
      usage = r.usage;
      parsed = extractJson(raw);
    } catch (e) {
      console.error(`${it.id} attempt ${attempt + 1} error: ${e.message}`);
    }
  }
  const validIds = new Set(it.candidates.map((c) => c.id));
  const picks = (parsed?.picks ?? []).filter((p) => validIds.has(p.chunk_id)).slice(0, 3);
  return {
    item_id: it.id,
    query: it.query,
    old_gold_chunk_ids: it.old_gold_chunk_ids,
    old_top_adequacy: parsed?.old_top_adequacy ?? "UNPARSEABLE",
    old_top_reason: parsed?.old_top_reason ?? "",
    picks,
    none_adequate: Boolean(parsed?.none_adequate),
    note: parsed?.note ?? "",
    parse_ok: Boolean(parsed),
    usage,
  };
}

const results = [];
const queue = [...data.items];
const workers = Array.from({ length: Math.min(CONC, queue.length) }, async () => {
  while (queue.length) {
    const it = queue.shift();
    const r = await processItem(it);
    results.push(r);
    console.error(
      `${r.item_id}: old=${r.old_top_adequacy} picks=${r.picks.length} none=${r.none_adequate}${r.parse_ok ? "" : " [UNPARSEABLE]"}`,
    );
  }
});
await Promise.all(workers);

results.sort((a, b) => a.item_id.localeCompare(b.item_id));
const out = {
  purpose: "curated45 — GLM-5.3 proposal pass (ADVISORY; human validates blind)",
  date: new Date().toISOString(),
  model: MODEL,
  temperature: 0,
  disclosure:
    "glm-5.3 is in-family with review-trio member glm-5.3-flash. Proposals are advisory; the human author's blind validation is the verdict of record.",
  candidates_sha_note: "input: candidates.json (see its own provenance block)",
  summary: {
    items: results.length,
    parse_failures: results.filter((r) => !r.parse_ok).length,
    old_top_adequacy: results.reduce((m, r) => ((m[r.old_top_adequacy] = (m[r.old_top_adequacy] ?? 0) + 1), m), {}),
    total_picks: results.reduce((n, r) => n + r.picks.length, 0),
    none_adequate: results.filter((r) => r.none_adequate).length,
  },
  results,
};
fs.writeFileSync(path.join(HERE, "proposals-glm53.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`\nproposals-glm53.json written: ${JSON.stringify(out.summary)}`);
