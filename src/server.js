// A tiny status service: the app this example deploys. GET /health reports what is running.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";

const startedAt = new Date().toISOString();
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

export function health() {
  return {
    status: "ok",
    service: pkg.name,
    version: pkg.version,
    commit: process.env.GIT_SHA ?? "dev",
    started_at: startedAt,
    uptime_seconds: Math.round(process.uptime()),
    node: process.version,
    region: process.env.REGION ?? "local",
  };
}

export function handle(req, res) {
  if (req.method !== "GET") {
    res.writeHead(405, { "content-type": "text/plain", allow: "GET" });
    res.end("method not allowed\n");
    return;
  }
  if (req.method === "GET" && req.url === "/version") {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end(`${pkg.version}\n`);
    return;
  }
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(health()));
    return;
  }
  res.writeHead(404, { "content-type": "text/plain" });
  res.end("not found\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 3000);
  createServer(handle).listen(port, () => console.log(`listening on http://localhost:${port}/health`));
}
