/**
 * axe on every page of the static export, in Light and Dark, at desktop (1440) and phone (390) width: no WCAG 2.2 AA
 * violation. The widths are the ones of keyboard.spec.mts, so the header, the mobile menu and the stacked layouts are
 * all scanned. Pages come from out/ (scripts/out-files.mjs), so a new page is tested without changing this file.
 * Theme: the color scheme is emulated and data-theme is set on <html> after load, so the scan sees the theme even
 * when a theme script has already chosen one. Reduced motion is on, so no color transition is caught halfway.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { listPages, pageUrl } from '../scripts/out-files.mjs';

const WCAG_22_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
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
          await page.evaluate((value) => {
            document.documentElement.dataset.theme = value;
          }, theme);

          const { violations } = await new AxeBuilder({ page }).withTags(WCAG_22_AA).analyze();
          // Only the rule ids are compared: the message above them is the readable part.
          expect(violations.map((v) => v.id), `${url} (${file}) at ${viewport.width}px in ${theme}:\n\n${explain(violations)}`).toEqual([]);
        });
      }
    }
  });
}
