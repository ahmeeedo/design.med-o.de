/**
 * Visual references for every template page: Light and Dark at desktop width (1440), Light at phone width (390).
 * A page that renders differently from its reference fails, and the Playwright report shows the diff.
 *
 * References come from the Linux runner of the screenshots job, never from Windows or macOS: fonts render
 * differently per system. The file names carry the platform (…-linux.png); other platforms' files are git-ignored,
 * so a local run makes its own references and never touches the committed ones.
 *
 * Add a page: one line in PAGES. Make or update references (a new page, or a change you want to keep): push the
 * branch, then GitHub → Actions → "Update screenshots" → Run workflow → your branch. The workflow writes the missing
 * and the changed references and commits them to the branch (.github/workflows/update-screenshots.yml); check the
 * images in the commit. The next CI run compares against them.
 *
 * Stable shots: reduced motion and no animations; the page has hydrated, the fonts are loaded and no Skeleton is
 * left (images and lazily loaded examples are done). Masked: the "Updated" date (it follows the last commit of the
 * page) and the version numbers in the footer and the Home link (they follow the release), not the look.
 * Docs pages are shot whole up to MAX_HEIGHT, so long pages (the token tables) stay comparable;
 * site pages and the Changelog show their first screen, the part a visitor sees on arrival.
 * Phone width runs in Light only: Dark is covered at desktop width, and every reference stays in the git history
 * (about 8 MB for the set today), so a fourth set would add a third more for little extra coverage.
 */
import { expect, test, type Page } from '@playwright/test';

/** The template pages. full: the whole page up to MAX_HEIGHT; otherwise the first screen. */
const PAGES = [
  { path: '/docs/overview/introduction', full: true },
  { path: '/docs/guides/styling', full: true },
  { path: '/docs/patterns/form', full: true },
  { path: '/docs/foundations/colors', full: true },
  { path: '/docs/foundations/colors/guidelines', full: true },
  { path: '/docs/foundations/colors/tokens', full: true },
  { path: '/docs/foundations/colors/code', full: true },
  { path: '/docs/components/button', full: true },
  { path: '/docs/components/button/styling', full: true },
  { path: '/docs/components/button/code', full: true },
  { path: '/docs/components/button/accessibility', full: true },
  // First screen only: the release list comes from the installed packages and changes with every release.
  { path: '/docs/overview/changelog', full: false },
  { path: '/', full: false },
  { path: '/showcase', full: false },
  { path: '/updates', full: false },
];

const SHOTS = [
  { name: 'desktop-light', viewport: { width: 1440, height: 900 }, theme: 'light' },
  { name: 'desktop-dark', viewport: { width: 1440, height: 900 }, theme: 'dark' },
  { name: 'phone-light', viewport: { width: 390, height: 844 }, theme: 'light' },
] as const;

/** Tallest part of a page that is compared, in CSS pixels. */
const MAX_HEIGHT = 6000;

/** "/docs/guides/styling" → "docs-guides-styling", "/" → "home". */
const slug = (path: string) => path.replace(/^\//, '').replaceAll('/', '-') || 'home';

/**
 * Waits until the page looks final: hydrated, fonts loaded, nothing loading and no Skeleton left. Lazy images below
 * the first screen load only when scrolled to, which a full-page shot never does, so they are switched to eager.
 */
async function settle(page: Page) {
  await page.waitForFunction(() => {
    const header = document.querySelector('header');
    return !!header && Object.keys(header).some((key) => key.startsWith('__reactFiber'));
  });
  await page.evaluate(() => {
    for (const image of document.querySelectorAll('img[loading="lazy"]')) (image as HTMLImageElement).loading = 'eager';
  });
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await expect(page.locator('.medo-skeleton, [data-state="loading"]')).toHaveCount(0);
}

for (const shot of SHOTS) {
  test.describe(shot.name, () => {
    test.use({ viewport: shot.viewport, colorScheme: shot.theme, reducedMotion: 'reduce' });

    for (const { path, full } of PAGES) {
      test(path, async ({ page }) => {
        await page.goto(path);
        await settle(page);
        // As in the axe spec: the theme script may already have chosen a theme; the shot shows the one asked for.
        await page.evaluate((theme) => {
          document.documentElement.dataset.theme = theme;
        }, shot.theme);
        const height = await page.evaluate(() => document.documentElement.scrollHeight);

        await expect(page).toHaveScreenshot(`${slug(path)}-${shot.name}.png`, {
          fullPage: full,
          clip: full ? { x: 0, y: 0, width: shot.viewport.width, height: Math.min(height, MAX_HEIGHT) } : undefined,
          mask: [page.getByText(/^Updated\s/), page.locator('footer [translate="no"]'), page.getByText(/^What's new in version/)],
          animations: 'disabled',
          timeout: 15_000,
        });
      });
    }
  });
}
