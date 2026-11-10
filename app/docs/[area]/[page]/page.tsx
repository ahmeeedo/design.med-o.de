/**
 * A docs page from content/docs/<area>/<page>.mdx: the hero from the front matter, then the MDX body.
 * Every page is rendered at build time; paths without a content file are not generated (dynamicParams = false),
 * so the static export holds exactly one HTML file per content file.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import * as runtime from 'react/jsx-runtime';
import { evaluate } from '@mdx-js/mdx';
import { Stack } from '@med-o/ui';
import { getDoc, getDocs } from '../../../../components/docs-content';
import { DocsHero } from '../../../../components/docs-hero';
import { mdxComponents } from '../../../../components/mdx-components';
import { rehypeSections } from '../../../../components/rehype-sections';
import styles from '../../docs.module.css';

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getDocs()).map((page) => ({ area: page.area, page: page.slug }));
}

export async function generateMetadata({ params }: PageProps<'/docs/[area]/[page]'>): Promise<Metadata> {
  const { area, page } = await params;
  const doc = await getDoc(area, page);
  if (!doc) return {};
  return { title: `${doc.title} · med.o Design System`, description: doc.excerpt };
}

export default async function DocPage({ params }: PageProps<'/docs/[area]/[page]'>) {
  const { area, page } = await params;
  const doc = await getDoc(area, page);
  if (!doc) notFound();

  const { default: Content } = await evaluate(doc.file, { ...runtime, rehypePlugins: [rehypeSections] });

  // Only the hero and the body are indexed for search; the area comes from the hero's category line.
  return (
    <Stack gap="group" data-pagefind-body>
      <DocsHero category={doc.areaLabel} title={doc.title} excerpt={doc.excerpt} />
      <Stack gap="group" className={styles.prose}>
        <Content components={mdxComponents} />
      </Stack>
    </Stack>
  );
}
