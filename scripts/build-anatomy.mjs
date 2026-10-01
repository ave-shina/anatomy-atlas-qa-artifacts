// Rebuilds src/data/anatomy.json from the full Z-Anatomy model
// (assets/Startup.glb), including bone subdivisions (.s/.i) and muscle
// origins/insertions (.o/.e). Run from repo root:
//   node apps/frontend/scripts/build-anatomy.mjs

import fs from "node:fs";

// ---------- helpers ----------
function canon(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Turn a Z-Anatomy object name into a clean display name.
function normalizeName(name) {
  let n = (name || "").trim();
  // muscle attachment: base.(o|e)(digits)(l|r)
  const m = n.match(/^(.+)\.([oe])(\d*)([lr])$/i);
  if (m) {
    const role = m[2].toLowerCase() === "o" ? "Origin" : "Insertion";
    return `${role} of ${m[1]}`;
  }
  n = n.replace(/\.([si])$/, ""); // subdivision (.s) / insertion (.i)
  n = n.replace(/\.([lr])$/, ""); // side
  return n;
}

function loadGlb(path) {
  const buf = fs.readFileSync(path);
  let off = 12;
  const cl = buf.readUInt32LE(off);
  off += 4;
  off += 4;
  return JSON.parse(buf.slice(off, off + cl).toString("utf8"));
}

// ---------- 1. collect anatomical leaf meshes + system from Startup.glb ----------
const startup = loadGlb("assets/Startup.glb");

const SYS = {
  "Skeletal system.g": "skeletal",
  "Joints.g": "joints",
  "Muscular system.g": "muscular",
  "Fasciae.g": "fasciae",
  "Arterial system.g": "cardiovascular",
  "Venous system.g": "cardiovascular",
  "Lymphoid organs.g": "lymphoid",
  "Nervous system & Sense organs.g": "nervous",
  "Visceral systems.g": "visceral",
  "Regions of human body.g": "regions",
};

const structures = new Map(); // display name -> { system }

function walk(idx, system) {
  const n = startup.nodes[idx];
  const name = (n.name || "").trim();
  // trailing-dot names are 3D text labels ("Grey matter of medulla
  // oblongata.") — writing-shaped meshes, not anatomy; skip like .j/.t/.st
  if (n.mesh !== undefined && !/\.(j|t|st)$/.test(name) && !/\.$/.test(name)) {
    const clean = normalizeName(name);
    // ".g" names are Z-Anatomy group markers (tree navigation with a tiny
    // clickable dot, e.g. "Brain.g") — hierarchy scaffolding, not anatomy.
    // Names containing "?" are encoding-corrupted in the Z-Anatomy export.
    // Underscored names ("Lat_Fis-post", "Sulcus interm_prim-Jensen") are
    // internal coded labels — never match natural answer text, and the coded
    // keys would only ever render as plain text chips.
    if (
      clean &&
      !clean.endsWith(".g") &&
      !name.includes("?") &&
      !name.includes("_")
    ) {
      if (!structures.has(clean)) {
        structures.set(clean, { system });
      }
    }
  }
  for (const c of n.children || []) walk(c, system);
}
for (const r of startup.scenes[0].nodes) {
  const s = SYS[startup.nodes[r].name];
  if (s) walk(r, s);
}

// ---------- 2. ontology for descriptions ----------
// Build-time input only — never imported by the app, so it stays out of the
// client bundle.
const bp = JSON.parse(
  fs.readFileSync("apps/frontend/data/bodyparts3d.json", "utf8")
);
const concepts = bp.concepts;
const isa = bp.isa;
const partOf = bp.partOf;

const canonIndex = new Map();
for (const [id, c] of Object.entries(concepts)) {
  const key = canon(c.en);
  if (key && !canonIndex.has(key)) canonIndex.set(key, id);
}
function lookupConcept(name) {
  const c = canon(name);
  if (canonIndex.has(c)) return canonIndex.get(c);
  const noDigits = c.replace(/\d+$/, "");
  if (noDigits && canonIndex.has(noDigits)) return canonIndex.get(noDigits);
  return null;
}

const partOfChildren = new Map();
for (const [child, parent] of Object.entries(partOf)) {
  if (!partOfChildren.has(parent)) partOfChildren.set(parent, []);
  partOfChildren.get(parent).push(child);
}
function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function describe(id) {
  const c = concepts[id];
  if (!c) return "An anatomical structure of the human body.";
  const en = cap(c.en);
  const s = [];
  const ip = isa[id];
  if (ip && concepts[ip]) s.push(`${en} is a type of ${concepts[ip].en}.`);
  const pp = partOf[id];
  if (pp && concepts[pp]) s.push(`It is a part of ${concepts[pp].en}.`);
  const kids = partOfChildren.get(id) || [];
  if (kids.length) {
    const names = kids
      .slice(0, 6)
      .map((k) => concepts[k]?.en)
      .filter(Boolean);
    let child = `It consists of ${names.join(", ")}`;
    if (kids.length > 6) child += ` and ${kids.length - 6} more`;
    s.push(`${child}.`);
  }
  if (!s.length) return `${en} is an anatomical structure of the human body.`;
  return s.join(" ");
}

// ---------- 3. assemble ----------
const list = [];
for (const [name, { system }] of structures) {
  let description;
  let id = lookupConcept(name);
  if (id) {
    description = describe(id);
  } else if (name.startsWith("Origin of ") || name.startsWith("Insertion of ")) {
    id = lookupConcept(name.replace(/^(Origin|Insertion) of /, ""));
    description = id
      ? `Attachment site of ${cap(concepts[id].en)}.`
      : "A muscle attachment site on bone.";
  } else {
    description = "An anatomical structure of the human body.";
  }
  list.push({ name, system, description });
}
list.sort((a, b) => a.name.localeCompare(b.name));

const dist = {};
for (const s of list) dist[s.system] = (dist[s.system] || 0) + 1;

const out = {
  meta: {
    source:
      "Z-Anatomy (assets/Startup.glb, full model incl. subdivisions & muscle attachments) + BodyParts3D ontology",
    total_structures: list.length,
    language: "en",
    systems:
      "skeletal, joints, muscular, fasciae, cardiovascular, lymphoid, nervous, visceral, regions",
    note: "system derived from Z-Anatomy top-level collections (Arterial+Venous merged into Cardiovascular).",
  },
  structures: list,
};
fs.writeFileSync(
  "apps/frontend/src/data/anatomy.json",
  JSON.stringify(out, null, 2) + "\n"
);
console.log("total structures:", list.length);
console.log("distribution:", dist);
