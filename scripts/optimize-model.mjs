/**
 * Optimize public/models/anatomy.glb for the web viewer.
 *
 * The Z-Anatomy source ships ~3.1k tiny meshes (one per anatomical part,
 * split further by side). The viewer resolves mesh names to structure keys
 * via normalizeName() in src/lib/structures.ts — "X.l" and "X.r" collapse to
 * the same key — so meshes sharing a key can be merged into one without
 * changing any app behavior (selection, highlight, hide, focus all operate
 * per key). Fewer, larger meshes compress dramatically better and cut draw
 * calls.
 *
 * Pipeline: flatten → drop 3D text labels (.j/.t/.st/.s decal nodes) →
 * bake world transforms into vertex data → weld → simplify (conservative
 * error-bound) → join per structure key → weld again → dedup/prune → Draco.
 *
 * Usage:
 *   pnpm exec node scripts/optimize-model.mjs [in.glb] [out.glb]
 * Verify afterwards (keys + placement) with scripts/verify-model.mjs.
 */
import fs from "node:fs";
import { NodeIO } from "@gltf-transform/core";
import {
  ALL_EXTENSIONS,
  KHRDracoMeshCompression,
} from "@gltf-transform/extensions";
import {
  dedup,
  flatten,
  joinPrimitives,
  prune,
  simplify,
  transformMesh,
  weld,
} from "@gltf-transform/functions";
import draco3d from "draco3dgltf";
import { MeshoptSimplifier } from "meshoptimizer";

// --- mirrors of src/lib/structures.ts; keep in sync ------------------------
function normalizeName(name) {
  let n = (name || "").trim();
  const m = n.match(/^(.+)\.([oe])(\d*)([lr])$/i);
  if (m) {
    // Role-aware, mirroring structures.ts + the vocabulary: attachments are
    // their own focusable structures ("Origin of X"), not part of bone X.
    const role = m[2].toLowerCase() === "o" ? "Origin" : "Insertion";
    return `${role} of ${m[1]}`;
  }
  n = n.replace(/\.([si])$/, "");
  n = n.replace(/\.([lr])$/, "");
  return n;
}

const canon = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Non-anatomy names dropped from the model — mirrors build-anatomy.mjs and the
// late drop below. Bake and join must SKIP these nodes, not just dispose them
// afterwards: in the full Z-Anatomy export, label and marker nodes SHARE mesh
// data with real structures (e.g. "Sixth rib.t" reuses the rib mesh), so
// baking a label welds label-space geometry (y≈14, far above the 1.7-unit
// body) into whatever structure shares the mesh. ".s" nodes are the Z-Anatomy
// bone-subdivision text decals ("Neck of femur" written as flat text) — every
// one is flat and shares its mesh with a ".t" label node, and 13 of them
// (femur, stapes, tibia, ...) join into real bone meshes, which would bake the
// writing onto the bone. Text-only ".s" keys stay in anatomy.json for RAG
// grounding; the viewer aliases them to their parent bone via
// src/data/label-fallbacks.json.
const isDroppedName = (name) =>
  /\.$|\.(j|t|st|g|s)$/.test(name) || name.includes("?") || name.includes("_");

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

const inPath = process.argv[2] ?? "public/models/anatomy.glb";
const outPath = process.argv[3] ?? "public/models/anatomy.opt.glb";

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "draco3d.decoder": await draco3d.createDecoderModule(),
    "draco3d.encoder": await draco3d.createEncoderModule(),
  });

const doc = await io.read(inPath);
const root = doc.getRoot();

// Mark NON_ANATOMY_ROOTS subtrees (movements, reference lines/planes, general
// terms, cross sections) BEFORE flatten() detaches the hierarchy — the join
// and bake below must skip the whole subtree, not just the named root, or the
// teaching aids ship as structure keys ("Median plane", "Ulnar" arrows).
const junkNodes = new Set();
for (const scene of root.listScenes()) {
  const mark = (node) => {
    junkNodes.add(node);
    for (const child of node.listChildren()) mark(child);
  };
  for (const node of scene.listChildren()) {
    if (NON_ANATOMY_ROOTS.has(node.getName() ?? "")) mark(node);
  }
}

await MeshoptSimplifier.ready;
await doc.transform(
  flatten(),
  weld(),
  simplify({ simplifier: MeshoptSimplifier, error: 0.0001 }),
);

