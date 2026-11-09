import { test } from "node:test";
import assert from "node:assert/strict";
import { health, handle } from "../src/server.js";

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

test("health reports when the service started", () => {
  assert.ok(!Number.isNaN(Date.parse(health().started_at)));
});

test("health reports the Node.js version", () => {
  assert.equal(health().node, process.version);
});

test("GET /version returns the package version", () => {
  let body = "";
  const res = { writeHead() {}, end(b) { body = b; } };
  handle({ method: "GET", url: "/version" }, res);
  assert.match(body, /^\d+\.\d+\.\d+\n$/);
});

test("non-GET requests get 405 with an Allow header", () => {
  let status = 0, headers = {};
  const res = { writeHead(c, h) { status = c; headers = h; }, end() {} };
  handle({ method: "POST", url: "/health" }, res);
  assert.equal(status, 405);
  assert.equal(headers.allow, "GET");
});
