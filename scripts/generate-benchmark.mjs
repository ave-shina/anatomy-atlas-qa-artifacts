/**
 * Generate candidate Anatomy3D-QB benchmark items (F factual / R relational /
 * A ambiguous) from local, deterministic sources — no API calls.
 *
 * Inputs
 *   - src/data/anatomy.json                     controlled vocabulary (name/system/description)
 *   - research/benchmark/mesh-keys.json         keys that have a renderable mesh
 *   - public/starter-pack/*.ndjson              corpus chunks (text + structureKeys)
 * Output
 *   - research/benchmark/anatomy3d-qb.candidates.ndjson   draft items (status=candidate)
 *   - research/benchmark/anatomy3d-qb.stats.json          counts + validation report
 *
 * Items ship as `ai_reviewed` v1: gold_answer_brief is auto-harvested
 * (enrich-benchmark.mjs) and quality is checked by the AI-assisted review
 * (research/benchmark/review/PROVENANCE.md). Human curation + κ remain future
 * work (02-protokol-evaluasi.md §1.4).
 *
 * Usage:
 *   node scripts/generate-benchmark.mjs [--seed 1] [--f-per-system 22]
 *       [--r-total 100] [--a-total 50] [--out <file>]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, "..");
const REPO = path.resolve(APP, "..", "..");
const BENCH_DIR = path.join(REPO, "research", "benchmark");

// --- args -------------------------------------------------------------------
const argv = process.argv.slice(2);
const arg = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const SEED = Number(arg("seed", "1"));
const F_PER_SYSTEM = Number(arg("f-per-system", "22"));
const R_TOTAL = Number(arg("r-total", "100"));
const A_TOTAL = Number(arg("a-total", "50"));
const OUT = path.resolve(arg("out", path.join(BENCH_DIR, "anatomy3d-qb.candidates.ndjson")));
const STATS = OUT.replace(/\.ndjson$/, ".stats.json");

const SYSTEMS = [
  "regions",
  "fasciae",
  "muscular",
  "joints",
  "skeletal",
  "cardiovascular",
  "lymphoid",
  "nervous",
  "visceral",
];
const GENERIC_DESC = "An anatomical structure of the human body.";

// --- deterministic RNG (mulberry32) ----------------------------------------
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(SEED);
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const canonicalize = (name) => (name || "").toLowerCase().replace(/[^a-z0-9]/g, "");

// --- load vocabulary + mesh availability -----------------------------------
const anatomyRaw = JSON.parse(fs.readFileSync(path.join(APP, "src/data/anatomy.json"), "utf8"));
const structures = Array.isArray(anatomyRaw) ? anatomyRaw : (anatomyRaw.structures ?? []);
const displayByKey = new Map();
const systemByKey = new Map();
const descByKey = new Map();
for (const s of structures) {
  const k = canonicalize(s?.name);
  if (!k || displayByKey.has(k)) continue;
  displayByKey.set(k, s.name);
  systemByKey.set(k, s.system);
  descByKey.set(k, s.description ?? null);
}

const meshArtifact = JSON.parse(fs.readFileSync(path.join(BENCH_DIR, "mesh-keys.json"), "utf8"));
const meshKeys = new Set(meshArtifact.meshKeys.map((r) => r.key));
// mesh artifact is authoritative for system/display when vocab lacks the key
for (const r of meshArtifact.meshKeys) {
  if (r.system && !systemByKey.has(r.key)) systemByKey.set(r.key, r.system);
  if (r.display && !displayByKey.has(r.key)) displayByKey.set(r.key, r.display);
}
const JUNK_KEY = /^$|^x$/; // empty canonical + the "?x" artifact
for (const k of [...meshKeys]) if (JUNK_KEY.test(k)) meshKeys.delete(k);

// --- load corpus chunks -----------------------------------------------------
const PACK = path.join(APP, "public/starter-pack/medrag-anatomy_gray.ndjson");
const chunks = [];
const chunksByKey = new Map();
{
  const lines = fs.readFileSync(PACK, "utf8").split("\n");
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    let d;
    try { d = JSON.parse(line); } catch { continue; }
    const m = d.m ?? {};
    let keys = [];
    try {
      keys = Array.isArray(m.structureKeys)
        ? m.structureKeys
        : JSON.parse(m.structureKeys ?? "[]");
    } catch { keys = []; }
    keys = [...new Set(keys.filter((k) => meshKeys.has(k)))];
    const chunk = { id: d.id, text: String(m.text ?? ""), keys, chunkIndex: Number(m.chunkIndex ?? 0) };
    chunks.push(chunk);
    for (const k of keys) {
      if (!chunksByKey.has(k)) chunksByKey.set(k, []);
      chunksByKey.get(k).push(chunk);
    }
  }
}
for (const arr of chunksByKey.values()) arr.sort((a, b) => a.chunkIndex - b.chunkIndex);

// --- helpers ----------------------------------------------------------------
const usedIds = new Set();
function makeId(type, system) {
  let n = 1;
  let id;
  do {
    id = `${type}-${system}-${String(n).padStart(3, "0")}`;
    n++;
  } while (usedIds.has(id));
  usedIds.add(id);
  return id;
}

const tokens = (s) => (s.toLowerCase().match(/[a-z]{2,}/g) ?? []);
function maxNgramOverlap(query, texts, n = 8) {
  const q = tokens(query);
  if (q.length < n) return 0;
  const qset = new Set();
  for (let i = 0; i + n <= q.length; i++) qset.add(q.slice(i, i + n).join(" "));
  let hits = 0;
  for (const t of texts) {
    const w = tokens(t);
    for (let i = 0; i + n <= w.length; i++) if (qset.has(w.slice(i, i + n).join(" "))) hits++;
  }
  return hits;
}

const items = [];

// --- chunk ranking + optional-structure mining ------------------------------
const words3 = (s) => (s.toLowerCase().match(/[a-z]{3,}/g) ?? []);
/** Cheap relevance proxy: how often the structure's own name words appear. */
function scoreChunk(chunk, display) {
  const text = chunk.text.toLowerCase();
  let score = 0;
  for (const w of new Set(words3(display))) {
    score += (text.match(new RegExp(`\\b${w}`, "g")) ?? []).length;
  }
  return score;
}
/** Most relevant gold chunks for a structure: ranked, not "first N by index". */
function topChunksForKey(key, display, n = 3) {
  return (chunksByKey.get(key) ?? [])
    .slice()
    .sort((a, b) => scoreChunk(b, display) - scoreChunk(a, display) || a.chunkIndex - b.chunkIndex)
    .slice(0, n);
}
/** Legitimate co-mentioned renderable structures → gold_structures_optional. */
function optionalFromChunks(goldChunks, exclude) {
  const skip = new Set(exclude);
  const set = new Set();
  for (const c of goldChunks) for (const k of c.keys) if (!skip.has(k) && meshKeys.has(k)) set.add(k);
  return [...set].sort().slice(0, 8);
}

