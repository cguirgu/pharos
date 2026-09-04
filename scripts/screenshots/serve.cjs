/**
 * Static server with SPA fallback, for screenshotting the web export.
 *
 * Usage: node scripts/screenshots/serve.cjs <dir> [port]
 *
 * Local tooling, not production — but it does read files off disk by request
 * path, so it is written to fail closed:
 *
 *  • The decoded path is RESOLVED and checked to be inside the root before any
 *    filesystem access, so `/../../etc/passwd` (or its percent-encoded forms)
 *    cannot escape the export directory.
 *  • Malformed percent-encoding returns 400 rather than throwing a URIError out
 *    of the request handler and killing the process.
 *  • It binds to loopback only.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(process.argv[2] || '.');
const PORT = Number(process.argv[3] || 8099);

const TYPES = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.mp3': 'audio/mpeg',
  '.map': 'application/json',
};

/** Resolve a request path inside ROOT, or null if it escapes / is malformed. */
function resolveInRoot(requestPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(requestPath);
  } catch {
    return null; // malformed percent-encoding, e.g. "/%"
  }
  if (decoded.includes('\0')) return null;
  const resolved = path.resolve(ROOT, '.' + path.posix.normalize(decoded));
  // `resolved === ROOT` is the directory itself; anything else must be under it.
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) return null;
  return resolved;
}

const server = http.createServer((req, res) => {
  const requestPath = (req.url || '/').split('?')[0];
  const resolved = resolveInRoot(requestPath);
  if (resolved === null) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    return res.end('Bad request path');
  }

  let file = resolved;
  try {
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      const asIndex = path.join(file, 'index.html');
      // SPA fallback: unknown client routes are served the app shell, which is
      // how expo-router paths like /faith resolve.
      file = fs.existsSync(asIndex) ? asIndex : path.join(ROOT, 'index.html');
    }
    const body = fs.readFileSync(file);
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server error');
  }
});

// Loopback only — this exists to be screenshotted by a local browser.
server.listen(PORT, '127.0.0.1', () => {
  console.log(`serving ${ROOT} on http://127.0.0.1:${PORT}`);
});
