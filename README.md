# anatomy-atlas-qa-artifacts

Artifacts for **"Grounded Answer-to-3D-Object Linking for Retrieval-Augmented
Anatomy Question Answering"** (Ave Syah Shina, 2026).

This repository releases everything the paper's claims trace to: the question
benchmark, the evaluation harness (the program that drives the RAG pipeline
during experiments), the review/judging scripts, and all retained run outputs.
Every reported number can be recomputed from the files here with single
commands; every run directory carries a manifest recording the models, the
retrieval budget, the git SHA, and checksums of its inputs.

## Contents

| Path | What it is |
|---|---|
| `benchmark/` | Question benchmark (`anatomy3d-qb.v3.ndjson` is the dataset of record — 330 items, 300 retrieval-eligible), gold data, mesh-name mapping (`mesh-keys.json`), review/judging packets and verdicts, `review/PROVENANCE.md` |
| `runs/` | All retained run outputs. The paper's numbers come from `v3-merged-{deepseek,glm,qwen}/` (chips: `analysis-uncapped-v3.json`, judges: `judge-*.jsonl` + `triangle-summary-v3.json`…, retrieval: `retrieval-v3.json`), `ablation-structurekeys-v3.json`, `posthoc-v3.json`, `lexical-baseline-v3/` |
| `scripts/` | Benchmark generator, run harness, analysis, judging, and review scripts (`.mts` run with `tsx`, `.mjs` with plain node) |
| `src/` | The pipeline modules the harness imports in-process (`lib/rag/*`, `lib/structures.ts`, types, anatomy vocabulary) |

## Requirements

- Node.js 20+
- `npm install` (or pnpm)
- Environment variables (owner-side, never committed):
  - `OPENROUTER_API_KEY` — chat models via OpenRouter
  - `PINECONE_API_KEY`, `PINECONE_INDEX` (default `anatomy-atlas`) — retrieval
  - `EMBED_MODEL` (default `baai/bge-m3`) — must match the seeded index (1024-dim)

The retrieval corpus (3,017 Gray's Anatomy chunks from MedRAG) is **not**
redistributed here; it lives in the Pinecone index. `scripts/seed-corpus.mjs`
can rebuild an index from the MedRAG parquet obtained separately (see the
MedRAG citation below). The 3D GLB model and the app UI are out of scope for
the benchmark and are not part of this release.

## Reproducing a run

```bash
npm install
npx tsx scripts/run-benchmark.mts --help        # full flag list
npx tsx scripts/run-benchmark.mts \
  --dataset benchmark/anatomy3d-qb.v3.ndjson \
  --index anatomy-atlas --conditions B3 --chat-model deepseek/deepseek-v4.1-flash
npx tsx scripts/analyze-run.mts --help          # chip/retrieval metrics + bootstrap CIs
npx tsx scripts/judge-run.mts --help            # LLM-judge triangle
```

Each run writes `manifest.json` next to its outputs; `analysis.json` /
`analysis-uncapped-v3.json` in the same directory hold the canonical
post-hoc re-scores under the released gold.

## Data licenses and attribution

- `scripts/`, `src/` — **MIT** (see `LICENSE`).
- `benchmark/` datasets and gold/review data, `runs/` outputs — **CC BY 4.0**
  (see `LICENSE-DATA`).
- Exceptions derived from third-party open data, marked **CC BY-SA 4.0** for
  share-alike compliance:
  - `src/data/anatomy.json` and `benchmark/mesh-keys.json` — structure
    vocabulary and mesh mapping derived from the
    [Z-Anatomy](https://github.com/LearnAnything/Z-Anatomy) atlas (CC BY-SA 4.0);
    structure descriptions from BodyParts3D (CC BY-SA 2.1 JP).

Retrieval corpus chunks originate from MedRAG (Xiong et al.,
"Benchmarking Retrieval-Augmented Generation for Medicine"), © their
respective sources, redistributed only through the seeded index and not
included in this repository.

## Provenance

The evaluation is fully automated with no human annotation. The gold
construction pipeline and the stand-in judge disclosure are documented in
`benchmark/review/PROVENANCE.md`.

## Citation

```bibtex
@misc{shina2026grounded,
  title  = {Grounded Answer-to-3D-Object Linking for Retrieval-Augmented
            Anatomy Question Answering},
  author = {Shina, Ave Syah},
  year   = {2026},
  url    = {https://github.com/ave-shina/anatomy-atlas-qa-artifacts}
}
```
