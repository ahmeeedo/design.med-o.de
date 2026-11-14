/**
 * The "Updated" date of a page: the date of the last commit that touched its source file. scripts/page-dates.mjs
 * writes these dates to generated/page-dates.json before every build (prebuild), because the Docker build has no .git
 * to ask. This module reads that file once at build time; no React, never in the browser.
 * The hero formats the date with Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }); this module only resolves it.
 * A missing file or entry falls back to today with one warning, so a page never fails to build over a date.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const FILE = path.join(process.cwd(), 'generated', 'page-dates.json');

let dates: Record<string, string> | undefined;
const warned = new Set<string>();

function warnOnce(key: string, message: string) {
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(`page-dates: ${message}`);
}

/** The JSON as { "<repo-relative path>": "<ISO date>" }; anything else is treated as empty. */
function load(): Record<string, string> {
  if (dates) return dates;
  dates = {};
  try {
    const parsed: unknown = JSON.parse(readFileSync(FILE, 'utf8'));
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) dates[key] = value;
      }
    } else {
      warnOnce('shape', `${FILE} is not an object of dates; every page gets today's date.`);
    }
  } catch {
    warnOnce('file', `${FILE} is missing; run "node scripts/page-dates.mjs". Every page gets today's date.`);
  }
  return dates;
}

/**
 * The last-commit date of a source file, by its repo-relative POSIX path, e.g. "content/docs/overview/introduction.mdx"
 * or "app/showcase/page.tsx". Today when the file has no entry.
 */
export function getUpdated(pagePath: string): Date {
  const iso = load()[pagePath];
  if (iso) return new Date(iso);
  warnOnce(`entry:${pagePath}`, `no date for ${pagePath}; using today.`);
  return new Date();
}
