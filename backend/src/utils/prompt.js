function buildContext(results) {
  return results.map((result, index) => {
    const payload = result.payload || {};
    return `SOURCE ${index + 1}
File: ${payload.fileName || "document.pdf"}
Page: ${payload.pageNumber ?? "N/A"}
Text:
${payload.text || ""}`;
  }).join("\n\n---\n\n");
}

module.exports = { buildContext };
