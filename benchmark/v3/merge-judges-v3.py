#!/usr/bin/env python3
"""
Merge stored ft-era judge cells with the v3 new-30 judge cells.

Per answer model <tag> and judge <j>: keep the stored judge-<j>.jsonl records
whose ids survive in kit v3 (262 kept + 8 rescued), append the new-30 records
from research/runs/v3-new30-<tag>/judge-<j>.jsonl, and rewrite judge-<j>.metrics.json
with means over the merged records (mirrors judge-run.mts: plain means over
judged rows; skipped = items absent from the cell).
"""
import json, os

REPO = "/Users/ave_shina/Public/Magister/Project/anatomy-atlas-qa"
BM = f"{REPO}/research/benchmark"
RUNS = f"{REPO}/research/runs"
MEAN = lambda xs: sum(xs) / len(xs) if xs else 0.0

kit = [json.loads(l) for l in open(f"{BM}/anatomy3d-qb.v3.ndjson")]
keep_ids = {i["id"] for i in kit if i["status"] != "v3_new"}  # 300 stored-side ids
new_ids = {i["id"] for i in kit if i["status"] == "v3_new"}

TAGS = {"deepseek": "ft-deepseek-r1", "glm": "ft-glm-r1", "qwen": "ft-qwen-r1"}
JMODELS = {"deepseek": "deepseek/deepseek-v4.1-flash", "glm": "z-ai/glm-5.3-flash", "qwen": "qwen/qwen3.8-flash"}

for tag, src in TAGS.items():
    for j, jmodel in JMODELS.items():
        stored = [json.loads(l) for l in open(f"{RUNS}/{src}/judge-{j}.jsonl") if l.strip()]
        stored = [r for r in stored if r["id"] in keep_ids]
        jf = f"{RUNS}/v3-new30-{tag}/judge-{j}.jsonl"
        new = [json.loads(l) for l in open(jf) if l.strip()] if os.path.exists(jf) else []
        new = [r for r in new if r["id"] in new_ids]
        merged = stored + new
        cv = [r["citation_validity"] for r in merged if r.get("citation_validity") is not None]
        ff = [r["faithfulness"] for r in merged if r.get("faithfulness") is not None]
        outdir = f"{RUNS}/v3-merged-{tag}"
        os.makedirs(outdir, exist_ok=True)
        with open(f"{outdir}/judge-{j}.jsonl", "w") as f:
            for r in merged:
                f.write(json.dumps(r, ensure_ascii=False) + "\n")
        old = json.load(open(f"{RUNS}/{src}/judge-{j}.metrics.json"))
        json.dump({
            "runId": f"v3-merged-{tag}", "condition": "B3", "judgeModel": jmodel,
            "judged": len(merged), "failed": 0,
            "skipped": 330 - len(merged),
            "citation_validity_mean": MEAN(cv), "faithfulness_mean": MEAN(ff),
            "note": "v3 kit merge — stored ft-era judge records for surviving items + fresh judge records for the 30 new items (means recomputed).",
        }, open(f"{outdir}/judge-{j}.metrics.json", "w"), indent=2)
        print(f"{tag} x judge-{j}: {len(merged)} records (stored {len(stored)} + new {len(new)}) | cv {MEAN(cv):.4f} ff {MEAN(ff):.4f}")
