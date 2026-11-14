/**
 * A docs page at /docs/<area>/<page>, or a tab at /docs/<area>/<page>/<tab>: a flat page from
 * content/docs/<area>/<page>.mdx, or one tab of a folder page from content/docs/<area>/<page>/<tab>.mdx, where the
 * first tab is the page route itself. One optional catch-all route serves both, because the static export needs every
 * dynamic route to generate at least one path, and a site without tabbed pages has no tab paths yet.
 * Every page is rendered at build time; paths without a content file are not generated (dynamicParams = false), so
 * the export holds exactly one HTML file per content file. The render lives in components/docs-page.tsx.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDoc, getDocs } from '../../../../../components/docs-content';
import { DocsPage, docMetadata } from '../../../../../components/docs-page';

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getDocs()).map((p) => ({
    area: p.area,
    page: p.slug,
    tab: p.href === p.pageHref ? undefined : [p.tab!.slug],
  }));
}

/** The entry for the route params: the page itself, or its tab when the catch-all holds exactly one segment. */
async function docOf(params: PageProps<'/docs/[area]/[page]/[[...tab]]'>['params']) {
  const { area, page, tab } = await params;
  return tab && tab.length !== 1 ? undefined : getDoc(area, page, tab?.[0]);
}

export async function generateMetadata({ params }: PageProps<'/docs/[area]/[page]/[[...tab]]'>): Promise<Metadata> {
  const doc = await docOf(params);
  return doc ? docMetadata(doc) : {};
}

export default async function Page({ params }: PageProps<'/docs/[area]/[page]/[[...tab]]'>) {
  const doc = await docOf(params);
  if (!doc) notFound();
  return <DocsPage doc={doc} />;
}
