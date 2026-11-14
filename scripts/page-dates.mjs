/**
 * Page dates: for every page, the date of the last commit that touched its source file, as generated/page-dates.json.
 * The hero prints it as "Updated …". The build reads the JSON instead of git because the Docker image has no .git
 * (.dockerignore): the workflow runs this script on the runner, `COPY . .` carries the file into the image, and the
 * `prebuild` run inside the image finds no git and keeps it. Node only, no dependencies, so it runs before `npm ci`.
 *
 * Keys are repo-relative POSIX paths: every file under content/ (docs and legal MDX) and every page.tsx under app/.
 * Docs pages are looked up by their content file; the route file is listed for completeness. Values are the ISO
 * committer date (git %cI). An untracked or uncommitted file gets the current date. Without git or without history
 * (shallow clone, Docker build) the script warns once, keeps an existing JSON or falls back to the current date for
 * every file, and exits 0: a missing date must never fail the build.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const OUTPUT_PATH = 'generated/page-dates.json';
const OUTPUT = join(ROOT, OUTPUT_PATH);
const NOW = new Date().toISOString();

/** Files under dir (recursively) that pass the filter, as repo-relative POSIX paths. */
function listFiles(dir, keep) {
  const files = [];
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) files.push(...listFiles(path, keep));
    else if (keep(entry.name)) files.push(path);
  }
  return files;
}

const files = [...listFiles('content', () => true), ...listFiles('app', (name) => name === 'page.tsx')].sort();

/** Runs git in the repo and returns stdout, or null when git is missing or the directory is not a repository. */
function git(...args) {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

function warn(message) {
  console.warn(`page-dates: ${message}`);
}

const inRepo = git('rev-parse', '--is-inside-work-tree') === 'true';

if (!inRepo && existsSync(OUTPUT)) {
  warn(`git is not available; keeping the existing ${OUTPUT_PATH}.`);
  process.exit(0);
}

const dates = {};
let fallbacks = 0;

if (inRepo) {
  // One status call for all files: a path listed here has uncommitted changes or is untracked.
  const changed = new Set(
    (git('status', '--porcelain', '--untracked-files=all', '--', ...files) ?? '')
      .split('\n')
      .filter(Boolean)
      .map((line) => line.slice(3).replace(/^"(.*)"$/, '$1')),
  );
  for (const file of files) {
    const date = changed.has(file) ? '' : git('log', '-1', '--format=%cI', '--', file);
    if (date) {
      dates[file] = date;
    } else {
      dates[file] = NOW;
      fallbacks += 1;
    }
  }
  if (git('rev-parse', '--is-shallow-repository') === 'true') {
    warn('shallow clone: the dates stop at the oldest fetched commit. Check out with fetch-depth: 0 for exact dates.');
  } else if (fallbacks > 0) {
    warn(`${fallbacks} of ${files.length} files have no committed history; they get the current date.`);
  }
} else {
  warn('git is not available; every page gets the current date.');
  for (const file of files) dates[file] = NOW;
  fallbacks = files.length;
}

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, `${JSON.stringify(dates, null, 2)}\n`);
console.log(`page-dates: ${files.length} entries written to ${OUTPUT_PATH}, ${fallbacks} with the current date.`);