// --- F: factual (single mesh structure) ------------------------------------
const F_TEMPLATES = [
  (d) => `What is the ${d}?`,
  (d) => `What is the function of the ${d}?`,
  (d) => `Where is the ${d} located?`,
];
for (const system of SYSTEMS) {
  const pool = shuffle(
    [...meshKeys].filter((k) => systemByKey.get(k) === system && (chunksByKey.get(k)?.length ?? 0) > 0),
  );
  for (const key of pool.slice(0, F_PER_SYSTEM)) {
    const display = displayByKey.get(key);
    const cs = topChunksForKey(key, display);
    const desc = descByKey.get(key);
    const tIdx = Math.floor(rand() * F_TEMPLATES.length);
    items.push({
      id: makeId("F", system),
      type: "F",
      system,
      query: F_TEMPLATES[tIdx](display),
      gold_structures_must: [key],
      gold_structures_optional: optionalFromChunks(cs, [key]),
      gold_chunk_ids: cs.map((c) => c.id),
      gold_answer_brief: desc && desc !== GENERIC_DESC ? desc : null,
      expects_clarification: false,
      rationale: "Single-structure factual grounding + citation.",
      status: "ai_reviewed",
      needs_curation: true,
      notes: "",
    });
  }
}

// --- R: relational (>=2 structures in one passage) --------------------------
const pairSeen = new Set();
const rCandidates = [];
for (const chunk of chunks) {
  if (chunk.keys.length < 2) continue;
  for (let i = 0; i < chunk.keys.length; i++) {
    for (let j = i + 1; j < chunk.keys.length; j++) {
      const [a, b] = [chunk.keys[i], chunk.keys[j]].sort();
      if (a === b) continue;
      const sameSystem = systemByKey.get(a) === systemByKey.get(b);
      const id = `${a}|${b}`;
      if (pairSeen.has(id)) continue;
      pairSeen.add(id);
      rCandidates.push({ a, b, sameSystem, chunk });
    }
  }
}
const rOrdered = [
  ...shuffle(rCandidates.filter((c) => c.sameSystem)),
  ...shuffle(rCandidates.filter((c) => !c.sameSystem)),
];
for (const { a, b, chunk } of rOrdered.slice(0, R_TOTAL)) {
  const system = systemByKey.get(a) ?? "regions";
  const da = displayByKey.get(a);
  const db = displayByKey.get(b);
  const pairChunks = (chunksByKey.get(a) ?? [])
    .filter((c) => c.keys.includes(b))
    .sort((x, y) => scoreChunk(y, da) + scoreChunk(y, db) - scoreChunk(x, da) - scoreChunk(x, db))
    .slice(0, 3);
  items.push({
    id: makeId("R", system),
    type: "R",
    system,
    query: `How are the ${da} and the ${db} anatomically related?`,
    gold_structures_must: [a, b].sort(),
    gold_structures_optional: optionalFromChunks(pairChunks, [a, b]),
    gold_chunk_ids: pairChunks.length ? pairChunks.map((c) => c.id) : [chunk.id],
    gold_answer_brief: null,
    expects_clarification: false,
    rationale: "Multi-structure relational grounding and recall.",
    status: "ai_reviewed",
    needs_curation: true,
    notes: "",
  });
}

