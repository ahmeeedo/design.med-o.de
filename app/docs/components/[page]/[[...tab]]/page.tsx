/**
 * Components at /docs/components/<page> and their tabs at /docs/components/<page>/<tab>, from
 * content/docs/components/<page>/<tab>.mdx, with the components MDX map bound to the page's manifest entry
 * (Playground, usage, accessibility, Storybook card). How area routes work: components/docs-route.ts.
 */
import type { Metadata } from 'next';
import { DocsPage } from '../../../../../components/docs-page';
import { docForParams, docsMetadata, docsStaticParams } from '../../../../../components/docs-route';
import { componentsComponentsFor } from '../../../../../components/mdx/components';

const AREA = 'components';

export const dynamicParams = false;

export function generateStaticParams() {
  return docsStaticParams(AREA, { tabs: true });
}

export async function generateMetadata({ params }: PageProps<'/docs/components/[page]/[[...tab]]'>): Promise<Metadata> {
  return docsMetadata(AREA, await params);
}

export default async function Page({ params }: PageProps<'/docs/components/[page]/[[...tab]]'>) {
  const doc = await docForParams(AREA, await params);
  return <DocsPage doc={doc} components={await componentsComponentsFor(doc)} />;
}
