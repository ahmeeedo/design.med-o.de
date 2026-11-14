/**
 * The hero at the top of every docs page: the area as a plain category line (sidebar groups are not pages, so it is
 * no link), the page title as the h1 and the excerpt. Status, last update, an external link and the tabs join it in
 * phase 1.
 */
import { Stack } from '@med-o/ui';
import styles from './docs-hero.module.css';

export function DocsHero({ category, title, excerpt }: { category: string; title: string; excerpt: string }) {
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
      </Stack>
    </header>
  );
}
