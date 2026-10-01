/**
 * Research-only pipeline conditions for E1 (02-protokol-evaluasi.md §3).
 *
 *   B3 — the shipped pipeline (delegates to runChat): retrieval + candidate
 *        resolution + clarification + controlled-vocabulary grounding.
 *   B2 — retrieval and the same answer prompt, but NO vocabulary grounding:
 *        chips are the model's raw [[obj:key]] markers, unfiltered.
 *   B1 — no retrieval (parametric knowledge only), same answer prompt with an
 *        empty CONTEXT; chips are the raw markers.
 *
 * B2/B1 reuse the SAME exported prompt builders and model/embedding factories
 * as the app, so only the conditioned step differs. Nothing here is imported
 * by app code.
 */
import type {
  ChatRequestBody,
  RagSettings,
  RagStreamEvent,
} from "@/types/rag";
import { runChat } from "@/lib/rag/chat";
import { createChatModel, createEmbeddings } from "@/lib/rag/providers";
import { queryChunks, type RetrievedChunk } from "@/lib/rag/vectorstore";
import { answerHuman, answerSystem } from "@/lib/rag/prompts";

export type Condition = "B1" | "B2" | "B3";
export const CONDITIONS: Condition[] = ["B1", "B2", "B3"];

const TOP_K = 6;
const SNIPPET_LEN = 240;
const MAX_OBJECT_CHIPS = 12;
/** Must mirror chat.ts — the marker format the answer model is told to emit. */
const OBJ_MARKER_PATTERN = "\\[\\[obj:\\s*([a-z0-9]+)\\s*\\]\\]";

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

export async function* runCondition(
  condition: Condition,
  settings: RagSettings,
  body: ChatRequestBody,
): AsyncGenerator<RagStreamEvent> {
  if (condition === "B3") {
    yield* runChat(settings, body);
    return;
  }

  const messageId = crypto.randomUUID();
  try {
    const chatModel = createChatModel(settings);
    let chunks: RetrievedChunk[] = [];

    if (condition === "B2") {
      yield { type: "status", stage: "retrieving" };
      const embeddings = createEmbeddings(settings);
      const vector = await embeddings.embedQuery(body.question);
      chunks = await queryChunks(settings, { vector, docIds: body.docIds, topK: TOP_K });
    }

    yield { type: "status", stage: "answering" };
    // B2 keeps the retrieval-derived key list in the prompt but drops the
    // post-hoc validation; B1 has no retrieval and so no keys at all.
    const allowedKeys =
      condition === "B2"
        ? [...new Set(chunks.flatMap((c) => c.structureKeys ?? []))]
        : [];
    const stream = await chatModel.stream([
      ["system", answerSystem(settings.promptPrefs)],
      ["human", answerHuman({ question: body.question, chunks, allowedKeys })],
    ]);

    let full = "";
    for await (const delta of stream) {
      const text = String(delta.content);
      if (text) {
        full += text;
        yield { type: "token", text };
      }
    }

    // Unvalidated chips: raw model markers only (no vocabulary filter).
    const keys = [...new Set(extractObjectKeys(full))].slice(0, MAX_OBJECT_CHIPS);
    yield { type: "objects", keys: keys.map((k) => ({ key: k, display: k })) };

    const cited = new Set<number>();
    const citeRe = /\[(\d{1,2})\]/g;
    let citeMatch: RegExpExecArray | null;
    while ((citeMatch = citeRe.exec(full)) !== null) cited.add(Number(citeMatch[1]));
    yield {
      type: "citations",
      items: chunks
        .map((c, i) => ({
          n: i + 1,
          docId: c.docId,
          docName: c.docName,
          page: c.page,
          snippet: c.text.length > SNIPPET_LEN ? `${c.text.slice(0, SNIPPET_LEN)}…` : c.text,
        }))
        .filter((c) => cited.has(c.n)),
    };
    yield { type: "done", messageId };
  } catch (e) {
    yield { type: "error", message: e instanceof Error ? e.message : String(e) };
  }
}
