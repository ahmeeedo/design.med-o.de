/**
 * Site footer, one line on every page: the legal links. Imprint and Privacy must be easy to find and reachable from
 * every page (§ 5 DDG, Art. 13 GDPR), so they stay in the footer; everything else (Updates, GitHub, Storybook) is in
 * the header. It renders after <main> (PageMain), so on docs pages it sits in the page column and the sidebar
 * keeps its place to the end.
 */
import { Container, Link, Stack } from '@med-o/ui';
import styles from './site-footer.module.css';

const LINKS = [
  { label: 'Imprint', href: '/imprint' },
  { label: 'Privacy', href: '/privacy' },
];

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Container>
        <nav aria-label="Footer">
          <Stack direction="horizontal" justify="end" gap="content" wrap>
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} variant="standalone" size="sm">
                {l.label}
              </Link>
            ))}
          </Stack>
        </nav>
      </Container>
    </footer>
  );
}
