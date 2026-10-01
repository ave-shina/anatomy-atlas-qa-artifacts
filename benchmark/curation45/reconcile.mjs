#!/usr/bin/env node
/**
 * Reconciliation: applied decisions (GLM-proposed) vs agent pre-screen.
 *
 * - Fills the `prescreen_agreement` column of curation45-decisions.csv
 *   (values: agree | same_cat_diff_id | conflict | prescreen_not_visible_old)
 * - Where the pre-screen disagrees, writes its counter-suggestion into
 *   `proposed_override` (NOT applied — the author decides at reveal).
 * - Writes reveal-reconciliation.md (the reveal document).
 *
 * Usage: node reconcile.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => JSON.parse(fs.readFileSync(path.join(HERE, f), "utf8"));
const proposals = read("proposals-glm53.json");
const prescreen = read("prescreen-agent.json");
const items = read("weak45.items.json");
const oldIds = new Map(items.map((i) => [i.id, new Set(i.gold_chunk_ids)]));

function toDecision(p, id) {
  const olds = oldIds.get(id) ?? new Set();
  const picks = p.picks ?? [];
  if (picks.length === 0) return p.none_adequate ? { cat: "none" } : { cat: "none", flag: "no_pick_not_none" };
  if (olds.has(picks[0].chunk_id)) return { cat: "keep_current" };
  return { cat: "chunk", id: picks[0].chunk_id };
}

const pre = new Map(prescreen.results.map((r) => [r.item_id, r]));
const glm = new Map(proposals.results.map((r) => [r.item_id, r]));

// --- read applied decisions CSV ---
const csvLines = fs.readFileSync(path.join(HERE, "curation45-decisions.csv"), "utf8").split("\n").filter(Boolean);
const head = csvLines[0].split(",");
const applied = new Map();
for (const line of csvLines.slice(1)) {
  const cols = line.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map((s) => s.replace(/,$/, "")).map((s) => s.replace(/^"|"$/g, "").replace(/""/g, '"'));
  const o = Object.fromEntries(head.map((h, i) => [h, cols[i] ?? ""]));
  applied.set(o.item_id, o);
}

let stats = { agree: 0, same_cat_diff_id: 0, conflict: 0 };
const table = [];
const conflicts = [];
for (const [id, a] of applied) {
  const p = pre.get(id);
  const g = glm.get(id);
  const pd = p ? toDecision(p, id) : { cat: "missing" };
  const ad = { cat: a.decision, id: a.chosen_chunk_id };
  let agree;
  if (!p) agree = "prescreen_missing";
  else if (pd.cat === ad.cat && (ad.cat !== "chunk" || pd.id === ad.id)) {
    agree = "agree";
    stats.agree++;
  } else if (pd.cat === ad.cat) {
    agree = "same_cat_diff_id";
    stats.same_cat_diff_id++;
  } else {
    agree = "conflict";
    stats.conflict++;
    const override = pd.cat === "chunk" ? `chunk:${pd.id}` : pd.cat;
    a.proposed_override = override;
    conflicts.push({ id, applied: `${ad.cat}${ad.id ? " " + ad.id : ""}`, prescreen: `${pd.cat}${pd.id ? " " + pd.id : ""}`, glm_note: g?.note ?? "", prescreen_note: p.note ?? "" });
  }
  a.prescreen_agreement = agree;
  table.push({ id, applied: a.decision, prescreen: pd.cat + (pd.id ? ` (${pd.id})` : ""), agree, override: a.proposed_override ?? "" });
}

// --- rewrite CSV with agreement + overrides ---
if (!head.includes("proposed_override")) head.push("proposed_override");
const esc = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;
const out = [head.join(",")];
for (const line of csvLines.slice(1)) {
  const cols = line.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map((s) => s.replace(/,$/, "")).map((s) => s.replace(/^"|"$/g, "").replace(/""/g, '"'));
  const o = Object.fromEntries(head.map((h, i) => [h, cols[i] ?? ""]));
  const a = applied.get(o.item_id);
  o.prescreen_agreement = a.prescreen_agreement;
  o.proposed_override = a.proposed_override ?? "";
  out.push(head.map((h) => esc(o[h] ?? "")).join(","));
}
fs.writeFileSync(path.join(HERE, "curation45-decisions.csv"), out.join("\n") + "\n");

// --- reveal doc ---
const md = [];
md.push(`# curated45 — Reveal & Rekonsiliasi`);
md.push("");
md.push(`Reveal SETELAH keputusan tercatat. Kolom keputusan yang berlaku di \`curation45-decisions.csv\` adalah usulan GLM-5.3 (agent-filled, bulk-approved penulis). Kolom \`prescreen_agreement\` = kesepakatan dengan pre-screen agent (harness \`glm-5.3-flash\`, in-family, advisory). Kolom \`proposed_override\` = usulan tandingan pre-screen — **belum diterapkan**, menunggu keputusan penulis.`);
md.push("");
md.push(`## Ringkasan`);
md.push("");
md.push(`| Kesepakatan | Item |`);
md.push(`|---|---|`);
md.push(`| agree (kategori & chunk sama) | ${stats.agree} |`);
md.push(`| same_cat_diff_id (sama kategori, chunk beda) | ${stats.same_cat_diff_id} |`);
md.push(`| conflict (kategori beda) | ${stats.conflict} |`);
md.push("");
if (conflicts.length) {
  md.push(`## Conflict — buta sudah terbuka, putuskan di sini`);
  md.push("");
  md.push(`Isi kolom \`author_override\` di CSV: kosong = terima yang berlaku; tulis \`override\` = pakai usulan pre-screen; atau isi nilai lain.`);
  md.push("");
  md.push(`| Item | Berlaku (GLM) | Usulan pre-screen | Catatan GLM | Catatan pre-screen |`);
  md.push(`|---|---|---|---|---|`);
  for (const c of conflicts) md.push(`| ${c.id} | ${c.applied} | ${c.prescreen} | ${c.glm_note} | ${c.prescreen_note} |`);
  md.push("");
}
md.push(`## Tabel penuh (45 item)`);
md.push("");
md.push(`| Item | Berlaku | Pre-screen | Kesepakatan | Override usulan |`);
md.push(`|---|---|---|---|---|`);
for (const t of table) md.push(`| ${t.id} | ${t.applied} | ${t.prescreen} | ${t.agree} | ${t.override} |`);
md.push("");
fs.writeFileSync(path.join(HERE, "reveal-reconciliation.md"), md.join("\n"));

console.log(`reconciliation: agree=${stats.agree} same_cat_diff_id=${stats.same_cat_diff_id} conflict=${stats.conflict}`);
console.log(`reveal-reconciliation.md written; CSV updated (prescreen_agreement + proposed_override)`);
