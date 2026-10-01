# Provenance — artefak review & verifikasi benchmark

Rekam asal-usul semua artefak verifikasi benchmark Anatomy3D-QB. Pertanyaan
"siapa/apa yang menilai?" dijawab di sini agar tidak perlu digali ulang.

## Ringkasan

Semua artefak verifikasi di bawah dihasilkan oleh **satu sesi agen OpenCode**
dengan model **`deepseek-v4.1-flash`** (provider `opencode-go`), berjalan
2026-09-16 23:40 – 2026-09-17 01:22 WIB. Ini **reviewer AI tunggal**, bukan
anotasi manusia — paper dan docs melabelinya *AI-assisted review / spot-check*.

## Artefak & waktu (WIB, 2026-09-17)

| Artefak | Waktu | Isi |
| --- | --- | --- |
| `../runs/final-mini-r3/manual-verification.csv` | 00:02 | kolom audit judge B3 (`gpt-4o-mini`) |
| `gold-packet.{jsonl,txt}`, `gold-verdicts.template.csv` | 00:07, ditulis ulang 00:31 | packet review 100 item terstratifikasi (di-generate `apps/frontend/scripts/review-packet.mjs`) |
| `gold-verdicts.csv` | 00:32 | verdict review 100 item (`must_ok`/`optional_ok`/`query_ok` + notes) |
| `../runs/final-mini-r3/judge-ai-spotcheck.csv` | 00:32 | spot-check 20 item vs panel judge |
| `../runs/final-mini-r3/manual-verification-gpt4o.csv` | 00:53 | kolom audit judge B3 (`gpt-4o`) |

Bukti waktu: mtime file cocok dengan log OpenCode
(`~/.local/share/opencode/log/opencode.log`, event `2026-09-16T17:32:17Z` =
00:32:17 WIB, eksekusi skrip pengisi verdict) dan tabel `message` di
`~/.local/share/opencode/opencode.db` (semua pesan assistant di window itu
`deepseek-v4.1-flash`).

## Peta peran model (agar tidak tertukar)

| Peran | Model | Sifat keluaran |
| --- | --- | --- |
| Reviewer gold 100 item + spot-check 20 item | `deepseek-v4.1-flash` | keputusan agen (artefak di tabel atas) |
| Judge #1, 260 item (`judge.jsonl`) | `openai/gpt-4o-mini` | keluaran API asli via `judge-run.mts` |
| Judge #2, 260 item (`judge-gpt4o.jsonl`) | `openai/gpt-4o` | keluaran API asli via `judge-run.mts` (dieksekusi 00:46–00:53 WIB dari sesi yang sama; agen hanya pelaksana) |
| Model chat dievaluasi (B1/B2/B3) | `gpt-4o-mini`, `gpt-4o`, `qwen-2.5-72b-instruct` | keluaran API asli via harness eksperimen |

Sesi OpenCode `deepseek-v4.1-flash` juga **mengeksekusi** judge run dan skrip
analisis, tapi skor judge berasal dari panggilan API ke model judge yang
dinamai — bukan dari model agen.

## Catatan metodologis

- **Konstruksi data tanpa model**: `generate-benchmark.mjs` (RNG ber-seed, seed 1),
  `enrich-benchmark.mjs` (heuristik word-overlap), dan `review-packet.mjs` (sampling
  + format packet) adalah skrip deterministik tanpa panggilan API. Satu-satunya
  keterlibatan AI dalam penyiapan benchmark adalah verdict review di file ini.

- Reviewer membaca `gold-packet.txt` (query, gold structures, cuplikan gold
  chunk, jawaban B3 + chips) lalu menetapkan verdict; verdict ditulis via
  skrip, sehingga tiap keputusan berupa baris CSV yang dapat diaudit.
- Model reviewer **di luar** set model chat yang dievaluasi
  (`openai/gpt-4o-mini`, `openai/gpt-4o`, `qwen-2.5-72b-instruct`) dan **di
  luar** panel judge (`gpt-4o-mini`, `gpt-4o`) → gold tidak divalidasi oleh
  model yang sedang diuji (anti-sirkularitas).
- Ini **bukan** pengganti anotasi manusia: κ antar-anotator tidak dilaporkan;
  gold bersifat provisional (paper §Limitations (1)). Kurasi manusia + κ
  tetap future work (rencana penelitian v0.2).

## v1.1 — Panel review konsensus trio (2026-09-19/20)

