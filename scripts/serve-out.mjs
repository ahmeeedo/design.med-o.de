/**
 * Serves out/ locally the way nginx serves it in production: clean URLs (/docs/a → docs/a.html), the 404 page with
 * status 404 for unknown paths, and gzip as in nginx.conf (level 6, files from 1 KB, HTML and the text types listed
 * there), so Lighthouse measures the bytes a visitor downloads. No caching headers. The Playwright tests and
 * Lighthouse start it; run it by hand with `node scripts/serve-out.mjs`. Port: PORT, default 4173.
 */
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';
import { createGzip } from 'node:zlib';
import { OUT, resolveUrlPath } from './out-files.mjs';

const PORT = Number(process.env.PORT ?? 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
};

/** What nginx compresses: text/html always, plus gzip_types (nginx serves .js as application/javascript). */
const GZIP = new Set(['.html', '.js', '.css', '.json', '.txt', '.svg']);
const GZIP_MIN_BYTES = 1024;

/** Sends a file, gzipped when nginx would gzip it and the client accepts it. */
function send(request, response, status, file) {
  const type = TYPES[extname(file)] ?? 'application/octet-stream';
  const compress =
    GZIP.has(extname(file)) &&
    statSync(file).size >= GZIP_MIN_BYTES &&
    /\bgzip\b/.test(request.headers['accept-encoding'] ?? '');
  if (!compress) {
    response.writeHead(status, { 'Content-Type': type });
    createReadStream(file).pipe(response);
    return;
  }
  response.writeHead(status, { 'Content-Type': type, 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' });
  createReadStream(file).pipe(createGzip({ level: 6 })).pipe(response);
}

const server = createServer((request, response) => {
  const path = new URL(request.url ?? '/', 'http://localhost').pathname;
  const file = resolveUrlPath(path);
  if (file) send(request, response, 200, file);
  else send(request, response, 404, join(OUT, '404.html'));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Serving ${OUT} at http://127.0.0.1:${PORT}`);
});
