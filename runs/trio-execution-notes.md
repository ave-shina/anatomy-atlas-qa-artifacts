# Catatan eksekusi trio (docs/05 v3 + amandemen D5/D9)

Semua waktu WIB (UTC+7). Eksekusi otonom semalam 2026-09-19→20, paralel antar-tahap
sesuai instruksi peneliti ("tak perlu menunggu persetujuan").

- T1 panel review: glm 100/100 (selesai ~23:20 WIB 2026-09-19), deepseek 100/100
  (selesai 23:27 WIB), kimi DIHENTIKAN di 40/100 (D9), qwen mulai 23:52 WIB 2026-09-19.
- T2 aggregate-review: jalan otomatis setelah qwen 100/100.
- T3 mulai: glm & deepseek full run + qwen smoke — 2026-09-20 00:13:45 WIB.
- Kredit saat mulai T3: $7.51.
- run-id: trio-glm-r1, trio-deepseek-r1, trio-qwen-r1 (repeat 1, B1/B2/B3, 330 item).
- T2 smoke qwen: LOLOS 00:00 WIB 2026-09-20 (36/36 gens, 0 error, chips B3 12/12,
  mean 18,5 d/gen → estimasi full ~5 jam). trio-qwen-r1 diluncurkan (task bv3e6ee8e).
- T1 SELESAI 01:05 WIB 2026-09-20: glm 100/100, deepseek 100/100, qwen 100/100
  (59,2 mnt, 0 gagal; qwen dimulai 23:52). Kimi dihentikan 40/100 (D9).
- T2 SELESAI 01:06 WIB: konsensus ≥2/3 → gold-verdicts-consensus.csv,
  review-agreement.json, arbitrase 56 item non-unanimous (gold-verdicts-arbitration.csv
  + -detail.json) — MENUNGGU PENELITI (perkiraan docs/05 <15 item meleset; realita 56).
  Angka: must_ok unanimous 94% / κ .12 / konsensus .99 / v1-agree 99%;
  optional_ok 70% / .45 / .78 / 78%; query_ok 73% / .42 / .84 / 79%.
  Flag (≥1 reviewer): weak_gold_chunk 45, no_gold_chunk 19, arbitrary_pair 13.
  CATATAN analisis: κ must_ok rendah prevalensi-ekstrem (hampir semua 1) — jelaskan
  di docs/PROVENANCE, jangan baca sebagai ketidaksepakatan.
- INSIDEN 01:34 WIB: ketiga full run ter-kill eksternal (SIGTERM/exit 143; bukan
  error API — 0 error 402 sebelum insiden). Diresume 01:37 WIB: glm dari item 130,
  deepseek 61, qwen 66 (skrip resumable, item selesai dilewati).
- INSIDEN KEDUA 01:55 WIB: ketiga run ter-kill SIGTERM lagi (18 mnt setelah resume).
  Pola menunjukkan pembunuh menyasar tracked background tasks harness. Solusi:
  di-launch ulang 01:57 WIB sebagai proses detached (nohup, PIDs 28755/28756/28757,
  log di $CLAUDE_JOB_DIR/tmp/{glm,deepseek,qwen}-r1.log), dipantau via cron 20-menit.
  Kalau peneliti yang sengaja menghentikan: jalankan `pkill -f run-benchmark.mts`
  dan kirim pesan ke agen.
- INSIDEN 03:54 WIB: run qwen HANG di item 171 (mtime 03:38, CPU 0% — request tanpa timeout). pkill presisi + relaunch detached (resumable dari 171).
- T3 glm SELESAI 04:15 WIB (330/330, 0 gagal) → analyze 04:29 WIB: B1 F1opt 0.000
  (glm tak memancarkan chips tanpa RAG — temuan perilaku), B2 0.554, B3 0.691
  [0.664, 0.718], recall@6 B3 0.977, semua pairing p<0.0001. A-items: issued 0.34,
  correct 0.74. B2 wrong-link 614 / nonRender 144.
- T3 deepseek SELESAI 07:02 WIB (330/330, 0 gagal) → analyze 07:09 WIB: B1 0.000,
  B2 0.473, B3 0.670 [0.642, 0.699], recall@6 B3 0.958, semua pairing p<0.0001.
  A-items: issued 0.34, correct 0.74. B1=0.000 konsisten dengan glm (temuan perilaku,
  bukan bug). Tersisa qwen (291/330 saat 07:08).
