# curated45 — Re-skoring Retrieval (gold v1 vs v2)

Offline, dari rank dense tersimpan di `research/runs/trio-*-r1` (arm deployed, top-6); kode metrik identik untuk v1/v2. Bootstrap 10000 resamples.

**S_both** = item berkunci di v1 DAN v2 (292 − 30) — selisih v1→v2 murni efek perbaikan gold. **S_dropped** = 30 item yang jadi gold-less. **S_curated** = 15 item curated45 yang berkunci di v2.

| Run | n | R@3 v1 | R@3 v2 | ΔR@3 | MRR v1 | MRR v2 | ΔMRR |
|---|---|---|---|---|---|---|---|
| trio-glm-r1 | 262 | 0.327 | 0.345 | **+0.018** [+0.004, +0.031] | 0.453 | 0.462 | **+0.009** [+0.000, +0.020] |
| trio-deepseek-r1 | 262 | 0.327 | 0.345 | **+0.018** [+0.004, +0.031] | 0.453 | 0.462 | **+0.009** [+0.000, +0.020] |
| trio-qwen-r1 | 262 | 0.327 | 0.345 | **+0.018** [+0.004, +0.031] | 0.452 | 0.461 | **+0.009** [+0.000, +0.020] |

### S_curated (n=15, deskriptif)

| Run | R@3 v1→v2 | MRR v1→v2 |
|---|---|---|
| trio-glm-r1 | 0.222 → 0.533 | 0.350 → 0.506 |
| trio-deepseek-r1 | 0.222 → 0.533 | 0.350 → 0.506 |
| trio-qwen-r1 | 0.222 → 0.533 | 0.350 → 0.506 |

### S_dropped (n=30): skor v1 terhadap kunci lemah

| Run | R@3 | MRR |
|---|---|---|
| trio-glm-r1 | 0.200 | 0.238 |
| trio-deepseek-r1 | 0.200 | 0.255 |
| trio-qwen-r1 | 0.200 | 0.255 |
