const { GoogleGenAI } = require("@google/genai");
const {
  embeddingProvider,
  embeddingDim,
  geminiApiKey,
  geminiEmbeddingModel,
  ollamaUrl,
  ollamaEmbeddingModel,
} = require("../config/env");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry on rate limits / temporary failures (waits 1s, 2s, 4s)
const withRetry = async (fn, retries = 3) => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= retries) throw error;
      await sleep(1000 * 2 ** attempt);
    }
  }
};

// Sends texts to the provider in small batches (each batch is retried on its own)
const embedInBatches = async (texts, batchSize, embedBatch) => {
  const vectors = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    vectors.push(...(await withRetry(() => embedBatch(batch))));
  }
  return vectors;
};

let geminiClient;
const getGemini = () => {
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is missing. Add it to .env or set EMBEDDING_PROVIDER=ollama.");
  }
  geminiClient ??= new GoogleGenAI({ apiKey: geminiApiKey });
  return geminiClient;
};

const geminiEmbed = (texts, taskType) => {
  const ai = getGemini(); // fail fast on a missing key, before any retry
  return embedInBatches(texts, 50, async (batch) => {
    const response = await ai.models.embedContent({
      model: geminiEmbeddingModel,
      contents: batch,
      config: { taskType, outputDimensionality: embeddingDim },
    });
    return response.embeddings.map((e) => e.values);
  });
};

const ollamaEmbed = (texts) =>
  embedInBatches(texts, 20, async (batch) => {
    const response = await fetch(`${ollamaUrl}/api/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: ollamaEmbeddingModel, input: batch }),
    });
    if (!response.ok) throw new Error(await response.text());
    return (await response.json()).embeddings;
  });

const providers = { gemini: geminiEmbed, ollama: ollamaEmbed };
const embedWithProvider = providers[embeddingProvider];

if (!embedWithProvider) {
  throw new Error(`Unknown EMBEDDING_PROVIDER "${embeddingProvider}". Use "gemini" or "ollama".`);
}

const embedMany = async (texts, taskType) => {
  try {
    const vectors = await embedWithProvider(texts, taskType);

    if (vectors.length !== texts.length) {
      throw new Error(`Expected ${texts.length} embeddings but got ${vectors.length}`);
    }
    if (vectors[0] && vectors[0].length !== embeddingDim) {
      throw new Error(`Embedding size ${vectors[0].length} does not match EMBEDDING_DIM=${embeddingDim}`);
    }
    return vectors;
  } catch (error) {
    throw new Error(`Failed to generate embeddings: ${error.message}`);
  }
};

// One question -> one vector
const generateEmbedding = async (text) => (await embedMany([text], "RETRIEVAL_QUERY"))[0];

// chunks -> same chunks with an `embedding` field
const generateEmbeddings = async (chunks) => {
  const vectors = await embedMany(
    chunks.map((chunk) => chunk.text),
    "RETRIEVAL_DOCUMENT"
  );
  return chunks.map((chunk, i) => ({ ...chunk, embedding: vectors[i] }));
};

module.exports = { generateEmbedding, generateEmbeddings };
