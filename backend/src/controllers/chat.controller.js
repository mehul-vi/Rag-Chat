const { generateEmbedding } = require("../services/embedding.service");
const { searchSimilarChunks } = require("../models/vector.model");
const { generateAnswer } = require("../services/llm.service");
const { buildContext } = require("../utils/prompt");
const { embeddingDimensions } = require("../config/env");

const TOP_K = Number(process.env.RAG_TOP_K || 6);
const MIN_SCORE = Number(process.env.RAG_MIN_SCORE || 0.25);

async function chat(req, res, next) {
  try {
    const question = typeof req.body?.question === "string" ? req.body.question.trim() : "";
    const documentId = typeof req.body?.documentId === "string" ? req.body.documentId.trim() : "";
    if (!question) return res.status(400).json({ success: false, message: "question is required." });
    if (!documentId) return res.status(400).json({ success: false, message: "documentId is required. Upload a PDF first." });
    if (question.length > 4000) return res.status(400).json({ success: false, message: "Question is too long (maximum 4000 characters)." });

    const queryEmbedding = await generateEmbedding(question, "RETRIEVAL_QUERY");
    if (queryEmbedding.length !== embeddingDimensions) throw new Error("Query embedding dimensions do not match the Qdrant collection.");

    const matches = await searchSimilarChunks(queryEmbedding, documentId, TOP_K);
    const results = matches.filter((item) => Number(item.score) >= MIN_SCORE);
    if (!results.length) {
      return res.json({
        success: true,
        question,
        answer: "I couldn't find enough relevant information in this PDF to answer confidently. Try rephrasing your question.",
        sources: [],
      });
    }

    const answer = await generateAnswer(question, buildContext(results));
    const sources = results.map((result) => ({
      fileName: result.payload?.fileName || "document.pdf",
      pageNumber: result.payload?.pageNumber ?? null,
      chunkIndex: result.payload?.chunkIndex ?? null,
      score: Number(Number(result.score).toFixed(3)),
      snippet: String(result.payload?.text || "").slice(0, 280),
    }));
    return res.json({ success: true, question, answer, sources });
  } catch (error) {
    return next(error);
  }
}

module.exports = { chat };
