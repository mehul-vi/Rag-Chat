const crypto = require("crypto");
const { extractPagesFromPDF } = require("../services/pdf.service");
const { chunkPages } = require("../services/chunk.service");
const { generateEmbeddings } = require("../services/embedding.service");
const { insertEmbeddings } = require("../models/vector.model");

async function uploadPDF(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Upload a PDF using form-data field name 'pdf'." });

    const pages = await extractPagesFromPDF(req.file.buffer);
    const readablePages = pages.filter((page) => String(page.text || "").trim());
    if (!readablePages.length) {
      return res.status(422).json({ success: false, message: "No readable text found. If this is a scanned PDF, configure GEMINI_API_KEY and keep PDF_VISION_ENABLED=true." });
    }

    const chunks = chunkPages(readablePages, 1200, 180);
    if (!chunks.length) return res.status(422).json({ success: false, message: "No searchable text chunks were created from this PDF." });

    const embeddings = await generateEmbeddings(chunks);
    const documentId = crypto.randomUUID();
    await insertEmbeddings(embeddings, req.file.originalname, documentId);

    return res.status(201).json({
      success: true,
      message: "PDF processed and indexed successfully.",
      documentId,
      fileName: req.file.originalname,
      totalPages: pages.length,
      indexedPages: readablePages.length,
      totalChunks: chunks.length,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { uploadPDF };
