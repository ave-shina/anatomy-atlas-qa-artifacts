// Exports src/data/label-fallbacks.json — a map of structure key -> parent
// structure key for Z-Anatomy bone subdivisions that have no 3D geometry.
//
// The Z-Anatomy source represents subdivisions (necks, tubercles, facets,
// grooves of bones) as 3D text decals: the ".s" node that names the structure
// and the ".t" label node SHARE one flat text mesh, so the structure's only
// geometry is its own name written as text. The optimizer's name filters
// (".t"/".j"/".st" drops) remove the label node but the ".s" node keeps the
// text mesh, so these 330 structures highlight a tiny flat decal in the
// viewer. This script detects them and records the nearest real ancestor
// (e.g. "Anatomical neck of humerus" -> "humerus") so the viewer can alias
// highlight/focus to the parent bone. anatomy.json and the RAG vocabulary are
// untouched — text-only terms stay valid grounding targets.
//
// Detection is two-signal, because each signal alone misfires: a mesh shared
// with a ".t" node also happens for real structures ("Sixth rib.t" reuses the
// rib mesh), and flat+small geometry also fits real thin structures (nuchal
// ligament). Only the intersection is a text decal. Run from repo root:
//   node apps/frontend/scripts/export-label-fallbacks.mjs

import fs from "node:fs";

// --- mirrors of src/lib/structures.ts; keep in sync ------------------------
function canon(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
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

// Same drop rules as build-anatomy.mjs / optimize-model.mjs.
const isDroppedName = (name) =>
  /\.$|\.(j|t|st|g)$/.test(name) || name.includes("?") || name.includes("_");

// A decal mesh is flat (thickness < 2% of its longest side) and tiny.
const MAX_DECAL_VERTS = 2500;

function loadGlb(path) {
  const buf = fs.readFileSync(path);
  let off = 12;
  const cl = buf.readUInt32LE(off);
  off += 8;
  return JSON.parse(buf.slice(off, off + cl).toString("utf8"));
}

const startup = loadGlb("assets/Startup.glb");
const anatomy = JSON.parse(
  fs.readFileSync("apps/frontend/src/data/anatomy.json", "utf8")
);
const vocab = new Set(anatomy.structures.map((s) => canon(s.name)));

// --- collect mesh users + geometry extents ---------------------------------
const meshUsers = new Map(); // mesh index -> [{ name, hasMesh: bool node }]
startup.nodes.forEach((n, i) => {
  if (n.mesh === undefined) return;
  if (!meshUsers.has(n.mesh)) meshUsers.set(n.mesh, []);
  meshUsers.get(n.mesh).push({ idx: i, name: (n.name || "").trim() });
});

// glTF requires min/max on POSITION accessors, so extents come free.
const meshExtent = new Map(); // mesh index -> { flat, verts }
for (const meshIdx of meshUsers.keys()) {
  const prim = startup.meshes[meshIdx].primitives[0];
  if (!prim || prim.attributes.POSITION === undefined) continue;
  const acc = startup.accessors[prim.attributes.POSITION];
  if (!acc.min || !acc.max) continue;
  const dims = [0, 1, 2].map((a) => acc.max[a] - acc.min[a]).sort((a, b) => a - b);
  meshExtent.set(meshIdx, {
    flat: dims[2] > 0 && dims[0] / dims[2] < 0.02,
    verts: acc.count,
  });
}

// --- classify --------------------------------------------------------------
// A decal mesh is a flat text mesh also referenced by a ".t" label node.
const decalMeshes = new Set();
for (const [meshIdx, users] of meshUsers) {
  const ext = meshExtent.get(meshIdx);
  if (!ext || !ext.flat || ext.verts > MAX_DECAL_VERTS) continue;
  if (users.some((u) => /\.t$/.test(u.name))) decalMeshes.add(meshIdx);
}

const parent = new Map();
startup.nodes.forEach((n, i) => (n.children || []).forEach((c) => parent.set(c, i)));

function ownKey(nodeIdx) {
  const name = (startup.nodes[nodeIdx].name || "").trim();
  if (startup.nodes[nodeIdx].mesh === undefined) return null;
  if (isDroppedName(name)) return null;
  const key = canon(normalizeName(name));
  return vocab.has(key) ? key : null;
}

// Text-only is decided per KEY, not per node: a dozen keys (femur, humerus,
// stapes, ...) mix a ".s" decal node with real ".l"/".r" geometry, and the
// optimizer joins them into one mesh — those structures are real.
const keyNodes = new Map(); // key -> [{ idx, decal }]
for (const [nodeIdx, n] of startup.nodes.entries()) {
  const key = ownKey(nodeIdx);
  if (!key) continue;
  if (!keyNodes.has(key)) keyNodes.set(key, []);
  keyNodes.get(key).push({ idx: nodeIdx, decal: decalMeshes.has(n.mesh) });
}
const isRealKey = (key) => keyNodes.get(key)?.some((n) => !n.decal) ?? false;

const fallbacks = new Map(); // text-only key -> parent key
let noParent = 0;
for (const [key, nodes] of keyNodes) {
  if (isRealKey(key)) continue;
  const decalNode = nodes.find((n) => n.decal);
  if (!decalNode) continue;
  // Walk up from a decal node to the nearest ancestor that is a real,
  // non-decal structure.
  let cur = decalNode.idx;
  while (parent.has(cur)) {
    cur = parent.get(cur);
    const ancKey = ownKey(cur);
    if (ancKey && isRealKey(ancKey)) {
      fallbacks.set(key, ancKey);
      break;
    }
  }
  if (!fallbacks.has(key)) noParent += 1;
}

// --- report ----------------------------------------------------------------
const sysOf = new Map(anatomy.structures.map((s) => [canon(s.name), s.system]));
const dist = {};
for (const k of fallbacks.keys()) {
  const sys = sysOf.get(k) ?? "?";
  dist[sys] = (dist[sys] || 0) + 1;
}
console.log("text-only structures:", fallbacks.size);
console.log("by system:", dist);
console.log("without a real ancestor:", noParent);
const selfRef = [...fallbacks].filter(([k, v]) => k === v);
if (selfRef.length) {
  console.error("self-referencing fallbacks:", selfRef.length);
  process.exit(1);
}

const out = Object.fromEntries([...fallbacks].sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(
  "apps/frontend/src/data/label-fallbacks.json",
  JSON.stringify(out, null, 2) + "\n"
);
console.log(
  "wrote apps/frontend/src/data/label-fallbacks.json —",
  "sample:",
  JSON.stringify(
    [...fallbacks]
      .filter(([k]) => /neckofhumerus|calcanealtubercle|malleus/.test(k))
      .slice(0, 4)
  )
);
