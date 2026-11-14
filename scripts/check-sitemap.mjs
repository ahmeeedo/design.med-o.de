/**
 * Sitemap check: out/sitemap.xml must list every page of the static export, and nothing else. Pages are the HTML files
 * in out/ as scripts/out-files.mjs finds them, without 404.html and the search index (pagefind/), mapped to their clean
 * URL. The check fails with the differences in both directions, and when out/robots.txt does not name the sitemap.
 * Run it after `npm run build`. Node's own modules only, so CI runs it without npm ci.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { OUT, listPages, pageUrl } from './out-files.mjs';

const NOT_LISTED = new Set(['404.html']);

const sitemapFile = join(OUT, 'sitemap.xml');
if (!existsSync(sitemapFile)) {
  console.error('Sitemap: out/sitemap.xml is missing. Run "npm run build" first; app/sitemap.ts writes it.');
  process.exit(1);
}

const urls = [...readFileSync(sitemapFile, 'utf8').matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => new URL(m[1]));
const origins = new Set(urls.map((url) => url.origin));
const listed = urls.map((url) => decodeURIComponent(url.pathname));
const pages = listPages()
  .filter((file) => !NOT_LISTED.has(file) && !file.startsWith('pagefind/'))
  .map(pageUrl);

const problems = [];
const missing = pages.filter((path) => !listed.includes(path));
const extra = listed.filter((path) => !pages.includes(path));
const duplicates = listed.filter((path, index) => listed.indexOf(path) !== index);
if (missing.length) problems.push(`Pages missing from the sitemap:\n${missing.map((p) => `  ${p}`).join('\n')}`);
if (extra.length) problems.push(`Sitemap entries without a page in out/:\n${extra.map((p) => `  ${p}`).join('\n')}`);
if (duplicates.length) problems.push(`Sitemap entries listed twice:\n${duplicates.map((p) => `  ${p}`).join('\n')}`);
if (origins.size > 1) problems.push(`Sitemap entries use more than one host: ${[...origins].join(', ')}`);

const [origin] = origins;
const robotsFile = join(OUT, 'robots.txt');
const robots = existsSync(robotsFile) ? readFileSync(robotsFile, 'utf8') : '';
const expected = `${origin}/sitemap.xml`;
if (!new RegExp(`^Sitemap:\\s*${expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'mi').test(robots)) {
  problems.push(`out/robots.txt does not name the sitemap: expected "Sitemap: ${expected}".`);
}

if (problems.length) {
  console.error(`Sitemap: ${problems.length} problem(s).\n\n${problems.join('\n\n')}`);
  process.exit(1);
}
console.log(`Sitemap: ${listed.length} URLs on ${origin}, one per page in out/; robots.txt names the sitemap.`);
