/**
 * Hydration on every page of the static export, at desktop (1440) and phone (390) width: React must take over the
 * server HTML without a mismatch. A mismatch makes React throw the server HTML away and render the page again in the
 * browser – the page jumps, and invalid HTML (a block inside a <p>) looks different without JavaScript. Production
 * builds only log the error code (#418, #423, #425), so the test watches the console and uncaught errors for those
 * codes and for the readable texts of a development build. Runs in the a11y job (npm run test:a11y).
 * Pages come from out/ (scripts/out-files.mjs), so a new page is tested without changing this file.
 */
import { expect, test } from '@playwright/test';
import { listPages, pageUrl } from '../scripts/out-files.mjs';

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  phone: { width: 390, height: 844 },
};

/** React's hydration errors: the minified codes of production builds and the readable texts of development builds. */
const HYDRATION_ERROR = /Minified React error #(418|423|425)\b|Hydration failed|did not match|hydration mismatch/i;

for (const [device, viewport] of Object.entries(VIEWPORTS)) {
  test.describe(device, () => {
    test.use({ viewport });

    for (const file of listPages()) {
      const url = pageUrl(file);

      test(`${url} hydrates without a mismatch`, async ({ page }) => {
        const errors: string[] = [];
        page.on('console', (message) => {
          if (message.type() === 'error' && HYDRATION_ERROR.test(message.text())) errors.push(message.text());
        });
        page.on('pageerror', (error) => {
          if (HYDRATION_ERROR.test(String(error))) errors.push(String(error));
        });

        await page.goto(url);
        // Hydrated: React adds its fiber key to hydrated elements. Then wait until nothing loads any more, so content
        // that hydrates later (Suspense) has run too.
        await page.waitForFunction(() => {
          const header = document.querySelector('header');
          return !!header && Object.keys(header).some((key) => key.startsWith('__reactFiber'));
        });
        await page.waitForLoadState('networkidle');

        expect(errors, `${url} (${file}) at ${viewport.width}px logged a hydration error`).toEqual([]);
      });
    }
  });
}
