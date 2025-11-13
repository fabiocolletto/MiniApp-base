const { test, expect } = require('@playwright/test');

test.describe('Idioma do shell e catálogo', () => {
  test('alternar idioma atualiza textos principais', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('#catalog-view[data-active="true"]');
    await page.waitForFunction(() => typeof window.__applyShellLanguage === 'function');

    await page.evaluate(() => window.__applyShellLanguage('en-US'));

    await expect(page.locator('[data-header-title]')).toHaveText('MiniApps Catalog');
    await expect(page.locator('#openCatalog')).toHaveText('Catalog');
    await expect(page.locator('#languageToggle [data-language-toggle-label]')).toHaveText('English');

    const shellLang = await page.evaluate(() => document.documentElement.lang);
    expect(shellLang).toBe('en-US');

    await expect(page.locator('[data-catalog-title]')).toHaveText('Your MiniApps Catalog');
    await expect(page.locator('[data-catalog-status]')).toHaveText(/Catalog loaded: 1 MiniApps available\./);
  });
});
