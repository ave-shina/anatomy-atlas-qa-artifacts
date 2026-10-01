import type { Index, RecordMetadata } from "@pinecone-database/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

import type { KnowledgeDocMeta, RagSettings } from "@/types/rag";

/**
 * Thin wrapper around the Pinecone SDK. Vectors live in the default
 * namespace; documents are isolated by metadata `docId` and vector-id prefix
 * `${docId}:${chunkIndex}` (see PRD §7.1, Q-3).
 */

const UPSERT_BATCH = 100;
const LIST_PAGE = 100;

export type ChunkMeta = {
  docId: string;
  docName: string;
  page: number;
  chunkIndex: number;
  text: string;
  structureKeys: string[];
  uploadedAt: number;
};

export type RetrievedChunk = ChunkMeta & { score: number };

function index(settings: RagSettings): Index {
  return new Pinecone({ apiKey: settings.pineconeKey }).index(
    settings.pineconeIndex,
  );
}

export async function upsertChunks(
  settings: RagSettings,
  vectors: { id: string; vector: number[]; meta: ChunkMeta }[],
): Promise<void> {
  const idx = index(settings);
  for (let i = 0; i < vectors.length; i += UPSERT_BATCH) {
    const batch = vectors.slice(i, i + UPSERT_BATCH);
    await idx.upsert({
      records: batch.map((v) => ({
        id: v.id,
        values: v.vector,
        metadata: v.meta as unknown as RecordMetadata,
      })),
    });
  }
}

export async function queryChunks(
  settings: RagSettings,
  opts: { vector: number[]; docIds: string[]; topK?: number },
): Promise<RetrievedChunk[]> {
  // docIds scopes retrieval to a document subset. The knowledge UI is gone,
  // so the client always sends [] — that now means "the whole owner index"
  // (no metadata filter) instead of "nothing".
  const res = await index(settings).query({
    vector: opts.vector,
    topK: opts.topK ?? 6,
    ...(opts.docIds.length > 0
      ? { filter: { docId: { $in: opts.docIds } } }
      : {}),
    includeMetadata: true,
  });
  return (res.matches ?? []).map((m) => ({
    ...(m.metadata as unknown as ChunkMeta),
    score: m.score ?? 0,
  }));
}

/** Page through all vector ids in the default namespace. */
async function listVectorIds(idx: Index): Promise<string[]> {
  const ids: string[] = [];
  let token: string | undefined;
  do {
    const page = await idx.listPaginated({
      limit: LIST_PAGE,
      paginationToken: token,
    });
    for (const v of page.vectors ?? []) if (v.id) ids.push(v.id);
    token = page.pagination?.next;
  } while (token);
  return ids;
}

export async function listDocs(
  settings: RagSettings,
): Promise<KnowledgeDocMeta[]> {
  const idx = index(settings);
  const ids = await listVectorIds(idx);
  const byDoc = new Map<string, { chunks: number; sampleId?: string }>();
  for (const id of ids) {
    const sep = id.indexOf(":");
    if (sep <= 0) continue;
    const docId = id.slice(0, sep);
    const entry = byDoc.get(docId) ?? { chunks: 0 };
    entry.chunks += 1;
    entry.sampleId ??= id;
    byDoc.set(docId, entry);
  }
  if (byDoc.size === 0) return [];

  // One fetch per doc gives us docName / uploadedAt from any chunk metadata.
  const docs: KnowledgeDocMeta[] = [];
  for (const [docId, entry] of byDoc) {
    try {
      const { records } = await idx.fetch({ ids: [entry.sampleId!] });
      const meta = records[entry.sampleId!]?.metadata as
        | Pick<ChunkMeta, "docName" | "uploadedAt">
        | undefined;
      docs.push({
        docId,
        docName: meta?.docName ?? docId,
        chunks: entry.chunks,
        uploadedAt: meta?.uploadedAt ?? 0,
      });
    } catch {
      docs.push({ docId, docName: docId, chunks: entry.chunks, uploadedAt: 0 });
    }
  }
  return docs.sort((a, b) => b.uploadedAt - a.uploadedAt);
}

export async function deleteDoc(
  settings: RagSettings,
  docId: string,
): Promise<void> {
  const idx = index(settings);
  const ids = (await listVectorIds(idx)).filter((id) =>
    id.startsWith(`${docId}:`),
  );
  if (ids.length === 0) return;
  for (let i = 0; i < ids.length; i += UPSERT_BATCH) {
    await idx.deleteMany({ ids: ids.slice(i, i + UPSERT_BATCH) });
  }
}
