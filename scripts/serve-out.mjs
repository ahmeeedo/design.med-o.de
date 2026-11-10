/**
 * Serves out/ locally the way nginx serves it in production: clean URLs (/docs/a → docs/a.html) and the 404 page with
 * status 404 for unknown paths. The Playwright tests start it; run it by hand with `node scripts/serve-out.mjs`.
 * Port: PORT, default 4173. No caching or compression – only the routing matters here.
 */
import { createReadStream, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';
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

const server = createServer((request, response) => {
  const path = new URL(request.url ?? '/', 'http://localhost').pathname;
  const file = resolveUrlPath(path);
  if (file) {
    response.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(response);
    return;
  }
  response.writeHead(404, { 'Content-Type': TYPES['.html'] });
  response.end(readFileSync(join(OUT, '404.html')));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Serving ${OUT} at http://127.0.0.1:${PORT}`);
});
