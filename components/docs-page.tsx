/**
 * The render of a docs entry, a flat page or one tab, used by the docs route: the hero from the front matter, then
 * the MDX body. The content schema check runs here, after the MDX is compiled and its headings are known, so a page
 * that misses a required section stops the build with its path and the expected order.
 * A tab is titled "<Page> · <Tab>", in the document title and in the search index (Pagefind takes the h1 otherwise).
 */
import type { Metadata } from 'next';
import * as runtime from 'react/jsx-runtime';
import { evaluate } from '@mdx-js/mdx';
import { Stack } from '@med-o/ui';
import styles from '../app/docs/docs.module.css';
import { checkSections } from './content-schema';
import type { DocPage } from './docs-content';
import { DocsHero } from './docs-hero';
import { mdxComponents } from './mdx-components';
import { rehypeSections } from './rehype-sections';

/** "Introduction" for a flat page, "Button · Styling" for a tab, the first one included. */
export const docTitle = (doc: DocPage) => (doc.tab ? `${doc.title} · ${doc.tab.label}` : doc.title);

export const docMetadata = (doc: DocPage): Metadata => ({
  title: `${docTitle(doc)} · med.o Design System`,
  description: doc.excerpt,
});

export async function DocsPage({ doc }: { doc: DocPage }) {
  const headings: string[] = [];
  const { default: Content } = await evaluate(doc.file, { ...runtime, rehypePlugins: [[rehypeSections, { headings }]] });
  checkSections(doc.file.path, doc.type, doc.tab?.slug, headings);

  // Only the hero and the body are indexed for search; the area comes from the hero's category line.
  return (
    <Stack gap="group" data-pagefind-body data-pagefind-meta={doc.tab ? `title:${docTitle(doc)}` : undefined}>
      <DocsHero category={doc.areaLabel} title={doc.title} excerpt={doc.excerpt} />
      <Stack gap="group" className={styles.prose}>
        <Content components={mdxComponents} />
      </Stack>
    </Stack>
  );
}
