#!/usr/bin/env python3
"""
Merge stored ft-era runs with the v3 new-30 runs into merged run dirs.

Per model (<tag> in deepseek/glm/qwen):
  input   research/runs/ft-<tag>-r1/items.jsonl      (330 v2-era records)
          research/runs/v3-new30-<tag>/items.jsonl   (30 new-item records)
  output  research/runs/v3-merged-<tag>/items.jsonl  (300 kept + 8 rescued-rescored + 30 new)
          research/runs/v3-merged-<tag>/manifest.json (dataset -> anatomy3d-qb.v3.ndjson)

The 30 replaced v2 items are dropped. The 8 rescued items keep their stored
condition records (identical queries) but get their retrieval block re-scored
against the new gold chunk from the stored retrieved list (run-benchmark
retrievalMetrics semantics: recall@k = |gold n top-k| / |gold|, mrr = 1/min rank).
Frozen ft-* run dirs are never modified.
"""
import json, hashlib, os, sys

REPO = "/Users/ave_shina/Public/Magister/Project/anatomy-atlas-qa"
BM = f"{REPO}/research/benchmark"
RUNS = f"{REPO}/research/runs"

kit = [json.loads(l) for l in open(f"{BM}/anatomy3d-qb.v3.ndjson")]
kit_by_id = {i["id"]: i for i in kit}
rescued = {i["id"]: i["gold_chunk_ids"] for i in kit if i["status"] == "v3_rescued"}
# replaced = 38 spec ids minus the 8 rescued (those 30 die)
spec_ids = {i["id"] for i in json.load(open(f"{BM}/v3/replace38.json"))["items"]}
replaced = spec_ids - set(rescued)
assert len(replaced) == 30 and not (replaced & set(rescued))

def rescore_retrieval(rec, gold):
    g = set(gold)
    retrieved = rec["retrieval"]["retrieved"]
    out = dict(rec["retrieval"])
    if not g:
        rec["retrieval"] = {**out, "recall_at_3": None, "recall_at_6": None, "recall_at_10": None, "mrr": None}
        return rec
    ranks = [i + 1 for i, cid in enumerate(retrieved) if cid in g]
    rec_at = lambda k: sum(1 for cid in retrieved[:k] if cid in g) / len(gold)
    rec["retrieval"] = {
        **out,
        "recall_at_3": rec_at(3), "recall_at_6": rec_at(6), "recall_at_10": rec_at(10),
        "mrr": 1 / min(ranks) if ranks else 0,
    }
    return rec

TAGS = {"deepseek": "ft-deepseek-r1", "glm": "ft-glm-r1", "qwen": "ft-qwen-r1"}
summary = {}
for tag, src in TAGS.items():
    stored = [json.loads(l) for l in open(f"{RUNS}/{src}/items.jsonl") if l.strip()]
    fresh = [json.loads(l) for l in open(f"{RUNS}/v3-new30-{tag}/items.jsonl") if l.strip()]
    fresh_ids = {r["id"] for r in fresh}
    assert len(fresh) == 30 and fresh_ids == {i["id"] for i in kit if i["status"] == "v3_new"}, tag

    kept, resc = [], []
    for rec in stored:
        if rec["id"] in replaced:
            continue
        if rec["id"] in rescued:
            resc.append(rescore_retrieval(rec, rescued[rec["id"]]))
        else:
            kept.append(rec)

    # Repair pre-existing ft-era retrieval gaps: queries are identical across
    # the three ft runs and the Pinecone index is the same, so the sibling
    # run's retrieved list is a faithful stand-in for the errored call.
    sibling = [json.loads(l) for l in open(f"{RUNS}/ft-glm-r1/items.jsonl") if l.strip()]
    sib_by_id = {r["id"]: r["retrieval"] for r in sibling if "error" not in r["retrieval"]}
    repairs = []
    for rec in kept + resc:
        if "error" in rec["retrieval"] and rec["id"] in sib_by_id:
            sib = sib_by_id[rec["id"]]
            gold = kit_by_id[rec["id"]].get("gold_chunk_ids") or []
            rec["retrieval"] = {"retrieved": sib["retrieved"], "scores": sib.get("scores", [])}
            rescore_retrieval(rec, gold)
            repairs.append(rec["id"])
    assert len(kept) == 292 and len(resc) == 8, (tag, len(kept), len(resc))
    merged = kept + resc + fresh

    outdir = f"{RUNS}/v3-merged-{tag}"
    os.makedirs(outdir, exist_ok=True)
    with open(f"{outdir}/items.jsonl", "w") as f:
        for r in merged:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    kit_sha = hashlib.sha256(open(f"{BM}/anatomy3d-qb.v3.ndjson", "rb").read()).hexdigest()
    old_man = json.load(open(f"{RUNS}/{src}/manifest.json"))
    man = {
        "runId": f"v3-merged-{tag}",
        "date": old_man["date"],
        "gitSha": old_man["gitSha"],
        "conditions": old_man["conditions"],
        "docId": old_man["docId"],
        "chatModel": old_man["chatModel"],
        "embedModel": old_man["embedModel"],
        "pineconeIndex": old_man["pineconeIndex"],
        "topK": old_man["topK"],
        "repeat": old_man["repeat"],
        "dataset": {"path": "research/benchmark/anatomy3d-qb.v3.ndjson", "sha256": kit_sha, "items": 330},
        "meshKeys": old_man["meshKeys"],
        "merge": {
            "note": "v3 kit merge — stored ft-era records (292 kept verbatim, 8 rescued with retrieval re-scored against the new gold chunk from the stored retrieved list) + 30 fresh v3-new30 records; 30 replaced v2 items dropped. Chips re-extracted offline by rescore-chips-uncapped.mts (--gold-patch none: the patched item A-nervous-003 was replaced in kit v3).",
            "retrieval_repairs": {
                "method": "stored ft-era records whose retrieval block holds a Pinecone error receive the identical query's retrieved list + scores from ft-glm-r1 (same index, same embed model) and are re-scored by the run-benchmark retrievalMetrics formula",
                "repaired_ids_per_tag": "recorded in merge stdout",
            },
            "sources": [src, f"v3-new30-{tag}"],
        },
    }
    json.dump(man, open(f"{outdir}/manifest.json", "w"), indent=1)
    r3 = [r["retrieval"]["recall_at_3"] for r in merged if r["retrieval"].get("recall_at_3") is not None]
    summary[tag] = {"records": len(merged), "retrieval_scored": len(r3)}
    print(f"{tag}: merged {len(merged)} records ({len(kept)} kept + {len(resc)} rescued-rescored + {len(fresh)} new), retrieval-scored {len(r3)}")
print(json.dumps(summary))
