/**
 * Showcase (Figma 67:979, mobile 79:1526): real interfaces built only from med.o components – a carousel of
 * highlights that name the components they use (it runs off the right edge of the screen), six reasons to use the
 * system, and one example in Light and Dark side by side with a split to drag. Sections follow the spacing rule
 * `section`; the page starts one section below the header.
 */
import type { Metadata } from 'next';
import { Container, Grid, ListRowIcon, Stack } from '@med-o/ui';
import { Eye, Globe, LayoutGrid, Link as LinkIcon, ListChecks, SunMoon } from 'lucide-react';
import { ShowcaseHighlights, ShowcaseThemeCompare } from '../../components/examples/lazy';
import { PageMain } from '../../components/page-main';
import { pageMetadata } from '../../components/site-metadata';
import styles from './showcase.module.css';

export const metadata: Metadata = pageMetadata({ title: 'Showcase', path: '/showcase' });

const REASONS = [
  {
    icon: <Eye />,
    title: 'Accessible by default',
    text: 'WCAG 2.2 AA in Light and Dark. Keyboard, focus and screen reader behavior come from React Aria.',
  },
  {
    icon: <ListChecks />,
    title: 'Tested on every change',
    text: 'Every story runs axe and interaction tests in Chromium, WebKit and Firefox.',
  },
  {
    icon: <LinkIcon />,
    title: 'Figma and code in sync',
    text: 'Tokens come from the Figma library. Design and code use the same names.',
  },
  {
    icon: <SunMoon />,
    title: 'Your brand, Light and Dark',
    text: 'Override a few color tokens – every component follows, in both themes.',
  },
  {
    icon: <LayoutGrid />,
    title: 'Any framework',
    text: 'Tokens and CSS work everywhere. React components on top, a Tailwind v4 theme included.',
  },
  {
    icon: <Globe />,
    title: 'Open source',
    text: 'MIT licensed and documented, with a Figma link on every component page.',
  },
];

export default function Showcase() {
  return (
    <PageMain>
      <Stack gap="section" className={styles.page}>
        <Container align="start">
          <Stack gap="content" data-pagefind-body data-pagefind-meta="area:Pages">
            <h1 className="medo-text-display-lg">Showcase</h1>
            <p className="medo-text-body-lg medo-text-secondary">
              Real interfaces built only from med.o components. Every one is accessible, follows Light and Dark, and
              takes your brand.
            </p>
          </Stack>
        </Container>
        {/* Full width: the carousel runs to the right edge of the screen (bleed), the header keeps the page width. */}
        <Container size="full">
          <ShowcaseHighlights />
        </Container>
        <Container align="start">
          <Stack gap="section">
            <Stack as="section" gap="group" aria-labelledby="why">
              <Stack gap="inline">
                <h2 id="why" className="medo-text-heading-xl">
                  Why med.o
                </h2>
                <p className="medo-text-body-lg medo-text-secondary">
                  Built for teams that ship accessible products – from the first design to production code.
                </p>
              </Stack>
              <Grid as="ul" minItemSize="var(--medo-size-width-xl)" gap="items" className={styles.reasons}>
                {REASONS.map((reason) => (
                  <Stack as="li" key={reason.title} gap="content" align="start">
                    <ListRowIcon>{reason.icon}</ListRowIcon>
                    <h3 className="medo-text-heading-sm">{reason.title}</h3>
                    <p className="medo-text-body-sm medo-text-secondary">{reason.text}</p>
                  </Stack>
                ))}
              </Grid>
            </Stack>
            <Stack as="section" gap="group" aria-labelledby="themes">
              <Stack gap="inline">
                <h2 id="themes" className="medo-text-heading-xl">
                  Light and Dark, built in
                </h2>
                <p className="medo-text-body-lg medo-text-secondary">
                  Every token has a value for both themes. Move the slider to compare – the markup stays the same.
                </p>
              </Stack>
              <ShowcaseThemeCompare />
            </Stack>
          </Stack>
        </Container>
      </Stack>
    </PageMain>
  );
}
