import { test } from "node:test";
import assert from "node:assert/strict";
import { handle } from "../src/server.js";

test("GET /ready answers 200", () => {
  let status = 0, body = "";
  const res = { writeHead(c) { status = c; }, end(b) { body = b; } };
  handle({ method: "GET", url: "/ready" }, res);
  assert.equal(status, 200);
  assert.equal(body, "ready\n");
});
