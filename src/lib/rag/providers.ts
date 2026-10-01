import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";

import type {
  ProviderModel,
  RagSettings,
  SettingsVerifyResult,
} from "@/types/rag";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export function createChatModel(settings: RagSettings): ChatOpenAI {
  if (!settings.chatModel) {
    throw new Error("Chat model is not configured.");
  }
  return new ChatOpenAI({
    model: settings.chatModel,
    apiKey: settings.openRouterKey,
    temperature: 0.2,
    maxRetries: 2,
    configuration: { baseURL: OPENROUTER_BASE_URL },
  });
}

export function createEmbeddings(settings: RagSettings): OpenAIEmbeddings {
  if (!settings.embedModel) {
    throw new Error("Embedding model is not configured.");
  }
  return new OpenAIEmbeddings({
    model: settings.embedModel,
    apiKey: settings.openRouterKey,
    maxRetries: 2,
    configuration: { baseURL: OPENROUTER_BASE_URL },
  });
}

function pinecone(settings: RagSettings): Pinecone {
  return new Pinecone({ apiKey: settings.pineconeKey });
}

/**
 * Fetch the OpenRouter model catalog and split it into chat vs embedding
 * entries. Embedding models live on a dedicated `/embeddings/models`
 * endpoint; the general `/models` catalog does not list them.
 */
export async function listModels(key: string): Promise<ProviderModel[]> {
  const headers = { Authorization: `Bearer ${key}` };
  const [chatRes, embedRes] = await Promise.all([
    fetch(`${OPENROUTER_BASE_URL}/models`, { headers }),
    fetch(`${OPENROUTER_BASE_URL}/embeddings/models`, { headers }),
  ]);
  if (!chatRes.ok) {
    throw new Error(`OpenRouter ${chatRes.status}: ${await chatRes.text()}`);
  }
  const chatJson = (await chatRes.json()) as {
    data?: { id: string; name?: string }[];
  };
  const models: ProviderModel[] = (chatJson.data ?? []).map((m) => ({
    id: m.id,
    name: m.name ?? m.id,
    kind: "chat",
  }));
  if (embedRes.ok) {
    const embedJson = (await embedRes.json()) as {
      data?: { id: string; name?: string }[];
    };
    models.push(
      ...(embedJson.data ?? []).map((m) => ({
        id: m.id,
        name: m.name ?? m.id,
        kind: "embedding" as const,
      })),
    );
  }
  return models;
}

/**
 * Verify the user's OpenRouter key (embedding probe) and the server's
 * knowledge base (read-only describeIndex — the index is never created
 * here; it is seeded by scripts/seed-corpus.mjs).
 */
export async function verifySettings(
  settings: RagSettings,
): Promise<SettingsVerifyResult> {
  const result: SettingsVerifyResult = {
    ok: false,
    openRouterOk: false,
    pineconeOk: false,
    indexExists: false,
  };

  try {
    if (!settings.embedModel) {
      throw new Error("EMBED_MODEL is not set on the server.");
    }
    const dim = (await createEmbeddings(settings).embedQuery("dimension probe"))
      .length;
    result.embedDim = dim;
    result.openRouterOk = true;
  } catch (e) {
    result.errors = {
      openRouter: e instanceof Error ? e.message : String(e),
    };
    return result;
  }

  try {
    if (!settings.pineconeKey) {
      throw new Error("PINECONE_API_KEY is not set on the server.");
    }
    const indexName = settings.pineconeIndex;
    const desc = await pinecone(settings).describeIndex(indexName);
    result.indexExists = true;
    result.indexName = desc.name || indexName;
    result.indexDim = desc.dimension;
    result.dimensionMismatch =
      result.embedDim !== undefined && desc.dimension !== result.embedDim;
    if (result.dimensionMismatch) {
      result.errors = {
        ...result.errors,
        pinecone: `Knowledge base index "${indexName}" holds ${desc.dimension}-dim vectors but EMBED_MODEL (${settings.embedModel}) produces ${result.embedDim}. Fix EMBED_MODEL or re-seed the index.`,
      };
    }
    result.pineconeOk = true;
    result.ok = !result.dimensionMismatch;
  } catch (e) {
    const raw = e instanceof Error ? e.message : String(e);
    const notFound =
      (e as { name?: string }).name === "PineconeNotFoundError" ||
      /\b404\b/.test(raw);
    result.errors = {
      ...result.errors,
      pinecone: notFound
        ? `Knowledge base index "${settings.pineconeIndex}" was not found on this Pinecone account. Seed it with \`pnpm exec node scripts/seed-corpus.mjs\`, or point PINECONE_INDEX at an existing index.`
        : raw,
    };
  }
  return result;
}
