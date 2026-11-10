/**
 * Internal link check on the static export: every href and src in every page of out/ must reach a file, resolved
 * like nginx does (clean URLs, see out-files.mjs). Fails with a list of page → broken target.
 * Skipped: external URLs (http:, https:, //), mailto:, tel:, data:, javascript: and anchors on the same page (#…).
 * Anchors on other pages are not checked – only that the page exists.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { OUT, listPages, pageUrl, readTags, resolveUrlPath } from './out-files.mjs';

const EXTERNAL = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;
const ATTRIBUTES = ['href', 'src'];

const pages = listPages();
const broken = [];
let checked = 0;

for (const file of pages) {
  const page = pageUrl(file);
  for (const { attributes } of readTags(readFileSync(join(OUT, file), 'utf8'))) {
    for (const attribute of ATTRIBUTES) {
      const value = attributes[attribute]?.trim();
      if (!value || value.startsWith('#') || EXTERNAL.test(value)) continue;
      checked += 1;
      const { pathname } = new URL(value, `http://site${page}`);
      if (!resolveUrlPath(pathname)) broken.push(`${page} → ${value}`);
    }
  }
}

if (broken.length) {
  console.error(`Broken internal links (${broken.length}):\n${broken.map((b) => `  ${b}`).join('\n')}`);
  process.exit(1);
}
console.log(`Links: ${checked} internal links on ${pages.length} pages, all reach a file.`);
