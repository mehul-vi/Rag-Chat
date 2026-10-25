function chunkPages(pages, chunkSize = 1200, overlap = 180) {
  if (!Number.isInteger(chunkSize) || chunkSize < 100) throw new Error("chunkSize must be at least 100");
  if (!Number.isInteger(overlap) || overlap < 0 || overlap >= chunkSize) throw new Error("overlap must be smaller than chunkSize");

  const chunks = [];
  let chunkIndex = 0;
  for (const page of pages || []) {
    const text = String(page.text || "").replace(/\u0000/g, " ").trim();
    if (!text) continue;
    for (let start = 0; start < text.length; start += chunkSize - overlap) {
      const chunkText = text.slice(start, start + chunkSize).trim();
      if (chunkText) chunks.push({ text: chunkText, pageNumber: page.pageNumber || 1, chunkIndex: chunkIndex++ });
      if (start + chunkSize >= text.length) break;
    }
  }
  return chunks;
}

module.exports = { chunkPages };