Semua di bawah dieksekusi otonom via `apps/frontend/scripts/run-review.mts` +
`aggregate-review.mts` (docs/05 T1–T2), temperature 0, JSON ketat, 3 percobaan
per item, sidecar `.raw.jsonl` untuk resume. Packet beku yang **sama** dengan v1
(`gold-packet.jsonl`, termasuk jawaban B3 `final-mini-r3` sebagai konteks).

### Eksekusi (WIB)

| Reviewer | Progress | Waktu |
| --- | --- | --- |
| `z-ai/glm-5.3-flash` → `gold-verdicts-glm` | 100/100, 0 gagal | selesai ~23:20 (19 Sep) |
| `deepseek/deepseek-v4.1-flash` → `gold-verdicts-deepseek` | 100/100, 0 gagal | selesai 23:27 (19 Sep) |
| `moonshotai/kimi-k2.6` → `gold-verdicts-kimi` | **dihentikan 40/100** (amandemen D9: kimi keluar dari trio karena latensi; file dibiarkan sebagai provenance, tidak masuk agregasi) | ~23:27 (19 Sep) |
| `qwen/qwen3.8-flash` → `gold-verdicts-qwen` | 100/100, 0 gagal | 23:52 → 00:51 (19→20 Sep) |
| Agregasi (`aggregate-review.mts`) | konsensus ≥2/3 | 01:06 (20 Sep) |

### Artefak v1.1

`gold-verdicts-{glm,deepseek,qwen}.{csv,raw.jsonl}` · `gold-verdicts-consensus.csv`
(vonis final = mayoritas ≥2/3 per kolom) · `review-agreement.json` ·
`gold-verdicts-arbitration.csv` (56 item non-unanimous; saat v1.1 dibuat masih
kosong, **kini terisi agen — lihat seksi SIMULASI di bawah**;
`gold-verdicts-arbitration-detail.json` berisi vote per-rater).

### Angka agreement (paper §III-C)

| Kolom | Unanimous | Fleiss κ | Konsensus ≥2/3 | Sepakat dgn v1 |
| --- | --- | --- | --- | --- |
| `must_ok` | 94% | 0,12 | 99% | 99% |
| `optional_ok` | 70% | 0,45 | 78% | 78% |
| `query_ok` | 73% | 0,42 | 84% | 79% |

Flag (≥1 reviewer menandai): `weak_gold_chunk` 45, `no_gold_chunk` 19,
`arbitrary_pair` 13. **Catatan tafsir κ**: κ `must_ok` (0,12) rendah karena
efek prevalensi-ekstrem (94% unanimous, hampir semua vonis 1) — parados
Fleiss pada konsensus hampir sempurna; laporkan berdampingan dengan %unanimous,
jangan disalahartikan sebagai ketidaksepakatan.

### Catatan D8 & perubahan peta peran

- **D8**: `deepseek-v4.1-flash` ikut panel v1.1 padahal ia pembuat verdict v1
  (single-reviewer lama). Konsistensi v1.1-vs-v1 (tabel atas) adalah cek itu;
  didisclose juga di paper (Limitations).
- **Perubahan peta peran (docs/05 v3)**: chat model, judge, dan reviewer gold
  sekarang **trio yang sama** (`glm-5.3-flash`, `deepseek-v4.1-flash`,
  `qwen3.8-flash` — kimi-k2.6 diganti qwen per D9). Tidak ada model eksternal
  sama sekali di loop; rawan-rawan titik self-bias diukur (triangle 9 kombinasi,
  headline = off-diagonal), bukan disembunyikan. Anti-sirkularitas versi lama
  ("reviewer di luar set yang diuji") **tidak berlaku lagi untuk v1.1** —
  digantikan argumen no-own-generation pada packet hasil generator deterministik
  (docs/05 §2.3).
- Ini tetap **bukan** anotasi manusia; arbitrase 56 item oleh peneliti adalah
  lapisan manusia pertama, κ human tetap future work.

## Pengisian arbitrase 56 item — 21 Sep 2026 (⚠️ SIMULASI UJI COBA)

`gold-verdicts-arbitration.csv` diisi **agen (Claude) atas instruksi eksplisit peneliti**
untuk keperluan uji coba pipeline — **bukan kurasi manusia untuk paper asli**. Setiap
baris ditandai `AI-standin(trial);` di kolom notes dan diputuskan dengan penalaran
anatomi per item terhadap rubric (bukan ikut mayoritas buta), membaca worksheet lengkap.

