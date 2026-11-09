import { test } from "node:test";
import assert from "node:assert/strict";
import { handle } from "../src/server.js";

test("unknown paths get 404", () => {
  let status = 0;
  const res = { writeHead(c) { status = c; }, end() {} };
  handle({ method: "GET", url: "/nope" }, res);
  assert.equal(status, 404);
});
