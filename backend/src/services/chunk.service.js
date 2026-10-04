// Finds where to end a chunk: the last space/newline in the second half of the
// chunk, so words are not cut in half. Falls back to a hard cut.
const findCutPoint = (text, start, end, chunkSize) => {
  const lastBreak = Math.max(text.lastIndexOf(" ", end), text.lastIndexOf("\n", end));
  return lastBreak > start + chunkSize / 2 ? lastBreak : end;
};

// Splits one page's text into overlapping pieces
const splitText = (text, chunkSize, overlap) => {
  const pieces = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + chunkSize, text.length);
    if (end < text.length) end = findCutPoint(text, start, end, chunkSize);

    const piece = text.slice(start, end).trim();
    if (piece) pieces.push(piece);

    if (end >= text.length) break;
    start = Math.max(end - overlap, start + 1); // always move forward
  }

  return pieces;
};

// pages: [{ pageNumber, text }] -> [{ text, pageNumber, chunkIndex }]
const chunkPages = (pages, chunkSize = 1000, overlap = 200) => {
  if (overlap >= chunkSize) {
    throw new Error("overlap must be smaller than chunkSize");
  }

  const chunks = [];

  for (const { pageNumber, text } of pages) {
    for (const piece of splitText((text ?? "").trim(), chunkSize, overlap)) {
      chunks.push({ text: piece, pageNumber, chunkIndex: chunks.length });
    }
  }

  return chunks;
};

module.exports = { chunkPages };
