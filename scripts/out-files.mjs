/**
 * The static export in out/ as the checks see it: which files are pages, and which file a URL serves.
 * resolveUrlPath follows nginx.conf (`try_files $uri $uri.html $uri/index.html =404`), so the axe test, the link
 * check and the local server find the same files as production. Pages are discovered, never listed by hand.
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const OUT = fileURLToPath(new URL('../out/', import.meta.url));

// Next writes the not-found page twice: 404.html, which nginx serves, and _not-found.html, an identical copy that
// no URL reaches. Only 404.html is checked.
const NOT_PAGES = new Set(['_not-found.html']);

const isFile = (path) => existsSync(path) && statSync(path).isFile();

function assertBuilt() {
  if (!existsSync(join(OUT, 'index.html'))) {
    throw new Error(`No static export in ${OUT}. Run "npm run build" first.`);
  }
}

/** Every page of the export as a path relative to out/ with forward slashes, e.g. "docs/overview/introduction.html". */
export function listPages() {
  assertBuilt();
  const pages = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) {
        if (name !== '_next') walk(path);
      } else if (name.endsWith('.html')) {
        const file = relative(OUT, path).split(sep).join('/');
        if (!NOT_PAGES.has(file)) pages.push(file);
      }
    }
  };
  walk(OUT);
  return pages.sort();
}

/** The clean URL of a page file: "index.html" → "/", "docs/a.html" → "/docs/a", "docs/index.html" → "/docs". */
export function pageUrl(file) {
  const path = file.replace(/(^|\/)index\.html$/, '').replace(/\.html$/, '');
  return `/${path}`;
}

/**
 * The opening tags of an HTML file with their attributes, e.g. [{ name: 'script', attributes: { src: '/a.js' } }].
 * Comments and the content of <script> and <style> are removed first, so code that mentions href="…" is not read
 * as a link. Next writes plain, quoted attributes, so no full HTML parser is needed.
 */
export function readTags(html) {
  const markup = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, '$1')
    .replace(/(<style\b[^>]*>)[\s\S]*?<\/style>/gi, '$1');
  const tags = [];
  for (const [, name, rest] of markup.matchAll(/<([a-zA-Z][\w-]*)\b([^>]*)>/g)) {
    const attributes = {};
    for (const [, key, , double, single, bare] of rest.matchAll(/([^\s=/>]+)(\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
      attributes[key.toLowerCase()] = decodeEntities(double ?? single ?? bare ?? '');
    }
    tags.push({ name: name.toLowerCase(), attributes });
  }
  return tags;
}

const decodeEntities = (value) =>
  value.replace(/&(amp|quot|#39|lt|gt);/g, (_, e) => ({ amp: '&', quot: '"', '#39': "'", lt: '<', gt: '>' })[e]);

/**
 * The file nginx serves for a URL path (without query or hash), or null for a 404.
 * Paths that leave out/ (e.g. "/../package.json") are a 404, as in nginx.
 */
export function resolveUrlPath(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  const base = resolve(OUT, `.${decoded.startsWith('/') ? decoded : `/${decoded}`}`);
  if (base !== OUT.replace(/[\\/]$/, '') && !base.startsWith(OUT)) return null;
  // With a trailing slash ("/docs/"), $uri and $uri.html never name a file, so only $uri/index.html can match.
  const candidates = decoded.endsWith('/') ? [join(base, 'index.html')] : [base, `${base}.html`, join(base, 'index.html')];
  for (const candidate of candidates) {
    if (isFile(candidate)) return candidate;
  }
  return null;
}
