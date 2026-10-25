const httpError = (status, message) => Object.assign(new Error(message), { status });

let PDFParseClass = null;
const getPDFParse = async () => {
  if (!PDFParseClass) {
    const pdfParseModule = await import("pdf-parse");
    PDFParseClass = pdfParseModule.PDFParse || pdfParseModule.default?.PDFParse || pdfParseModule.default || pdfParseModule;
  }
  return PDFParseClass;
};

// Returns [{ pageNumber, text }] for every page that has text
const extractPagesFromPDF = async (buffer) => {
  const PDFParse = await getPDFParse();
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
