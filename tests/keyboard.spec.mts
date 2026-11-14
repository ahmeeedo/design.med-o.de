/**
 * The keyboard path through the site shell, at desktop (1440) and phone (390) width: skip link, header, search and
 * the mobile menu. Two docs layout steps run at their own width: "On this page" as a disclosure (1024) and the docs
 * Drawer behind the Menu button above the page (768). Elements are found by role and accessible name, as a screen reader user meets them, so a renamed
 * or hidden control fails here.
 * Each test waits for hydration first: before it, the static HTML has no key handlers, and a key press would be lost.
 */
import { expect, test, type Locator, type Page } from '@playwright/test';

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };
const LAPTOP = { width: 1024, height: 768 };
const TABLET = { width: 768, height: 1024 };
const DOCS_PAGE = '/docs/overview/introduction';

/** Opens a page and waits until React has hydrated the header (React adds its fiber key to hydrated elements). */
async function open(page: Page, url: string) {
  await page.goto(url);
  await page.waitForFunction(() => {
    const header = document.querySelector('header');
    return !!header && Object.keys(header).some((key) => key.startsWith('__reactFiber'));
  });
}

/** Presses Tab once per expected element and checks that focus lands on each, in this order. */
async function expectTabOrder(page: Page, stops: Locator[]) {
  for (const stop of stops) {
    await page.keyboard.press('Tab');
    await expect(stop, `Tab should reach ${stop}`).toBeFocused();
  }
}

const skipLink = (page: Page) => page.getByRole('link', { name: 'Skip to content' });
/** A control in the site header (the footer repeats some page links). */
const inHeader = (page: Page, role: 'link' | 'button', name: string) =>
  page.getByRole('banner').getByRole(role, { name, exact: true });
const searchDialog = (page: Page) => page.getByRole('dialog', { name: 'Search the docs' });
/** The desktop trigger is the field-like button “Search …”; on phones it is the icon button “Search”. */
const searchTrigger = (page: Page, width: 'desktop' | 'phone') => inHeader(page, 'button', width === 'desktop' ? 'Search …' : 'Search');

