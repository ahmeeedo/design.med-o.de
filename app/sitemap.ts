/**
 * sitemap.xml: every page of the static export with the date of its last commit (components/page-dates.ts).
 * Docs pages and tabs come from the content files, so a new page is listed without changing this file; the other
 * pages are listed here with the file whose date they show. The 404 page is not listed. scripts/check-sitemap.mjs
 * compares this list with the HTML files in out/ after the build.
 */
import type { MetadataRoute } from 'next';
import { getDocs } from '../components/docs-content';
import { getUpdated } from '../components/page-dates';
import { SITE_URL } from '../components/site-metadata';

// The static export writes the file at build time only for routes marked static; without it the build stops.
export const dynamic = 'force-static';

/** Pages outside the docs, with the source file that dates them. The legal pages are dated by their text. */
const PAGES = [
  { path: '/', source: 'app/page.tsx' },
  { path: '/showcase', source: 'app/showcase/page.tsx' },
  { path: '/updates', source: 'app/updates/page.tsx' },
  { path: '/imprint', source: 'content/legal/imprint.mdx' },
  { path: '/privacy', source: 'content/legal/privacy.mdx' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const docs = (await getDocs()).map((doc) => ({ path: doc.href, source: doc.file.path }));
  return [...PAGES, ...docs].map(({ path, source }) => ({
    url: new URL(path, SITE_URL).href,
    lastModified: getUpdated(source),
  }));
}