- Sepakat dgn konsensus mayoritas panel: **149/168 sel (88.7%)** — must 50/56,
  optional 54/56, query 45/56.
- Pembalikan utama `query_ok` (11 sel): 10 pasangan-R arbitrer (ACA–sinus cavernosus,
  EHL–FDB, azygos–LGA, kandung empedu–ureter, dst.) dinilai tanpa relasi bermakna;
  5 fragmen-A tanpa history ("that muscle.") dinilai malformed (must_ok juga →0
  karena gold kosong tidak terjustifikasi); item 42 (`Sulcus interm_prim-Jensen`)
  must_ok 0→1 — istilah Jensen's sulcus nyata, target benar, tapi query_ok→0
  (varian obskur, tak ada dukungan korpus).
- Kebalikan arah: query_ok 0→1 untuk 3 query F rapi yang salah label tipe-A
  (A-muscular-001, A-skeletal-001) dan 1 opsional (F-nervous-016, R-joints-001).
- **Gold final 100 item** (`gold-verdicts-final.json`, unanimous 44 + arbitrase 56):
  must_ok **95.0%** · optional_ok **80.0%** · query_ok **79.0%**
  (F 100/72/100 · R 100/92/60 · A 80/84/56, % per kolom must/opt/query).

Untuk paper asli: baris berlabel `AI-standin(trial)` harus ditinjau ulang dan diisi
ulang oleh peneliti; lapisan manusia pertama (κ human) tetap future work.

### Ratifikasi peneliti — 21 Sep 2026

Peneliti menyatakan telah **memeriksa sendiri hasil arbitrase 56 item** dan
meratifikasinya. Konsekuensi artefak:

- Prefix `AI-standin(trial);` pada kolom notes `gold-verdicts-arbitration.csv`
  diganti **`author-ratified;`** (56/56 baris; rationale per item tidak berubah —
  yang berubah hanya status kedudukan vonisnya).
- `gold-verdicts-final.json` tidak diubah (isi vonis identik dengan saat agregasi).
- Status paper: kalimat "pending author ratification" dihapus; kini
  *"post-hoc arbitration ratified by the author"* (§III-C, Limitations 1).
- Jejak bagaimana vonis awal diproduksi (draft agen, seksi SIMULASI di atas)
  **tetap dipertahankan** di file ini — ratifikasi tidak menghapus provenance.

Keterbatasan yang tetap berlaku dan didisclose di paper: annotator manusia
tunggal (peneliti), tanpa anotator kedua independen — κ human/second-annotator
tetap future work.

## v1.2 — Analisis post-hoc offline & PABAK agreement (21 Sep 2026)

Sekali lagi tanpa panggilan API: `apps/frontend/scripts/posthoc-analysis.mts`
dijalankan oleh agen (Claude Code) atas artefak run yang tersimpan
(`research/runs/trio-*-r1/{items.jsonl,manifest.json,analysis.json}`, packet review
`gold-verdicts-{glm,deepseek,qwen}.csv`) dan menulis satu file kanonik
**`research/runs/posthoc.json`**. Angka ini yang dikutip paper §IV–V (revisi
"perbaiki semua aspek"):

- **B2+V faktorial**: validasi kosakata diterapkan offline ke chip mentah B2 →
  ΔF1opt ≤ 0,001 di ketiga model (gain B3 berasal dari condense + resolusi
  kandidat, bukan filter; validasi = jaminan struktural).
- **Reference coverage** (recall token konten brief, F/R items): B1→B3 naik
  +0,06…+0,11 (Wilcoxon p≤0,0033); B2≈B3 (p≥0,57).
- **Fisher exact** halusinasi B2 (2–3 link) vs B3 (0): p=0,112–0,205 → klaim
  "nol halusinasi" dipertahankan sebagai jaminan by-construction, bukan signifikansi.
- **Gwet's AC1** (PABAK) dari verdict panel v1.1: must_ok **0,96** ·
  optional_ok 0,69 · query_ok 0,74 — dilaporkan berdampingan dengan Fleiss κ
  (must κ=0,12 = artefak prevalensi near-ceiling, bukan ketidaksepakatan; lihat
  tabel §v1.1 di atas).
- **Latensi** B3−B2 per model: +1,0 / +4,0 / +1,6 s (GLM/DeepSeek/Qwen) —
  mengoreksi catatan lama "+0,7–1,6 s" di docs/04.

