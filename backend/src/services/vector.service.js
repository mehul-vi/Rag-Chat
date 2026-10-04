const crypto = require("crypto");
const { QdrantClient } = require("@qdrant/js-client-rest");
const { qdrantUrl, qdrantApiKey, collectionName, embeddingDim } = require("../config/env");

const client = new QdrantClient({ url: qdrantUrl, apiKey: qdrantApiKey });
const UPSERT_BATCH_SIZE = 100;

const createCollection = async () => {
  const { collections } = await client.getCollections();

  if (!collections.some((c) => c.name === collectionName)) {
    await client.createCollection(collectionName, {
      vectors: { size: embeddingDim, distance: "Cosine" },
    });
    console.log(`Collection "${collectionName}" created`);
  }

  // Index makes filtering by documentId fast. Calling it again is harmless.
  try {
    await client.createPayloadIndex(collectionName, {
      field_name: "documentId",
      field_schema: "keyword",
      wait: true,
    });
  } catch (error) {
    console.warn("Payload index note:", error.message);
  }
};

// Stores all chunks of one uploaded document with metadata
const storeEmbeddings = async (chunks, fileName, documentId, totalPages) => {
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
  const result = await client.query(collectionName, {
    query: queryEmbedding,
    limit,
    with_payload: true,
    filter: { must: [{ key: "documentId", match: { value: documentId } }] },
  });
  return result.points ?? [];
};

module.exports = { createCollection, storeEmbeddings, searchSimilarChunks };
