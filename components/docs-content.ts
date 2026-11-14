/**
 * The docs content, read once at build time from content/docs/<area>/. A flat page is one file, <page>.mdx; a
 * component or foundation page is a folder, <page>/<tab>.mdx, with one file per tab. Every tab is its own route and
 * its own entry here, so it gets its own title, search entry and section anchors.
 * Each file starts with YAML front matter that the schemas below check. A file that breaks a rule fails the build
 * with its path and the field, so a typo never ships as a broken page. The same list feeds the routes, the page
 * metadata and the docs tree in the sidebar.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { VFile } from 'vfile';
import { matter } from 'vfile-matter';
import { z } from 'zod';
import { TABS, isTabbed, type PageType, type Tab } from './content-schema';
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

const STATUSES = ['experimental', 'beta', 'stable', 'deprecated'] as const;

export type Status = (typeof STATUSES)[number];

/** Fields of every page. The tabbed types keep them in their first tab's file. */
const common = {
  title: z.string().min(1),
  excerpt: z.string().min(1),
  area: z.enum(AREA_IDS),
  /** Position in the area's list in the sidebar, from 1. */
  order: z.number().int().positive(),
  /** Hrefs of related pages. */
  related: z.array(z.string().min(1)).optional(),
};

// One strict object per type: a field that another type owns, such as `status` on a guide, is an unrecognized key.
const PageFrontMatter = z.discriminatedUnion('type', [
  z.strictObject({ ...common, type: z.literal('overview') }),
  z.strictObject({ ...common, type: z.literal('guide'), figma: z.url().optional() }),
  z.strictObject({ ...common, type: z.literal('pattern'), figma: z.url().optional() }),
  z.strictObject({ ...common, type: z.literal('foundation'), figma: z.url() }),
  z.strictObject({
    ...common,
    type: z.literal('component'),
    /** The component's name in the package manifest. */
    component: z.string().min(1),
    status: z.enum(STATUSES).optional(),
    /** The Storybook story id, the target of the hero link and the Code tab. */
    storybookId: z.string().min(1),
  }),
]);

/** The other tab files of a folder page: the tab they hold and, optionally, their own excerpt. */
const TabFrontMatter = z.strictObject({
  tab: z.string().min(1),
  excerpt: z.string().min(1).optional(),
});

export type PageFrontMatter = z.infer<typeof PageFrontMatter>;

export interface DocPage {
  type: PageType;
  title: string;
  /** The tab's own excerpt when it has one, else the page's. */
  excerpt: string;
  area: AreaId;
  order: number;
  related: string[];
  status?: Status;
  storybookId?: string;
  figma?: string;
  component?: string;
  /** The page's part of the URL: the file name or the folder name. */
  slug: string;
  /** This entry's URL. The first tab of a folder page is the page URL itself. */
  href: string;
  /** The URL of the page: equal to `href` for flat pages and first tabs. */
  pageHref: string;
  areaLabel: string;
  /** This entry's tab; undefined for flat pages. */
  tab?: Tab;
  /** The page's tabs in order with their hrefs; empty for flat pages. */
  tabs: { label: string; href: string }[];
  /** The MDX body without the front matter, with the file path for compiler messages. */
  file: VFile;
}

const ROOT = path.join(process.cwd(), 'content', 'docs');

const fail = (file: string, problems: string[]): never => {
  throw new Error(`Docs content is invalid:\n${problems.map((p) => `  ${file}: ${p}`).join('\n')}`);
};

const issues = (error: z.ZodError) =>
  error.issues.map((issue) => `${issue.path.join('.') || 'front matter'} – ${issue.message}`);

/** Reads one MDX file and strips its front matter; the raw matter stays in file.data.matter. */
async function readMdx(...segments: string[]): Promise<{ relative: string; file: VFile; matter: unknown }> {
  const relative = path.posix.join('content/docs', ...segments);
  const file = new VFile({ path: relative, value: await readFile(path.join(ROOT, ...segments), 'utf8') });
  matter(file, { strip: true });
  return { relative, file, matter: file.data.matter };
}

function parsePage(relative: string, area: string, raw: unknown): PageFrontMatter {
  const result = PageFrontMatter.safeParse(raw);
  if (!result.success) return fail(relative, issues(result.error));
  if (result.data.area !== area) fail(relative, [`area – "${result.data.area}" does not match the folder "${area}"`]);
  return result.data;
}

const entry = (
  data: PageFrontMatter,
  rest: Pick<DocPage, 'excerpt' | 'slug' | 'href' | 'pageHref' | 'tab' | 'tabs' | 'file'>,
): DocPage => ({
  ...data,
  related: data.related ?? [],
  areaLabel: AREAS.find((a) => a.id === data.area)!.label,
  ...rest,
});

/** A flat page: content/docs/<area>/<page>.mdx. */
async function readFlatPage(area: string, name: string): Promise<DocPage> {
  const { relative, file, matter: raw } = await readMdx(area, name);
  const data = parsePage(relative, area, raw);
  if (isTabbed(data.type)) {
    fail(relative, [`type – a ${data.type} page is a folder with one file per tab, ${TABS[data.type].map((t) => `${t.slug}.mdx`).join(', ')}`]);
  }
  const slug = name.replace(/\.mdx$/, '');
  const href = `/docs/${area}/${slug}`;
  return entry(data, { excerpt: data.excerpt, slug, href, pageHref: href, tab: undefined, tabs: [], file });
}