Uji berpasangan F1opt diperluas di `analyze-run.mts` (wilcoxon_f1_optional +
mean_diff_f1_optional) lalu di-rerun untuk ketiga run trio; determinisme dicek
(nilai lama byte-identik). Dokumentasi naratif: `research/docs/04-hasil-eksperimen.md`
§2 (uji berpasangan), §3b (PABAK), §3c (rekap post-hoc).

## Prefill spot-check manusia (2026-09-21, dibuat AI; dikonfirmasi penulis)

`human-spotcheck-AI-prefill.csv` dibuat oleh agen AI sebagai BANTU mengisi
`human-spotcheck.csv` (80 baris: 30 item × must_ok/query_ok + 20 faithfulness):

- Bagian A: usulan nilai = konsensus panel v1.1 pasca-arbitrase
  (`gold-verdicts-final.json`); konteks = query + gold_must per item.
- Bagian B: usulan skor = rata faithfulness dua judge silang (tanpa self-judge)
  dari `judge-*.jsonl` trio-r1; konteks = kutipan jawaban + jumlah sitasi.

**Status akhir (2026-09-21): penulis meninjau dan mengonfirmasi seluruh 80
nilai (konfirmasi menyeluruh via sesi kerja; kolom `value_final` tidak diisi di
file prefill).** `human-spotcheck.csv` diisi dari nilai terkonfirmasi itu
(kolom `notes` = "author-confirmed 2026-09-21").

Catatan integritas agar tidak salah kutip:

- Nilai **berasal dari prefill AI** (derivasi: konsensus panel v1.1 untuk
  bagian A, rata judge silang untuk bagian B). Kontribusi manusia di sini
  adalah **konfirmasi penyelidik**, bukan anotasi independen — anotator
  independen kedua masih tugas terjadwal (docs/05).
- Karena usulan dan konfirmasi bukan pengukuran independen, **κ
  penulis-vs-panel sengaja TIDAK dihitung dan TIDAK dilaporkan** (akan
  sirkular). Klaim yang sah: *author spot-check upheld the panel verdicts
  (80/80)*.
- Bagian B memakai jawaban `trio-*-r1` B3 repeat-0; skor judge silang diambil
  dari `judge-*.jsonl` pada 2026-09-21 (file tetap stamping asli 17–20 Sep).

## Kit anotasi manusia v2-human (2026-09-22)

Dibangun sebagai eksekusi tugas terjadwal "anotator kedua independen" (docs/05)
— kali ini anotasi manusia **sungguhan, bukan prefill AI**:

| Artefak | Isi |
| --- | --- |
| `../v2-human/RUBRIC.md` | rubrik penilaian 4 kolom (must/optional/query/chunk_ok) |
| `../v2-human/README.md` | alur kerja 2 anotator + adjudikasi + `--apply` |
| `../v2-human/annotator-{A,B}.csv` | packet beku 100 item (D2/D3) ter-blind: tanpa jawaban model, tanpa verdict AI, tanpa flag; urutan acak ber-seed berbeda per anotator (seed di `build-info.json`) |
| `apps/frontend/scripts/build-human-annotation.mjs` | generator packet (display names, blinding, shuffle) |
| `apps/frontend/scripts/score-human-annotation.mjs` | Cohen κ + Gwet AC1 (+ Fleiss bila ≥3 anotator), worksheet adjudikasi, `--apply` → `anatomy3d-qb.v2-human.ndjson` + `human-review-summary.json` + manifest SHA-256 |

Sumber packet: `gold-packet.jsonl` (SHA-256 terekam di `build-info.json`).
Verdict panel AI **tidak dimasukkan** ke packet — kesepakatan vs panel hanya
dilaporkan deskriptif di summary; κ-vs-panel tetap tidak dihitung (sirkular).

Status: **menunggu anotasi** (A = peneliti, B = kolega independen; min. 2
manusia agar κ terdefinisi). Aturan integritas: dilarang prefill AI — jika ada
prefill, hasilnya kehilangan klaim "independent human annotation" dan kembali
ke status quo. Tidak ada file lama yang diubah atau dihapus oleh kit ini.

**Amandemen 22 Sep 2026 (sore):** kit dihapus dari disk (folder `../v2-human/`
+ skrip `build-human-annotation.mjs` & `score-human-annotation.mjs`) dalam
pembersihan repo, atas keputusan peneliti agar repositori konsisten dengan
jalur **100% AI** — kit tidak pernah dieksekusi (0/100 baris terisi) dan tidak
pernah masuk analisis. Rekam di atas dipertahankan sebagai jejak bahwa jalur
anotasi manusia pernah dipersiapkan lalu ditangguhkan. Bila kelak klaim human
annotation diambil, packet blind dapat dibangun ulang dari `gold-packet.jsonl`
(frozen, SHA-256 terekam) mengikuti alur di bagian ini.

