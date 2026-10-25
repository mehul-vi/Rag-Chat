require("dotenv").config();

module.exports = {
  port: Number(process.env.PORT || 5000),
  qdrantUrl: process.env.QDRANT_URL || "http://localhost:6333",
  qdrantApiKey: process.env.QDRANT_API_KEY || undefined,
  groqApiKey: process.env.GROQ_API_KEY || undefined,
  groqModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  geminiApiKey: process.env.GEMINI_API_KEY || undefined,
  embeddingModel: process.env.EMBEDDING_MODEL || "gemini-embedding-001",
  embeddingDimensions: Number(process.env.EMBEDDING_DIMENSIONS || 768),
  visionModel: process.env.GEMINI_VISION_MODEL || "gemini-2.5-flash",
  // OCR runs only when a PDF page has little/no selectable text, keeping normal PDFs fast.
  pdfVisionEnabled: process.env.PDF_VISION_ENABLED !== "false",
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 15),
};
