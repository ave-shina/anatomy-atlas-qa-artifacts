#!/usr/bin/env python3
"""
Aggregate retrieval metrics over the merged v3 runs (run-benchmark.mts
retrievalMetrics semantics, applied to each merged record's retrieval block).

Output per run: research/runs/v3-merged-<tag>/retrieval-v3.json with overall
R@3/6/10 + MRR (mean over retrieval-scored items = items with a gold chunk in
kit v3), plus byType and bySystem blocks, and a provenance note.
"""
import json, sys

REPO = "/Users/ave_shina/Public/Magister/Project/anatomy-atlas-qa"
RUNS = f"{REPO}/research/runs"
MEAN = lambda xs: sum(xs) / len(xs) if xs else 0.0

TAGS = ["deepseek", "glm", "qwen"]
overall = {}
for tag in TAGS:
    items = [json.loads(l) for l in open(f"{RUNS}/v3-merged-{tag}/items.jsonl") if l.strip()]
    scored = [i for i in items if i["retrieval"].get("recall_at_3") is not None]
    def block(rows):
        return {
            "n": len(rows),
            "recall_at_3": MEAN([r["retrieval"]["recall_at_3"] for r in rows]),
            "recall_at_6": MEAN([r["retrieval"]["recall_at_6"] for r in rows]),
            "recall_at_10": MEAN([r["retrieval"]["recall_at_10"] for r in rows]),
            "mrr": MEAN([r["retrieval"]["mrr"] for r in rows]),
        }
    byType = {t: block([r for r in scored if r["type"] == t]) for t in sorted({r["type"] for r in scored})}
    bySystem = {s: {"n": sum(1 for r in scored if r["system"] == s),
                    "recall_at_3": MEAN([r["retrieval"]["recall_at_3"] for r in scored if r["system"] == s]),
                    "recall_at_6": MEAN([r["retrieval"]["recall_at_6"] for r in scored if r["system"] == s])}
                for s in sorted({r["system"] for r in scored})}
    out = {
        "runId": f"v3-merged-{tag}",
        "note": "Retrieval over the v3 kit: raw-question retrieval (baai/bge-m3, Pinecone anatomy-atlas, top-6), recall@k = |gold ∩ top-k| / |gold|, MRR = 1/min gold rank. 262 stored records verbatim, 8 rescued re-scored against the new gold chunk from the stored retrieved list, 30 new items from the v3-new30 runs. Denominator = the 300 retrieval-eligible items.",
        "overall": block(scored),
        "eligible": len(scored),
        "byType": byType,
        "bySystem": bySystem,
    }
    json.dump(out, open(f"{RUNS}/v3-merged-{tag}/retrieval-v3.json", "w"), indent=2)
    overall[tag] = out["overall"]
    print(f"{tag}: eligible {len(scored)} | R@3 {out['overall']['recall_at_3']:.4f} R@6 {out['overall']['recall_at_6']:.4f} MRR {out['overall']['mrr']:.4f}")
json.dump(overall, open(f"{RUNS}/retrieval-v3-summary.json", "w"), indent=2)
print("retrieval-v3-summary.json written")
