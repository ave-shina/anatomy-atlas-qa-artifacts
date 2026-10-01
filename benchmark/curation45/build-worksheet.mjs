#!/usr/bin/env node
/**
 * Build the BLIND validation worksheet + decision template for the curated45 repair.
 *
 * Blindness rules:
 *  - Candidate order is shuffled deterministically (seeded by item id), then
 *    relabeled A..H, so neither retrieval rank nor GLM's preference order leaks.
 *  - GLM-5.3's picks/reasons live ONLY in proposals-glm53.json and are NOT
 *    copied into the worksheet.
 *  - The agent pre-screen lives ONLY in prescreen-agent.json (built separately,
 *    after validation) and is NOT copied into the worksheet.
 *
 * Inputs:  candidates.json, proposals-glm53.json (summary stats only)
 * Outputs: worksheet-blind.md, curation45-decisions.template.csv
 *
 * Usage: node build-worksheet.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(HERE, "../../../apps/frontend");
const cands = JSON.parse(fs.readFileSync(path.join(HERE, "candidates.json"), "utf8"));
const props = JSON.parse(fs.readFileSync(path.join(HERE, "proposals-glm53.json"), "utf8"));

// corpus text lookup so the validator can judge keep_current against the old chunk
const corpusText = new Map();
{
  const lines = fs
    .readFileSync(path.join(APP, "public/starter-pack/medrag-anatomy_gray.ndjson"), "utf8")
    .split("\n");
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const c = JSON.parse(lines[i]);
    corpusText.set(c.id, c.m.text);
  }
}

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
const LABELS = "ABCDEFGH";

const lines = [];
lines.push(`# curated45 — Blind Validation Worksheet`);
lines.push("");
lines.push(`**Penilai:** penulis (satu-satunya lapisan independen).  `);
lines.push(`**Instrumen:** kandidat = top-8 embedding retrieval (${cands.embed_model}) atas ${cands.corpus.chunks} chunk corpus (sha256 \`${cands.corpus.sha256.slice(0, 12)}…\`).  `);
lines.push(`**Buta:** urutan kandidat diacak deterministik per item; usulan & alasan GLM-5.3 serta pre-screen agent TIDAK ADA di dokumen ini — keduanya baru di-reveal setelah keputusanmu terkunci di \`${"curation45-decisions.csv"}\`.`);
lines.push("");
lines.push(`## Cara mengisi`);
lines.push("");
lines.push(`Untuk setiap item, pilih SATU keputusan dan isi barisnya di \`curation45-decisions.csv\`:`);
lines.push("");
lines.push(`| Keputusan | Artinya | Kolom \`decision\` |`);
lines.push(`|---|---|---|`);
lines.push(`| Ganti dengan kandidat terbaik | chunk ini benar-benar memuat informasi untuk menjawab query | \`chunk\` + isi \`chosen_chunk_id\` |`);
lines.push(`| Pertahankan kunci lama | kamu tidak setuju dengan panel; chunk lama cukup layak | \`keep_current\` |`);
lines.push(`| Tidak ada yang layak | tidak ada kandidat (atau kunci lama) yang memuat informasinya | \`none\` → item jadi gold-less |`);
lines.push(`| Item bermasalah | query-nya sendiri cacat (mis. pasangan relasional arbitrer) — perbaikannya revisi item, bukan ganti chunk | \`item_flawed\` + catat di \`notes\` |`);
lines.push("");
lines.push(`**Kriteria "layak":** chunk memuat informasi yang ditanya query — bukan sekadar menyebut nama struktur. Dump keterangan gambar, daftar istilah, dan sebutan sepintas TIDAK layak.`);
lines.push(`**Disiplin scope:** putuskan gold chunk ID saja. Jangan mengubah query/gold structures lewat jalur ini.`);
lines.push("");
lines.push(`> Statistik agregat proposal GLM-5.3 (tanpa identitas item): ${props.results.length} item; total usulan ${props.summary.total_picks}; usulan "tidak ada yang layak" ${props.summary.none_adequate} item. Angka ini tidak mengikat — nilai sendiri setiap item.`);
lines.push("");
lines.push(`---`);
lines.push("");

for (const it of cands.items) {
  const shuffled = [...it.candidates];
  const rng = mulberry32(hashStr(it.id));
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  lines.push(`## ${it.id}  (${it.type}/${it.system})`);
  lines.push("");
  lines.push(`**QUERY:** ${it.query}`);
  lines.push("");
  lines.push(`**MUST-HAVE:** ${it.gold_structures_must.join(", ") || "(none)"}`);
  lines.push("");
  lines.push(`**Kunci lama (ditandai lemah panel):** ${it.old_gold_chunk_ids.join(", ")}`);
  lines.push("");
  for (const oid of it.old_gold_chunk_ids) {
    const t = corpusText.get(oid);
    if (t) {
      lines.push(`**Teks kunci lama \`${oid}\`:**`);
      lines.push("");
      lines.push(`> ${t.replace(/\n+/g, "\n> ")}`);
      lines.push("");
    }
  }
  lines.push(`### Kandidat (acak, berlabel)`);
  lines.push("");
  shuffled.forEach((c, i) => {
    lines.push(`**[${LABELS[i]}] \`${c.id}\`** — hal. ${c.page}, chunk ${c.chunkIndex}`);
    lines.push("");
    lines.push(`> ${c.text.replace(/\n+/g, "\n> ")}`);
    lines.push("");
  });
  lines.push(`**KEPUTUSAN →** \`decision\`: chunk / keep_current / none / item_flawed — \`chosen_chunk_id\`: ____`);
  lines.push("");
  lines.push(`---`);
  lines.push("");
}

fs.writeFileSync(path.join(HERE, "worksheet-blind.md"), lines.join("\n"));

const csv = ["item_id,decision,chosen_chunk_id,notes"];
for (const it of cands.items) csv.push(`${it.id},,,`);
fs.writeFileSync(path.join(HERE, "curation45-decisions.template.csv"), csv.join("\n") + "\n");

console.log(`worksheet-blind.md: ${lines.length} lines, ${cands.items.length} items`);
console.log(`curation45-decisions.template.csv: template written`);
