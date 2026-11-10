/**
 * Playwright: browser tests against the static export in out/, served like production by scripts/serve-out.mjs.
 * Run `npm run build` first. Chromium only for now. Every *.spec.mts in tests/ runs here: ES modules, so the specs can
 * import the helpers in scripts/ (the package itself is CommonJS).
 */
import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  // CI: annotations on the pull request plus the HTML report as an artifact; locally: one line per test.
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node scripts/serve-out.mjs',
    url: `http://127.0.0.1:${PORT}`,
    env: { PORT: String(PORT) },
    reuseExistingServer: !process.env.CI,
  },
});
