/**
 * Home (Figma "Explorations · Home hero": 37:2288, 55:4578, 55:5594, mobile 78:2827): one screen high – the intro on
 * the left (what's new, headline, the install command, Get started and Browse components) and the live examples on
 * the right, three sets switched with tabs. Below 1024 px the intro comes first and the examples follow as a row.
 * The install command is highlighted here at build time; no highlighting code reaches the browser.
 */
import type { Metadata } from 'next';
import { Button, CodeBlockTabs, Link, Stack } from '@med-o/ui';
import { highlight } from '@med-o/ui/highlight';
import ui from '@med-o/ui/package.json';
import { ArrowRight } from 'lucide-react';
import { HomeExamples } from '../components/examples/lazy';
import { PageMain } from '../components/page-main';
import { pageMetadata } from '../components/site-metadata';
import { STORYBOOK_URL } from '../components/site-data';
import styles from './home.module.css';

export const metadata: Metadata = pageMetadata({ path: '/' });

const PACKAGES = '@med-o/ui @med-o/design-tokens';
const INSTALL = [
  { id: 'npm', label: 'npm', code: `npm install ${PACKAGES}` },
  { id: 'pnpm', label: 'pnpm', code: `pnpm add ${PACKAGES}` },
  { id: 'yarn', label: 'yarn', code: `yarn add ${PACKAGES}` },
];

/** "0.19" for 0.19.0: the release line the link announces. */
const RELEASE = ui.version.split('.').slice(0, 2).join('.');

export default async function Home() {
  const install = await Promise.all(
    INSTALL.map(async (item) => ({ ...item, language: 'bash', tokens: await highlight(item.code, 'bash') })),
  );

  return (
    <PageMain>
      <div className={styles.hero}>
        <Stack gap="items" className={styles.intro} data-pagefind-body data-pagefind-meta="area:Pages">
          <Link href="/updates" variant="standalone" size="sm" arrow>
            {`What's new in version ${RELEASE}`}
          </Link>
          <h1 className={`medo-text-display-xl ${styles.title}`} data-pagefind-meta="title:Home">Build accessible products faster.</h1>
          <p className="medo-text-body-lg medo-text-secondary">
            Tokens, styles and React components for software and websites. WCAG 2.2 AA, Light and Dark, ready for your
            brand.
          </p>
          <div translate="no">
            <CodeBlockTabs aria-label="Package manager" items={install} copyable />
          </div>
          <div className={styles.actions} data-pagefind-ignore="all">
            <Button href="/docs/overview/introduction" size="lg" endIcon={<ArrowRight />}>
              Get started
            </Button>
            <Button href={STORYBOOK_URL} variant="secondary" size="lg">
              Browse components
            </Button>
          </div>
        </Stack>
        <HomeExamples />
      </div>
    </PageMain>
  );
}
