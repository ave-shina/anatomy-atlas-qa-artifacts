import anatomy from "@/data/anatomy.json";
import labelFallbacks from "@/data/label-fallbacks.json";
import type * as THREE from "three";
import type { Structure } from "@/types/anatomy";

const STRUCTURES = anatomy.structures as Structure[];

export function canonicalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const canonToInfo = new Map<string, Structure>();
for (const s of STRUCTURES) {
  canonToInfo.set(canonicalize(s.name), s);
}

/**
 * Z-Anatomy represents bone subdivisions (necks, tubercles, facets) as 3D
 * text decals — the structure's only mesh is its own name written as text.
 * Those keys alias to their parent bone (see
 * scripts/export-label-fallbacks.mjs); returns null for real geometry.
 */
export function labelFallbackKey(key: string): string | null {
  return (labelFallbacks as Record<string, string>)[canonicalize(key)] ?? null;
}

// Turn a Z-Anatomy object name into a clean display name.
export function normalizeName(name: string): string {
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

export function resolveStructure(meshName: string): {
  key: string;
  display: string;
} {
  const display = normalizeName(meshName);
  const key = canonicalize(display);
  return { key, display };
}

export function getStructureInfo(key: string): Structure | undefined {
  return canonToInfo.get(canonicalize(key));
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

// GLTFLoader stores the original (unsanitized) name in userData.name; walk up
// to the nearest ancestor that has one.
export function resolveMeshName(obj: THREE.Object3D): string {
  let cur: THREE.Object3D | null = obj;
  while (cur) {
    const n = (cur.userData as { name?: string } | undefined)?.name;
    if (n) return n;
    cur = cur.parent;
  }
  return obj.name;
}

export function isNonAnatomy(obj: THREE.Object3D): boolean {
  let cur: THREE.Object3D | null = obj;
  while (cur) {
    const n = (cur.userData as { name?: string } | undefined)?.name || cur.name;
    if (NON_ANATOMY_ROOTS.has(n)) return true;
    cur = cur.parent;
  }
  return false;
}
