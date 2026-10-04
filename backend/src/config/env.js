require("dotenv").config();

const num = (value, fallback) => {
  if (value === undefined || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

module.exports = {
  port: num(process.env.PORT, 5000),
  isProduction: process.env.NODE_ENV === "production",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  mongodbUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pdf-chat",

  qdrantUrl: process.env.QDRANT_URL || "http://localhost:6333",
  qdrantApiKey: process.env.QDRANT_API_KEY || undefined,
  collectionName: process.env.QDRANT_COLLECTION || "pdf_documents",

  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL || "openai/gpt-oss-120b",

  embeddingProvider: (process.env.EMBEDDING_PROVIDER || "gemini").trim().toLowerCase(),
  embeddingDim: num(process.env.EMBEDDING_DIM, 768),
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiEmbeddingModel: process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001",
  ollamaUrl: process.env.OLLAMA_URL || "http://localhost:11434",
  ollamaEmbeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text",

  topK: num(process.env.TOP_K, 5),
  minScore: num(process.env.MIN_SCORE, 0.35),
};
