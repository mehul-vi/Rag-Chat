const test = require("node:test");
const assert = require("node:assert");
const { chunkPages } = require("../src/services/chunk.service");

test("keeps page numbers and creates sequential chunk indexes", () => {
  const pages = [
    { pageNumber: 1, text: "word ".repeat(500) },
    { pageNumber: 2, text: "short page" },
  ];
  const chunks = chunkPages(pages, 1000, 200);

  assert.ok(chunks.length > 2);
  assert.strictEqual(chunks[chunks.length - 1].pageNumber, 2);
  chunks.forEach((c, i) => assert.strictEqual(c.chunkIndex, i));
});

test("chunks never exceed the chunk size", () => {
  const chunks = chunkPages([{ pageNumber: 1, text: "abc ".repeat(1000) }], 300, 50);
  chunks.forEach((c) => assert.ok(c.text.length <= 300));
});

test("consecutive chunks overlap", () => {
  const text = Array.from({ length: 400 }, (_, i) => `w${i}`).join(" ");
  const chunks = chunkPages([{ pageNumber: 1, text }], 200, 50);
  const lastWordOfFirst = chunks[0].text.split(" ").pop();
  assert.ok(chunks[1].text.includes(lastWordOfFirst));
});

test("text shorter than the chunk size gives exactly one chunk", () => {
  const chunks = chunkPages([{ pageNumber: 3, text: "  hello world  " }]);
  assert.deepStrictEqual(chunks, [{ text: "hello world", pageNumber: 3, chunkIndex: 0 }]);
});

test("cuts at a newline when there are no spaces", () => {
  const text = "a".repeat(80) + "\n" + "b".repeat(80);
  const chunks = chunkPages([{ pageNumber: 1, text }], 100, 10);
  assert.strictEqual(chunks[0].text, "a".repeat(80));
});

test("text with no whitespace at all is still split and never loops forever", () => {
  const chunks = chunkPages([{ pageNumber: 1, text: "x".repeat(2500) }], 1000, 200);
  assert.ok(chunks.length >= 3);
  chunks.forEach((c) => assert.ok(c.text.length <= 1000));
});

test("skips empty pages and an empty page list", () => {
  assert.deepStrictEqual(chunkPages([]), []);
  assert.deepStrictEqual(chunkPages([{ pageNumber: 1, text: "   " }]), []);
});

test("rejects bad overlap", () => {
  assert.throws(() => chunkPages([{ pageNumber: 1, text: "x" }], 100, 100));
});
