/**
 * axe on every page of the static export, in Light and Dark, at desktop (1440) and phone (390) width: no WCAG 2.2 AA
 * violation. The widths are the ones of keyboard.spec.mts, so the header, the mobile menu and the stacked layouts are
 * all scanned. Pages come from out/ (scripts/out-files.mjs), so a new page is tested without changing this file.
 * Theme: the color scheme is emulated and data-theme is set on <html> after load, so the scan sees the theme even
 * when a theme script has already chosen one. Reduced motion is on, and the scan waits until every finite animation
 * and transition has ended: some components still fade in under reduced motion (Tag enters from opacity 0), and a
 * scan in the middle of a fade measures blended colors. Endless animations, such as a skeleton shimmer, are not
 * awaited.
 * Each scan waits for hydration and for the fonts, as the keyboard spec does: components add attributes after they
 * measure themselves (a scrolling code block becomes focusable), and the final font metrics decide what scrolls.
 * One exception: color-contrast skips [data-contrast-example], the don't samples on foundation pages that show a
 * failing color pair on purpose. They are pictures of a wrong example (WCAG 1.4.3, incidental text), named for screen
 * readers. The page is scanned without them, then they are scanned on their own with every rule but color-contrast.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { listPages, pageUrl } from '../scripts/out-files.mjs';

const WCAG_22_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
/** Don't samples that fail contrast on purpose; see the header. */
const CONTRAST_EXAMPLE = '[data-contrast-example]';
const THEMES = ['light', 'dark'] as const;
const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  phone: { width: 390, height: 844 },
};

type Violation = Awaited<ReturnType<AxeBuilder['analyze']>>['violations'][number];

/** One block per rule: what is wrong, how bad, where to read more, and the elements with their fix. */
function explain(violations: Violation[]) {
  return violations
    .map((v) => {
      const nodes = v.nodes.map((n) => `    ${n.target.join(' ')}\n      ${(n.failureSummary ?? '').replace(/\n/g, '\n      ')}`);
      return `${v.id} (${v.impact}): ${v.help}\n  ${v.helpUrl}\n${nodes.join('\n')}`;
    })
    .join('\n\n');
}

for (const [device, viewport] of Object.entries(VIEWPORTS)) {
  test.describe(device, () => {
    test.use({ viewport });

    for (const file of listPages()) {
      const url = pageUrl(file);

      for (const theme of THEMES) {
        test(`${url} – ${theme}`, async ({ page }) => {
          await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
          await page.goto(url);
          // Hydrated: React adds its fiber key to hydrated elements. Then the fonts, so the layout is final.
          await page.waitForFunction(() => {
            const header = document.querySelector('header');
            return !!header && Object.keys(header).some((key) => key.startsWith('__reactFiber'));
          });
          await page.evaluate(() => document.fonts.ready.then(() => undefined));
          await page.evaluate((value) => {
            document.documentElement.dataset.theme = value;
          }, theme);
          // Let every finite fade and transition end, so the scan sees final colors (see the header).
          await page.evaluate(() =>
            Promise.all(
              document
                .getAnimations()
                .filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity)
                .map((animation) => animation.finished.catch(() => undefined)),
            ).then(() => undefined),
          );

          const { violations } = await new AxeBuilder({ page }).withTags(WCAG_22_AA).exclude(CONTRAST_EXAMPLE).analyze();
          if ((await page.locator(CONTRAST_EXAMPLE).count()) > 0) {
            const examples = await new AxeBuilder({ page })
              .withTags(WCAG_22_AA)
              .include(CONTRAST_EXAMPLE)
              .disableRules(['color-contrast'])
              .analyze();
            violations.push(...examples.violations);
          }
          // Only the rule ids are compared: the message above them is the readable part.
          expect(violations.map((v) => v.id), `${url} (${file}) at ${viewport.width}px in ${theme}:\n\n${explain(violations)}`).toEqual([]);
        });
      }
    }
  });
}
