const { GoogleGenAI } = require("@google/genai");

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
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is missing. Add it to .env.");
  }
  geminiClient ??= new GoogleGenAI({ apiKey: geminiApiKey });
  return geminiClient;
};

const geminiEmbed = (texts, taskType) => {
  const ai = getGemini(); // fail fast on a missing key, before any retry
  const geminiEmbeddingModel = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
  const embeddingDim = Number(process.env.EMBEDDING_DIM) || 768;

  return embedInBatches(texts, 50, async (batch) => {
    const response = await ai.models.embedContent({
      model: geminiEmbeddingModel,
      contents: batch,
      config: { taskType, outputDimensionality: embeddingDim },
    });
    return response.embeddings.map((e) => e.values);
  });
};

const embedMany = async (texts, taskType) => {
  try {
    const embeddingDim = Number(process.env.EMBEDDING_DIM) || 768;
    const vectors = await geminiEmbed(texts, taskType);

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
