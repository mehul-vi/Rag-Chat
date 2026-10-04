const crypto = require("crypto");
const { extractPagesFromPDF } = require("../services/pdf.service");
const { chunkPages } = require("../services/chunk.service");
const { generateEmbeddings } = require("../services/embedding.service");
const { storeEmbeddings } = require("../services/vector.service");

const uploadPDF = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "PDF file is required" });
  }

  const pages = await extractPagesFromPDF(req.file.buffer);
  const chunks = chunkPages(pages);

  if (!chunks.length) {
    return res.status(422).json({
      success: false,
      message: "The PDF has no extractable text (scanned PDFs are not supported)",
    });
  }

  const documentId = crypto.randomUUID();
  const embeddedChunks = await generateEmbeddings(chunks);
  await storeEmbeddings(embeddedChunks, req.file.originalname, documentId, pages.length);

  res.json({
    success: true,
    message: "PDF processed successfully",
    documentId,
    fileName: req.file.originalname,
    totalPages: pages.length,
    totalChunks: chunks.length,
  });
};

module.exports = { uploadPDF };
