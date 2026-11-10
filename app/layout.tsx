/**
 * Root layout: imports fonts, tokens and component styles once for every page and sets the page language.
 * DM Mono is only used for code, and the code text styles use the regular weight, so it loads in 400 only.
 */
import type { Metadata } from 'next';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/dm-mono/400.css';
import '@med-o/design-tokens/css/tokens.css';
import '@med-o/design-tokens/css/typography.css';
import '@med-o/ui/styles.css';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'med.o Design System',
  description: 'Guidelines, components and tokens for building med.o products, with live examples you can copy.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
