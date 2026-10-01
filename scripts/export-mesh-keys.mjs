/**
 * Export the set of structure keys that actually have renderable meshes in the
 * optimized GLB, and cross-reference it against the controlled vocabulary
 * (src/data/anatomy.json).
 *
 * Why: the research benchmark needs, per gold structure, to know whether a mesh
 * exists (must vs optional). In the app this is decided client-side at runtime
 * (ChatbotPanel `unavailableObjectKeys`); the harness and annotators need a
 * static artifact.
 *
 * Mapping mirrors src/lib/structures.ts (normalizeName + canonicalize + the
 * NON_ANATOMY_ROOTS filter) and scripts/verify-model.mjs — keep them in sync.
 *
 * Usage:
 *   node scripts/export-mesh-keys.mjs [glb] [outJson]
 * Defaults:
 *   glb     = public/models/anatomy.glb
 *   outJson = ../../../research/benchmark/mesh-keys.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import draco3d from "draco3dgltf";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, "..");
const REPO = path.resolve(APP, "..", "..");

// --- mirrors of src/lib/structures.ts; keep in sync ------------------------
function canonicalize(name) {
  return (name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeName(name) {
  let n = (name || "").trim();
  const m = n.match(/^(.+)\.([oe])(\d*)([lr])$/i);
  if (m) {
    const role = m[2].toLowerCase() === "o" ? "Origin" : "Insertion";
    return `${role} of ${m[1]}`;
  }
  n = n.replace(/\.([si])$/, "");
  n = n.replace(/\.([lr])$/, "");
  return n;
}

const NON_ANATOMY_ROOTS = new Set([
  "HOW TO ...",
  "Take a picture",
  "Movements.g",
  "Reference lines.g",
  "Reference planes.g",
  "General terms.g",
  "Cross Section X",
  "Cross Section Y",
  "Cross Section Z",
  "Medulla-path",
  "BezierCircle'",
]);

const glbPath = path.resolve(APP, process.argv[2] ?? "public/models/anatomy.glb");
const outPath = path.resolve(process.argv[3] ?? path.join(REPO, "research", "benchmark", "mesh-keys.json"));

// --- 1. mesh keys from the GLB ---------------------------------------------
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "draco3d.decoder": await draco3d.createDecoderModule() });
const doc = await io.read(glbPath);

const meshKeys = new Set();
const meshKeyMeshes = new Map(); // key -> mesh node count
let meshNodes = 0;
for (const scene of doc.getRoot().listScenes()) {
  scene.traverse((node) => {
    const mesh = node.getMesh();
    if (!mesh || node.getSkin()) return;
    const name = node.getName() ?? "";
    if (NON_ANATOMY_ROOTS.has(name)) return;
    // 3D text labels are intentionally dropped by optimize-model.mjs.
    if (/\.$|\.(j|t|st)$/.test(name)) return;
    const key = canonicalize(normalizeName(name));
    if (!key) return;
    meshNodes += 1;
    meshKeys.add(key);
    meshKeyMeshes.set(key, (meshKeyMeshes.get(key) ?? 0) + 1);
  });
}

// --- 2. controlled vocabulary ----------------------------------------------
const anatomyRaw = JSON.parse(fs.readFileSync(path.join(APP, "src/data/anatomy.json"), "utf8"));
const structures = Array.isArray(anatomyRaw) ? anatomyRaw : (anatomyRaw.structures ?? []);
const vocabByKey = new Map(); // canon key -> structure
for (const s of structures) {
  const k = canonicalize(s?.name);
  if (!k) continue;
  if (!vocabByKey.has(k)) vocabByKey.set(k, s);
}

const JUNK_RE = /[?]{2,}|\?[a-z]?$/i;

const vocabKeys = [...vocabByKey.keys()];
const vocabWithoutMesh = vocabKeys.filter((k) => !meshKeys.has(k));
const meshWithoutVocab = [...meshKeys].filter((k) => !vocabByKey.has(k));
const junkVocabKeys = vocabKeys.filter((k) => JUNK_RE.test(vocabByKey.get(k)?.name ?? ""));

const sortKeys = (arr) => [...arr].sort((a, b) => a.localeCompare(b));
const asRows = (keys) =>
  sortKeys(keys).map((key) => {
    const s = vocabByKey.get(key);
    return {
      key,
      display: s?.name ?? null,
      system: s?.system ?? null,
      inVocab: Boolean(s),
      meshNodes: meshKeyMeshes.get(key) ?? 0,
    };
  });

const artifact = {
  generatedFrom: path.relative(REPO, glbPath),
  vocabulary: path.relative(REPO, path.join(APP, "src/data/anatomy.json")),
  counts: {
    meshKeys: meshKeys.size,
    meshNodes,
    vocabKeys: vocabKeys.length,
    vocabWithMesh: vocabKeys.length - vocabWithoutMesh.length,
    vocabWithoutMesh: vocabWithoutMesh.length,
    meshWithoutVocab: meshWithoutVocab.length,
    junkVocabKeys: junkVocabKeys.length,
  },
  meshKeys: asRows(meshKeys),
  vocabWithoutMesh: asRows(vocabWithoutMesh),
  meshWithoutVocab: asRows(meshWithoutVocab),
  junkVocabKeys: sortKeys(junkVocabKeys),
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(artifact, null, 2) + "\n");

const c = artifact.counts;
console.log(`GLB            : ${path.relative(REPO, glbPath)}`);
console.log(`mesh nodes     : ${c.meshNodes}`);
console.log(`mesh keys      : ${c.meshKeys}`);
console.log(`vocab keys     : ${c.vocabKeys}  (with mesh ${c.vocabWithMesh}, without mesh ${c.vocabWithoutMesh})`);
console.log(`mesh-only keys : ${c.meshWithoutVocab}`);
console.log(`junk vocab keys: ${c.junkVocabKeys}${c.junkVocabKeys ? " -> " + artifact.junkVocabKeys.join(", ") : ""}`);
console.log(`written        : ${path.relative(REPO, outPath)}`);
