# Author review kit (human verification of the gold audit sample)

Purpose: record the author's independent human verdicts on the frozen 100-item
audit sample, so the paper's provenance claim can be extended from
"fully automated" to "AI panel + independent human verification" with an
artifact behind it.

## Files

- `gold-packet.txt` — the material: query, gold must/optional, gold brief,
  gold chunk, B3 answer and chips for each of the 100 items (50 F / 25 R / 25 A).
  This is the same frozen packet the AI panel reviewed.
- `gold-verdicts-author.template.csv` — blank sheet, one row per item:
  `item_id,must_ok,optional_ok,query_ok,notes`.

## How to fill

For each item, decide from the packet material only:

- `must_ok` — 1 if the gold `must` structures are correct for this query
  (nothing missing that must be linked, nothing wrong); 0 otherwise.
- `optional_ok` — 1 if the `optional` list is reasonable (no wrong structures).
- `query_ok` — 1 if the query is unambiguous and answerable from the chunk;
  0 otherwise (ambiguous or unanswerable).
- `notes` — optional, free text.

Blinding rule: fill it WITHOUT opening `gold-verdicts-{glm,deepseek,qwen}.csv`,
`gold-verdicts-claude*.csv`, `gold-verdicts-final*.json`, or
`review-agreement*.json`. Independence is what makes the agreement number
meaningful.

When done, save a copy as `gold-verdicts-author.csv` (keep the template as-is),
then compute agreement:

```
cd apps/frontend && node scripts/author-agreement.mjs
```

It writes `author-review-agreement.json` (per-column agreement and Cohen's
kappa vs the v2 consensus value: trio-unanimous -> panel value, else arbiter).
