const { QdrantClient } = require("@qdrant/js-client-rest");
const crypto = require("crypto");
const { qdrantUrl, qdrantApiKey, embeddingDimensions } = require("../config/env");

const COLLECTION_NAME = process.env.QDRANT_COLLECTION || "pdf_documents";
const client = new QdrantClient({ url: qdrantUrl, apiKey: qdrantApiKey, checkCompatibility: false });

async function initCollection() {
  const { collections } = await client.getCollections();
  const exists = collections.some((collection) => collection.name === COLLECTION_NAME);

  if (!exists) {
    await client.createCollection(COLLECTION_NAME, {
      vectors: { size: embeddingDimensions, distance: "Cosine" },
    });
    console.log(`[Qdrant] Created ${COLLECTION_NAME} (${embeddingDimensions} dimensions)`);
  } else {
    const info = await client.getCollection(COLLECTION_NAME);
    const vectorConfig = info.config?.params?.vectors;
    const actualSize = typeof vectorConfig?.size === "number" ? vectorConfig.size : null;
    if (actualSize && actualSize !== embeddingDimensions) {
      throw new Error(`Qdrant collection '${COLLECTION_NAME}' has ${actualSize}-dimension vectors; configured embeddings use ${embeddingDimensions}. Set a new QDRANT_COLLECTION name or match the dimensions.`);
    }
    console.log(`[Qdrant] ${COLLECTION_NAME} ready`);
  }

  try {
    await client.createPayloadIndex(COLLECTION_NAME, {
      field_name: "documentId", field_schema: "keyword", wait: true,
    });
  } catch (error) {
    if (!/already exists|exists/i.test(error.message || "")) throw error;
  }
}

async function insertEmbeddings(embeddings, fileName, documentId) {
  if (!embeddings.length) throw new Error("No text chunks were embedded");
  const points = embeddings.map((item) => ({
    id: crypto.randomUUID(),
    vector: item.embedding,
    payload: { fileName, documentId, pageNumber: item.pageNumber, chunkIndex: item.chunkIndex, text: item.text },
  }));
  for (let i = 0; i < points.length; i += 100) {
    await client.upsert(COLLECTION_NAME, { wait: true, points: points.slice(i, i + 100) });
  }
  return points.length;
}

async function searchSimilarChunks(queryEmbedding, documentId, limit = 5) {
  const filter = documentId ? { must: [{ key: "documentId", match: { value: documentId } }] } : undefined;
  const result = await client.query(COLLECTION_NAME, { query: queryEmbedding, limit, with_payload: true, filter });
  return result.points || [];
}

module.exports = { client, COLLECTION_NAME, initCollection, insertEmbeddings, searchSimilarChunks };