test.describe('desktop', () => {
  test.use({ viewport: DESKTOP });

  test('skip link is the first stop and moves focus to the main content', async ({ page }) => {
    await open(page, '/');
    await expectTabOrder(page, [skipLink(page)]);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
  });

  test('Tab reaches every header control in order', async ({ page }) => {
    await open(page, '/');
    await expectTabOrder(page, [
      skipLink(page),
      inHeader(page, 'link', 'med.o Design System home'),
      inHeader(page, 'link', 'Showcase'),
      inHeader(page, 'link', 'Docs'),
      inHeader(page, 'link', 'Updates'),
      searchTrigger(page, 'desktop'),
      inHeader(page, 'link', 'Give feedback (opens in a new tab)'),
      inHeader(page, 'button', 'Resources'),
    ]);
  });

  test('Give feedback opens a new tab safely', async ({ page }) => {
    await open(page, '/');
    const feedback = inHeader(page, 'link', 'Give feedback (opens in a new tab)');
    await expect(feedback).toHaveAttribute('target', '_blank');
    await expect(feedback).toHaveAttribute('rel', /\bnoopener\b/);
    await expect(feedback).toHaveAttribute('href', 'https://github.com/ahmeeedo/design.med-o.de/issues/new');
  });

  test('resources popover opens with Enter and Esc returns focus to its button', async ({ page }) => {
    await open(page, '/');
    const button = inHeader(page, 'button', 'Resources');
    await button.focus();
    await page.keyboard.press('Enter');
    const popover = page.getByRole('dialog', { name: 'Resources' });
    await expect(popover).toBeVisible();
    await expect(popover.getByRole('link', { name: /Storybook/ })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(popover).toBeHidden();
    await expect(button).toBeFocused();
  });

  // QuickSearch listens for both, so either modifier opens the search on every platform.
  for (const shortcut of ['Control+K', 'Meta+K']) {
    test(`${shortcut} opens the search and Esc returns focus`, async ({ page }) => {
      await open(page, '/');
      const docs = inHeader(page, 'link', 'Docs');
      await docs.focus();
      await page.keyboard.press(shortcut);
      await expect(searchDialog(page)).toBeVisible();
      await expect(page.getByRole('searchbox', { name: 'Search the docs' })).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(searchDialog(page)).toBeHidden();
      await expect(docs).toBeFocused();
    });
  }

  test('search finds a page and Enter opens it', async ({ page }) => {
    await open(page, '/');
    const button = searchTrigger(page, 'desktop');
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(searchDialog(page)).toBeVisible();
    await page.keyboard.type('install');
    await expect(searchDialog(page).getByRole('option', { name: 'Introduction' })).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/docs/overview/introduction');
  });

  test('Esc clears a filled search first, then closes it and returns focus to the button', async ({ page }) => {
    await open(page, '/');
    const button = searchTrigger(page, 'desktop');
    await button.focus();
    await page.keyboard.press('Enter');
    const field = page.getByRole('searchbox', { name: 'Search the docs' });
    await expect(field).toBeFocused();
    await page.keyboard.type('install');
    await page.keyboard.press('Escape');
    await expect(field).toHaveValue('');
    await expect(searchDialog(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(searchDialog(page)).toBeHidden();
    await expect(button).toBeFocused();
  });
});

test.describe('phone', () => {
  test.use({ viewport: PHONE });

  test('skip link is the first stop and moves focus to the main content', async ({ page }) => {
    await open(page, '/');
    await expectTabOrder(page, [skipLink(page)]);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
  });

  test('Tab reaches logo, search and menu', async ({ page }) => {
    await open(page, '/');
    await expectTabOrder(page, [
      skipLink(page),
      inHeader(page, 'link', 'med.o Design System home'),
      searchTrigger(page, 'phone'),
      inHeader(page, 'button', 'Menu'),
    ]);
  });

  test('Control+K opens the search and Esc closes it', async ({ page }) => {
    await open(page, '/');
    await page.keyboard.press('Control+K');
    await expect(searchDialog(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(searchDialog(page)).toBeHidden();
  });

  for (const how of ['Escape', 'Close'] as const) {
    test(`menu opens with Enter and ${how} returns focus to the menu button`, async ({ page }) => {
      await open(page, '/docs/overview/introduction');
      const button = inHeader(page, 'button', 'Menu');
      await button.focus();
      await page.keyboard.press('Enter');
      const menu = page.getByRole('dialog', { name: 'Menu' });
      await expect(menu).toBeVisible();
      await expect(menu.getByRole('link', { name: 'Showcase' })).toBeVisible();
      if (how === 'Escape') await page.keyboard.press('Escape');
      else await menu.getByRole('button', { name: 'Close' }).press('Enter');
      await expect(menu).toBeHidden();
      await expect(button).toBeFocused();
    });
  }
});

test.describe('laptop', () => {
  test.use({ viewport: LAPTOP });

  test('"On this page" opens with Enter and a link moves focus to its section', async ({ page }) => {
    await open(page, DOCS_PAGE);
    const toggle = page.getByRole('main').getByRole('button', { name: 'On this page' });
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const feedback = page.getByRole('navigation', { name: 'On this page' }).getByRole('link', { name: 'Feedback' });
    await feedback.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('heading', { name: 'Feedback', level: 2 })).toBeFocused();
  });
});

test.describe('tablet', () => {
  test.use({ viewport: TABLET });

  test('docs drawer opens with Enter, Esc closes it and returns focus to the Menu button', async ({ page }) => {
    await open(page, DOCS_PAGE);
    const button = page.getByRole('main').getByRole('button', { name: 'Menu' });
    await button.focus();
    await page.keyboard.press('Enter');
    const drawer = page.getByRole('dialog', { name: 'Docs' });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole('searchbox', { name: 'Filter this menu' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    await expect(button).toBeFocused();
  });
});
