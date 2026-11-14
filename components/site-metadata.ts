/**
 * Search and share metadata in one place: the site name, the base URL, the Open Graph image and the per-page fields.
 * Next merges metadata shallowly, so a page that sets openGraph replaces the layout's whole object; pageMetadata
 * therefore returns every field a page needs (canonical, Open Graph, Twitter) in one go. The title template in the
 * root layout adds " · med.o Design System" to the document title; Open Graph and Twitter get the full title here.
 * Base URL: SITE_URL, default the production host. Dev and preview serve the same tags but send noindex (nginx.conf).
 * No React; runs at build time only.
 */
import type { Metadata } from 'next';

export const SITE_NAME = 'med.o Design System';
export const SITE_DESCRIPTION =
  'Guidelines, components and tokens for building med.o products, with live examples you can copy.';
export const SITE_URL = new URL(process.env.SITE_URL || 'https://design.med-o.de');

/** One static image for every page, built by scripts/og-image.mjs. */
const OG_IMAGE = { url: '/og.png', width: 1200, height: 630, alt: SITE_NAME };

/** Open Graph and Twitter fields shared by every page; the root layout uses them for pages without their own. */
export const shareMetadata = (title: string, description: string, path?: string): Metadata => ({
  openGraph: { type: 'website', siteName: SITE_NAME, title, description, url: path, images: [OG_IMAGE] },
  twitter: { card: 'summary_large_image', title, description, images: [OG_IMAGE.url] },
});

/**
 * The metadata of one page: title (the layout's template completes it), description, canonical URL and the share
 * tags. path is the page's URL path, e.g. "/docs/overview/introduction"; without a title the page is the home page.
 */
export function pageMetadata({ title, description = SITE_DESCRIPTION, path }: { title?: string; description?: string; path: string }): Metadata {
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    ...shareMetadata(title ? `${title} · ${SITE_NAME}` : SITE_NAME, description, path),
  };
}
