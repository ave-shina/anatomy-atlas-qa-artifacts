# curated45 — Re-skoring Retrieval (gold v1 vs v2)

Offline, dari rank dense tersimpan di `research/runs/ft-glm-r1,ft-deepseek-r1,ft-qwen-r1` (arm deployed, top-6); kode metrik identik untuk v1/v2. Bootstrap 10000 resamples.

**S_both** = item berkunci di v1 DAN v2 (292 − 30) — selisih v1→v2 murni efek perbaikan gold. **S_dropped** = 30 item yang jadi gold-less. **S_curated** = 15 item curated45 yang berkunci di v2.

| Run | n | R@3 v1 | R@3 v2 | ΔR@3 | MRR v1 | MRR v2 | ΔMRR |
|---|---|---|---|---|---|---|---|
| ft-glm-r1 | 262 | 0.328 | 0.346 | **+0.018** [+0.004, +0.031] | 0.452 | 0.460 | **+0.009** [+0.000, +0.020] |
| ft-deepseek-r1 | 262 | 0.327 | 0.345 | **+0.018** [+0.004, +0.031] | 0.452 | 0.461 | **+0.009** [+0.000, +0.020] |
| ft-qwen-r1 | 261 | 0.328 | 0.346 | **+0.018** [+0.004, +0.034] | 0.452 | 0.461 | **+0.009** [-0.001, +0.022] |

### S_curated (n=15, deskriptif)

| Run | R@3 v1→v2 | MRR v1→v2 |
|---|---|---|
| ft-glm-r1 | 0.222 → 0.533 | 0.339 → 0.494 |
| ft-deepseek-r1 | 0.222 → 0.533 | 0.339 → 0.494 |
| ft-qwen-r1 | 0.222 → 0.533 | 0.339 → 0.494 |

### S_dropped (n=30): skor v1 terhadap kunci lemah

| Run | R@3 | MRR |
|---|---|---|
| ft-glm-r1 | 0.200 | 0.238 |
| ft-deepseek-r1 | 0.233 | 0.241 |
| ft-qwen-r1 | 0.200 | 0.238 |
