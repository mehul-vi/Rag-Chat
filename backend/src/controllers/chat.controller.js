const { generateEmbedding } = require("../services/embedding.service");
const { searchSimilarChunks } = require("../services/vector.service");
const { generateAnswer } = require("../services/llm.service");
const { buildContext } = require("../utils/prompt");
const { topK, minScore } = require("../config/env");

const MAX_QUESTION_LENGTH = 1000;

const badRequest = (res, message) => res.status(400).json({ success: false, message });

const toSource = ({ score, payload }) => ({
  fileName: payload.fileName,
  pageNumber: payload.pageNumber,
  chunkIndex: payload.chunkIndex,
  score: Number(score.toFixed(3)),
  snippet: payload.text.slice(0, 200),
});

// Detect metadata questions (e.g., page count, file name)
const isMetaQuery = (text) => {
  const lower = text.toLowerCase();
  return (
    lower.includes("how many pages") ||
    lower.includes("page count") ||
    lower.includes("number of pages") ||
    lower.includes("total pages") ||
    lower.includes("name of this file") ||
    lower.includes("filename") ||
    lower.includes("what is the file")
  );
};

const chat = async (req, res) => {
  const { question: rawQuestion, documentId } = req.body ?? {};
  const question = typeof rawQuestion === "string" ? rawQuestion.trim() : "";

  if (!question) return badRequest(res, "Question is required");
  if (question.length > MAX_QUESTION_LENGTH) {
    return badRequest(res, `Question is too long (max ${MAX_QUESTION_LENGTH} characters)`);
  }
  if (!documentId || typeof documentId !== "string") {
    return badRequest(res, "documentId is required. Upload a PDF first.");
  }

  const queryEmbedding = await generateEmbedding(question);
  const matches = await searchSimilarChunks(queryEmbedding, documentId, topK);

  // Weak matches are dropped
  const results = matches.filter((match) => match.score >= minScore);

  // Extract document metadata from matched chunks
  const samplePayload = matches[0]?.payload || {};
  const maxPageFromMatches = matches.length
    ? Math.max(...matches.map((m) => m.payload?.pageNumber || 1))
    : 1;

  const docMeta = {
    fileName: samplePayload.fileName || "",
    totalPages: samplePayload.totalPages || maxPageFromMatches,
    totalChunks: samplePayload.totalChunks || matches.length,
  };

  const context = buildContext(results, docMeta);
  const { answer, usedDocument } = await generateAnswer(question, context);

  // For pure metadata questions (like "how many pages are in this PDF?"), don't show noisy page snippet citations
  const isMetadata = isMetaQuery(question);
  const sources = usedDocument && !isMetadata ? results.map(toSource) : [];

  res.json({ success: true, question, answer, sources });
};

module.exports = { chat };