## v2 — Gold full-AI: arbitrase out-of-family (22 Sep 2026) ⭐ FINAL UNTUK PAPER

**Pemicu**: instruksi eksplisit peneliti (22 Sep 2026) — *"benchmark full AI
saja, tidak ada campur tangan manusia; ground truth dari Claude"*. Konsekuensi:
lapisan arbitrase `author-ratified` (21 Sep, seksi SIMULASI + Ratifikasi di
atas) dan spot-check 80 nilai `author-confirmed` **disengguhkan dari jalur
analisis** (superseded — file tidak dihapus, jejak tetap di sini). Diganti
arbiter AI out-of-family. Kit v2-human **dispenisikan** (ditunda; dihapus
dari disk sore harinya — lihat amandemen di seksi kit).

### Eksekusi (WIB, 22 Sep 2026)

1. **Review 100 item oleh `anthropic/claude-sonnet-5`** via OpenRouter
   (`apps/frontend/scripts/run-review.mts`, packet beku `gold-packet.jsonl`
   yang sama dengan v1/v1.1, rubric sama, temperature 0, sidecar
   `.raw.jsonl`). Dua kendala API dan penanganannya:
   - 402 "can only afford N tokens" (request default 65536 max tokens) →
     flag `--max-tokens 1024` ditambahkan ke `run-review.mts` (verdict JSON
     <300 token); retry → 89/100 sukses.
   - 11 item sisa gagal karena **kredit OpenRouter habis** (total $20,
     terpakai $19.981, sisa $0.019; 402 in-flight / JSON truncation). Atas
     instruksi peneliti ("gunakan kemampuanmu saja") 11 item diisi **stand-in
     agen sesi** — lihat disclosure di bawah.
2. **Stand-in 11 item**: `standin-verdicts.json` (vonis + rationale anatomi
   per item, `_provenance` blinding) digabung ke
   `gold-verdicts-claude.{csv,raw.jsonl}` via `apply-standin-verdicts.mjs`
   (hanya menimpa baris `REVIEW_ERROR`/stand-in lama; menolak menyentuh
   verdict API). Prefix notes: `agent-standin(harness:glm-5.3-flash)`.
   Agen sesi berjalan di harness `glm-5.3-flash` (anggota trio yang
   dievaluasi) → untuk 11 item ini arbiter **BUKAN out-of-family**;
   diputuskan buta terhadap vote panel, rubric sama. Didisclose di paper
   (§III-C + Limitations 1: "eleven of the 56").
3. **Agregasi v2** (`aggregate-review-v2.mts`): aturan final — *trio unanimous
   (per kolom) → nilai konsensus; item non-unanimous di kolom mana pun
   (56 item, set sama dengan v1.1) → vonis arbiter*. Guard ketat: agregasi
   berhenti dengan daftar kesalahan bila ada sel verdict ≠ 0/1.
   Waktu artefak: 18:13–18:14.

### Artefak v2

`gold-verdicts-claude.{csv,raw.jsonl}` (89 API + 11 stand-in) ·
`gold-verdicts-arbitration-claude.csv` (56 item arbitrase) ·
`gold-verdicts-final-v2.json` (rule + coverage arbiter + vonis final) ·
`review-agreement-v2.json` (agreement 4-rater + flips vs final superseded).
Artefak lama (`gold-verdicts-arbitration.csv` author-ratified,
`gold-verdicts-final.json`, `human-spotcheck.csv`) **dibiarkan
utuh** sebagai provenance; tidak dipakai analisis v2. Kit v2-human dihapus
dari disk 22 Sep (lihat amandemen di seksi kit).

### Angka final v2 (paper §III-C)

- **Gold final v2**: must_ok **92%** · optional_ok **71%** · query_ok **85%**
  (final superseded 21 Sep: 95/80/79; per-type v2: F 100/64/100 · R 68/76/64 ·
  A 100/80/76).
- **Sepakat arbiter vs konsensus trio**: must 89% (κ −0.02, artefak prevalensi)
  · optional 79% (κ 0.47) · query 80% (κ 0.22).
- **Panel 4-rater** (trio + claude): Gwet AC1 0.91/0.64/0.72; Fleiss κ
  −0.00/0.42/0.32 (must κ = artefak prevalensi near-ceiling, same as v1.1).
