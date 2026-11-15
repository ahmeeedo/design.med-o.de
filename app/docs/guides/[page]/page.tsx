/**
 * Guides at /docs/guides/<page>, from content/docs/guides/<page>.mdx, with the content MDX map: code tabs, tables,
 * cards and grids. How area routes work: components/docs-route.ts.
 */
import type { Metadata } from 'next';
import { DocsPage } from '../../../../components/docs-page';
import { docForParams, docsMetadata, docsStaticParams } from '../../../../components/docs-route';
import { contentComponents } from '../../../../components/mdx/content';

const AREA = 'guides';

export const dynamicParams = false;

export function generateStaticParams() {
  return docsStaticParams(AREA);
}

export async function generateMetadata({ params }: PageProps<'/docs/guides/[page]'>): Promise<Metadata> {
  return docsMetadata(AREA, await params);
}

export default async function Page({ params }: PageProps<'/docs/guides/[page]'>) {
  return <DocsPage doc={await docForParams(AREA, await params)} components={contentComponents} />;
}