// --- bake world transforms into vertex data ---------------------------------
// flatten() only detaches nodes from their parents (folding each world
// transform into the node's TRS) — vertex data still lives in per-node local
// space. Joining primitives from different nodes without baking would render
// them all at the representative node's transform, scattering the model.
// transformMesh handles POSITION/NORMAL/TANGENT, morph targets and winding
// order. World matrices are snapshotted first: resetting a node's TRS would
// otherwise change the world matrices of nodes visited after it.
const isIdentity = (m) =>
  m[0] === 1 && m[5] === 1 && m[10] === 1 && m[15] === 1 &&
  m[1] === 0 && m[2] === 0 && m[3] === 0 && m[4] === 0 &&
  m[6] === 0 && m[7] === 0 && m[8] === 0 && m[9] === 0 &&
  m[11] === 0 && m[12] === 0 && m[13] === 0 && m[14] === 0;

const bakeList = [];
for (const scene of root.listScenes()) {
  scene.traverse((node) => {
    const mesh = node.getMesh();
    if (!mesh || node.getSkin()) return; // skinned meshes bind in armature space
    if (junkNodes.has(node) || isDroppedName(node.getName() ?? "")) return;
    bakeList.push([node, node.getWorldMatrix()]);
  });
}
// Z-Anatomy's full export shares one mesh across bilateral nodes
// ("Incus.l"/"Incus.r" reference the same vertex data, mirrored by node
// transforms). transformMesh mutates accessor arrays in place, so a shared
// mesh must be split BEFORE anything is baked — otherwise later users would
// copy (or re-transform) already-baked world-space vertices and fling the
// geometry across the scene. First user keeps the mesh; everyone else gets a
// deep copy (own accessors) made while the data is still pristine. Then each
// node bakes its own mesh exactly once.
const meshUsers = new Map(); // mesh -> [node, ...] in bake order
for (const [node] of bakeList) {
  const mesh = node.getMesh();
  if (!meshUsers.has(mesh)) meshUsers.set(mesh, []);
  meshUsers.get(mesh).push(node);
}
const copyAccessor = (src) => {
  const copy = doc.createAccessor();
  copy.setType(src.getType());
  copy.setArray(src.getArray().slice());
  copy.setBuffer(src.getBuffer());
  return copy;
};
const copyMesh = (src) => {
  const copy = doc.createMesh();
  for (const prim of src.listPrimitives()) {
    const p = doc
      .createPrimitive()
      .setMode(prim.getMode())
      .setMaterial(prim.getMaterial());
    for (const semantic of prim.listSemantics()) {
      p.setAttribute(semantic, copyAccessor(prim.getAttribute(semantic)));
    }
    if (prim.getIndices()) p.setIndices(copyAccessor(prim.getIndices()));
    for (const target of prim.listTargets()) {
      const t = doc.createPrimitiveTarget();
      for (const semantic of target.listSemantics()) {
        t.setAttribute(semantic, copyAccessor(target.getAttribute(semantic)));
      }
      p.addTarget(t);
    }
    copy.addPrimitive(p);
  }
  return copy;
};
for (const [, users] of meshUsers) {
  for (const node of users.slice(1)) node.setMesh(copyMesh(node.getMesh()));
}
for (const [node, matrix] of bakeList) {
  if (!isIdentity(matrix)) transformMesh(node.getMesh(), matrix);
  node.setTranslation([0, 0, 0]).setRotation([0, 0, 0, 1]).setScale([1, 1, 1]);
}

// --- group mesh nodes by structure key -------------------------------------
const groups = new Map();
for (const node of root.listNodes()) {
  const mesh = node.getMesh();
  if (!mesh || node.getSkin()) continue;
  const name = node.getName() ?? "";
  if (junkNodes.has(node) || NON_ANATOMY_ROOTS.has(name) || isDroppedName(name))
    continue;
  const key = canon(normalizeName(name));
  if (!key) continue;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(node);
}

