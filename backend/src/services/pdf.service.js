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
    const result = await parser.getText();
    const pages = result?.pages || [];
    
    // Fallback: If result.pages is not available but result.text is
    if ((!pages || pages.length === 0) && result?.text?.trim()) {
      return [{ pageNumber: 1, text: result.text.trim() }];
    }

    return pages
      .map((page, index) => ({
        pageNumber: page.num ?? index + 1,
        text: (page.text || "").replace(/\s+\n/g, "\n").trim(),
      }))
      .filter((page) => page.text);
  } catch (err) {
    console.error("PDF Parsing Failure Detail:", err);
    throw httpError(422, `Could not read this PDF: ${err?.message || "File may be corrupted or password-protected."}`);
  } finally {
    try {
      await parser?.destroy?.();
    } catch (_) {
      // Safe cleanup
    }
  }
};

module.exports = { extractPagesFromPDF };
