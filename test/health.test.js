import { test } from "node:test";
import assert from "node:assert/strict";
import { health } from "../src/server.js";

test("health reports the service and version", () => {
  const h = health();
  assert.equal(h.status, "ok");
  assert.equal(h.service, "deploy-to-prod-example");
  assert.match(h.version, /^\d+\.\d+\.\d+$/);
});