// --- A: ambiguity — multi-turn vague reference + negative control -----------
// On a FIRST message the clarification gate only fires for <=2-word,
// structure-free, domain-keyword references; the intended path is multi-turn,
// where the condense model owns the vagueness verdict. So ambiguity items carry
// a short two-structure history and a vague follow-up.
const wordToKeys = new Map();
for (const key of meshKeys) {
  for (const w of new Set(tokens(displayByKey.get(key)))) {
    if (!wordToKeys.has(w)) wordToKeys.set(w, new Set());
    wordToKeys.get(w).add(key);
  }
}
const uniqueWords = [...wordToKeys.entries()].filter(([, set]) => set.size === 1);

const SYSTEM_NOUN = {
  regions: "region", fasciae: "fascia", muscular: "muscle", joints: "joint",
  skeletal: "bone", cardiovascular: "vessel", lymphoid: "gland", nervous: "nerve", visceral: "organ",
};
const aValidCount = Math.ceil(A_TOTAL * 0.6);
const aNegCount = A_TOTAL - aValidCount;

// Natural ambiguity handling. Two flavours, matching how learners actually ask:
//  (a) single-turn bare reference ("that muscle.") — short, domain-keyword, no
//      named structure;
//  (b) two-turn reference after a two-structure answer ("Tell me more about one
//      of them.") — the antecedent is genuinely indeterminate.
const CLARIFY_SINGLE = ["that muscle.", "this bone.", "the nerve.", "that artery.", "the joint.", "that vessel."];
const CLARIFY_MULTI = [
  [["user", "What is the difference between the radial artery and the ulnar artery?"], ["assistant", "Both the radial and ulnar arteries arise from the brachial artery and supply the forearm and hand."]],
  [["user", "Name the bones that form the elbow joint."], ["assistant", "The elbow joint involves the humerus, the radius and the ulna."]],
  [["user", "Which nerves supply the forearm?"], ["assistant", "The forearm is supplied by the median, ulnar and radial nerves."]],
];
const nSingle = Math.floor(aValidCount / 2);
for (let i = 0; i < aValidCount; i++) {
  const single = i < nSingle;
  const hist = single ? null : CLARIFY_MULTI[i % CLARIFY_MULTI.length].map(([role, text]) => ({ role, text }));
  const query = single ? CLARIFY_SINGLE[i % CLARIFY_SINGLE.length] : "Tell me more about one of them.";
  items.push({
    id: makeId("A", "regions"),
    type: "A",
    system: "regions",
    query,
    ...(hist ? { history: hist } : {}),
    gold_structures_must: [],
    gold_structures_optional: [],
    gold_chunk_ids: [],
    gold_answer_brief: null,
    expects_clarification: true,
    rationale: single
      ? "Bare reference with no named structure: a correct system should ask which structure is meant rather than guess."
      : "Follow-up with an indeterminate antecedent across two structures: clarification is the correct path.",
    status: "ai_reviewed",
    needs_curation: true,
    notes: "system is a placeholder — the target set comes from retrieval",
  });
}
for (const [word, set] of shuffle(uniqueWords).slice(0, aNegCount)) {
  const key = [...set][0];
  const system = systemByKey.get(key) ?? "regions";
  const cs = topChunksForKey(key, displayByKey.get(key));
  items.push({
    id: makeId("A", system),
    type: "A",
    system,
    query: `What is the ${displayByKey.get(key)}?`,
    gold_structures_must: [key],
    gold_structures_optional: optionalFromChunks(cs, [key]),
    gold_chunk_ids: cs.map((c) => c.id),
    gold_answer_brief: null,
    expects_clarification: false,
    rationale: `Negative control: "${word}" is unambiguous; answering directly is correct.`,
    status: "ai_reviewed",
    needs_curation: true,
    notes: "",
  });
}

