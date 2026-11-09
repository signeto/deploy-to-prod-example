import { test } from "node:test";
import assert from "node:assert/strict";
import { health } from "../src/server.js";

test("health reports the service and version", () => {
  const h = health();
  assert.equal(h.status, "ok");
  assert.equal(h.service, "deploy-to-prod-example");
  assert.match(h.version, /^\d+\.\d+\.\d+$/);
});

test("health reports uptime in whole seconds", () => {
  const h = health();
  assert.ok(Number.isInteger(h.uptime_seconds));
  assert.ok(h.uptime_seconds >= 0);
});

test("health reports the region, local by default", () => {
  assert.equal(health().region, process.env.REGION ?? "local");
});
