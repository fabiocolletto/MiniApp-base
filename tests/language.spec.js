const { test, expect } = require('@playwright/test');
const { stubFirebase } = require('./helpers/firebase');

test.describe('Idioma do shell e miniapps', () => {
  test('alternar idioma atualiza shell, catálogo e gestor', async ({ page }) => {
    await stubFirebase(page);

    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('miniapp-shell.sheetId', 'sheet-language-test');
      const session = {
        token: 'local-session-token',
        userId: 'usr_local_admin',
        email: 'admin@example.com',
        role: 'admin',
        storedAt: new Date().toISOString(),
      };
      localStorage.setItem('miniapp.session', JSON.stringify(session));
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }

      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    });

    await page.reload();

    await page.waitForSelector('[data-header-title]');
    await page.waitForFunction(() => typeof window.__applyShellLanguage === 'function');

    await page.evaluate(() => window.__applyShellLanguage('en-US'));

    await expect(page.locator('[data-header-title]')).toHaveText('MiniApps Catalog');
    await expect(page.locator('#openCatalog')).toHaveText('Catalog');
    await expect(page.locator('#languageToggle [data-language-toggle-label]')).toHaveText('English');

    const shellLang = await page.evaluate(() => document.documentElement.lang);
    expect(shellLang).toBe('en-US');

    const catalogTitle = page.frameLocator('#catalog-frame').locator('#catalogTitle');
    await expect(catalogTitle).toHaveText('Your MiniApps Catalog');
    const catalogStatus = page.frameLocator('#catalog-frame').locator('#status-message');
    await expect(catalogStatus).toContainText('Firebase configuration missing.');

    await page.evaluate(() => {
      window.loadMiniApp('miniapp-gestor-de-catalogo/index.html', {
        title: 'MiniApp Catalog Manager',
        subtitle: 'Admin tooling',
      });
    });

    const managerFrame = page.frameLocator('#miniapp-panel');
    await expect(managerFrame.locator('#managerHeading [data-manager-title]')).toHaveText('MiniApp Catalog Manager');
    await expect(managerFrame.locator('#managerBadge')).toHaveText('(Admin Access)');
    await expect(managerFrame.locator('#status-message')).toHaveText("Spreadsheet ID restored. Click 'Test & Preview' (Step 2) to sync.");

    await expect(managerFrame.locator('html')).toHaveAttribute('lang', 'en-US');
  });
});
