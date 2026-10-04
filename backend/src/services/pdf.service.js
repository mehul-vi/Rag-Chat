const { PDFParse } = require("pdf-parse");
const httpError = require("../utils/httpError");

// Returns [{ pageNumber, text }] for every page that has text
const extractPagesFromPDF = async (buffer) => {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });

  try {
    const { pages } = await parser.getText();
    return pages
      .map((page, index) => ({
        pageNumber: page.num ?? index + 1,
        text: (page.text || "").replace(/\s+\n/g, "\n").trim(),
      }))
      .filter((page) => page.text);
  } catch {
    throw httpError(422, "Could not read this PDF. It may be corrupted or password-protected.");
  } finally {
    await parser.destroy();
  }
};

module.exports = { extractPagesFromPDF };
