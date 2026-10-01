import type * as THREE from "three";

/** One entry of src/data/anatomy.json (Z-Anatomy structure metadata). */
export type Structure = {
  name: string;
  system: string;
  description: string;
};

/** A resolved structure shown in the UI list. */
export type StructureItem = {
  key: string;
  display: string;
  description: string;
  system: string;
};

/** Currently selected structure for the info card / panel highlight. */
export type Selection = {
  key: string;
  display: string;
  description: string;
  /** Display name of the parent mesh the structure is drawn as part of
   *  (text-only Z-Anatomy subdivisions have no geometry of their own). */
  partOf?: string;
};

/** Bounding sphere used to drive the camera focus animation. */
export type FocusPoint = { center: THREE.Vector3; radius: number };

/** Top-level anatomical system shown as a peel layer / panel group. */
export type LayerDef = { id: string; label: string };

/** Simple stroke-icon definition used by LayerGlyph. */
export type Icon = {
  paths: string[];
  circles?: { cx: number; cy: number; r: number; fill?: boolean }[];
};
