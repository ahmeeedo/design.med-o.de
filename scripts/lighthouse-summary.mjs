/**
 * Lighthouse summary: one table row per page with the four category scores and the Largest Contentful Paint of the
 * median run, read from lighthouse/manifest.json, which `lhci autorun` writes (lighthouserc.json, upload target
 * "filesystem"). In CI the table also goes to the job summary. The reports themselves stay in lighthouse/ and in the
 * job's artifact; nothing is uploaded anywhere else.
 * Settings: Lighthouse's default mobile profile (emulated phone, throttled network and CPU), 3 runs per page.
 * The assertions in lighthouserc.json only warn; this script never fails on a score.
 */
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'lighthouse';
const manifestPath = join(DIR, 'manifest.json');
if (!existsSync(manifestPath)) {
  console.error(`Lighthouse: ${manifestPath} is missing. Run "npm run build", then "npm run check:lighthouse".`);
  process.exit(1);
}

const score = (value) => (typeof value === 'number' ? Math.round(value * 100) : '–');
const rows = JSON.parse(readFileSync(manifestPath, 'utf8'))
  .filter((entry) => entry.isRepresentativeRun)
  .map((entry) => {
    const report = JSON.parse(readFileSync(entry.jsonPath, 'utf8'));
    const lcp = report.audits['largest-contentful-paint']?.numericValue;
    const { performance, accessibility, seo } = entry.summary;
    return `| ${new URL(entry.url).pathname} | ${score(performance)} | ${score(accessibility)} | ${score(entry.summary['best-practices'])} | ${score(seo)} | ${lcp ? Math.round(lcp) : '–'} |`;
  });

const table = [
  '| Page | Performance | Accessibility | Best practices | SEO | LCP ms |',
  '| --- | ---: | ---: | ---: | ---: | ---: |',
  ...rows,
].join('\n');

console.log(`Lighthouse, mobile, median of 3 runs:\n\n${table}\n`);
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Lighthouse (mobile, median of 3 runs)\n\n${table}\n`);
}