let joinedKeys = 0;
let skippedKeys = 0;
const materialIds = new Map(); // Material object -> stable short id
for (const [key, nodes] of groups) {
  if (nodes.length < 2) continue;
  // Bucket primitives by (material identity, mode, attribute layout, index
  // type) — joinPrimitives requires compatibility on all of them. Z-Anatomy
  // materials are unnamed, so identity (not name) must key the bucket.
  const buckets = new Map();
  for (const node of nodes) {
    for (const prim of node.getMesh().listPrimitives()) {
      const material = prim.getMaterial();
      if (!materialIds.has(material)) {
        materialIds.set(material, materialIds.size);
      }
      const semantics = prim.listSemantics();
      const layout = semantics
        .map((s) => `${s}:${prim.getAttribute(s)?.getComponentType()}`)
        .sort()
        .join(",");
      const indices = prim.getIndices()?.getArray()?.constructor.name ?? "-";
      const sig = `${materialIds.get(material)}|${prim.getMode()}|${layout}|${indices}`;
      if (!buckets.has(sig)) buckets.set(sig, []);
      buckets.get(sig).push(prim);
    }
  }

  try {
    // Representative node keeps its name — normalizeName(rep) must resolve
    // to this key, which holds for any member of the group.
    const rep = [...nodes].sort((a, b) =>
      (a.getName() ?? "").localeCompare(b.getName() ?? ""),
    )[0];
    const newMesh = doc.createMesh(key);
    for (const prims of buckets.values()) {
      newMesh.addPrimitive(
        prims.length === 1 ? prims[0] : joinPrimitives(prims),
      );
    }
    const oldMesh = rep.getMesh();
    rep.setMesh(newMesh);
    oldMesh.dispose();
    for (const node of nodes) {
      if (node === rep) continue;
      node.getMesh()?.dispose();
      node.dispose();
    }
    joinedKeys += 1;
  } catch (e) {
    // Incompatible bucket (e.g. accessor type mismatch): keep as-is.
    skippedKeys += 1;
    console.warn(`skip key "${key}": ${e.message}`);
  }
}

// --- drop non-anatomy meshes -------------------------------------------------
// Trailing-dot names ("Grey matter of medulla oblongata.") and .j/.t/.st/.s
// names are writing-shaped label meshes, not anatomy — build-anatomy.mjs
// excludes the same shapes and the viewer hides them at runtime. ".g" names
// are Z-Anatomy tree-navigation markers (tiny clickable dots), "?" names are
// encoding corruption, and underscored names ("Lat_Fis-post") are internal
// coded labels — build-anatomy.mjs excludes all three too. Must run AFTER the
// bake and join above: disposing nodes earlier corrupts the world-matrix
// snapshot and misplaces real geometry (caught by verify-model.mjs as large
// center shifts).
let droppedLabels = 0;
for (const node of root.listNodes()) {
  const name = node.getName() ?? "";
  if (
    !junkNodes.has(node) &&
    !/\.$|\.(j|t|st|g|s)$/.test(name) &&
    !name.includes("?") &&
    !name.includes("_")
  )
    continue;
  const mesh = node.getMesh();
  if (mesh && mesh.listParents().length === 1) mesh.dispose();
  node.dispose();
  droppedLabels += 1;
}
console.log(`dropped ${droppedLabels} text-label meshes`);

