import type { ChatRequestBody, RagStreamEvent } from "@/types/rag";
import type { RagSettings } from "@/types/rag";

import {
  annotatePrecise,
  resolveCandidates,
  vocabDisplay,
} from "./grounding";
import { createChatModel, createEmbeddings } from "./providers";
import {
  assumptionNote,
  clarificationQuestion,
  CONDENSE_SYSTEM,
  condenseHuman,
  parseCondense,
  answerHuman,
  answerSystem,
} from "./prompts";
import { queryChunks, type RetrievedChunk } from "./vectorstore";

/**
 * Chat orchestration (PRD FR-4..FR-6): condense → retrieve → disambiguate →
 * stream answer. Conversational input (greetings, thanks) is handled by the
 * answer prompt itself (hard rule 6) — no server-side phrase gate — and when
 * the condense verdict is `anatomy: false` even retrieval is skipped: the
 * verdict comes for free with the condense call, and rule 6 would ignore the
 * context anyway. Yielded as an async generator of SSE events; the route only
 * encodes them onto the wire.
 */

const TOP_K = 6;
const SNIPPET_LEN = 240;
/** Chip limit under an answer: uncapped; explicit model markers rank first. */
const MAX_OBJECT_CHIPS = Infinity;

/** Marker format the answer model is instructed to emit (whitespace-tolerant). */
const OBJ_MARKER_PATTERN = "\\[\\[obj:\\s*([a-z0-9]+)\\s*\\]\\]";

/** Pull [[obj:key]] markers out of the model output, deduped, order kept.
 *  Keys are lowercased — models sometimes emit CamelCase, and ALLOWED_KEYS
 *  are lowercase by construction. */
function extractObjectKeys(text: string): string[] {
  const keys: string[] = [];
  const re = new RegExp(OBJ_MARKER_PATTERN, "gi");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const key = m[1].toLowerCase();
    if (!keys.includes(key)) keys.push(key);
  }
  return keys;
}

