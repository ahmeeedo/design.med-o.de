/**
 * The shared logic of the docs routes. Every docs area has its own route under app/docs/<area>/, so each route passes
 * its own MDX map to DocsPage and a page loads only the client code its area uses (Next ships every client component
 * in a route's module graph on every page of that route). The routes stay small: params, metadata and the lookup live
 * here. No JSX of its own; runs at build time only.
 *
 * Add an area route with the area's first page – not before: the static export stops when a dynamic route generates
 * no path. Copy app/docs/guides/[page]/page.tsx and change three things:
 *   1. The folder: app/docs/<area>/[page]/page.tsx for a flat area (guides, patterns, overview), or
 *      app/docs/<area>/[page]/[[...tab]]/page.tsx for a tabbed area (foundations, components) – the first tab is
 *      the page URL itself, every other tab one more segment.
 *   2. The area id in the calls below, and `{ tabs: true }` for a tabbed area.
 *   3. The MDX map: the area's own components/mdx/<area>.tsx, or base / content when they are enough.
 * A static route next to [page] (such as app/docs/overview/changelog) wins over [page]; list its segment in `skip`,
 * so [page] never generates the same path from a content file.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDoc, getDocs, type DocPage } from './docs-content';
import { docMetadata } from './docs-page';

type Area = DocPage['area'];

/** The params of an area route: the page, and on tabbed areas the optional tab segment. */
export interface DocsParams {
  page: string;
  tab?: string[];
}

/**
 * The paths of one area for generateStaticParams. A flat area throws when one of its pages has tabs, because its
 * route has no segment for them; a tabbed area returns the tab as the optional catch-all, empty for the first tab.
 */
export async function docsStaticParams(
  area: Area,
  { tabs = false, skip = [] }: { tabs?: boolean; skip?: string[] } = {},
) {
  const entries = (await getDocs()).filter((doc) => doc.area === area && !skip.includes(doc.slug));
  if (!tabs) {
    const tabbed = entries.find((doc) => doc.tabs.length > 0);
    if (tabbed) {
      throw new Error(`${tabbed.file.path} has tabs, but the ${area} route has no tab segment. Use { tabs: true }.`);
    }
    return entries.map((doc) => ({ page: doc.slug }));
  }
  return entries.map((doc) => ({ page: doc.slug, tab: doc.href === doc.pageHref ? undefined : [doc.tab!.slug] }));
}

/** The entry for the params, or undefined: a tab only when the optional segment holds exactly one item. */
async function findDoc(area: Area, { page, tab }: DocsParams) {
  return tab && tab.length !== 1 ? undefined : getDoc(area, page, tab?.[0]);
}

/** The entry for the params; a path without a content file is a 404. */
export async function docForParams(area: Area, params: DocsParams): Promise<DocPage> {
  const doc = await findDoc(area, params);
  if (!doc) notFound();
  return doc;
}

/** Title, description, canonical URL and share tags of the entry (docMetadata), or none for a 404. */
export async function docsMetadata(area: Area, params: DocsParams): Promise<Metadata> {
  const doc = await findDoc(area, params);
  return doc ? docMetadata(doc) : {};
}
