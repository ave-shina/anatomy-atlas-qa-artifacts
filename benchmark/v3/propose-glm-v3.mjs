#!/usr/bin/env node
/**
 * GLM-5.3 proposal pass for the v3 gold refresh (rescue screening).
 *
 * For each chunk-less item, z-ai/glm-5.3 reads the query + top-8 retrieved
 * candidates (from the CURRENT fulltext corpus) and either proposes up to 3
 * adequate reference chunks with one-line reasons, or declares none adequate.
 * Items with a validated pick are RESCUED (question kept, chunk attached);
 * items with none are REPLACED chunk-first.
 *
 * Disclosure note: glm-5.3 is in-family with review-trio member glm-5.3-flash;
 * its output is a PROPOSAL only. The coding agent runs an independent
 * pre-screen under the same rubric, and the human author validates blind;
 * the final verdict is theirs. Recorded here so provenance stays explicit.
 *
 * Inputs:  candidates38.json
 * Output:  proposals-glm53-v3.json
 *
 * Usage: node propose-glm-v3.mjs [--model z-ai/glm-5.3] [--concurrency 4]
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

const data = JSON.parse(fs.readFileSync(path.join(HERE, "candidates38.json"), "utf8"));

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
  return `ITEM ${it.id} (${it.type}/${it.system})
QUERY: ${it.query}
MUST-HAVE STRUCTURES: ${it.gold_structures_must.join(", ") || "(none — item judged by query alone)"}
NOTE: this item has no gold chunk; a review panel found no adequate passage in the earlier (truncated-text) corpus. Your job is to check the current full-text corpus candidates.

RETRIEVED CANDIDATES:
${cands}

TASK — respond with ONLY this JSON object, no markdown fence:
{
  "item_id": "${it.id}",
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
  let usage = null;
  for (let attempt = 0; attempt < 2 && !parsed; attempt++) {
    try {
      const r = await callModel(it, attempt);
      usage = r.usage;
      parsed = extractJson(r.text);
    } catch (e) {
      console.error(`${it.id} attempt ${attempt + 1} error: ${e.message}`);
    }
  }
  const validIds = new Set(it.candidates.map((c) => c.id));
  const picks = (parsed?.picks ?? []).filter((p) => validIds.has(p.chunk_id)).slice(0, 3);
  return {
    item_id: it.id,
    query: it.query,
    type: it.type,
    system: it.system,
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
      `${r.item_id}: picks=${r.picks.length} none=${r.none_adequate}${r.parse_ok ? "" : " [UNPARSEABLE]"}`,
    );
  }
});
await Promise.all(workers);

results.sort((a, b) => a.item_id.localeCompare(b.item_id));
const out = {
  purpose: "v3 gold refresh — GLM-5.3 rescue-screening proposal pass (ADVISORY; coding agent pre-screens, human author validates blind)",
  date: new Date().toISOString(),
  model: MODEL,
  temperature: 0,
  disclosure:
    "glm-5.3 is in-family with review-trio member glm-5.3-flash. Proposals are advisory; the coding-agent pre-screen and the human author's blind validation follow; the author is the verdict of record.",
  candidates_sha_note: "input: candidates38.json (see its own provenance block; corpus sha 5f6b9263002b...)",
  summary: {
    items: results.length,
    parse_failures: results.filter((r) => !r.parse_ok).length,
    total_picks: results.reduce((n, r) => n + r.picks.length, 0),
    none_adequate: results.filter((r) => r.none_adequate).length,
  },
  results,
};
fs.writeFileSync(path.join(HERE, "proposals-glm53-v3.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`\nproposals-glm53-v3.json written: ${JSON.stringify(out.summary)}`);
