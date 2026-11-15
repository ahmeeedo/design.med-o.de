/**
 * Next.js config: the site is a static export. `next build` writes plain HTML, CSS and JS to `out/`, which nginx
 * serves. There is no server logic, so redirects and headers live in nginx, not here.
 * Locale strings: React Aria ships its built-in texts (announcements, labels) for 30+ languages in every component
 * that has them. The site runs in en-US only (I18nProvider in app/providers.tsx), so React Aria's own Turbopack rule
 * keeps en-US and turns the other locale files into empty modules – 5 to 14 kB gzip less JavaScript per page.
 * A second site language needs its locale in this list.
 */
import type { NextConfig } from 'next';
import optimizeLocales from '@react-aria/optimize-locales-plugin';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: false,
  // Images are resized at build time; the export has no server to optimize them on request.
  images: { unoptimized: true },
  turbopack: {
    // The plugin types its locale list as readonly, which Next's JSON loader options do not accept; it is a plain array.
    rules: optimizeLocales.turbopack({ locales: ['en-US'] }).rules as NonNullable<NextConfig['turbopack']>['rules'],
  },
};

export default nextConfig;
