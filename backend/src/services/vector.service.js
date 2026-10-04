const crypto = require("crypto");
const { QdrantClient } = require("@qdrant/js-client-rest");

const getCollectionName = () => process.env.QDRANT_COLLECTION || "pdf_documents";
const getEmbeddingDim = () => Number(process.env.EMBEDDING_DIM) || 768;

let qdrantClient = null;
const getClient = () => {
  if (!qdrantClient) {
    const url = process.env.QDRANT_URL || "http://localhost:6333";
    const apiKey = process.env.QDRANT_API_KEY || undefined;
    qdrantClient = new QdrantClient({ url, apiKey });
  }
  return qdrantClient;
};

const UPSERT_BATCH_SIZE = 100;
let collectionChecked = false;

const createCollection = async () => {
  try {
    const client = getClient();
    const collectionName = getCollectionName();
    const embeddingDim = getEmbeddingDim();
    const { collections } = await client.getCollections();

    if (!collections.some((c) => c.name === collectionName)) {
      await client.createCollection(collectionName, {
        vectors: { size: embeddingDim, distance: "Cosine" },
      });
      console.log(`Collection "${collectionName}" created`);
    }

    try {
      await client.createPayloadIndex(collectionName, {
        field_name: "documentId",
        field_schema: "keyword",
        wait: true,
      });
    } catch (error) {
      console.warn("Payload index note:", error.message);
    }
    collectionChecked = true;
  } catch (err) {
    console.warn("Qdrant collection check note:", err.message);
  }
};

const ensureCollection = async () => {
  if (!collectionChecked) {
    await createCollection();
  }
};

// Stores all chunks of one uploaded document with metadata
const storeEmbeddings = async (chunks, fileName, documentId, totalPages) => {
  await ensureCollection();
  const client = getClient();
  const collectionName = getCollectionName();
  const totalPagesCount = totalPages || chunks[chunks.length - 1]?.pageNumber || 1;
  const points = chunks.map((chunk) => ({
    id: crypto.randomUUID(),
    vector: chunk.embedding,
    payload: {
      text: chunk.text,
      fileName,
      documentId,
      pageNumber: chunk.pageNumber,
      chunkIndex: chunk.chunkIndex,
      totalPages: totalPagesCount,
      totalChunks: chunks.length,
    },
  }));

  for (let i = 0; i < points.length; i += UPSERT_BATCH_SIZE) {
    await client.upsert(collectionName, {
      wait: true,
      points: points.slice(i, i + UPSERT_BATCH_SIZE),
    });
  }
};

// Searches only inside one document, so users never see other PDFs
const searchSimilarChunks = async (queryEmbedding, documentId, limit) => {
  await ensureCollection();
  const client = getClient();
  const collectionName = getCollectionName();
  const result = await client.query(collectionName, {
    query: queryEmbedding,
    limit,
    with_payload: true,
    filter: { must: [{ key: "documentId", match: { value: documentId } }] },
  });
  return result.points ?? [];
};

module.exports = { createCollection, ensureCollection, storeEmbeddings, searchSimilarChunks };