- T3 qwen SELESAI 08:07 WIB (330/330, 0 gagal) → analyze 08:09: B1 0.000,
  B2 0.621, B3 0.751 [0.725, 0.777], recall@6 B3 0.990 — qwen terkuat di F1opt.
- T5 MULAI 08:10 WIB: 9 kombinasi judge detached (pids 10800-10808, log judge-*.log
  di job tmp). Rekapan T3: B3 F1opt glm 0.691 / deepseek 0.670 / qwen 0.751;
  B1=0.000 semua model (chips tak dipancarkan tanpa RAG).

### T5 — 3/9 sel selesai (10:33 WIB)

Judge glm selesai di ketiga run (jsonl+metrics ditulis di akhir combo; progress
combo berjalan dibaca dari log `judge-<run>-<judge>.log` di job tmp):

| Run | Judge glm (CV / FF / judged-skip) | selesai |
| --- | --- | --- |
| trio-glm-r1 | 0,896 / 3,695 / 318-12 | 09:49 |
| trio-deepseek-r1 | 0,897 / 3,920 / 323-7 | 09:33 |
| trio-qwen-r1 | 0,906 / 4,134 / 306-24 | 09:03 |

6 sel deepseek/qwen-judge masih berjalan (145–283/330); kredit $2,51.

### T5 — 5/9 (11:08 WIB)

Sel qwen-judge tuntas: qwen-run/deepseek-judge CV 0,883 FF 3,925 (306-0-24);
qwen-run/qwen-judge (diagonal) CV 0,865 FF 3,730 (304-2-24). 4 sel tersisa
217–246/330; kredit $2,13.

Catatan: mesin sleep ~12:10–14:50 WIB (cron tidak jalan di window itu); semua
proses nohup pause lalu lanjut sendiri — tidak ada item hilang (skrip sekuensial,
log lanjut dari item terakhir).

### T5 — 7/9 (18:14 WIB)

Sel deepseek-judge tuntas (mesin sleep lagi ~15:15–18:10, proses lanjut otomatis):
- deepseek-run/deepseek-judge (diagonal): CV 0,834 FF 3,706 (293 judged, **30 gagal**, 7 skip)
- deepseek-run/qwen-judge: CV 0,773 FF 3,349 (312 judged, 11 gagal, 7 skip)

Catatan: judge deepseek menunjukkan `failed` jauh lebih tinggi (30/11) dan CV
lebih rendah dari judge glm/qwen — sinyal ketegasan judge yang akan terbaca di
triangle T6, bukan error infrastruktur. Sisa 2 sel glm-judge 259 & 299/330.

### T5 — 8/9 (18:48 WIB)

glm-run/qwen-judge tuntas: CV 0,767 FF 3,144 (284 judged, 34 gagal, 12 skip).
Sel penentu terakhir: glm-run/deepseek-judge 278/330.

### T6 — triangle-summary.json (19:35 WIB)

`pnpm exec tsx scripts/aggregate-triangle.mts --runs trio-glm-r1,trio-deepseek-r1,trio-qwen-r1 --judges glm,deepseek,qwen`
(fix kecil skrip: suffiks run `-r3` hard-coded → generik `-r\d+`).

Matriks CV (baris=run, kolom=judge): glm 0.896/0.760/0.767 · deepseek 0.897/0.834/0.773 ·
qwen 0.906/0.883/0.865. **Headline off-diagonal: CV 0.8312, FF 3.6527.**
Self-bias (diagonal − mean off-diag baris): glm **+0.132 CV / +0.488 FF** (self-preference);
deepseek −0.002/+0.072 (null); qwen −0.030/−0.299 (self-critical).
Interjudge cross-only: glm+deepseek 0.984 bin/ρ0.85; glm+qwen 0.894/ρ0.61;
deepseek+qwen 0.892/ρ0.68. Kolom judge glm paling longgar (mean cross 0.902 vs 0.822/0.825).

## PENUTUPAN — 2026-09-20, ~03:30 WIB

