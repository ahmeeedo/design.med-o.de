/**
 * Foundations at /docs/foundations/<page> and their tabs at /docs/foundations/<page>/<tab>, from
 * content/docs/foundations/<page>/<tab>.mdx, with the foundations MDX map: token tables, color samples and images.
 * How area routes work: components/docs-route.ts.
 */
import type { Metadata } from 'next';
import { DocsPage } from '../../../../../components/docs-page';
import { docForParams, docsMetadata, docsStaticParams } from '../../../../../components/docs-route';
import { foundationsComponents } from '../../../../../components/mdx/foundations';

const AREA = 'foundations';

export const dynamicParams = false;

export function generateStaticParams() {
  return docsStaticParams(AREA, { tabs: true });
}

export async function generateMetadata({ params }: PageProps<'/docs/foundations/[page]/[[...tab]]'>): Promise<Metadata> {
  return docsMetadata(AREA, await params);
}

export default async function Page({ params }: PageProps<'/docs/foundations/[page]/[[...tab]]'>) {
  return <DocsPage doc={await docForParams(AREA, await params)} components={foundationsComponents} />;
}
