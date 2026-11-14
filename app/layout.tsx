/**
 * Root layout: fonts, tokens and component styles once for every page, the page language, the theme script and the
 * site frame (skip link, header, footer). DM Mono is only used for code, and the code text styles use the regular
 * weight, so it loads in 400 only.
 */
import type { Metadata } from 'next';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/dm-mono/400.css';
import '@med-o/design-tokens/css/tokens.css';
import '@med-o/design-tokens/css/typography.css';
import '@med-o/design-tokens/css/base.css';
import '@med-o/ui/styles.css';
import { SkipLink } from '@med-o/ui';
import { getDocsTree } from '../components/docs-content';
import { SiteFooter } from '../components/site-footer';
import { SiteHeader } from '../components/site-header';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, shareMetadata } from '../components/site-metadata';
import { ThemeScript } from '../components/theme-script';
import { Providers } from './providers';
import styles from './shell.module.css';

// Defaults for every page. Pages add their canonical URL and share tags through pageMetadata (site-metadata.ts).
export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: { template: `%s · ${SITE_NAME}`, default: SITE_NAME },
  description: SITE_DESCRIPTION,
  ...shareMetadata(SITE_NAME, SITE_DESCRIPTION),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const docsTree = await getDocsTree();

  return (
    // The theme script may set data-theme before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <Providers>
          <div className={styles.page}>
            <SkipLink href="#main" />
            <SiteHeader docsTree={docsTree} />
            <div className={styles.content}>{children}</div>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
