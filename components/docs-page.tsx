/**
 * The render of a docs entry, a flat page or one tab, used by every docs area route (Figma 106:3625, mobile
 * 121:2152): the hero, the tab list on tabbed pages, the MDX body and the Feedback section in one column, and "On this
 * page" next to it from 1280 px or as a disclosure under the hero below (see docs.module.css). The content schema
 * check runs here, after the MDX is compiled and its headings are known, so a page that misses a required section
 * stops the build. Data blocks (DATA_BLOCKS) are MDX components that render their own sections from package data,
 * such as the Changelog's versions; their sections join the outline and the schema check like "##" headings.
 * A tab is titled "<Page> · <Tab>", in the document title and in the search index (Pagefind takes the h1 otherwise).
 * The MDX map comes from the route (components/mdx/), so a page carries only the client components of its area.
 */
import type { Metadata } from 'next';
import type { MDXComponents } from 'mdx/types';
import * as runtime from 'react/jsx-runtime';
import { evaluate } from '@mdx-js/mdx';
import remarkGfm from 'remark-gfm';
import { Stack } from '@med-o/ui';
import styles from '../app/docs/docs.module.css';
import { getVersions } from './changelog';
import { checkSections } from './content-schema';
import type { DocPage } from './docs-content';
import { DocsHero, type DocsHeroProps } from './docs-hero';
import { DocsOutline } from './docs-outline';
import { DocsTabs } from './docs-tabs';
import { FEEDBACK_ID, FeedbackSection } from './feedback-section';
import { getUpdated } from './page-dates';
import { rehypeCodeMeta } from './rehype-code-meta';
import { rehypeSections } from './rehype-sections';
import { storybookDocsUrl } from './site-data';
import { pageMetadata } from './site-metadata';

/** "Introduction" for a flat page, "Button · Styling" for a tab, the first one included. */
export const docTitle = (doc: DocPage) => (doc.tab ? `${doc.title} · ${doc.tab.label}` : doc.title);

/** Title (the layout's template adds the site name), description, canonical URL and share tags of one entry. */
export const docMetadata = (doc: DocPage): Metadata =>
  pageMetadata({ title: docTitle(doc), description: doc.excerpt, path: doc.href });

/** The hero's one external link: Storybook for components, Figma for foundations, patterns and guides that have it. */
function heroLink(doc: DocPage): DocsHeroProps['link'] {
  if (doc.type === 'component' && doc.storybookId) return { label: 'Storybook', href: storybookDocsUrl(doc.storybookId) };
  if (doc.link) return doc.link;
  if (doc.figma) return { label: 'Figma', href: doc.figma };
  return undefined;
}

/** MDX components that render sections from data, with the outline of those sections. */
const DATA_BLOCKS: Record<string, () => Promise<{ id: string; label: string }[]>> = {
  ReleaseList: async () => (await getVersions()).map((v) => ({ id: v.id, label: v.version })),
};

/** "On this page" lists 3 sections or more; with fewer it is left out, as the component's guidelines say. */
const MIN_SECTIONS = 3;

/** `components`: the MDX map of the page's area route, plus blocks only this page uses (the Changelog's release list). */
export async function DocsPage({ doc, components }: { doc: DocPage; components: MDXComponents }) {
  const headings: string[] = [];
  const outline: { id: string; label: string }[] = [];
  const usedBlocks: string[] = [];
  const { default: Content } = await evaluate(doc.file, {
    ...runtime,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeCodeMeta, [rehypeSections, { headings, outline, blocks: Object.keys(DATA_BLOCKS), usedBlocks }]],
  });
  // A data block's sections follow the "##" sections; pages put their blocks after the text.
  for (const name of usedBlocks) {
    const sections = await DATA_BLOCKS[name]();
    outline.push(...sections);
    headings.push(...sections.map((section) => section.label));
  }
  checkSections(doc.file.path, doc.type, doc.tab?.slug, headings);

  const sections = [...outline, { id: FEEDBACK_ID, label: 'Feedback' }];
  const onThisPage = sections.length >= MIN_SECTIONS;
  const hero = (
    <DocsHero
      category={doc.areaLabel}
      title={doc.title}
      excerpt={doc.excerpt}
      status={doc.type === 'component' ? doc.status : undefined}
      updated={getUpdated(doc.file.path)}
      link={heroLink(doc)}
    />
  );

  return (
    <div className={styles.article}>
      {/* Only the hero and the body are indexed for search; the area comes from the hero's category line. */}
      <div className={styles.column} data-pagefind-body data-pagefind-meta={doc.tab ? `title:${docTitle(doc)}` : undefined}>
        <DocsTabs tabs={doc.tabs} current={doc.href} header={hero}>
          <Stack gap="group">
            {onThisPage && (
              <div className={styles.disclosure} data-pagefind-ignore="all">
                <DocsOutline items={sections} variant="disclosure" />
              </div>
            )}
            <Content components={components} />
            <FeedbackSection title={docTitle(doc)} route={doc.href} text={doc.feedback} />
          </Stack>
        </DocsTabs>
      </div>
      {onThisPage && (
        <div className={styles.rail}>
          <DocsOutline items={sections} variant="rail" />
        </div>
      )}
    </div>
  );
}