export async function* runChat(
  settings: RagSettings,
  body: ChatRequestBody,
): AsyncGenerator<RagStreamEvent> {
  const messageId = crypto.randomUUID();
  try {
    const chatModel = createChatModel(settings);
    const embeddings = createEmbeddings(settings);

    /* 0 — Condense history into a standalone question + vagueness verdict
         (FR-4.2.1). The same call that resolves "yang tadi" also judges
         whether it could be resolved — the model owns reference resolution;
         the clarification gate below only does the arithmetic. */
    let standalone = body.question;
    let condensed: { resolved: boolean; anatomy: boolean } | undefined;
    if (body.history.length > 0) {
      yield { type: "status", stage: "condensing" };
      const res = await chatModel.invoke([
        ["system", CONDENSE_SYSTEM],
        ["human", condenseHuman(body.history, body.question)],
      ]);
      const parsed = parseCondense(String(res.content), body.question);
      standalone = parsed.standalone;
      condensed = { resolved: parsed.resolved, anatomy: parsed.anatomy };
    }

    /* 1 — Retrieve (FR-4.2.2). Skipped outright when the condense verdict
         said the message is small talk / off-topic (`anatomy: false`): rule 6
         makes the answer model ignore the context in that case, so the
         embedding call and the Pinecone query would be pure latency. First
         messages always retrieve — with no condense call there is no verdict
         to gate on. */
    const lockedDisplay = body.clarifiedKey
      ? vocabDisplay(body.clarifiedKey)
      : undefined;
    let chunks: RetrievedChunk[] = [];
    if (condensed?.anatomy !== false) {
      yield { type: "status", stage: "retrieving" };
      // A clarification pick re-scopes retrieval: re-embedding the bare
      // question would return the same near-misses that forced clarification.
      const vector = await embeddings.embedQuery(
        lockedDisplay ? `${standalone} ${lockedDisplay}` : standalone,
      );
      chunks = await queryChunks(settings, {
        vector,
        docIds: body.docIds,
        topK: TOP_K,
      });
    }

    /* 2 — Candidate resolution & clarification gate (FR-5). */
    const { candidates, ambiguous } = resolveCandidates({
      question: standalone,
      chunks,
      shownKeys: body.shownKeys,
      condensed,
    });

    const exhausted = body.clarifyRound >= 2;
    const lockedKey = body.clarifiedKey ?? (exhausted ? candidates[0]?.key : undefined);
    const allowedKeys = [
      ...new Set([
        ...(lockedKey ? [lockedKey] : []),
        ...candidates.map((c) => c.key),
        ...chunks.flatMap((c) => c.structureKeys ?? []),
      ]),
    ].filter((k) => vocabDisplay(k) !== undefined);

    if (!lockedKey && !exhausted && ambiguous) {
      yield {
        type: "clarification",
        question: clarificationQuestion(body.question),
        candidates,
        round: (body.clarifyRound + 1) as 1 | 2,
      };
      yield { type: "done", messageId };
      return;
    }

    /* 3 — Stream the grounded answer (FR-4.2.5, FR-6). */
    yield { type: "status", stage: "answering" };
    // Contexts mentioning the locked candidate come first.
    const ordered = lockedKey
      ? [
          ...chunks.filter((c) => c.structureKeys?.includes(lockedKey)),
          ...chunks.filter((c) => !c.structureKeys?.includes(lockedKey)),
        ]
      : chunks;
    const assumption =
      !body.clarifiedKey && exhausted && candidates[0]
        ? assumptionNote(candidates[0].display, body.question)
        : undefined;

    const stream = await chatModel.stream([
      ["system", answerSystem(settings.promptPrefs)],
      [
        "human",
        answerHuman({
          // The standalone rewrite, not the raw follow-up: history is
          // deliberately not sent to the answer model (strict grounding), so
          // an elliptical "kenapa begitu?" would otherwise arrive without
          // its antecedent.
          question: standalone,
          chunks: ordered,
          allowedKeys,
          assumption,
          clarified: lockedDisplay,
        }),
      ],
    ]);
    let full = "";
    for await (const delta of stream) {
      const text = String(delta.content);
      if (text) {
        full += text;
        yield { type: "token", text };
      }
    }

    /* 4 — Sanitized object chips + citations (FR-6.2, FR-6.4). Chips are
         every real anatomy structure the answer names: explicit model
         markers first, then literal structure names — so a chip still
         appears when the model forgets the marker format. A key only needs
         to exist in the anatomy vocabulary; whether its mesh is focusable
         is decided client-side (unavailableObjectKeys). Citations list only
         the chunks actually cited as [n] — a conversational reply (hard
         rule 6) cites nothing and so surfaces no junk sources. */
    yield {
      type: "objects",
      keys: [
        ...new Set([
          ...extractObjectKeys(full),
          ...annotatePrecise(
            full.replace(new RegExp(OBJ_MARKER_PATTERN, "gi"), " "),
            MAX_OBJECT_CHIPS,
          ),
        ]),
      ]
        .filter((k) => vocabDisplay(k) !== undefined)
        .slice(0, MAX_OBJECT_CHIPS)
        .map((k) => ({ key: k, display: vocabDisplay(k)! })),
    };
    const cited = new Set<number>();
    const citeRe = /\[(\d{1,2})\]/g;
    let citeMatch: RegExpExecArray | null;
    while ((citeMatch = citeRe.exec(full)) !== null) {
      cited.add(Number(citeMatch[1]));
    }
    yield {
      type: "citations",
      items: ordered
        .map((c, i) => ({
          n: i + 1,
          docId: c.docId,
          docName: c.docName,
          page: c.page,
          snippet:
            c.text.length > SNIPPET_LEN ? `${c.text.slice(0, SNIPPET_LEN)}…` : c.text,
        }))
        .filter((c) => cited.has(c.n)),
    };
    yield { type: "done", messageId };
  } catch (e) {
    yield {
      type: "error",
      message: e instanceof Error ? e.message : String(e),
    };
  }
}
