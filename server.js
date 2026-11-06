// Tollgate local server — zero dependencies. `node server.js`, then http://localhost:3000
// Mirrors the Vercel functions in api/ so local and hosted behave the same.
const http = require("http");
const fs = require("fs");
const path = require("path");

(function loadEnv(file) {
  try {
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch (_) {}
})(path.join(__dirname, ".env"));

const { screen, scenario, SCENARIO } = require("./lib/handlers");

const PUBLIC = path.join(__dirname, "public");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };
const PORT = process.env.PORT || 3000;

function send(res, status, obj) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve) => {
    let buf = "";
    req.on("data", (c) => { buf += c; if (buf.length > 1e6) req.destroy(); });
    req.on("end", () => { try { resolve(buf ? JSON.parse(buf) : {}); } catch { resolve(null); } });
  });
}

http.createServer(async (req, res) => {
  const url = req.url.split("?")[0];
  const gate = url.match(/^\/api\/(protect|guard|inspect)$/);
  if (req.method === "GET" && url === "/api/scenario") return send(res, 200, SCENARIO);
  if (req.method === "POST" && (gate || url === "/api/scenario")) {
    const body = await readBody(req);
    if (body === null) return send(res, 400, { error: "Request body is not valid JSON." });
    try {
      const out = gate ? await screen(gate[1], body) : await scenario(body);
      return send(res, out.status, out.json);
    } catch (e) {
      return send(res, 500, { error: String(e.message || e) });
    }
  }
  const file = path.join(PUBLIC, url === "/" ? "index.html" : url);
  if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`\n  Tollgate  http://localhost:${PORT}`);
  console.log(`  Clocked key: ${process.env.CLOCKED_API_KEY ? "loaded" : "MISSING, add CLOCKED_API_KEY to .env"}\n`);
});
