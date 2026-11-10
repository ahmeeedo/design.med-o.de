/**
 * The docs content: every file in content/docs/<area>/<page>.mdx, read once at build time.
 * Each file starts with YAML front matter that the schema below checks. A file that breaks a rule fails the build
 * with its path and the field, so a typo never ships as a broken page. The same list feeds the routes, the page
 * metadata and the docs tree in the sidebar.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { VFile } from 'vfile';
import { matter } from 'vfile-matter';
import { z } from 'zod';
import type { DocsArea } from './site-data';

/** The docs areas in sidebar order. */
export const AREAS = [
  { id: 'overview', label: 'Overview' },
  { id: 'guides', label: 'Guides' },
  { id: 'foundations', label: 'Foundations' },
  { id: 'patterns', label: 'Patterns' },
  { id: 'components', label: 'Components' },
] as const;

type AreaId = (typeof AREAS)[number]['id'];

const AREA_IDS = AREAS.map((a) => a.id) as [AreaId, ...AreaId[]];

const FrontMatter = z.strictObject({
  title: z.string().min(1),
  excerpt: z.string().min(1),
  area: z.enum(AREA_IDS),
  /** Position in the area's list in the sidebar, from 1. */
  order: z.number().int().positive(),
  status: z.enum(['experimental', 'beta', 'stable', 'deprecated']).optional(),
});

export type FrontMatter = z.infer<typeof FrontMatter>;

export interface DocPage extends FrontMatter {
  /** File name without .mdx – the last part of the URL. */
  slug: string;
  href: string;
  areaLabel: string;
  /** The MDX body without the front matter, with the file path for compiler messages. */
  file: VFile;
}

const ROOT = path.join(process.cwd(), 'content', 'docs');

const fail = (file: string, problems: string[]): never => {
  throw new Error(`Docs content is invalid:\n${problems.map((p) => `  ${file}: ${p}`).join('\n')}`);
};

async function readPage(area: string, name: string): Promise<DocPage> {
  const relative = path.posix.join('content/docs', area, name);
  const file = new VFile({ path: relative, value: await readFile(path.join(ROOT, area, name), 'utf8') });
  matter(file, { strip: true });

  const result = FrontMatter.safeParse(file.data.matter);
  if (!result.success) {
    return fail(
      relative,
      result.error.issues.map((issue) => `${issue.path.join('.') || 'front matter'} – ${issue.message}`),
    );
  }
  const data = result.data;
  if (data.area !== area) fail(relative, [`area – "${data.area}" does not match the folder "${area}"`]);

  const slug = name.replace(/\.mdx$/, '');
  return {
    ...data,
    slug,
    href: `/docs/${area}/${slug}`,
    areaLabel: AREAS.find((a) => a.id === area)!.label,
    file,
  };
}

async function load(): Promise<DocPage[]> {
  const pages: DocPage[] = [];
  for (const entry of await readdir(ROOT, { withFileTypes: true })) {
    const relative = `content/docs/${entry.name}`;
    if (!entry.isDirectory()) fail(relative, ['only area folders belong here']);
    if (!AREA_IDS.includes(entry.name as AreaId)) fail(relative, [`unknown area folder; use one of ${AREA_IDS.join(', ')}`]);
    for (const name of await readdir(path.join(ROOT, entry.name))) {
      if (!name.endsWith('.mdx')) fail(`${relative}/${name}`, ['only .mdx files belong here']);
      pages.push(await readPage(entry.name, name));
    }
  }

  // One position per page in each area, so the sidebar order is never left to chance.
  for (const area of AREA_IDS) {
    const seen = new Map<number, string>();
    for (const page of pages.filter((p) => p.area === area)) {
      const other = seen.get(page.order);
      if (other) fail(`content/docs/${area}/${page.slug}.mdx`, [`order – ${page.order} is also used by ${other}.mdx`]);
      seen.set(page.order, page.slug);
    }
  }

  return pages.sort((a, b) => AREA_IDS.indexOf(a.area) - AREA_IDS.indexOf(b.area) || a.order - b.order);
}

let cache: Promise<DocPage[]> | undefined;

/** All docs pages, in sidebar order. Read once per build; the dev server reads them again on every request. */
export function getDocs(): Promise<DocPage[]> {
  if (process.env.NODE_ENV !== 'production') return load();
  cache ??= load();
  return cache;
}

export async function getDoc(area: string, slug: string): Promise<DocPage | undefined> {
  return (await getDocs()).find((p) => p.area === area && p.slug === slug);
}

/** The docs tree for the sidebar: only areas that have pages. */
export async function getDocsTree(): Promise<DocsArea[]> {
  const pages = await getDocs();
  return AREAS.map((area) => ({
    label: area.label,
    pages: pages.filter((p) => p.area === area.id).map((p) => ({ label: p.title, href: p.href })),
  })).filter((area) => area.pages.length > 0);
}
