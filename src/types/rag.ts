/**
 * Shared types for the RAG Q&A feature (see docs/PRD-RAG-QA.md §7).
 * Used by both the API routes (server) and the chatbot UI (client).
 */

/* ------------------------------------------------------------------ */
/* Settings (PRD §7.3)                                                 */
/* ------------------------------------------------------------------ */

/** Everything the server pipeline needs. lib/rag/credentials.ts merges the
 *  user's header (ClientRagSettings) with owner env config (Pinecone index
 *  + embedding model), so Pinecone fields are never client-supplied. */
export type RagSettings = {
  openRouterKey: string;
  chatModel: string;
  embedModel: string;
  pineconeKey: string;
  pineconeIndex: string;
  /** Bounded answer-style customization (soft prompt layer, PRD FR-1). */
  promptPrefs?: PromptPrefs;
};

/** What the browser stores (localStorage) and sends in `x-rag-config`.
 *  Pinecone credentials and the embedding model are owner env config. */
export type ClientRagSettings = Pick<
  RagSettings,
  "openRouterKey" | "chatModel" | "promptPrefs"
>;

/** Soft prompt layer the user may tune; hard rules stay server-locked. */
export type PromptPrefs = {
  /** Audience & tone instruction, e.g. "jelaskan untuk mahasiswa semester 1". */
  persona?: string;
  length?: "short" | "normal" | "detailed";
  language?: "auto" | "id" | "en";
};

export type SettingsVerifyResult = {
  ok: boolean;
  openRouterOk: boolean;
  /** The owner's Pinecone index answered describeIndex (read-only). */
  pineconeOk: boolean;
  indexExists: boolean;
  /** Server env config echo, for the settings dialog. */
  indexName?: string;
  indexDim?: number;
  embedDim?: number;
  /** True when embedDim !== indexDim (EMBED_MODEL vs seeded index). */
  dimensionMismatch?: boolean;
  errors?: { openRouter?: string; pinecone?: string };
};

/* ------------------------------------------------------------------ */
/* Chat messages & sessions (PRD §7.2, §7.4)                           */
/* ------------------------------------------------------------------ */

/** A clickable 3D object reference: key matches a StructureItem key. */
export type ObjectRef = { key: string; display: string };

/** A candidate offered during a clarification round. */
export type CandidateRef = ObjectRef & { system?: string };

/** Numbered citation into an ingested document chunk. */
export type Citation = {
  n: number;
  docId: string;
  docName: string;
  page: number;
  snippet: string;
};

export type ChatMessage =
  | { id: string; role: "user"; text: string }
  | {
      id: string;
      role: "assistant";
      status: "streaming";
      markdown: string;
      stage?: RagStatusStage;
    }
  | {
      id: string;
      role: "assistant";
      status: "clarifying";
      question: string;
      candidates: CandidateRef[];
      round: 1 | 2;
      /** Set once the user picked a candidate — locks the bubble. */
      pickedKey?: string;
    }
  | {
      id: string;
      role: "assistant";
      status: "done";
      markdown: string;
      objects: ObjectRef[];
      citations: Citation[];
    }
  | { id: string; role: "assistant"; status: "error"; message: string };

export type ChatSession = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  /** Documents that supplied answers in this session (FR-8.3). */
  kbDocIds: string[];
  messages: ChatMessage[];
};

export type ChatSessionsState = {
  sessions: ChatSession[];
  activeSessionId: string;
};

/* ------------------------------------------------------------------ */
/* Chat request / SSE stream (PRD §6.3)                                */
/* ------------------------------------------------------------------ */

export type ChatHistoryTurn = { role: "user" | "assistant"; text: string };

export type ChatRequestBody = {
  question: string;
  /** Prior turns (done answers only, condensed to text). */
  history: ChatHistoryTurn[];
  /** Document ids allowed for retrieval; empty means the whole knowledge
   *  base index (doc scoping is unused since the knowledge panel left). */
  docIds: string[];
  /** How many clarification rounds already happened for this question. */
  clarifyRound: 0 | 1 | 2;
  /** Candidate key picked by the user from a clarification bubble. */
  clarifiedKey?: string;
  /** Structure keys currently shown/isolated in the viewer (weak signal). */
  shownKeys?: string[];
};

export type RagStatusStage = "condensing" | "retrieving" | "answering";

export type RagStreamEvent =
  | { type: "status"; stage: RagStatusStage }
  | {
      type: "clarification";
      question: string;
      candidates: CandidateRef[];
      round: 1 | 2;
    }
  | { type: "token"; text: string }
  | { type: "objects"; keys: ObjectRef[] }
  | { type: "citations"; items: Citation[] }
  | { type: "done"; messageId: string }
  | { type: "error"; message: string; code?: string };

/* ------------------------------------------------------------------ */
/* Knowledge base documents                                            */
/* ------------------------------------------------------------------ */

export type KnowledgeDocMeta = {
  docId: string;
  docName: string;
  chunks: number;
  uploadedAt: number;
};

/** Upload/import progress SSE events (`/api/knowledge/*`). */
export type UploadStreamEvent =
  | { type: "progress"; stage: "parsing" | "chunking" | "embedding" | "upsert" | "downloading"; current?: number; total?: number }
  | { type: "done"; docId: string; docName: string; chunks: number }
  | { type: "error"; message: string };

/** OpenRouter model entry (client picks a chat model from these). */
export type ProviderModel = {
  id: string;
  name: string;
  kind: "chat" | "embedding";
};
