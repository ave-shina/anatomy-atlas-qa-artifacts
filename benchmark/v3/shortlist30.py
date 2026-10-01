#!/usr/bin/env python3
"""
Chunk-first shortlist for the v3 gold refresh (local, deterministic, no API).

For each replacement slot (type, system, count) produced by the rescue
screening (8 rescued, 30 replaced), shortlists corpus chunks that could seed
a new benchmark item:

  F ("What is X?" family)  — chunks containing >=1 structure of the slot
                             system whose surface name appears in the text,
                             prose-quality scored.
  R ("How are X and Y…")   — chunks containing >=2 same-system structures
                             whose surface names both appear in the text.
  A negative control        — like F, but prefers rarer/more technical names
                             (controls ask plain questions about obscure
                             structures that still have certified evidence).

Excludes must-structures and gold chunks already used in the v2 kit, and the
structures of the 38 original chunk-less items. Caption/label dumps are
penalized (Fig-density, bullet separators, sentence count).

Inputs:  anatomy.json (mesh vocab), starter pack corpus, anatomy3d-qb.v2.ndjson, replace38.json
Output:  shortlist30.json — per slot, up to 3 options {chunk, structures, scores}
"""
import json
import re
import collections

ROOT = "/Users/ave_shina/Public/Magister/Project/anatomy-atlas-qa"
CORPUS = f"{ROOT}/apps/frontend/public/starter-pack/medrag-anatomy_gray.ndjson"
ANATOMY = f"{ROOT}/apps/frontend/src/data/anatomy.json"
V2 = f"{ROOT}/research/benchmark/anatomy3d-qb.v2.ndjson"
SPEC = f"{ROOT}/research/benchmark/v3/replace38.json"
OUT = f"{ROOT}/research/benchmark/v3/shortlist30.json"
RESCUED = {
    "F-joints-009", "F-cardiovascular-004", "F-nervous-005", "F-visceral-001",
    "A-nervous-001", "A-nervous-007", "A-regions-032", "A-joints-002",
}

def canon(name):
    return re.sub(r"[^a-z0-9]", "", name.lower())

an = json.load(open(ANATOMY))["structures"]
structs = {}
for s in an:
    structs[canon(s["name"])] = s  # key -> {name, system, description}

kit = [json.loads(l) for l in open(V2)]
used_must = {k for it in kit for k in it["gold_structures_must"]}
used_chunks = {c for it in kit for c in (it.get("gold_chunk_ids") or [])}
old_structs = {k for it in json.load(open(SPEC))["items"] for k in it["gold_structures_must"]}
banned = used_must | old_structs

# slots
from collections import Counter
need = Counter()
for it in json.load(open(SPEC))["items"]:
    if it["id"] not in RESCUED:
        need[(it["type"], it["system"])] += 1

# corpus
chunks = []
with open(CORPUS) as f:
    f.readline()
    for l in f:
        c = json.loads(l)
        chunks.append({"id": c["id"], "text": c["m"]["text"], "keys": set(c["m"].get("structureKeys") or [])})

def prose_score(t):
    """higher = more explanatory prose; <=0 = caption/label dump"""
    if len(t) < 350:
        return -10
    figs = t.count("Fig.")
    bullets = t.count("•") + t.count("– ")
    sentences = t.count(". ")
    s = min(len(t) / 400.0, 3.0) + min(sentences / 4.0, 3.0) - 0.6 * figs - 0.4 * bullets
    return s

# name frequency across corpus (for obscurity preference)
name_freq = collections.Counter()
for ch in chunks:
    tl = ch["text"].lower()
    for k, s in structs.items():
        if k in ch["keys"] and s["name"].lower() in tl:
            name_freq[k] += 1

def struct_options(ch, system):
    """same-system structures in this chunk whose name appears in the text, not banned"""
    tl = ch["text"].lower()
    out = []
    for k in ch["keys"]:
        if k in banned or k not in structs:
            continue
        s = structs[k]
        if s["system"] != system:
            continue
        if s["name"].lower() in tl:
            out.append(k)
    return out

# index chunks by system presence
by_sys = collections.defaultdict(list)
for ch in chunks:
    ch["prose"] = prose_score(ch["text"])
    if ch["prose"] <= 0:
        continue
    sys_here = {structs[k]["system"] for k in ch["keys"] if k in structs}
    for sy in sys_here:
        by_sys[sy].append(ch)

options = {}  # slot key -> list of option dicts
for (typ, system), n in sorted(need.items()):
    scored = []
    seen_struct = set()
    for ch in by_sys[system]:
        if ch["id"] in used_chunks:
            continue
        ks = struct_options(ch, system)
        if typ == "R":
            if len(ks) < 2:
                continue
            pairs = [(a, b) for i, a in enumerate(ks) for b in ks[i + 1:]]
            if not pairs:
                continue
            opt = {"chunk_id": ch["id"], "structures": list(ks[:6]), "prose": round(ch["prose"], 2),
                   "text": ch["text"], "page": None}
        else:
            if not ks:
                continue
            # F: prefer well-named; A: prefer obscure (low corpus frequency)
            ks.sort(key=lambda k: (-name_freq[k], k) if typ == "F" else (name_freq[k], len(k)))
            k0 = ks[0]
            if k0 in seen_struct:
                continue
            seen_struct.add(k0)
            opt = {"chunk_id": ch["id"], "structures": ks[:6], "prose": round(ch["prose"], 2),
                   "text": ch["text"], "page": None, "primary": k0,
                   "name_corpus_freq": name_freq[k0]}
        scored.append(opt)
    scored.sort(key=lambda o: -o["prose"])
    options[f"{typ}|{system}"] = scored[: max(n * 3, 6)]

out = {
    "purpose": "v3 gold refresh — chunk-first shortlist for the 30 replacement slots (deterministic local scoring, no API)",
    "date": "2026-09-29",
    "excluded": {"v2_must_structures": len(used_must), "v2_gold_chunks": len(used_chunks), "old38_structures": len(old_structs)},
    "slots": {k: {"need": need[tuple(k.split("|"))], "options": v} for k, v in options.items()},
}
json.dump(out, open(OUT, "w"), indent=2)
print("shortlist30.json written")
for k in sorted(options):
    print(f"  {k:22s} need={need[tuple(k.split('|'))]} options={len(options[k])} top_prose={options[k][0]['prose'] if options[k] else None}")
EOF = None
