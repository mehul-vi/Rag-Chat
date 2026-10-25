const { PDFParse } = require("pdf-parse");
const { geminiApiKey, visionModel, pdfVisionEnabled } = require("../config/env");

function httpError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function extractSelectableText(buffer) {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    return (result.pages || []).map((page, index) => ({
      pageNumber: Number(page.num) || index + 1,
      text: String(page.text || "").replace(/\u0000/g, " ").trim(),
    }));
  } finally {
    await parser.destroy().catch(() => {});
  }
}

async function extractScannedPdf(buffer, textPages) {
  if (!geminiApiKey) {
    throw httpError(
      "This PDF appears scanned or image-based. Add GEMINI_API_KEY to enable OCR, or upload a PDF with selectable text.",
      422
    );
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(visionModel)}:generateContent?key=${encodeURIComponent(geminiApiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { inline_data: { mime_type: "application/pdf", data: buffer.toString("base64") } },
            { text: "Read this PDF page by page. Extract readable text, including text in scanned pages, screenshots, tables and diagrams. Do not guess unreadable content. Return only valid JSON: {\"pages\":[{\"pageNumber\":1,\"text\":\"extracted text and concise useful description of visual content\"}]}. Include every page and use actual 1-based page numbers." },
          ],
        }],
        generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
      }),
    }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw httpError(`PDF OCR failed (${response.status}): ${data.error?.message || "Gemini request failed"}`, 422);
  }

  const raw = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n").trim();
  if (!raw) throw httpError("OCR returned no readable content for this PDF.", 422);

  let parsed;
  try {
    parsed = JSON.parse(raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""));
  } catch {
    throw httpError("OCR returned an invalid response. Try a smaller or clearer PDF.", 422);
  }
  if (!Array.isArray(parsed.pages)) throw httpError("OCR did not return page-level text.", 422);

  const ocrByPage = new Map(parsed.pages.map((page, index) => [
    Number(page.pageNumber) || index + 1,
    String(page.text || page.extractedText || "").trim(),
  ]));
  const pageCount = Math.max(textPages.length, ...ocrByPage.keys(), 0);

  return Array.from({ length: pageCount }, (_, index) => {
    const pageNumber = index + 1;
    const original = textPages.find((page) => page.pageNumber === pageNumber)?.text || "";
    const ocrText = ocrByPage.get(pageNumber) || "";
    // Keep exact selectable text; use OCR as a fallback for pages without useful text.
    return { pageNumber, text: original.length >= 40 ? original : (ocrText || original) };
  });
}

async function extractPagesFromPDF(buffer) {
  if (!buffer?.length) throw httpError("Uploaded PDF is empty.");
  if (!buffer.subarray(0, 1024).toString("binary").includes("%PDF")) {
    throw httpError("Invalid PDF file. Please upload a valid PDF.");
  }

  let pages;
  try {
    pages = await extractSelectableText(buffer);
  } catch (error) {
    if (!pdfVisionEnabled) throw httpError(`Could not read PDF: ${error.message}`, 422);
    return extractScannedPdf(buffer, []);
  }

  const hasUsefulText = pages.some((page) => page.text.length >= 40);
  const hasEmptyPages = pages.some((page) => page.text.length < 40);
  // Fast path for regular text PDFs; OCR only if text is missing/scanned.
  if (pdfVisionEnabled && (!hasUsefulText || hasEmptyPages)) {
    try {
      return await extractScannedPdf(buffer, pages);
    } catch (error) {
      if (!hasUsefulText) throw error;
      console.warn(`[PDF OCR skipped] ${error.message}`);
      return pages;
    }
  }
  return pages;
}

module.exports = { extractPagesFromPDF };
