/**
 * The links of the site shell in one place: page links, resources and the feedback target.
 * Header, mobile menu, docs sidebar and footer all read from here, so a link changes in one spot.
 */

export interface SiteLink {
  label: string;
  href: string;
}

/** One area of the docs tree, built from the content files (see docs-content.ts). */
export interface DocsArea {
  label: string;
  pages: SiteLink[];
}

/** Page links in the header and the mobile menu. Home has none: the logo leads there. */
export const PAGES: (SiteLink & { match: string })[] = [
  { label: 'Showcase', href: '/showcase', match: '/showcase' },
  { label: 'Docs', href: '/docs/overview/introduction', match: '/docs' },
  { label: 'Updates', href: '/updates', match: '/updates' },
];

/** External resources: header popover, mobile menu. Each opens a new tab. */
export const RESOURCES: SiteLink[] = [
  { label: 'Storybook', href: 'https://storybook.med-o.de' },
  { label: 'Figma library', href: 'https://www.figma.com/design/vOTfMtcpCwAJjuSZUkfpfj/med.o-Design-System' },
  { label: 'GitHub', href: 'https://github.com/ahmeeedo/medo-design_system' },
  { label: 'npm', href: 'https://www.npmjs.com/package/@med-o/ui' },
];

export const FEEDBACK_URL = 'https://github.com/ahmeeedo/design.med-o.de/issues/new';

/** True when `pathname` is `match` or below it. */
export const isWithin = (pathname: string, match: string) => pathname === match || pathname.startsWith(`${match}/`);
