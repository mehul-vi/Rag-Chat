const test = require("node:test");
const assert = require("node:assert");
const http = require("node:http");

const app = require("../src/app");

// Small helper: sends a request and parses the JSON reply.
// `body` is sent as JSON; use `raw` + `headers` to send anything else.
const request = (server, path, { method = "GET", body, raw, headers } = {}) =>
  new Promise((resolve, reject) => {
    const { port } = server.address();
    const req = http.request(
      { port, path, method, headers: { "Content-Type": "application/json", ...headers } },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
      }
    );
    req.on("error", reject);
    const payload = raw ?? (body && JSON.stringify(body));
    if (payload) req.write(payload);
    req.end();
  });

const postChat = (server, body) => request(server, "/api/chat", { method: "POST", body });

test("API validation", async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());

  await t.test("health check", async () => {
    const res = await request(server, "/health");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, "ok");
  });

  await t.test("chat rejects empty question", async () => {
    const res = await postChat(server, { question: " ", documentId: "x" });
    assert.strictEqual(res.status, 400);
  });

  await t.test("chat rejects a question that is not a string", async () => {
    const res = await postChat(server, { question: 123, documentId: "x" });
    assert.strictEqual(res.status, 400);
  });

  await t.test("chat rejects a too long question", async () => {
    const res = await postChat(server, { question: "a".repeat(1001), documentId: "x" });
    assert.strictEqual(res.status, 400);
  });

  await t.test("chat requires documentId", async () => {
    const res = await postChat(server, { question: "hi" });
    assert.strictEqual(res.status, 400);
  });

  await t.test("chat rejects invalid JSON with 400", async () => {
    const res = await request(server, "/api/chat", { method: "POST", raw: "{ not json" });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  await t.test("upload requires a file", async () => {
    const res = await request(server, "/api/pdf/upload", { method: "POST" });
    assert.strictEqual(res.status, 400);
  });

  await t.test("upload rejects non-PDF files", async () => {
    const boundary = "testboundary";
    const raw =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="pdf"; filename="notes.txt"\r\n` +
      `Content-Type: text/plain\r\n\r\nhello\r\n` +
      `--${boundary}--\r\n`;

    const res = await request(server, "/api/pdf/upload", {
      method: "POST",
      raw,
      headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
    });
    assert.strictEqual(res.status, 400);
    assert.match(res.body.message, /Only PDF/);
  });
});