/** A folder page: content/docs/<area>/<page>/<tab>.mdx, one entry per tab file, in tab order. */
async function readFolderPage(area: string, slug: string): Promise<DocPage[]> {
  const folder = path.posix.join('content/docs', area, slug);
  const files = await Promise.all(
    (await readdir(path.join(ROOT, area, slug))).map(async (name) => {
      if (!name.endsWith('.mdx')) fail(`${folder}/${name}`, ['only .mdx files belong here']);
      return { name, tabSlug: name.replace(/\.mdx$/, ''), ...(await readMdx(area, slug, name)) };
    }),
  );

  // The file without `tab` holds the page's front matter and is the first tab; every other file is a tab.
  const hasTab = (raw: unknown) => typeof raw === 'object' && raw !== null && 'tab' in raw;
  const firsts = files.filter((f) => !hasTab(f.matter));
  if (firsts.length !== 1) {
    fail(folder, [`exactly one file holds the page front matter (without \`tab\`); found ${firsts.length}: ${firsts.map((f) => f.name).join(', ') || 'none'}`]);
  }
  const first = firsts[0];
  const data = parsePage(first.relative, area, first.matter);
  if (!isTabbed(data.type)) {
    return fail(first.relative, [`type – a ${data.type} page is a single file, content/docs/${area}/${slug}.mdx`]);
  }
  const tabs = TABS[data.type];
  if (first.tabSlug !== tabs[0].slug) {
    fail(first.relative, [`the page front matter belongs in ${tabs[0].slug}.mdx, the first tab of a ${data.type} page`]);
  }

  const pageHref = `/docs/${area}/${slug}`;
  const hrefOf = (tab: Tab) => (tab === tabs[0] ? pageHref : `${pageHref}/${tab.slug}`);
  const present = tabs.filter((tab) => files.some((f) => f.tabSlug === tab.slug));
  const tabLinks = present.map((tab) => ({ label: tab.label, href: hrefOf(tab) }));

  return present.map((tab) => {
    const file = files.find((f) => f.tabSlug === tab.slug)!;
    let excerpt = data.excerpt;
    if (file !== first) {
      const result = TabFrontMatter.safeParse(file.matter);
      if (!result.success) return fail(file.relative, issues(result.error));
      if (result.data.tab !== tab.slug) fail(file.relative, [`tab – "${result.data.tab}" does not match the file name "${tab.slug}"`]);
      excerpt = result.data.excerpt ?? excerpt;
    }
    return entry(data, { excerpt, slug, href: hrefOf(tab), pageHref, tab, tabs: tabLinks, file: file.file });
  }).concat(
    // A file whose name is not a tab of this type is a mistake, never silently skipped.
    files
      .filter((f) => !tabs.some((tab) => tab.slug === f.tabSlug))
      .map((f) => fail(f.relative, [`"${f.tabSlug}" is not a tab of a ${data.type} page; use ${tabs.slice(1).map((t) => t.slug).join(', ')}`])),
  );
}

async function load(): Promise<DocPage[]> {
  const pages: DocPage[] = [];
  for (const area of await readdir(ROOT, { withFileTypes: true })) {
    const relative = `content/docs/${area.name}`;
    if (!area.isDirectory()) fail(relative, ['only area folders belong here']);
    if (!AREA_IDS.includes(area.name as AreaId)) fail(relative, [`unknown area folder; use one of ${AREA_IDS.join(', ')}`]);
    for (const item of await readdir(path.join(ROOT, area.name), { withFileTypes: true })) {
      if (item.isDirectory()) pages.push(...(await readFolderPage(area.name, item.name)));
      else if (item.name.endsWith('.mdx')) pages.push(await readFlatPage(area.name, item.name));
      else fail(`${relative}/${item.name}`, ['only .mdx files and page folders belong here']);
    }
  }

  // One position per page in each area, so the sidebar order is never left to chance. Tabs share their page's order.
  for (const area of AREA_IDS) {
    const seen = new Map<number, string>();
    for (const page of pages.filter((p) => p.area === area && p.href === p.pageHref)) {
      const other = seen.get(page.order);
      if (other) fail(page.file.path, [`order – ${page.order} is also used by ${other}`]);
      seen.set(page.order, page.file.path);
    }
  }

  return pages.sort((a, b) => AREA_IDS.indexOf(a.area) - AREA_IDS.indexOf(b.area) || a.order - b.order);
}

let cache: Promise<DocPage[]> | undefined;

/**
 * All docs entries in sidebar order: one per flat page and one per tab, tabs in tab order after their page's order.
 * Read once per build; the dev server reads them again on every request.
 */
export function getDocs(): Promise<DocPage[]> {
  if (process.env.NODE_ENV !== 'production') return load();
  cache ??= load();
  return cache;
}

/** The entry at /docs/<area>/<page> or, with `tab`, at /docs/<area>/<page>/<tab>. */
export async function getDoc(area: string, page: string, tab?: string): Promise<DocPage | undefined> {
  const href = `/docs/${area}/${page}${tab ? `/${tab}` : ''}`;
  return (await getDocs()).find((p) => p.href === href);
}

/** The docs tree for the sidebar: only areas that have pages, every page once, linking to its first tab. */
export async function getDocsTree(): Promise<DocsArea[]> {
  const pages = await getDocs();
  return AREAS.map((area) => ({
    label: area.label,
    pages: pages
      .filter((p) => p.area === area.id && p.href === p.pageHref)
      .map((p) => ({ label: p.title, href: p.href, status: p.status })),
  })).filter((area) => area.pages.length > 0);
}
