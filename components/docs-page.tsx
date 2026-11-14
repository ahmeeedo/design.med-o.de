/**
 * The render of a docs entry, a flat page or one tab, used by the docs route (Figma 106:3625, mobile 121:2152): the
 * hero, the tab list on tabbed pages, the MDX body and the Feedback section in one column, and "On this page" next to
 * it from 1280 px or as a disclosure under the hero below (see docs.module.css). The content schema check runs here,
 * after the MDX is compiled and its headings are known, so a page that misses a required section stops the build.
 * A tab is titled "<Page> · <Tab>", in the document title and in the search index (Pagefind takes the h1 otherwise).
 */
import type { Metadata } from 'next';
import * as runtime from 'react/jsx-runtime';
import { evaluate } from '@mdx-js/mdx';
import { OnThisPage, Stack } from '@med-o/ui';
import styles from '../app/docs/docs.module.css';
import { checkSections } from './content-schema';
import type { DocPage } from './docs-content';
import { DocsHero, type DocsHeroProps } from './docs-hero';
import { DocsTabs } from './docs-tabs';
import { FEEDBACK_ID, FeedbackSection } from './feedback-section';
import { mdxComponents } from './mdx-components';
import { getUpdated } from './page-dates';
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
  if (doc.figma) return { label: 'Figma', href: doc.figma };
  return undefined;
}

/** "On this page" lists 3 sections or more; with fewer it is left out, as the component's guidelines say. */
const MIN_SECTIONS = 3;

export async function DocsPage({ doc }: { doc: DocPage }) {
  const headings: string[] = [];
  const outline: { id: string; label: string }[] = [];
  const { default: Content } = await evaluate(doc.file, {
    ...runtime,
    rehypePlugins: [[rehypeSections, { headings, outline }]],
  });
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
                <OnThisPage items={sections} variant="disclosure" />
              </div>
            )}
            <Content components={mdxComponents} />
            <FeedbackSection title={docTitle(doc)} route={doc.href} />
          </Stack>
        </DocsTabs>
      </div>
      {onThisPage && (
        <div className={styles.rail}>
          <OnThisPage items={sections} variant="rail" />
        </div>
      )}
    </div>
  );
}
