import type { ChatHistoryTurn, PromptPrefs } from "@/types/rag";

import type { RetrievedChunk } from "./vectorstore";

/**
 * Prompt contracts for the RAG chat pipeline (PRD FR-4, FR-5, FR-6). The
 * answer model may only use structure keys listed in ALLOWED_KEYS and must
 * cite numbered sources — the server filters violations afterwards.
 *
 * The system prompt is split in two layers: hard rules (locked — the UI
 * parses [[obj:key]] chips and [n] citations they produce) and soft user
 * preferences (persona/length/language) that can never override them.
 */

/**
 * Verdict from the condense step: the rewrite plus the model's own judgment
 * of whether the follow-up's subject is determinate and on-topic. Replaces
 * hand-rolled anaphora/filler word lists — the model that resolves "yang
 * tadi" is the right judge of whether it could be resolved.
 */
export type CondenseResult = {
  /** Follow-up rewritten to be self-contained (original language kept). */
  standalone: string;
  /** True when the subject is concrete — named outright or pinned by history. */
  resolved: boolean;
  /** False for small talk or messages clearly off the anatomy topic. */
  anatomy: boolean;
};

export const CONDENSE_SYSTEM = `You rewrite a follow-up question as a standalone question.
Given the chat history, resolve pronouns and vague references ("that muscle", "otot itu")
to their antecedents. Keep the original language of the question; if it is already
standalone, return it unchanged.
Output ONLY a JSON object, nothing else:
{"standalone": "<rewritten question>",
 "subject": "<the concrete subject after rewriting, or null if it stays vague>",
 "anatomy": false if the follow-up is small talk or clearly not about anatomy, else true}`;

export function condenseHuman(
  history: ChatHistoryTurn[],
  question: string,
): string {
  const turns = history
    .slice(-8)
    .map((t) => `${t.role === "user" ? "User" : "Assistant"}: ${t.text}`)
    .join("\n");
  return `Chat history:\n${turns}\n\nFollow-up question: ${question}\n\nResult JSON:`;
}

/**
 * Tolerant parse of the condense verdict. On malformed output fall back to
 * treating the raw text as a resolved, on-topic question — a broken verdict
 * must degrade to "answer directly", never to a spurious clarification.
 */
export function parseCondense(raw: string, fallback: string): CondenseResult {
  const json = raw.match(/\{[\s\S]*\}/);
  if (json) {
    try {
      const j = JSON.parse(json[0]) as {
        standalone?: unknown;
        subject?: unknown;
        anatomy?: unknown;
      };
      const standalone =
        typeof j.standalone === "string" && j.standalone.trim()
          ? j.standalone.trim()
          : fallback;
      const subject = typeof j.subject === "string" ? j.subject.trim() : "";
      return {
        standalone,
        resolved: subject.length > 0,
        anatomy: j.anatomy !== false,
      };
    } catch {
      /* fall through to the raw-text fallback */
    }
  }
  return { standalone: raw.trim() || fallback, resolved: true, anatomy: true };
}

/** Clamp user-supplied prompt prefs to the bounded vocabulary (client + server). */
export function sanitizePromptPrefs(raw: unknown): PromptPrefs {
  if (!raw || typeof raw !== "object") return {};
  const r = raw as Partial<PromptPrefs>;
  const persona =
    typeof r.persona === "string" ? r.persona.trim().slice(0, 300) : undefined;
  return {
    ...(persona ? { persona } : {}),
    ...(r.length === "short" || r.length === "normal" || r.length === "detailed"
      ? { length: r.length }
      : {}),
    ...(r.language === "auto" || r.language === "id" || r.language === "en"
      ? { language: r.language }
      : {}),
  };
}

/** Language hard rule shared by every system prompt (locked). */
function languageRule(prefs?: PromptPrefs): string {
  return prefs?.language === "id"
    ? "Always answer in Indonesian."
    : prefs?.language === "en"
      ? "Always answer in English."
      : "Answer in the same language as the question.";
}

/**
 * The answer system prompt: locked hard rules (citation, object markers,
 * abstention) plus the user's soft preferences demoted beneath them. Rules
 * 1–3 are load-bearing for the UI — they must stay byte-identical here.
 */