// --- validation + anti-leakage ---------------------------------------------
const report = { invalidMust: [], optionalOverlap: [], dupIds: [], leaks: [] };
const seenId = new Set();
for (const it of items) {
  if (seenId.has(it.id)) report.dupIds.push(it.id);
  seenId.add(it.id);
  for (const k of it.gold_structures_must) if (!meshKeys.has(k)) report.invalidMust.push(`${it.id}:${k}`);
  if (it.gold_structures_optional.some((k) => it.gold_structures_must.includes(k)))
    report.optionalOverlap.push(it.id);
  if (it.gold_chunk_ids.length) {
    const texts = it.gold_chunk_ids
      .map((id) => chunks.find((c) => c.id === id)?.text ?? "")
      .filter(Boolean);
    const hits = maxNgramOverlap(it.query, texts, 8);
    if (hits > 0) report.leaks.push({ id: it.id, hits });
  }
  if (it.type !== "A" && tokens(it.query).length < 3) report.leaks.push({ id: it.id, hits: -1, note: "query too short" });
}

// --- write ------------------------------------------------------------------
const byType = {};
const bySystem = {};
for (const it of items) {
  byType[it.type] = (byType[it.type] ?? 0) + 1;
  bySystem[it.system] = (bySystem[it.system] ?? 0) + 1;
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, items.map((it) => JSON.stringify(it)).join("\n") + "\n");
fs.writeFileSync(
  STATS,
  JSON.stringify(
    {
      seed: SEED,
      total: items.length,
      byType,
      bySystem,
      optionalItems: items.filter((it) => it.gold_structures_optional.length > 0).length,
      validation: report,
    },
    null,
    2,
  ) + "\n",
);

console.log(`chunks=${chunks.length}  meshKeys=${meshKeys.size}`);
console.log(`items=${items.length}`, byType);
console.log(`bySystem:`, bySystem);
console.log(`validation: invalidMust=${report.invalidMust.length} optionalOverlap=${report.optionalOverlap.length} dupIds=${report.dupIds.length} leaks=${report.leaks.length}`);
if (report.leaks.length) console.log(`  leaks -> ${report.leaks.slice(0, 5).map((l) => JSON.stringify(l)).join(", ")}`);
console.log(`written: ${path.relative(REPO, OUT)}`);
console.log(`written: ${path.relative(REPO, STATS)}`);
