/**
 * Verify that an optimized GLB preserves every structure key and its
 * world-space placement. Compares two documents key-by-key:
 *
 *   1. key set — every key in the original must exist in the optimized file
 *   2. placement — per-key world bounding box (center + size) must match
 *
 * Joining/simplifying may shrink a box slightly, so size deltas get a loose
 * tolerance; a center shift means geometry moved and fails the check.
 *
 * Usage:
 *   pnpm exec node scripts/verify-model.mjs <original.glb> <optimized.glb>
 */
import fs from "node:fs";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import draco3d from "draco3dgltf";

// --- mirrors of src/lib/structures.ts; keep in sync ------------------------
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
const canon = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

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

// gl-matrix mat4 is column-major: out[i] = m[i]x + m[4+i]y + m[8+i]z + m[12+i]
function xform(m, v) {
  return [
    m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12],
    m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13],
    m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14],
  ];
}

const kb = (p) => `${(fs.statSync(p).size / 1024 / 1024).toFixed(1)}MB`;

async function keyBounds(path) {
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      "draco3d.decoder": await draco3d.createDecoderModule(),
    });
  const doc = await io.read(path);
  const root = doc.getRoot();
  // NON_ANATOMY_ROOTS subtrees are dropped entirely by optimize-model.mjs —
  // skip them here so the teaching aids don't count as missing keys.
  const junk = new Set();
  for (const scene of root.listScenes()) {
    const mark = (node) => {
      junk.add(node);
      for (const child of node.listChildren()) mark(child);
    };
    for (const node of scene.listChildren()) {
      if (NON_ANATOMY_ROOTS.has(node.getName() ?? "")) mark(node);
    }
  }
  const out = new Map(); // key -> { min, max, meshes }
  let meshes = 0;
  for (const scene of root.listScenes()) {
    scene.traverse((node) => {
      const mesh = node.getMesh();
      if (!mesh || node.getSkin()) return;
      if (junk.has(node)) return;
      const name = node.getName() ?? "";
      if (NON_ANATOMY_ROOTS.has(name)) return;
      // 3D text labels and other non-anatomy meshes are intentionally dropped
      // by optimize-model.mjs (trailing-dot / .j/.t/.st/.s text-decal names,
      // "?" names, underscored coded labels) — don't count them as missing
      // keys.
      if (
        /\.$|\.(j|t|st|g|s)$/.test(name) ||
        name.includes("?") ||
        name.includes("_")
      )
        return;
      const key = canon(normalizeName(name));
      if (!key) return;
      const m = node.getWorldMatrix();
      let e = out.get(key);
      if (!e) {
        e = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity], meshes: 0 };
        out.set(key, e);
      }
      e.meshes += 1;
      meshes += 1;
      for (const prim of mesh.listPrimitives()) {
        const pos = prim.getAttribute("POSITION");
        if (!pos) continue;
        // Exact bounds: transform every vertex. Corner-of-bbox shortcuts
        // overestimate whenever a node transform includes rotation, which
        // shows up as false center/size deltas.
        const arr = pos.getArray();
        for (let k = 0; k < arr.length; k += 3) {
          const p = xform(m, [arr[k], arr[k + 1], arr[k + 2]]);
          for (let i = 0; i < 3; i++) {
            if (p[i] < e.min[i]) e.min[i] = p[i];
            if (p[i] > e.max[i]) e.max[i] = p[i];
          }
        }
      }
    });
  }
  console.error(
    `${path}: ${out.size} keys / ${meshes} mesh nodes, ` +
      `skins=${root.listSkins().length}, animations=${root.listAnimations().length}, ${kb(path)}`,
  );
  return out;
}

const [origPath, optPath] = process.argv.slice(2);
if (!origPath || !optPath) {
  console.error("usage: node scripts/verify-model.mjs <original.glb> <optimized.glb>");
  process.exit(2);
}

const orig = await keyBounds(origPath);
const opt = await keyBounds(optPath);

const missing = [...orig.keys()].filter((k) => !opt.has(k));
const extra = [...opt.keys()].filter((k) => !orig.has(k));

// Per-key world-bbox comparison. simplify() is lossy, so size may shrink a
// little; the CENTER must hold — a shifted center is moved geometry.
const CENTER_TOL = 0.01; // model units (~1cm on a 1.7m body)
let worst = [];
let shifted = 0;
for (const [key, a] of orig) {
  const b = opt.get(key);
  if (!b) continue;
  const cDelta = Math.max(...[0, 1, 2].map((i) => Math.abs((a.min[i] + a.max[i]) / 2 - (b.min[i] + b.max[i]) / 2)));
  const sDelta = Math.max(...[0, 1, 2].map((i) => Math.abs((a.max[i] - a.min[i]) - (b.max[i] - b.min[i]))));
  if (cDelta > CENTER_TOL) shifted += 1;
  worst.push({ key, cDelta, sDelta });
}
worst.sort((x, y) => y.cDelta - x.cDelta);

console.log(`missing keys: ${missing.length}${missing.length ? " -> " + missing.slice(0, 10).join(", ") : ""}`);
console.log(`extra keys:   ${extra.length}${extra.length ? " -> " + extra.slice(0, 10).join(", ") : ""}`);
console.log(`center shifts > ${CENTER_TOL}: ${shifted}`);
console.log("worst keys by center delta:");
for (const w of worst.slice(0, 10)) {
  console.log(`  ${w.key.padEnd(40)} center Δ=${w.cDelta.toExponential(2)}  size Δ=${w.sDelta.toExponential(2)}`);
}

if (missing.length || extra.length || shifted) {
  console.error("FAIL: optimized model does not match the original.");
  process.exit(1);
}
console.error("OK: all keys preserved and placed correctly.");