- **Flips vs final superseded**: 36/300 sel (must 13, optional 17, query 6).
  Arah utama: arbiter lebih ketat pada pasangan-R arbitrer (must 1→0, termasuk
  R-nervous-009: gold-must "medulla oblongata" untuk query nervus facialis —
  inti CN VII di pons) dan pada optional; fragmen-A telanjang dinilai kontrol
  negatif valid (must 0→1, query 1→0→sesuai cabang rubric).

### Peta peran berakhir (v2)

| Peran | Model | Catatan |
| --- | --- | --- |
| Panel review gold (100 item) | trio: glm-5.3-flash, deepseek-v4.1-flash, qwen3.8-flash | mayoritas ≥2/3 |
| Arbiter 56 item non-unanimous | `anthropic/claude-sonnet-5` | **out-of-family** (89 item via API) |
| Stand-in arbiter 11 item | agen sesi Claude Code (harness `glm-5.3-flash`) | bukan out-of-family; blinded; disclosed |
| Judge triangle & chat yang dievaluasi | trio yang sama | tak berubah (D1–D9) |

Validasi gold kini **100% otomatis** (tanpa campur tangan manusia) dengan satu
model di luar set yang dievaluasi pada lapisan arbitrase — menjawab kritik
"trio menilai ujian buatannya sendiri" untuk lapisan gold; self-bias sisi
jawaban tetap diukur, bukan dieliminasi (Limitations 2).


## Era fulltext — re-seed korpus & re-run trio (27–28 Sep 2026) ⭐ ERA PAPER SAAT INI

Dokumen teknis lengkap: `research/docs/06-corpus-fulltext-reseed.md`. Ringkasan
provenance:

- **Trigger**: (1) cap 400 karakter pada teks tersimpan (2.945/3.017 chunk
  menabrak cap) — teks itulah konteks prompt jawaban & judge; (2) GLB +
  vocabulary baru (2.358 entri, semua mesh-backed 1:1). Keputusan user:
  re-seed bersih `baai/bge-m3` (index `anatomy-atlas` + starter pack
  fulltext 1024-dim), TANPA cap apa pun.
- **Beku & tidak disentuh**: dataset run (`candidates.ndjson`, sha
  `f3af56d9…`), gold packet, verdicts final v2, trio-*-r1, posthoc.json,
  triangle-summary.json, rescore-v2 default outputs, briefs v1/v2.
- **Artefak baru**: pack baru sha `5f6b9263…`; `mesh-keys.json` baru
  (`mesh-keys@2026-09-16.json` diarsipkan); briefs v3
  (`gold-answer-briefs.v3.ndjson`, harvest ulang dari fulltext, algoritma
  `bestSentence` identik); patch 1 item
  (`gold-v3-anervous003.patch.json`, diterapkan post-hoc saat scoring —
  dataset tidak disentuh).
- **Run baru**: `ft-{glm,deepseek,qwen}-r1` × B1/B2/B3 × 330 item, manifest
  dataset sha `f3af56d9…`, `embedModel: baai/bge-m3`, mesh sha `ba5b1a1a…`,
  topK 6. Semua run final **330/330, 0 generation error**. Insiden tercatat:
  ft-qwen pass 1 gagal 260/330 karena 429 (repair: backoff eksponensial +
  drop baris error + resume), pass 2 menyisakan 18 error transient non-429
  (drop + resume), pass final bersih; 2 item kehilangan pengukuran retrieval
  tersimpan (n retrieval = 291 pada run itu).
- **Judge**: 9 sel (3 run × 3 judge) komplet; `judge-run.mts` di-patch jadi
  per-item resume (append `judge-<judge>.jsonl`, `metrics.json` = penanda
  sel komplet); 74 baris error transient di-re-judge sampai 0; skipped
  (tanpa sitasi) 11/7/17 per run. Sel judge-glm pada ft-glm-r1 & ft-deepseek-r1
  berjalan dengan kode tulis-di-akhir; sisanya kode resume — hasil setara.
- **Klaim paper tidak berubah**: pipeline fully automated, tanpa anotasi
  manusia; disclosure "eleven of the 56" tetap; gold final v2 tetap kanonik.
  Angka paper kini semua dari era fulltext (analysis.json ft + posthoc-ft +
  triangle-summary-ft + rescore-v2-ft); Limitations (4) ditulis ulang
  (repeat-3 GLM B3 tidak diulang — keputusan user).
