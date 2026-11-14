/**
 * The hero at the top of every docs page (Figma Site/Page header 104:2063): the area as a plain category line
 * (sidebar groups are not pages, so it is no link), the page title as the h1, the excerpt, and a meta row with the
 * status (component pages only), the last update and one external link – Storybook on component pages, Figma on
 * foundation pages, on patterns and guides only when the front matter names a Figma frame. No breadcrumbs.
 * The date comes from git at build time and is printed in UTC, so the same commit gives the same date everywhere.
 */
import { Badge, Link, Stack } from '@med-o/ui';
import type { Status } from './docs-content';
import { STATUS } from './status';
import styles from './docs-hero.module.css';

const DATE = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });

export interface DocsHeroProps {
  category: string;
  title: string;
  excerpt: string;
  status?: Status;
  updated: Date;
  link?: { label: string; href: string };
}

export function DocsHero({ category, title, excerpt, status, updated, link }: DocsHeroProps) {
  return (
    <header className={styles.hero}>
      <Stack gap="content">
        <Stack gap="inline">
          <p className="medo-text-label-sm medo-text-secondary" data-pagefind-meta="area">
            {category}
          </p>
          <h1 className={`medo-text-display-xl ${styles.title}`}>{title}</h1>
        </Stack>
        <p className={`medo-text-body-lg medo-text-secondary ${styles.excerpt}`}>{excerpt}</p>
        <Stack direction="horizontal" gap="content" align="center" wrap data-pagefind-ignore="all">
          {status && <Badge tone={STATUS[status].tone}>{STATUS[status].label}</Badge>}
          <p className="medo-text-caption medo-text-secondary">
            Updated <time dateTime={updated.toISOString()}>{DATE.format(updated)}</time>
          </p>
          {link && (
            <Link href={link.href} variant="standalone" size="sm" external target="_blank">
              {link.label}
            </Link>
          )}
        </Stack>
      </Stack>
    </header>
  );
}
