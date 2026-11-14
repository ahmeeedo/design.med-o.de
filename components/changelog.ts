/**
 * The changelogs of @med-o/ui and @med-o/design-tokens, read at build time from their CHANGELOG.md in node_modules
 * (written by Changesets) into releases the Updates and Changelog pages render. Nothing is written twice: a release
 * adds its entries here on the next update.
 *
 * The format follows the writing rule for changesets, the same one the Storybook "What's new" page parses:
 *   ## <version>            _Released <date>_           ### Major|Minor|Patch Changes
 *   - <commit>: New|Improved|Fixed: summary
 *     details as paragraphs and lists, indented two spaces
 *     **Breaking:** what changed. (or **Breaking (types only):**)
 *     Update: what to do.
 * "- @med-o/…" and "- Updated dependencies" lines are package bookkeeping and end an entry. A paragraph that looks
 * like a breaking change but does not match the format fails the build, so a typo cannot hide one.
 * No React and no Vite; runs in server components and scripts only.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const PACKAGES = ['@med-o/ui', '@med-o/design-tokens'] as const;
export type PackageName = (typeof PACKAGES)[number];

export type Category = 'new' | 'improved' | 'fixed';
export type ReleaseKind = 'Major' | 'Minor' | 'Patch';

/** A paragraph or a list from the details of an entry, inline Markdown kept as written. */
export type Block = { type: 'paragraph'; text: string } | { type: 'list'; items: string[] };

export interface Breaking {
  /** "**Breaking (types only):**" – the code compiles differently, nothing changes at runtime. */
  typesOnly: boolean;
  text: string;
  /** The "Update:" sentence, when the entry has one. */
  update?: string;
}

export interface ChangelogEntry {
  commit: string;
  category: Category;
  summary: string;
  body: Block[];
  breaking?: Breaking;
}

export interface Release {
  package: PackageName;
  version: string;
  /** From "_Released YYYY-MM-DD_"; every release since 0.2.0 has one. */
  date?: string;
  kind: ReleaseKind;
  /** Empty for a release that says "No changes in this release." */
  entries: ChangelogEntry[];
}

const RANK: Record<ReleaseKind, number> = { Major: 0, Minor: 1, Patch: 2 };
const CATEGORY: Record<string, Category> = { New: 'new', Improved: 'improved', Fixed: 'fixed' };

const oneLine = (text: string) => text.replace(/\s*\n\s*/g, ' ').trim();

/** The raw indented lines of an entry, split at blank lines into paragraphs and lists; the breaking paragraph apart. */
function finish(lines: string[], where: string): { body: Block[]; breaking?: Breaking } {
  const body: Block[] = [];
  let breaking: Breaking | undefined;
  for (const block of lines.join('\n').split(/\n\s*\n/)) {
    const text = block.trim();
    if (!text) continue;
    const match = /^\*\*(?:Breaking|Behaviou?r change)(?: \(([^)]+)\))?:\*\*\s*([\s\S]*)/.exec(text);
    if (match) {
      const [what, update] = match[2].split(/\n?Update:\s*/);
      breaking = { typesOnly: match[1] === 'types only', text: oneLine(what), update: update ? oneLine(update) : undefined };
      continue;
    }
    if (/^\*\*[^*]*\b(?:breaking|behaviou?r change)/i.test(text)) {
      throw new Error(`${where}: a breaking paragraph is not in the "**Breaking:** … Update: …" format:\n  ${text.split('\n').join('\n  ')}`);
    }
    if (text.startsWith('- ')) body.push({ type: 'list', items: text.split(/\n(?=- )/).map((item) => oneLine(item.slice(2))) });
    else body.push({ type: 'paragraph', text: oneLine(text) });
  }
  return { body, breaking };
}

/** One CHANGELOG.md into its releases, newest first as written. */
export function parseChangelog(markdown: string, pkg: PackageName): Release[] {
  const releases: Release[] = [];
  let release: Release | undefined;
  let kind: ReleaseKind = 'Patch';
  let open: { entry: ChangelogEntry; lines: string[] } | undefined;

  const close = () => {
    if (open && release) Object.assign(open.entry, finish(open.lines, `${pkg} ${release.version}, ${open.entry.commit}`));
    open = undefined;
  };

  for (const line of markdown.split('\n')) {
    const version = /^## (\S+)/.exec(line);
    if (version) {
      close();
      release = { package: pkg, version: version[1], kind: 'Patch', entries: [] };
      releases.push(release);
      continue;
    }
    if (!release) continue;

    const date = /^_Released (\d{4}-\d{2}-\d{2})_$/.exec(line);
    if (date) {
      release.date = date[1];
      continue;
    }
    const heading = /^### (Major|Minor|Patch) Changes/.exec(line);
    if (heading) {
      close();
      kind = heading[1] as ReleaseKind;
      if (RANK[kind] < RANK[release.kind]) release.kind = kind;
      continue;
    }
    const item = /^- ([0-9a-f]{7,}): (?:(New|Improved|Fixed): )?(.*)/.exec(line);
    if (item) {
      close();
      const [, commit, category, summary] = item;
      // Without a category, a change in a patch release is a fix, any other an improvement – the Storybook rule.
      const entry: ChangelogEntry = { commit, category: CATEGORY[category] ?? (kind === 'Patch' ? 'fixed' : 'improved'), summary: summary.trim(), body: [] };
      release.entries.push(entry);
      open = { entry, lines: [] };
      continue;
    }
    if (/^- /.test(line)) {
      close();
      continue;
    }
    if (open && (line.startsWith('  ') || !line.trim())) open.lines.push(line.slice(2));
  }
  close();
  return releases;
}

const byVersionDesc = (a: Release, b: Release) =>
  b.version.localeCompare(a.version, undefined, { numeric: true }) || PACKAGES.indexOf(a.package) - PACKAGES.indexOf(b.package);

async function load(): Promise<Release[]> {
  const lists = await Promise.all(
    PACKAGES.map(async (pkg) => parseChangelog(await readFile(path.join(process.cwd(), 'node_modules', pkg, 'CHANGELOG.md'), 'utf8'), pkg)),
  );
  return lists.flat().sort(byVersionDesc);
}

let cache: Promise<Release[]> | undefined;

/** The releases of both packages in one list, newest first, @med-o/ui before @med-o/design-tokens of the same version. */
export function getReleases(): Promise<Release[]> {
  cache ??= load();
  return cache;
}
