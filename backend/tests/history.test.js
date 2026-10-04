const test = require("node:test");
const assert = require("node:assert");
const http = require("node:http");

const app = require("../src/app");

const request = (server, path, { method = "GET", body } = {}) =>
  new Promise((resolve, reject) => {
    const { port } = server.address();
    const req = http.request(
      { port, path, method, headers: { "Content-Type": "application/json" } },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
      }
    );
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });

test("History API validation", async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());

  await t.test("GET /api/history requires uid", async () => {
    const res = await request(server, "/api/history");
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /uid.*required/i);
  });

  await t.test("POST /api/history requires uid", async () => {
    const res = await request(server, "/api/history", {
      method: "POST",
      body: { title: "Test Chat", messages: [] },
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /uid.*required/i);
  });
});
