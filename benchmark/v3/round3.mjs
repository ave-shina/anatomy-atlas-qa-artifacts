#!/usr/bin/env node
/**
 * Round-2 deficit fill for the v3 gold refresh.
 *
 * After the out-of-family review rejected 8 of the 30 generated items, this
 * pass refills exactly those slots. Fresh candidate chunks are recomputed
 * from the corpus here (the shortlist options were consumed by rounds 1-2),
 * excluding:
 *   - every chunk consumed by generated30/backfill (kept or rejected), and
 *   - must-structures of ACCEPTED v3 items (no near-duplicate questions).
 *
 * The generator prompt and validation mirror generate30.mjs; a failed or
 * generator-rejected option falls through to the next candidate.
 *
 * Inputs:  generated30.json, generated30-backfill.json, review-agent-v3.json,
 *          anatomy.json, anatomy3d-qb.v2.ndjson, replace38.json, corpus pack
 * Output:  generated30-round3.json
 *
 * Usage: node round2.mjs [--model z-ai/glm-5.3]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "../../..");
const APP = path.join(ROOT, "apps/frontend");
const MODEL = process.argv.includes("--model") ? process.argv[process.argv.indexOf("--model") + 1] : "z-ai/glm-5.3";

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

// ---- deficits ----------------------------------------------------------
const reviewAll = JSON.parse(fs.readFileSync(path.join(HERE, "review-agent-v3.json"), "utf8"));
const review = { ...reviewAll.verdicts, ...(reviewAll.round2_verdicts ?? {}) };
const r1 = JSON.parse(fs.readFileSync(path.join(HERE, "generated30.json"), "utf8")).results;
const r2 = JSON.parse(fs.readFileSync(path.join(HERE, "generated30-backfill.json"), "utf8")).results;
const r2b = JSON.parse(fs.readFileSync(path.join(HERE, "generated30-round2.json"), "utf8")).results;
const all = [...r1, ...r2, ...r2b];
const byId = new Map(all.map((r) => [r.slot_item_id, r]));

const DEFICITS = {}; // "type|system" -> count
const bannedStructs = new Set();
const usedChunks = new Set();
for (const r of all) usedChunks.add(r.chunk_id); // everything touched is consumed
const kit = fs.readFileSync(path.join(ROOT, "research/benchmark/anatomy3d-qb.v2.ndjson"), "utf8")
  .trim().split("\n").map((l) => JSON.parse(l));
for (const it of kit) {
  usedChunks.add(it.gold_chunk_ids?.[0]);
  for (const k of it.gold_structures_must) bannedStructs.add(k);
}
const spec = JSON.parse(fs.readFileSync(path.join(HERE, "replace38.json"), "utf8"));
for (const it of spec.items) for (const k of it.gold_structures_must) bannedStructs.add(k);
for (const [id, v] of Object.entries(review)) {
  const r = byId.get(id);
  if (!r) continue;
  if (v.verdict === "reject") {
    const k = `${r.type}|${r.system}`;
    DEFICITS[k] = (DEFICITS[k] ?? 0) + 1;
  } else {
    for (const k of r.must) bannedStructs.add(k); // accepted items keep their structures
  }
}
const deficits = Object.entries(DEFICITS).map(([k, need]) => ({ k, typ: k.split("|")[0], system: k.split("|")[1], need }));
console.error(`deficits: ${deficits.map((d) => `${d.k}(${d.need})`).join(", ")}`);

// ---- corpus ------------------------------------------------------------
const corpusPath = path.join(APP, "public/starter-pack/medrag-anatomy_gray.ndjson");
const lines = fs.readFileSync(corpusPath, "utf8").split("\n").filter((l) => l.trim());
const chunks = lines.slice(1).map((l) => {
  const c = JSON.parse(l);
  return { id: c.id, text: c.m.text, keys: new Set(c.m.structureKeys ?? []) };
});

function proseScore(t) {
  if (t.length < 350) return -10;
  const figs = (t.match(/Fig\./g) ?? []).length;
  const bullets = (t.match(/•/g) ?? []).length + (t.match(/– /g) ?? []).length;
  const sentences = (t.match(/\. /g) ?? []).length;
  return Math.min(t.length / 400, 3) + Math.min(sentences / 4, 3) - 0.6 * figs - 0.4 * bullets;
}

function optionsFor(d, limit) {
  const out = [];
  for (const ch of chunks) {
    if (usedChunks.has(ch.id)) continue;
    const prose = proseScore(ch.text);
    if (prose <= 0) continue;
    const tl = ch.text.toLowerCase();
    const ks = [...ch.keys].filter((k) => vocab.has(k) && !bannedStructs.has(k) && vocab.get(k).system === d.system && vocab.get(k).name.toLowerCase().split("(")[0].trim().toLowerCase() && tl.includes(vocab.get(k).name.toLowerCase()));
    if (d.typ === "R" ? ks.length < 2 : ks.length < 1) continue;
    out.push({ chunk_id: ch.id, structures: ks.slice(0, 6), prose: Number(prose.toFixed(2)), text: ch.text });
  }
  out.sort((a, b) => b.prose - a.prose);
  return out.slice(0, limit);
}

// ---- generation (mirrors generate30.mjs) --------------------------------
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

async function callModel(userContent, attempt) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL, temperature: 0, max_tokens: 2000, reasoning: { effort: "low" },
      messages: [{ role: "system", content: SYSTEM }, { role: "user", content: userContent + (attempt > 0 ? "\n\nREMINDER: output ONLY the raw JSON object." : "") }],
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()).choices?.[0]?.message?.content ?? "";
}

function validate(d, structs, parsed) {
  if (!parsed || parsed.reject) return { ok: false, why: parsed?.reject ? `rejected: ${parsed.reject === true ? "inadequate" : parsed.reject}` : "unparseable" };
  const must = Array.isArray(parsed.must) ? parsed.must.filter((k) => structs.includes(k)) : [];
  if (d.typ === "R" && must.length !== 2) return { ok: false, why: "R needs exactly 2 valid must keys" };
  if (d.typ !== "R" && must.length !== 1) return { ok: false, why: "F/A needs exactly 1 valid must key" };
  const q = String(parsed.query ?? "").trim();
  if (q.length < 15 || q.length > 200) return { ok: false, why: "query length off" };
  const namesInQuery = must.every((k) => vocab.get(k).name.toLowerCase().split("(")[0].trim().toLowerCase().split(" ").every((w) => q.toLowerCase().includes(w)));
  if (!namesInQuery) return { ok: false, why: "query does not name the must structure(s)" };
  const brief = String(parsed.answer_brief ?? "").trim();
  if (brief.length < 30 || brief.length > 600) return { ok: false, why: "brief length off" };
  return { ok: true, item: { query: q, must, brief, rationale: String(parsed.rationale ?? "").slice(0, 200) } };
}

let serial = 300; // round-2 ids
const results = [];
for (const d of deficits) {
  const opts = optionsFor(d, 10);
  console.error(`${d.k}: ${opts.length} fresh options`);
  if (!opts.length) {
    results.push({ slot_item_id: `R3-${serial}`, type: d.typ, system: d.system, status: "no_options", round: 2 });
    serial++;
    continue;
  }
  let made = 0;
  for (const opt of opts) {
    if (made >= d.need) break;
    const structs = opt.structures.filter((k) => vocab.has(k));
    const names = structs.map((k) => `${k} = "${vocab.get(k).name}"`).join("\n  ");
    const user = `ITEM R3-${serial} (type ${d.typ}, system ${d.system})
PASSAGE (chunk ${opt.chunk_id}):
${opt.text}

STRUCTURES FROM THIS PASSAGE (key = "display name"):
  ${names}

TASK — write the item as specified. must = the key or two keys (R) the question is about, taken from the list above.`;
    serial++;
    let parsed = null;
    for (let attempt = 0; attempt < 2 && !parsed; attempt++) {
      try {
        parsed = extractJson(await callModel(user, attempt));
      } catch (e) {
        console.error(`  ${d.k} chunk ${opt.chunk_id} attempt ${attempt + 1}: ${e.message}`);
      }
    }
    const v = validate(d, structs, parsed);
    results.push({
      slot_item_id: `R2-${serial - 1}`, type: d.typ, system: d.system, chunk_id: opt.chunk_id,
      structures_offered: structs, ...(v.ok ? { status: "generated", ...v.item } : { status: "failed", why: v.why }),
      parse_ok: Boolean(parsed), round: 2,
    });
    usedChunks.add(opt.chunk_id); // consumed either way
    if (v.ok) {
      for (const k of v.item.must) bannedStructs.add(k);
      made++;
      console.error(`  ${d.k} <- ${opt.chunk_id} OK`);
    } else {
      console.error(`  ${d.k} chunk ${opt.chunk_id}: FAIL — ${v.why}`);
    }
  }
  if (made < d.need) console.error(`WARNING: ${d.k} still short ${d.need - made}`);
}

const generated = results.filter((r) => r.status === "generated").length;
const stillShort = deficits.filter((d) => {
  const got = results.filter((r) => r.type === d.typ && r.system === d.system && r.status === "generated").length;
  return got < d.need;
}).map((d) => d.k);
const out = {
  purpose: "v3 gold refresh — round-2 deficit fill after the out-of-family review rejected 8 items (ADVISORY PROPOSAL, same disclosure as generated30.json)",
  date: new Date().toISOString(),
  model: MODEL,
  temperature: 0,
  disclosure: "glm-5.3 is in-family with review-trio member glm-5.3-flash. Generated items are proposals; verdict of record is the author's.",
  deficits_input: DEFICITS,
  summary: { generated, slots_still_short: stillShort },
  results,
};
fs.writeFileSync(path.join(HERE, "generated30-round3.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`\ngenerated30-round3.json written: generated=${generated} still_short=${JSON.stringify(stillShort)}`);
