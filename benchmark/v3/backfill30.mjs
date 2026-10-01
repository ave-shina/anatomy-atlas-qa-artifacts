#!/usr/bin/env node
/**
 * Backfill rounds for the v3 generation pass.
 *
 * Re-runs generation for slots that fell short in generated30.json, walking
 * each slot's remaining shortlist options. Options the generator rejects as
 * inadequate are consumed permanently; accepted ones become items.
 *
 * Inputs:  generated30.json, shortlist30.json, anatomy.json
 * Output:  generated30-backfill.json
 *
 * Usage: node backfill30.mjs [--max-rounds 3]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(HERE, "../../../apps/frontend");
const MODEL = "z-ai/glm-5.3";
const MAX_ROUNDS = Number(process.argv.includes("--max-rounds") ? process.argv[process.argv.indexOf("--max-rounds") + 1] : 3);

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
const slots = JSON.parse(fs.readFileSync(path.join(HERE, "shortlist30.json"), "utf8")).slots;
const first = JSON.parse(fs.readFileSync(path.join(HERE, "generated30.json"), "utf8"));

// state from round 1
const usedChunks = new Set(first.results.map((r) => r.chunk_id));
const okBySlot = new Map();
for (const r of first.results) {
  if (r.status === "generated") {
    const k = `${r.type}|${r.system}`;
    okBySlot.set(k, (okBySlot.get(k) ?? 0) + 1);
  }
}
const needBySlot = new Map(Object.entries(slots).map(([k, v]) => [k, v.need]));

// import prompt machinery from generate30 (duplicated compactly here)
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

function extractJson(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]);
  } catch {
    return null;
  }
}

async function callModel(userContent) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL, temperature: 0, max_tokens: 2000, reasoning: { effort: "low" },
      messages: [{ role: "system", content: SYSTEM }, { role: "user", content: userContent }],
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()).choices?.[0]?.message?.content ?? "";
}

function validate(typ, structs, parsed) {
  if (!parsed || parsed.reject) return { ok: false, why: parsed?.reject ? `rejected: ${parsed.reject === true ? "inadequate" : parsed.reject}` : "unparseable" };
  const must = Array.isArray(parsed.must) ? parsed.must.filter((k) => structs.includes(k)) : [];
  if (typ === "R" && must.length !== 2) return { ok: false, why: "R needs exactly 2 valid must keys" };
  if (typ !== "R" && must.length !== 1) return { ok: false, why: "F/A needs exactly 1 valid must key" };
  const q = String(parsed.query ?? "").trim();
  if (q.length < 15 || q.length > 200) return { ok: false, why: "query length off" };
  const brief = String(parsed.answer_brief ?? "").trim();
  if (brief.length < 30 || brief.length > 600) return { ok: false, why: "brief length off" };
  return { ok: true, item: { query: q, must, brief, rationale: String(parsed.rationale ?? "").slice(0, 200) } };
}

let serial = 100; // backfill ids
const results = [];
for (let round = 1; round <= MAX_ROUNDS; round++) {
  const short = [];
  for (const [k, need] of needBySlot) {
    const have = okBySlot.get(k) ?? 0;
    if (have < need) short.push({ k, typ: k.split("|")[0], system: k.split("|")[1], deficit: need - have });
  }
  if (!short.length) break;
  console.error(`round ${round}: short slots -> ${short.map((s) => `${s.k}(${s.deficit})`).join(", ")}`);
  let progressed = false;
  for (const s of short) {
    const opts = slots[`${s.typ}|${s.system}`].options.filter((o) => !usedChunks.has(o.chunk_id));
    let made = 0;
    for (const opt of opts) {
      if (made >= s.deficit) break;
      const structs = opt.structures.filter((k) => vocab.has(k));
      if (s.typ === "R" ? structs.length < 2 : structs.length < 1) continue;
      const names = structs.map((k) => `${k} = "${vocab.get(k).name}"`).join("\n  ");
      const user = `ITEM B-${serial} (type ${s.typ}, system ${s.system})
PASSAGE (chunk ${opt.chunk_id}):
${opt.text}

STRUCTURES FROM THIS PASSAGE (key = "display name"):
  ${names}

TASK — write the item as specified. must = the key or two keys (R) the question is about, taken from the list above.`;
      serial++;
      let parsed = null;
      try {
        parsed = extractJson(await callModel(user));
      } catch (e) {
        console.error(`  backfill ${s.k} chunk ${opt.chunk_id}: ${e.message}`);
        continue;
      }
      const v = validate(s.typ, structs, parsed);
      results.push({
        slot_item_id: `B-${serial - 1}`, type: s.typ, system: s.system, chunk_id: opt.chunk_id,
        structures_offered: structs, ...(v.ok ? { status: "generated", ...v.item } : { status: "failed", why: v.why }),
        parse_ok: Boolean(parsed), round,
      });
      if (v.ok) {
        usedChunks.add(opt.chunk_id);
        okBySlot.set(`${s.typ}|${s.system}`, (okBySlot.get(`${s.typ}|${s.system}`) ?? 0) + 1);
        made++;
        progressed = true;
        console.error(`  ${s.k} <- ${opt.chunk_id} OK`);
      } else {
        usedChunks.add(opt.chunk_id); // rejected as inadequate — do not retry
        console.error(`  ${s.k} chunk ${opt.chunk_id}: FAIL — ${v.why}`);
      }
    }
  }
  if (!progressed) {
    console.error("round made no progress; stopping");
    break;
  }
}

const finalCounts = {};
for (const [k, need] of needBySlot) finalCounts[k] = `${Math.min(okBySlot.get(k) ?? 0, need)}/${need}`;
const out = {
  purpose: "v3 gold refresh — backfill rounds over remaining shortlist options (ADVISORY PROPOSAL, same disclosure as generated30.json)",
  date: new Date().toISOString(),
  model: MODEL,
  temperature: 0,
  rounds_run: MAX_ROUNDS,
  summary: { generated_this_file: results.filter((r) => r.status === "generated").length, slot_fill: finalCounts },
  results,
};
fs.writeFileSync(path.join(HERE, "generated30-backfill.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`\ngenerated30-backfill.json written: ${JSON.stringify(out.summary, null, 1)}`);
