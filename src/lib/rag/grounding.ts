import anatomy from "@/data/anatomy.json";
import { canonicalize, normalizeName } from "@/lib/structures";
import type { CandidateRef } from "@/types/rag";

import type { RetrievedChunk } from "./vectorstore";

/**
 * Grounding: ties free text back to the 3D structures the viewer knows about
 * (PRD FR-2.2 annotation, FR-5 candidate resolution, FR-6.4 marker filtering).
 */

export type VocabEntry = { key: string; display: string; system: string };

type StructureRow = { name: string; system: string; description: string };

function buildVocab(): {
  /** [lowercased display, key] pairs, longest names first for greedy match. */
  matchers: [string, string][];
  byKey: Map<string, VocabEntry>;
} {
  const byKey = new Map<string, VocabEntry>();
  for (const s of anatomy.structures as StructureRow[]) {
    const display = normalizeName(s.name);
    const key = canonicalize(display);
    // Skip mojibake names ("????????"), empty keys, and trivial short names.
    if (!key || key.length < 4 || display.includes("?")) continue;
    if (!byKey.has(key)) {
      byKey.set(key, { key, display, system: s.system });
    }
  }
  const matchers = [...byKey.values()]
    .map((e) => [e.display.toLowerCase(), e.key] as [string, string])
    .sort((a, b) => b[0].length - a[0].length);
  return { matchers, byKey };
}

const { matchers: VOCAB_MATCHERS, byKey: VOCAB_BY_KEY } = buildVocab();

/**
 * Find structure keys whose name literally occurs in `text`. Used at ingest
 * time (chunk annotation) so annotation stays comparable with the seeded
 * starter pack. For anything user-facing, prefer {@link annotatePrecise}.
 */
export function annotateText(text: string, limit = 24): string[] {
  const lower = text.toLowerCase();
  const keys = new Set<string>();
  for (const [needle, key] of VOCAB_MATCHERS) {
    if (lower.includes(needle)) {
      keys.add(key);
      if (keys.size >= limit) break;
    }
  }
  return [...keys];
}

/** VOCAB_MATCHERS bucketed by first character, keeping longest-first order. */
const MATCHERS_BY_FIRST = new Map<string, [string, string][]>();
for (const matcher of VOCAB_MATCHERS) {
  const bucket = MATCHERS_BY_FIRST.get(matcher[0][0]);
  if (bucket) bucket.push(matcher);
  else MATCHERS_BY_FIRST.set(matcher[0][0], [matcher]);
}

/**
 * Structure names occurring in `text`, scanned left-to-right: longest match
 * wins at each position and a match must end on a word boundary, so "ulnar"
 * no longer matches "Ulna" and "tibialis" no longer matches "Tibia". Used where false
 * positives surface in the UI — explicit question mentions and answer chips.
 */
export function annotatePrecise(text: string, limit = 24): string[] {
  const lower = text.toLowerCase();
  const isLetter = (c: string | undefined) =>
    c !== undefined && /\p{L}/u.test(c);
  const keys = new Set<string>();
  let i = 0;
  while (i < lower.length && keys.size < limit) {
    let best: [string, string] | null = null;
    for (const [needle, key] of MATCHERS_BY_FIRST.get(lower[i]) ?? []) {
      if (best && needle.length <= best[0].length) continue;
      if (lower.startsWith(needle, i) && !isLetter(lower[i + needle.length])) {
        best = [needle, key];
      }
    }
    if (best) {
      keys.add(best[1]);
      i += best[0].length;
    } else {
      i += 1;
    }
  }
  return [...keys];
}

/**
 * Domain words marking a short first message as anatomy-related (ID + EN).
 * With no history there is no condense call to judge intent, so the
 * clarification gate needs this evidence that a ≤2-word input ("otot") asks
 * about anatomy at all — off-topic short input ("kenapa langit biru", whose
 * junk candidates still tie) must answer directly, not clarify.
 */
const ANATOMY_INTENT_RE =
  /\b(anatomi|anatomy|anatomis|otot|tulang|sendi|persendian|saraf|organ|jantung|paru|paru-paru|hati|ginjal|lambung|usus|otak|mata|telinga|kulit|darah|pembuluh|arteri|vena|urat|ligamen|tendon|tubuh|badan|sistem|system|muscle|bone|joint|nerve|heart|lung|liver|kidney|stomach|intestine|brain|eye|ear|skin|blood|vessel|artery|vein|ligament|body|head|neck|chest|abdomen|pelvis|thorax|fungsi|struktur|penjelasan|definisi)\b/i;

export type CandidateResolution = {
  /** Ranked candidates (strongest first, max 4) for chips / clarification. */
  candidates: CandidateRef[];
  /** True when the question is too vague to pick a single object. */
  ambiguous: boolean;
};

/**
 * Combine three signals into ranked object candidates:
 *  1. `structureKeys` annotated on retrieved chunks, weighted by retrieval
 *     score (strong),
 *  2. structure names explicitly mentioned in the question (strong),
 *  3. structures currently shown in the viewer (weak, PRD Q-4).
 */
export function resolveCandidates(opts: {
  question: string;
  chunks: RetrievedChunk[];
  shownKeys?: string[];
  /** Condense verdict — present whenever history existed (CondenseResult). */
  condensed?: { resolved: boolean; anatomy: boolean };
}): CandidateResolution {
  const weights = new Map<string, number>();
  const bump = (key: string, delta: number) =>
    weights.set(key, (weights.get(key) ?? 0) + delta);

  opts.chunks.forEach((chunk, rank) => {
    for (const key of chunk.structureKeys ?? []) {
      if (VOCAB_BY_KEY.has(key)) bump(key, (chunk.score ?? 0) / (rank + 1));
    }
  });

  for (const key of annotatePrecise(opts.question)) bump(key, 3);
  for (const key of opts.shownKeys ?? []) {
    if (VOCAB_BY_KEY.has(key)) bump(key, 0.5);
  }

  const candidates = [...weights.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([key]) => VOCAB_BY_KEY.get(key)!)
    .map(({ key, display, system }) => ({ key, display, system }));

  const explicit = annotatePrecise(opts.question);
  const closeRunnersUp =
    candidates.length >= 2 &&
    (weights.get(candidates[1].key) ?? 0) >=
      0.5 * (weights.get(candidates[0].key) ?? 1);
  // Vagueness = no structure named AND the subject stayed indeterminate.
  // Mid-conversation that is the condense model's verdict (it saw the
  // history); on a first message there is nothing to resolve except
  // ultra-short prompts ("otot"), where raw word count stands in.
  const firstMessageShort =
    opts.question.trim().split(/\s+/).length <= 2;
  const vague =
    explicit.length === 0 &&
    (opts.condensed ? !opts.condensed.resolved : firstMessageShort);
  // Retrieval always returns something (Pinecone top-k), so competing
  // candidates exist even for content-free input. Clarification additionally
  // needs evidence the input is an anatomy question at all: the condense
  // verdict mid-conversation, a domain word on a first message.
  const anatomyIntent = opts.condensed
    ? opts.condensed.resolved || opts.condensed.anatomy
    : ANATOMY_INTENT_RE.test(opts.question);

  return {
    candidates,
    // A single explicitly named structure is never ambiguous, and neither is
    // a descriptive question — it gets answered directly against its chunks.
    // Clarification is reserved for bare references where two candidates
    // genuinely compete (FR-5).
    ambiguous: vague && closeRunnersUp && anatomyIntent,
  };
}

/** Display lookup for marker sanitization (FR-6.4). */
export function vocabDisplay(key: string): string | undefined {
  return VOCAB_BY_KEY.get(key)?.display;
}
