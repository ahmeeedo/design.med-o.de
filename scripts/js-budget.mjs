/**
 * JavaScript budget: for every page in out/, the gzip size of the scripts it loads when it opens.
 * The concept proposes at most 100 kB per page. BUDGET_KB starts at null (report only); set it once the real pages
 * are measured, and the check fails above it.
 *
 * Counted: <script src>, <link rel="modulepreload"> and <link rel="preload" as="script">, each file once per page.
 * Not counted: <script nomodule> (legacy polyfills, modern browsers skip them), inline scripts (Next's page data,
 * part of the HTML) and chunks loaded later on demand. Gzip at level 6, the same level nginx uses.
 * In CI the table also goes to the job summary.
 */
import { appendFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { OUT, listPages, pageUrl, readTags, resolveUrlPath } from './out-files.mjs';

/** Maximum gzip kB of JavaScript per page, or null to report only. */
const BUDGET_KB = null;

const scriptsOf = (tags) =>
  tags.flatMap(({ name, attributes: a }) => {
    if (name === 'script' && a.src && !('nomodule' in a)) return [a.src];
    if (name === 'link' && a.href && (a.rel === 'modulepreload' || (a.rel === 'preload' && a.as === 'script'))) return [a.href];
    return [];
  });

const rows = [];
const missing = [];
for (const file of listPages()) {
  const urls = [...new Set(scriptsOf(readTags(readFileSync(join(OUT, file), 'utf8'))))];
  let bytes = 0;
  for (const src of urls) {
    const target = resolveUrlPath(new URL(src, `http://site${pageUrl(file)}`).pathname);
    if (!target) missing.push(`${pageUrl(file)} → ${src}`);
    else bytes += gzipSync(readFileSync(target), { level: 6 }).length;
  }
  rows.push({ page: pageUrl(file), scripts: urls.length, kb: bytes / 1000 });
}

const over = BUDGET_KB === null ? [] : rows.filter((r) => r.kb > BUDGET_KB);
const limit = BUDGET_KB === null ? 'no limit set (report only)' : `limit ${BUDGET_KB} kB`;
const table = [
  `| Page | Scripts | gzip kB |`,
  `| --- | ---: | ---: |`,
  ...rows.map((r) => `| ${r.page} | ${r.scripts} | ${r.kb.toFixed(1)}${over.includes(r) ? ' ⚠' : ''} |`),
].join('\n');

console.log(`JavaScript per page, ${limit}:\n\n${table}\n`);
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### JavaScript per page (${limit})\n\n${table}\n`);
}

if (missing.length) {
  console.error(`Scripts not found in out/:\n${missing.map((m) => `  ${m}`).join('\n')}`);
  process.exit(1);
}
if (over.length) {
  console.error(`Over the budget of ${BUDGET_KB} kB: ${over.map((r) => `${r.page} (${r.kb.toFixed(1)} kB)`).join(', ')}`);
  process.exit(1);
}
