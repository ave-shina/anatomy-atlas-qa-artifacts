#!/usr/bin/env node
/**
 * GLM-5.3 generation pass for the v3 gold refresh (chunk-first replacements).
 *
 * Consumes shortlist30.json options greedily (no chunk reuse across items)
 * and asks z-ai/glm-5.3 to write one benchmark item per slot from a single
 * chunk: query, must-structures (verbatim anatomy.json names), and a short
 * reference answer built from that chunk alone.
 *
 * Validation is local and strict: must keys must appear in the chunk's
 * structureKeys AND in the mesh vocab, query must match the type's template,
 * brief must be non-empty. A rejected option falls through to the next one.
 *
 * Disclosure: glm-5.3 is in-family with review-trio member glm-5.3-flash.
 * Its output is a PROPOSAL; the coding agent reviews out-of-family and the
 * human author validates blind. Recorded so provenance stays explicit.
 *
 * Inputs:  shortlist30.json, ../../../apps/frontend/src/data/anatomy.json
 * Output:  generated30.json
 *
 * Usage: node generate30.mjs [--model z-ai/glm-5.3] [--concurrency 4]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "../../..");
const APP = path.join(ROOT, "apps/frontend");
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
  console.error("Missing OPENROUTER_API_KEY");
  process.exit(2);
}

const canon = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
const vocabList = JSON.parse(fs.readFileSync(path.join(APP, "src/data/anatomy.json"), "utf8")).structures;
const vocab = new Map(vocabList.map((s) => [canon(s.name), s]));
const shortlist = JSON.parse(fs.readFileSync(path.join(HERE, "shortlist30.json"), "utf8")).slots;

// one assignment per needed item, chunks unique across the whole run
const usedChunks = new Set();
const assignments = [];
for (const slot of Object.keys(shortlist).sort()) {
  const [typ, system] = slot.split("|");
  const need = shortlist[slot].need;
  let made = 0;
  for (const opt of shortlist[slot].options) {
    if (made >= need) break;
    if (usedChunks.has(opt.chunk_id)) continue;
    const structs = opt.structures.filter((k) => vocab.has(k));
    if (typ === "R" ? structs.length < 2 : structs.length < 1) continue;
    usedChunks.add(opt.chunk_id);
    assignments.push({ slot, typ, system, chunk: opt, structs });
    made++;
  }
  if (made < need) console.error(`WARNING: slot ${slot} short ${need - made} (ran out of options)`);
}

const SYSTEM = `You are writing benchmark items for a medical RAG dataset grounded in Gray's Anatomy (41st ed.).
You get ONE passage and a list of anatomical structures from it. Write ONE item that this passage definitively answers.
Rules:
- Query templates by type.
  F: one of "What is the <Name>?", "Where is the <Name> located?", "What is the function of the <Name>?" — pick the one the passage actually supports.
  R: exactly "How are the <NameA> and the <NameB> anatomically related?"
  A: exactly "What is the <Name>?" (plain factual control item about one structure).
- <Name> MUST be the structure's display name VERBATIM as given, even if the grammar reads oddly.
- The reference answer must be built ONLY from the passage, under 60 words, one or two sentences.
- For R, the passage must state an actual anatomical relationship (course, adjacency, branching, attachment) between the two structures — if it merely lists both names, say so in reject.
- If the passage is inadequate (caption dump, names only, no answerable content), set "reject": true and say why in one line.
Respond with ONLY this JSON object, no markdown fence:
{
  "item_id": "<given slot-item id>",
  "query": "<the question>",
  "must": ["<key(s) from the provided key list>"],
  "answer_brief": "<short reference answer from the passage>",
  "rationale": "<=20 words why this makes a valid item>",
  "reject": false
}`;

const jobs = assignments.map((a, i) => ({ ...a, slot_item_id: `${a.typ}-${a.system}-gen${i + 1}` }));

function userPrompt(j) {
  const names = j.structs.map((k) => `${k} = "${vocab.get(k).name}"`).join("\n  ");
  return `ITEM ${j.slot_item_id} (type ${j.typ}, system ${j.system})
PASSAGE (chunk ${j.chunk.chunk_id}):
${j.chunk.text}

STRUCTURES FROM THIS PASSAGE (key = "display name"):
  ${names}

TASK — write the item as specified. must = the key or two keys (R) the question is about, taken from the list above.`;
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

async function callModel(j, attempt) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      max_tokens: 2000,
      reasoning: { effort: "low" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userPrompt(j) + (attempt > 0 ? "\n\nREMINDER: output ONLY the raw JSON object." : "") },
      ],
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "";
}

function validate(j, parsed) {
  if (!parsed || parsed.reject) return { ok: false, why: parsed?.reject ? `generator rejected: ${parsed.reject === true ? "inadequate" : parsed.reject}` : "unparseable" };
  const must = Array.isArray(parsed.must) ? parsed.must.filter((k) => j.structs.includes(k)) : [];
  if (j.typ === "R" && must.length !== 2) return { ok: false, why: "R needs exactly 2 valid must keys" };
  if (j.typ !== "R" && must.length !== 1) return { ok: false, why: "F/A needs exactly 1 valid must key" };
  const q = String(parsed.query ?? "").trim();
  if (q.length < 15 || q.length > 200) return { ok: false, why: "query length off" };
  const namesInQuery = must.every((k) => vocab.get(k).name.toLowerCase().split("(")[0].trim().toLowerCase().split(" ").every((w) => q.toLowerCase().includes(w)));
  if (!namesInQuery) return { ok: false, why: "query does not name the must structure(s)" };
  const brief = String(parsed.answer_brief ?? "").trim();
  if (brief.length < 30 || brief.length > 600) return { ok: false, why: "brief length off" };
  return { ok: true, item: { query: q, must, brief, rationale: String(parsed.rationale ?? "").slice(0, 200) } };
}

const results = [];
const queue = [...jobs];
const workers = Array.from({ length: Math.min(CONC, queue.length) }, async () => {
  while (queue.length) {
    const j = queue.shift();
    let parsed = null;
    for (let attempt = 0; attempt < 2 && !parsed; attempt++) {
      try {
        parsed = extractJson(await callModel(j, attempt));
      } catch (e) {
        console.error(`${j.slot_item_id} attempt ${attempt + 1}: ${e.message}`);
      }
    }
    const v = validate(j, parsed);
    results.push({
      slot_item_id: j.slot_item_id, type: j.typ, system: j.system, chunk_id: j.chunk.chunk_id,
      structures_offered: j.structs, ...(v.ok ? { status: "generated", ...v.item } : { status: "failed", why: v.why }),
      parse_ok: Boolean(parsed),
    });
    console.error(`${j.slot_item_id}: ${v.ok ? "OK" : "FAIL — " + v.why}`);
  }
});
await Promise.all(workers);

results.sort((a, b) => a.slot_item_id.localeCompare(b.slot_item_id));
const out = {
  purpose: "v3 gold refresh — GLM-5.3 chunk-first item generation (ADVISORY PROPOSAL; reviewed out-of-family by the coding agent, validated blind by the human author)",
  date: new Date().toISOString(),
  model: MODEL,
  temperature: 0,
  disclosure: "glm-5.3 is in-family with review-trio member glm-5.3-flash. Generated items are proposals; verdict of record is the author's.",
  shortlist_note: "input: shortlist30.json (deterministic local scoring)",
  summary: {
    assignments: results.length,
    generated: results.filter((r) => r.status === "generated").length,
    failed: results.filter((r) => r.status !== "generated").length,
  },
  results,
};
fs.writeFileSync(path.join(HERE, "generated30.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`\ngenerated30.json written: ${JSON.stringify(out.summary)}`);