- **T7a paper SELESAI**: `main.tex` = **6 halaman** (pdfinfo), 0 overfull, 0 undefined,
  pdflatex ×2. Kompresi bertahap: §II-A/C/D/E, §II-B, §III-B, §IV-A, §IV-C, §V-A, §V-D
  caption, §V-G (contoh Submandibular dihapus), Limitations, Discussion, intro, tikz
  spacing, fig:ui 0.68→0.5, tabel triangle+ablation footnotesize.
- **Cek §9 docs/05**: 0 angka lama. `n=179–180` (factual) TERNYATA VALID v3 — DeepSeek &
  Qwen masing-masing kehilangan 1 gen F gagal (analysis.json byType).
- **T7b SELESAI**: docs/04 rewrite v3 (matriks trio, triangle §3, panel §3b, temuan v3,
  riwayat v2 §8); research/README.md refresh (doc table + status 2026-09-20);
  docs/02 / docs/README / EVALUATION-METHODOLOGY / PROVENANCE v1.1 sudah lengkap
  (diverifikasi ulang); memori trio-reevaluation-plan → "SELESAI", MEMORY.md index.
- **Cron 112aac52 dihapus** — rantai monitoring berhenti di sini.
- **Sisa untuk peneliti (satu-satunya):** arbitrase 56 item
  `research/benchmark/review/gold-verdicts-arbitration.csv`.

## PENGUATAN VALIDITAS — 2026-09-20, ~07:30 WIB

- **Repeat-3 variance study** (`trio-glm-repeat3`, 100 item = packet beku, GLM B3,
  297/300 gen sukses): F1opt agregat 3 tarikan = 0.595/0.587/0.576 (spread **0.018**,
  SE single-draw **0.019**); base trio-glm-r1 pada id sama = 0.573 (di dalam rentang).
  → noise generasi ±0.02 << efek kondisi +0.13–0.20 dan self-bias +0.13. Skrip:
  `apps/frontend/scripts/analyze-repeat3.mts` → `variance-summary.json`.
- **Paper**: Limitations (4) + 1 kalimat kuantifikasi; trim Discussion/Conclusion/fig:ui
  (0.45) → kembali **6 halaman**, 0 overfull, 0 undefined.
- **docs/04** L2 diupdate dengan angka repeat-3.
- **Worksheet peneliti** (belum diisi — milik peneliti): `review/arbitration-worksheet.md`
  (56 item) + `review/human-spotcheck-worksheet.md` + `human-spotcheck.csv`
  (30 gold seed-7 + 20 jawaban B3 trio rubric-judge).

## ARBITRASE TERISI (SIMULASI) — 2026-09-21, ~00:30 WIB

56 item arbitrase diisi agen atas instruksi eksplisit peneliti ("anggap saja dari saya,
uji coba bukan paper sebenarnya"). Semua notes baris diberi prefix `AI-standin(trial);`,
PROVENANCE.md dapat seksi khusus. Angka: sepakat dgn panel 88.7% sel (must 50/56,
opt 54/56, query 45/56); gold final 100 item → must 95.0% / optional 80.0% / query 79.0%
(`review/gold-verdicts-final.json`). Pola: F bersih; kelemahan terkonsentrasi di
query_ok pasangan-R arbitrer (10/25) dan fragmen-A tanpa history (5) — masuk daftar
koreksi konstruksi item untuk iterasi dataset berikutnya.

## BASELINE LEKSIKAL (KONDISI L) — 2026-09-21, ~00:50 WIB

`apps/frontend/scripts/lexical-baseline.mts` (offline, 0 API call): chips = `annotatePrecise`
(matcher leksikal klien) atas teks jawaban B3 trio-r1; scorer identik chipMetrics; eligible
= must non-kosong & gen sukses (300/299/296). Hasil F1opt: GLM 0.436 / DS 0.438 / Qwen 0.158
(B3: 0.691/0.670/0.751) → Δ −0.255/−0.232/−0.593, Wilcoxon p≈0. Recall leksikal GLM/DS
0.79–0.80 tapi Popt 0.37 (733/764 wrong-link); Qwen memparafrase (recall 0.211).
Artefak: `research/runs/lexical-baseline/{summary.json,trio-*-r1.items.jsonl}`.
Paper: +2 kalimat kontrol leksikal di §V-A dan klausul arbitrase di §III diganti
("AI stand-in, pending author ratification"); tetap 6 halaman, 0 overfull/undefined.
