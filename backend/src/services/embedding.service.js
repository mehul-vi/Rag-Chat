const { geminiApiKey, embeddingModel, embeddingDimensions } = require("../config/env");

async function generateEmbedding(text, taskType = "RETRIEVAL_DOCUMENT") {
  if (!geminiApiKey) throw new Error("GEMINI_API_KEY is missing in .env");
  const cleanText = String(text || "").trim();
  if (!cleanText) throw new Error("Cannot embed empty text");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(embeddingModel)}:embedContent?key=${encodeURIComponent(geminiApiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${embeddingModel}`,
        content: { parts: [{ text: cleanText }] },
        taskType,
        outputDimensionality: embeddingDimensions,
      }),
    }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Gemini embedding error (${response.status}): ${data.error?.message || "Request failed"}`);

  const vector = data.embedding?.values;
  if (!Array.isArray(vector) || vector.length !== embeddingDimensions) {
    throw new Error(`Embedding dimensions mismatch. Expected ${embeddingDimensions}, received ${vector?.length || 0}.`);
  }
  return vector;
}

async function mapConcurrent(items, concurrency, worker) {
  const output = new Array(items.length);
  let next = 0;
  async function run() {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      output[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
  return output;
}

async function generateEmbeddings(chunks) {
  return mapConcurrent(chunks, 3, async (chunk, index) => ({
    text: chunk.text,
    pageNumber: chunk.pageNumber,
    chunkIndex: chunk.chunkIndex ?? index,
    embedding: await generateEmbedding(chunk.text, "RETRIEVAL_DOCUMENT"),
  }));
}

module.exports = { generateEmbedding, generateEmbeddings };
