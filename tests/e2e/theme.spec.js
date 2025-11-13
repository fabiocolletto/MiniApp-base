const { test, expect } = require('@playwright/test');
const { stubFirebase } = require('../helpers/firebase');

test.describe('Alternância de tema no shell', () => {
  test('propaga tema para catálogo e MiniApps carregados', async ({ page }) => {
    await stubFirebase(page);
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('miniapp-shell.sheetId', 'sheet-theme-test');
      const session = {
        token: 'local-session-token',
        userId: 'usr_local_admin',
        email: 'admin@example.com',
        role: 'admin',
        storedAt: new Date().toISOString(),
      };
      localStorage.setItem('miniapp.session', JSON.stringify(session));
      const matchMediaStub = (query) => ({
        matches: false,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        onchange: null,
        dispatchEvent: () => false,
      });
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        writable: true,
        value: matchMediaStub,
      });
    });

    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => typeof window.__applyShellTheme === 'function');

    const root = page.locator('#miniapp-root');
    const initialTheme = await root.getAttribute('data-theme');
    const initialNormalized = initialTheme === 'dark' ? 'dark' : 'light';
    expect(initialNormalized).toBe('light');

    await page.evaluate(() => window.__applyShellTheme('dark'));

    await expect.poll(async () => root.getAttribute('data-theme')).toBe('dark');

    await page.evaluate(() => window.openCatalogView());

    const catalogFrame = page.frameLocator('#catalog-frame');
    await catalogFrame.locator('body').waitFor();
    await expect.poll(async () => catalogFrame.locator('body').getAttribute('data-theme')).toBe('dark');

    const openBase = catalogFrame.locator('[data-open-miniapp][data-url="miniapp-base/index.html"]');
    await openBase.click();

    await page.waitForSelector('#app-view[data-active="true"]');

    const appFrame = page.frameLocator('#miniapp-panel');
    await expect.poll(async () => appFrame.locator('.ma').getAttribute('data-theme')).toBe('dark');

    await page.evaluate((theme) => window.__applyShellTheme(theme), initialNormalized);

    const expectedFinalTheme = initialNormalized;
    await expect.poll(async () => root.getAttribute('data-theme')).toBe(expectedFinalTheme);
    await expect.poll(async () => appFrame.locator('.ma').getAttribute('data-theme')).toBe(expectedFinalTheme);
    await expect.poll(async () => catalogFrame.locator('body').getAttribute('data-theme')).toBe(expectedFinalTheme);

    const storedTheme = await page.evaluate(() => localStorage.getItem('miniapp-shell.theme'));
    expect(storedTheme).toBe(initialNormalized);
  });
});
