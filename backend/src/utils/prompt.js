const buildContext = (results, meta = {}) => {
  let header = "";
  if (meta.fileName || meta.totalPages) {
    header = `[Document Information: File "${meta.fileName || 'Uploaded Document'}" | Total Pages: ${meta.totalPages || 'Unknown'} | Total Indexed Chunks: ${meta.totalChunks || results.length}]\n\n`;
  }

  const passages = results
    .map((result, index) => {
      const { fileName, pageNumber, text } = result.payload;
      return `[Source ${index + 1} | ${fileName} | Page ${pageNumber}]\n${text}`;
    })
    .join("\n\n---\n\n");

  return header + (passages || "(No specific text passages matched)");
};

module.exports = { buildContext };
