/**
 * Overview pages at /docs/overview/<page>, from content/docs/overview/<page>.mdx, with the base MDX map: these pages
 * are plain Markdown. The Changelog has its own static route next to this one, so it is skipped here.
 * How area routes work: components/docs-route.ts.
 */
import type { Metadata } from 'next';
import { DocsPage } from '../../../../components/docs-page';
import { docForParams, docsMetadata, docsStaticParams } from '../../../../components/docs-route';
import { baseComponents } from '../../../../components/mdx/base';

const AREA = 'overview';

export const dynamicParams = false;

export function generateStaticParams() {
  return docsStaticParams(AREA, { skip: ['changelog'] });
}

export async function generateMetadata({ params }: PageProps<'/docs/overview/[page]'>): Promise<Metadata> {
  return docsMetadata(AREA, await params);
}

export default async function Page({ params }: PageProps<'/docs/overview/[page]'>) {
  return <DocsPage doc={await docForParams(AREA, await params)} components={baseComponents} />;
}