// --- restore material colors -------------------------------------------------
// The full Z-Anatomy export lost the lean export's colors: 128 of its 171
// materials ship with no baseColorFactor (white) and 154 carry
// emissiveFactor > 0, which the previously shipped model never had (0/44).
// Left alone, ~59% of primitives render colorless. Recolor colorless
// materials by name — anatomy-family colors mirrored from the old model's
// lean export; brain-lobe tones chosen by us since the full export lost
// them — and zero emissive, matching the old pipeline's output.
const MATERIAL_COLORS = [
  [/^black$/, [0.01, 0.01, 0.01]],
  [/^eye$/, [0.93, 0.95, 0.96]],
  [/sulci/, [0.91, 0.627, 0.749]],
  [/^skin/, [0.91, 0.71, 0.61]],
  [/^teeth[ -]?roots/, [0.88, 0.83, 0.72]],
  [/^teeth/, [0.92, 0.88, 0.78]],
  [/^bone/, [0.94, 0.88, 0.75]],
  [/^cartilage/, [0.44, 0.66, 0.84]],
  [/^pulmonary artery/, [0.39, 0.23, 0.78]],
  [/^pulmonary vein/, [0.78, 0.23, 0.31]],
  [/^artery/, [0.91, 0.3, 0.24]],
  [/^vein/, [0.24, 0.49, 0.77]],
  [/^nerve/, [0.95, 0.77, 0.06]],
  [/^tendon/, [0.95, 0.91, 0.81]],
  [/^ligament/, [0.6, 0.65, 0.65]],
  [/^articular capsule/, [0.55, 0.55, 0.58]],
  [/^lymph/, [0.18, 0.62, 0.36]],
  [/^mucosa/, [0.96, 0.72, 0.69]],
  [/^gland/, [0.61, 0.35, 0.71]],
  [/^ductus/, [0.85, 0.73, 0.54]],
  [/^bronch/, [0.94, 0.6, 0.56]],
  [/^organ/, [0.9, 0.49, 0.13]],
  [/^intestine/, [0.88, 0.48, 0.42]],
  [/^suture/, [0.63, 0.63, 0.63]],
  [/^frontal lobe/, [0.8, 0.45, 0.5]],
  [/^temporal lobe/, [0.8, 0.65, 0.35]],
  [/^parietal lobe/, [0.55, 0.65, 0.85]],
  [/^occipital lobe/, [0.5, 0.75, 0.55]],
  [/^insula/, [0.7, 0.55, 0.8]],
  [/^limbic/, [0.8, 0.55, 0.35]],
  // Muscle-system materials: attachment markers ("Origin-*", "End-*") and
  // the animator action colors all read as muscle in the atlas.
  [
    /^origin|^end[-\s]|flexion|extension|rotation|rotator|adductor|abductor|extensor|flexor|trapezius|masticat|levator|depressor|biarticular|diaphragm|superficial|orbicular|phonation|ingestion|muscul/,
    [0.75, 0.22, 0.17],
  ],
];
const recolored = [];
for (const mat of root.listMaterials()) {
  mat.setEmissiveFactor([0, 0, 0]);
  const name = mat.getName() ?? "";
  // "Text-2" is the black material Z-Anatomy's annotation workflow left on 344
  // skeletal meshes (ear ossicles, metatarsals, phalanges) — after the label
  // drop those bones are its only users. Force bone ivory; body hair keeps its
  // correct "Black" material. Runs before the hasBase skip: Text-2 ships with
  // a valid (black) baseColorFactor.
  if (/^text/i.test(name)) {
    mat.setBaseColorFactor([0.94, 0.88, 0.75, 1]);
    recolored.push(`${name} (text→bone)`);
    continue;
  }
  const hasBase = (mat.getBaseColorFactor() ?? [1, 1, 1, 1]).some(
    (v, i) => i < 3 && Math.abs(v - 1) > 1e-3,
  );
  if (hasBase || mat.getBaseColorTexture()) continue;
  const rule = MATERIAL_COLORS.find(([re]) => re.test(name.toLowerCase()));
  if (rule) {
    mat.setBaseColorFactor([...rule[1], 1]);
    recolored.push(name);
  } else {
    console.warn(`material without a color rule: "${name}" — left white`);
  }
}
console.log(
  `recolored ${recolored.length} colorless materials, zeroed emissive`,
);

// Three primitives in the source (ethmoid air cells) ship with NO material —
// glTF's default renders near-black in three.js (metallic, unlit). They are
// bone, so give them the bone color.
let unmaterial = 0;
for (const mesh of root.listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    if (!prim.getMaterial()) {
      prim.setMaterial(
        doc
          .createMaterial()
          .setName("Bone (default)")
          .setBaseColorFactor([0.94, 0.88, 0.75, 1]),
      );
      unmaterial += 1;
    }
  }
}
if (unmaterial) console.log(`assigned bone material to ${unmaterial} prims`);

await doc.transform(weld(), dedup(), prune());

// --- Draco ------------------------------------------------------------------
const draco =
  root
    .listExtensionsUsed()
    .find((ext) => ext.extensionName === "KHR_draco_mesh_compression") ??
  doc.createExtension(KHRDracoMeshCompression);
draco.setRequired(true);
draco.setEncoderOptions({
  method: KHRDracoMeshCompression.EncoderMethod.EDGEBREAKER,
  encodeSpeed: 0,
  decodeSpeed: 5,
});

await io.write(outPath, doc);

const kb = (p) => `${(fs.statSync(p).size / 1024 / 1024).toFixed(1)}MB`;
console.log(
  `joined ${joinedKeys} keys (${skippedKeys} skipped) — ` +
    `${kb(inPath)} -> ${kb(outPath)}: ${outPath}`,
);
