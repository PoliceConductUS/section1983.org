// Static server for the production build in dist/, used by the accessibility
// suite. It mirrors production routing: a directory serves its index.html, a
// path without a trailing slash serves the same page, and an unknown path
// returns 404.html. The port is strict: it exits if the port is taken, so
// tests never run against some other server.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("dist");
const PORT = Number(process.env.A11Y_PORT || 41983);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".pdf": "application/pdf",
  ".woff2": "font/woff2",
};

function resolveFile(urlPath) {
  const clean = path
    .normalize(decodeURIComponent(urlPath))
    .replace(/^(\.\.[/\\])+/, "");
  const target = path.join(ROOT, clean);
  if (!target.startsWith(ROOT)) return null;
  for (const candidate of [target, path.join(target, "index.html")]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
}

if (!fs.existsSync(path.join(ROOT, "index.html"))) {
  console.error("dist/index.html is missing. Run `npm run build` first.");
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  const file = resolveFile(pathname);
  const served = file ?? path.join(ROOT, "404.html");
  res.writeHead(file ? 200 : 404, {
    "Content-Type": TYPES[path.extname(served)] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  fs.createReadStream(served).pipe(res);
});

server.on("error", (error) => {
  console.error(`Cannot serve dist/ on port ${PORT}: ${error.message}`);
  process.exit(1);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Serving dist/ at http://127.0.0.1:${PORT}`);
});
