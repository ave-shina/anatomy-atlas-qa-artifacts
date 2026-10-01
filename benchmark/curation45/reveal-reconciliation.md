# curated45 — Reveal & Rekonsiliasi

Reveal SETELAH keputusan tercatat. Kolom keputusan yang berlaku di `curation45-decisions.csv` adalah usulan GLM-5.3 (agent-filled, bulk-approved penulis). Kolom `prescreen_agreement` = kesepakatan dengan pre-screen agent (harness `glm-5.3-flash`, in-family, advisory). Kolom `proposed_override` = usulan tandingan pre-screen — **belum diterapkan**, menunggu keputusan penulis.

## Ringkasan

| Kesepakatan | Item |
|---|---|
| agree (kategori & chunk sama) | 38 |
| same_cat_diff_id (sama kategori, chunk beda) | 2 |
| conflict (kategori beda) | 5 |

## Conflict — buta sudah terbuka, putuskan di sini

Isi kolom `author_override` di CSV: kosong = terima yang berlaku; tulis `override` = pakai usulan pre-screen; atau isi nilai lain.

| Item | Berlaku (GLM) | Usulan pre-screen | Catatan GLM | Catatan pre-screen |
|---|---|---|---|---|
| A-skeletal-001 | none | keep_current | No candidate defines the patella (largest sesamoid bone, anterior knee); all are passing mentions or figure dumps. | 1381 covers patellar ligament attachments, not the patella itself. |
| F-cardiovascular-004 | keep_current | none | No candidate explicitly defines the supreme intercostal artery; C4 is nearest but may be truncated before naming it. | No candidate names supreme intercostal artery; 2462 costocervical-trunk text truncated at branch list. |
| F-fasciae-004 | none | keep_current | C1 contains incidental mention only; the true defining passage (from palmaris longus expansion) is absent from retrieved candidates. | Fiber architecture and relations present; formal definition of the sheet absent. |
| F-regions-011 | none | keep_current | C1 only mentions it as an anterior triangle subdivision; no candidate states its boundaries or contents definition. | Triangle borders missing; 2727 is a figure-label dump. |
| F-visceral-001 | chunk medrag-anatomy_gray:2626 | none | No candidate fully defines the duct's origin/opening; C1 likely continues into duct description on same page. | Best (2627) gives course and lingual nerve relation only; no definition or gland of origin. |

## Tabel penuh (45 item)

| Item | Berlaku | Pre-screen | Kesepakatan | Override usulan |
|---|---|---|---|---|
| A-regions-032 | none | none | agree |  |
| A-skeletal-001 | none | keep_current | conflict | keep_current |
| F-cardiovascular-004 | keep_current | none | conflict | none |
| F-cardiovascular-008 | none | none | agree |  |
| F-cardiovascular-012 | keep_current | keep_current | agree |  |
| F-cardiovascular-015 | none | none | agree |  |
| F-fasciae-004 | none | keep_current | conflict | keep_current |
| F-joints-009 | none | none | agree |  |
| F-joints-016 | none | none | agree |  |
| F-lymphoid-011 | keep_current | keep_current | agree |  |
| F-muscular-006 | chunk | chunk (medrag-anatomy_gray:1456) | same_cat_diff_id |  |
| F-muscular-009 | chunk | chunk (medrag-anatomy_gray:176) | agree |  |
| F-muscular-013 | chunk | chunk (medrag-anatomy_gray:1342) | agree |  |
| F-muscular-016 | chunk | chunk (medrag-anatomy_gray:2233) | agree |  |
| F-nervous-001 | chunk | chunk (medrag-anatomy_gray:794) | agree |  |
| F-nervous-005 | none | none | agree |  |
| F-nervous-019 | keep_current | keep_current | agree |  |
| F-regions-008 | none | none | agree |  |
| F-regions-011 | none | keep_current | conflict | keep_current |
| F-regions-015 | none | none | agree |  |
| F-regions-019 | chunk | chunk (medrag-anatomy_gray:1474) | agree |  |
| F-regions-022 | none | none | agree |  |
| F-skeletal-001 | chunk | chunk (medrag-anatomy_gray:1869) | agree |  |
| F-skeletal-012 | chunk | chunk (medrag-anatomy_gray:1704) | same_cat_diff_id |  |
| F-skeletal-016 | chunk | chunk (medrag-anatomy_gray:1372) | agree |  |
| F-skeletal-019 | none | none | agree |  |
| F-visceral-001 | chunk | none | conflict | none |
| F-visceral-005 | none | none | agree |  |
| F-visceral-008 | none | none | agree |  |
| R-cardiovascular-003 | none | none | agree |  |
| R-cardiovascular-008 | none | none | agree |  |
| R-cardiovascular-012 | none | none | agree |  |
| R-cardiovascular-018 | none | none | agree |  |
| R-cardiovascular-023 | none | none | agree |  |
| R-cardiovascular-026 | none | none | agree |  |
| R-cardiovascular-033 | none | none | agree |  |
| R-cardiovascular-043 | none | none | agree |  |
| R-joints-001 | none | none | agree |  |
| R-muscular-001 | none | none | agree |  |
| R-muscular-003 | none | none | agree |  |
| R-muscular-009 | none | none | agree |  |
| R-muscular-012 | none | none | agree |  |
| R-muscular-014 | none | none | agree |  |
| R-nervous-009 | none | none | agree |  |
| R-visceral-007 | none | none | agree |  |