export function answerSystem(prefs?: PromptPrefs): string {
  const language = languageRule(prefs);
  const length =
    prefs?.length === "short"
      ? "Keep the answer short (usually under 120 words)."
      : prefs?.length === "detailed"
        ? "You may go up to roughly 450 words when the question warrants detail."
        : "Keep the answer focused (usually under 250 words).";
  const persona = prefs?.persona?.trim();
  return `You are an anatomy tutor embedded in a 3D anatomy atlas app.
Answer the user's question using ONLY the numbered CONTEXT blocks for anatomical facts.

Hard rules:
1. Cite every factual claim with the context block number, like [1] or [2][3].
2. Every anatomical structure you mention must be marked as [[obj:key]] where key
   is taken EXCLUSIVELY from ALLOWED_KEYS. Example: the [[obj:bicepsbrachii]] flexes the elbow [1].
   Never invent keys; if a structure has no key in ALLOWED_KEYS, write its name as plain text.
3. If the CONTEXT does not contain enough information, say so plainly. You may then add
   general knowledge, clearly introduced with "General note:" (or the equivalent in the
   user's language), without citations.
4. ${language}
5. Format with markdown: short paragraphs, **bold** structure names, bullet lists when
   enumerating. ${length}
6. If the user's message is conversational rather than a question about anatomy — a
   greeting, thanks, farewell, or asking who you are / what you can do — reply warmly
   and briefly (1-3 sentences) and invite them to explore the 3D model or ask about
   anatomy. Do NOT use [n] citations or [[obj:key]] markers in such a reply, and do
   NOT treat the CONTEXT as relevant to it.${
     persona
       ? `

Soft preferences (lower priority than the hard rules above):
- Audience & tone: ${persona}`
       : ""
   }`;
}

/** Human-message template description for the settings prompt viewer. */
export const HUMAN_TEMPLATE_DOC = `The server composes the user message as:
ALLOWED_KEYS — the 3D object keys the model may mention (from context & viewer)
CONTEXT — numbered PDF chunks [1]..[n] with source & page
QUESTION — your question
(+ NOTE assumption, when clarification rounds are exhausted;
 + NOTE clarification pick, when the user picked a candidate)`;

export function answerHuman(opts: {
  question: string;
  chunks: RetrievedChunk[];
  allowedKeys: string[];
  /** Set after clarification rounds are exhausted (PRD FR-5.3). */
  assumption?: string;
  /** Structure the user picked in a clarification bubble (FR-5.4). */
  clarified?: string;
}): string {
  const context = opts.chunks
    .map(
      (c, i) => `[${i + 1}] (source: ${c.docName}, page ${c.page})\n${c.text}`,
    )
    .join("\n\n---\n\n");
  const lines = [
    `ALLOWED_KEYS: ${opts.allowedKeys.length ? opts.allowedKeys.join(", ") : "(none)"}`,
    "",
    `CONTEXT:\n${context || "(no context retrieved)"}`,
    "",
    `QUESTION: ${opts.question}`,
  ];
  if (opts.assumption) {
    lines.push(
      "",
      `NOTE: The question was ambiguous. State this assumption early in your answer, in the user's language: ${opts.assumption}`,
    );
  }
  if (opts.clarified) {
    lines.push(
      "",
      `NOTE: The question contained an ambiguous reference, and the user then picked the structure "${opts.clarified}". That structure is the subject of the question — answer about it.`,
    );
  }
  return lines.join("\n");
}

/** Localized clarification bubble text (FR-5.2). */
export function clarificationQuestion(question: string): string {
  const indonesian =
    /\b(apa|bagaimana|mana|yang|itu|tadi|jelaskan|fungsi|otot|tulang|dimana|di mana)\b/i.test(
      question,
    );
  return indonesian
    ? "Maksud Anda objek anatomi yang mana? Pilih salah satu di bawah ini."
    : "Which anatomical object do you mean? Pick one below.";
}

/** Assumption note used when clarification rounds run out (FR-5.3). */
export function assumptionNote(display: string, question: string): string {
  const indonesian =
    /\b(apa|bagaimana|mana|yang|itu|tadi|jelaskan|fungsi|otot|tulang|dimana|di mana)\b/i.test(
      question,
    );
  return indonesian
    ? `pertanyaan Anda ambigu, jadi saya berasumsi maksud Anda ${display}`
    : `your question was ambiguous, so I assumed you meant ${display}`;
}
