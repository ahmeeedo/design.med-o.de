/**
 * Updates (Figma 69:1061, mobile 79:2856): the latest releases of both packages with "Before you update" first, then
 * Support, Browsers and Help and resources. The releases come from the installed changelogs (getVersions), so the
 * page follows each update of the packages. Browser versions follow the design system's documented support (package
 * README and the Storybook guide "Versioning & support"). Brand logos come from the brands' own kits; see
 * public/brands/README.md. Sections are one `group` gap apart with a line between them.
 */
import type { Metadata } from 'next';
import Image from 'next/image';
import { Card, Container, Grid, Link, Stack } from '@med-o/ui';
import { getVersions } from '../../components/changelog';
import { PageMain } from '../../components/page-main';
import { RESOURCES, STORYBOOK_URL, storybookDocsUrl } from '../../components/site-data';
import { pageMetadata } from '../../components/site-metadata';
import { UpdatesReleases } from '../../components/updates-releases';
import styles from './updates.module.css';

export const metadata: Metadata = pageMetadata({ title: 'Updates', path: '/updates' });

const SUPPORT = [
  { title: 'Fixes', text: 'The latest version gets every fix. Update to get it.' },
  {
    title: 'Versions',
    text: 'Until 1.0 a minor version may break – always marked “Breaking”, with how to update. From 1.0 on: semantic versioning.',
  },
  {
    title: 'Deprecations',
    text: 'A deprecated API keeps working for at least one more version, and your editor shows the replacement.',
  },
];

/** Minimum versions, as documented in the design system (README, guide "Versioning & support"). */
const BROWSERS = [
  { name: 'Chrome', logo: 'chrome', versions: '117+' },
  { name: 'Edge', logo: 'edge', versions: '117+' },
  { name: 'Safari', logo: 'safari', versions: '17.5+ · macOS and iOS' },
  { name: 'Firefox', logo: 'firefox', versions: '129+' },
  { name: 'Samsung Internet', logo: 'samsung-internet', versions: '24+' },
];

const href = (label: string) => RESOURCES.find((resource) => resource.label === label)!.href;
const REPO = href('GitHub');

const HELP = [
  {
    name: 'GitHub',
    logo: 'github',
    text: 'Issues, releases and the source code.',
    links: [
      { label: 'Report a bug', href: `${REPO}/issues/new` },
      { label: 'Releases', href: `${REPO}/releases` },
    ],
  },
  { name: 'Storybook', logo: 'storybook', text: 'Every component live, with all props.', links: [{ label: 'Open Storybook', href: STORYBOOK_URL }] },
  {
    name: 'Figma',
    logo: 'figma',
    text: 'The design library with tokens and components.',
    links: [{ label: 'Open the Figma library', href: href('Figma library') }],
  },
  { name: 'npm', logo: 'npm', text: '@med-o/ui and @med-o/design-tokens.', links: [{ label: '@med-o/ui on npm', href: href('npm') }] },
];

/**
 * Logos that the brands' kits allow here, with their own proportions; a brand without one shows its name only
 * (public/brands/README.md). GitHub may not be recolored, so Dark shows the kit's white file.
 */
const LOGOS: Record<string, { width: number; height: number; white?: boolean }> = {
  github: { width: 98, height: 96, white: true },
  storybook: { width: 52, height: 64 },
  figma: { width: 400, height: 600 },
};

function Logo({ logo }: { logo: string }) {
  const size = LOGOS[logo];
  if (!size) return null;
  const { white, ...dimensions } = size;
  // The name follows as text, so the logo is decorative.
  if (!white) return <Image src={`/brands/${logo}.svg`} alt="" {...dimensions} className={styles.logo} />;
  return (
    <>
      <Image src={`/brands/${logo}.svg`} alt="" {...dimensions} className={`${styles.logo} ${styles.light}`} />
      <Image src={`/brands/${logo}-white.svg`} alt="" {...dimensions} className={`${styles.logo} ${styles.dark}`} />
    </>
  );
}

function Section({ id, title, text, children }: { id: string; title: string; text: string; children: React.ReactNode }) {
  return (
    <Stack as="section" gap="content" className={styles.section} aria-labelledby={id}>
      <Stack gap="inline">
        <h2 id={id} className="medo-text-heading-xl">
          {title}
        </h2>
        <p className="medo-text-body-lg medo-text-secondary">{text}</p>
      </Stack>
      {children}
    </Stack>
  );
}

export default async function Updates() {
  // Only what the list shows: the details of an entry stay out of the page's data.
  const versions = (await getVersions()).map((version) => ({
    ...version,
    entries: version.entries.map((entry) => ({ ...entry, body: [] })),
  }));

  return (
    <PageMain>
      <Container className={styles.page}>
        <Stack gap="group" data-pagefind-body data-pagefind-meta="area:Pages">
          <Stack gap="content">
            <h1 className="medo-text-display-lg">Updates</h1>
            <p className="medo-text-body-lg medo-text-secondary">
              Every release of <span translate="no">@med-o/design-tokens</span> and <span translate="no">@med-o/ui</span>.
              Breaking changes come first, with how to update.
            </p>
          </Stack>
          <UpdatesReleases versions={versions} />
          <Section id="support" title="Support" text="What gets fixed, and for how long.">
            <Grid as="ul" minItemSize="var(--medo-size-width-xl)" className={styles.grid}>
              {SUPPORT.map((item) => (
                <li key={item.title}>
                  <Card title={item.title} variant="filled" className={styles.fill}>
                    {item.text}
                  </Card>
                </li>
              ))}
            </Grid>
            <Link href={storybookDocsUrl('guides-versioning-support--docs')} variant="standalone" arrow>
              Versioning &amp; support guide
            </Link>
          </Section>
          <Section
            id="browsers"
            title="Browsers"
            text="Every component works from these versions on. The last two versions of each are supported."
          >
            <Grid as="ul" minItemSize="var(--medo-size-width-sm)" className={styles.grid}>
              {BROWSERS.map((browser) => (
                <Stack as="li" key={browser.name} gap="content" className={styles.tile}>
                  <Logo logo={browser.logo} />
                  <h3 className="medo-text-heading-sm">{browser.name}</h3>
                  <p className="medo-text-body-sm medo-text-secondary">{browser.versions}</p>
                </Stack>
              ))}
            </Grid>
            <p className="medo-text-body-sm medo-text-secondary">
              Tested in every pull request: Chromium, WebKit and Firefox, in Light and Dark.
            </p>
          </Section>
          <Section id="help" title="Help and resources" text="Report a problem, read the source, open the design files.">
            <Grid as="ul" minItemSize="var(--medo-size-width-lg)" className={styles.grid}>
              {HELP.map((item) => (
                <Stack as="li" key={item.name} gap="content" className={styles.tile}>
                  <Logo logo={item.logo} />
                  <h3 className="medo-text-heading-sm">{item.name}</h3>
                  <p className="medo-text-body-sm medo-text-secondary">{item.text}</p>
                  <Stack gap="inline" align="start">
                    {item.links.map((link) => (
                      <Link key={link.href} href={link.href} variant="standalone" external target="_blank">
                        {link.label}
                      </Link>
                    ))}
                  </Stack>
                </Stack>
              ))}
            </Grid>
          </Section>
        </Stack>
      </Container>
    </PageMain>
  );
}
