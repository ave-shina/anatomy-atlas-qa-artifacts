# curated45 — Perbaikan 45 Weak Gold Chunk

Perbaikan gold chunk untuk 45 item yang ditandai `weak_gold_chunk` oleh panel
konsensus v1.1 (glm-5.3-flash, deepseek-v4.1-flash, qwen3.8-flash; mayoritas
≥ 2/3; lihat `review/PROVENANCE.md` §v1.1/v2). Output akhir pipeline ini adalah
**gold v2 untuk 45 item tersebut** — v1 tetap frozen, semua perubahan tercatat
dalam diff.

## Rantai proses & disclosure

1. **Ekstraksi** (`extract-weak45.mjs`) — 45 item dari
   `review/gold-verdicts-consensus.csv` + `anatomy3d-qb.v1.ndjson` →
   `weak45.items.json`. Komposisi: 27 F, 16 R, 2 A; 25 item pernah non-unanimous
   (ke arbitrase); semua punya gold chunk.
2. **Retrieval kandidat** (`retrieve-candidates.mjs`) — query di-embed dengan
   `openai/text-embedding-3-small` (sama dengan vektor corpus) via OpenRouter,
   cosine atas 3.017 chunk, **top-8 per item** → `candidates.json` (dengan
   provenance sha256 corpus). Deterministik, tanpa sampling.
3. **Proposal GLM-5.3** (`propose-glm.mjs`) — `z-ai/glm-5.3`, temperature 0,
   `reasoning: low`, JSON ketat: penilaian kecukupan kunci lama + maks 3 usulan
   pengganti + opsi "tidak ada yang layak" → `proposals-glm53.json`.
   **Disclosure:** glm-5.3 se-famili dengan anggota trio `glm-5.3-flash` —
   output-nya **advisory**, bukan verdict.
4. **Validasi buta penulis** — `worksheet-blind.md`: kandidat diacak
   deterministik per item (seed = id), berlabel A–H (urutan ranking dan
   preferensi GLM tidak bocor); teks kunci lama disertakan (untuk keputusan
   `keep_current`); usulan/alasan GLM dan pre-screen agent TIDAK ada di
   worksheet. Keputusan diisi di `curation45-decisions.csv`.
5. **Pre-screen agent (tersembunyi)** — coding agent (harness `glm-5.3-flash`,
   in-family) membaca kandidat secara independen → `prescreen-agent.json`,
   hanya di-reveal SETELAH keputusan penulis terkunci. Sifatnya advisory;
   satu-satunya lapisan independen adalah penulis.
6. **Reveal & rekonsiliasi** — tabel kesepakatan penulis vs GLM-5.3 vs agent
   pre-screen; item dengan ketidaksepakatan penuh direview ulang.
7. **Gold v2 + re-skoring** — 45 item diperbarui (chunk ID saja — scope
   disiplin), re-skoring retrieval offline (tanpa panggilan LLM; skor judge 9
   sel TIDAK berubah karena judge tidak melihat gold), lapor metrik penuh v2 +
   subset 45 terkurasi dengan bootstrap CI. Klaim "conservative"/"upper bound"
   di paper dikonfirmasi atau direvisi sesuai hasil.

## Keputusan validasi (kolom `decision`)

| Nilai | Arti |
|---|---|
| `chunk` | ganti; isi `chosen_chunk_id` dengan id kandidat |
| `keep_current` | pertahankan kunci lama (penulis tidak setuju dengan panel) |
| `none` | tidak ada yang layak → item jadi gold-less (coverage retrieval turun) |
| `item_flawed` | query-nya cacat (mis. pasangan relasional arbitrer) → jalur revisi item, bukan ganti chunk |

## Status

- [x] Ekstraksi 45 item
- [x] Retrieval kandidat top-8
- [x] Proposal GLM-5.3 (0 gagal parse; kunci lama dinilai inadequate 44/45,
      partial 1/45; 32/45 dinyatakan tanpa kandidat layak — belum tentu final,
      validator menilai semua 8 kandidat sendiri)
- [x] Worksheet buta + templat keputusan
- [x] Keputusan terisi (agent-filled dari usulan GLM-5.3; penulis membaca
      worksheet dan menyetujui secara bulk — BUKAN keputusan buta per item
      manusia; lihat kolom `filled_by`/`source` di CSV)
- [x] Pre-screen agent tersimpan (`prescreen-agent.json`, in-family, advisory)
      dan di-reveal
- [x] Rekonsiliasi (`reveal-reconciliation.md`): agree 38, same_cat_diff_id 2,
      conflict 5 — menunggu putusan penulis untuk 5–7 item
- [x] Putusan penulis pada 5 konflik ("setuju semua", 26 Sep, setelah membaca
      teks chunk) → `apply-overrides.mjs` → `gold-v2-chunk45.patch.json` FINAL
      (12 chunk / 30 none / 3 keep_current; 42 item berubah)
- [x] `anatomy3d-qb.v2.ndjson` — benchmark v2 (gold_chunk_ids saja; v1 frozen)
- [x] Re-skoring offline (`rescore-v2.mjs`) — lihat "Hasil" di bawah

## Hasil re-skoring (26 Sep 2026)

Ranks dari `research/runs/trio-*-r1` (dense deployed, top-6); definisi recall
= fraksi gold tertutup (validasi 292/292 vs metrik tersimpan); bootstrap 10k.

- **S_both (n=262, item berkunci di v1 dan v2 — murni efek perbaikan gold):
  R@3 0.327→0.345 (Δ +0.018, CI95 [+0.004, +0.031]); MRR 0.453→0.462
  (Δ +0.009, CI95 [+0.000, +0.020])** — identik di ketiga run.
- **S_curated (n=15, deskriptif): R@3 0.222→0.533; MRR 0.350→0.506** — di
  item yang kuncinya benar-benar diganti, retrieval hampir dua kali lipat.
- **S_dropped (n=30, gold-less di v2): skor v1 R@3 0.200** — rendah, konsisten
  dengan kuncinya memang arbitrer; 26 di antaranya ber-flag
  `consider_item_flawed` (pasangan relasional tanpa passage penghubung).
- **Verdict vs klaim paper**: klaim *"retrieval numbers are conservative"*
  (main.tex §re-rank/§limitations) **terkonfirmasi** — memperbaiki gold
  menaikkan angka. Klaim *"upper bound on the re-rank's benefit"* belum
  diuji ulang (perlu pool depth-20 arm re-rank + akses Pinecone; data tidak
  tersimpan di run artefak).
- Sanity check: agregat v1 penuh 292 item = 0.314 R@3 = persis angka paper.
