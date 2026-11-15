/**
 * Patterns at /docs/patterns/<page>, from content/docs/patterns/<page>.mdx, with the pattern MDX map: content plus
 * spec images, related components, lists and badges. How area routes work: components/docs-route.ts.
 */
import type { Metadata } from 'next';
import { DocsPage } from '../../../../components/docs-page';
import { docForParams, docsMetadata, docsStaticParams } from '../../../../components/docs-route';
import { patternsComponents } from '../../../../components/mdx/patterns';

const AREA = 'patterns';

export const dynamicParams = false;

export function generateStaticParams() {
  return docsStaticParams(AREA);
}

export async function generateMetadata({ params }: PageProps<'/docs/patterns/[page]'>): Promise<Metadata> {
  return docsMetadata(AREA, await params);
}

export default async function Page({ params }: PageProps<'/docs/patterns/[page]'>) {
  return <DocsPage doc={await docForParams(AREA, await params)} components={patternsComponents} />;
}
