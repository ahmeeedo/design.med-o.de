/**
 * Site footer on every page: name, version and license, and the links people look for at the bottom.
 * The version is the installed @med-o/ui, read at build time, so the site shows the release it was built with.
 */
import { Container, Link, Stack } from '@med-o/ui';
import ui from '@med-o/ui/package.json';
import text from './text.module.css';
import styles from './site-footer.module.css';

const LINKS = [
  { label: 'Updates', href: '/updates' },
  { label: 'GitHub', href: 'https://github.com/ahmeeedo/medo-design_system', external: true },
  { label: 'Storybook', href: 'https://storybook.med-o.de', external: true },
  { label: 'Imprint', href: '/imprint' },
  { label: 'Privacy', href: '/privacy' },
];

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Container>
        <Stack direction="horizontal" justify="between" align="center" wrap gap="content" className={styles.row}>
          <p className={`medo-text-caption ${text.secondary}`}>
            med.o Design System · Version <span translate="no">{ui.version}</span> · MIT License
          </p>
          <nav aria-label="Footer">
            <Stack direction="horizontal" gap="content" wrap>
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  variant="standalone"
                  size="sm"
                  external={l.external}
                  target={l.external ? '_blank' : undefined}
                >
                  {l.label}
                </Link>
              ))}
            </Stack>
          </nav>
        </Stack>
      </Container>
    </footer>
  );
}
