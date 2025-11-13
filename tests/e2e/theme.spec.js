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

    const catalogRoot = page.locator('#catalog-app');
    await expect.poll(async () => catalogRoot.getAttribute('data-theme')).toBe('dark');

    await page.route('**/miniapp-theme-probe.html', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `<!doctype html><html><body data-theme=""><script>\nwindow.addEventListener('message', (event) => {\n  if (event.data && event.data.action === 'shell-theme') {\n    document.body.setAttribute('data-theme', event.data.theme === 'dark' ? 'dark' : 'light');\n    if (window.parent) {\n      window.parent.postMessage({ action: 'miniapp-theme-ready' }, '*');\n      window.parent.postMessage({ action: 'miniapp-theme-applied', theme: event.data.theme }, '*');\n    }\n  } else if (event.data && event.data.action === 'shell-language') {\n    window.parent?.postMessage({ action: 'miniapp-language-ready' }, '*');\n  } else if (event.data && event.data.action === 'shell-session') {\n    window.parent?.postMessage({ action: 'miniapp-session-ready' }, '*');\n  }\n});\n</script></body></html>`
      });
    });

    await page.evaluate(() => window.loadMiniApp('/miniapp-theme-probe.html', { title: 'Probe' }, { bypassAuth: true }));

    await page.waitForSelector('#app-view[data-active="true"]');

    const appFrame = page.frameLocator('#miniapp-panel');
    await expect.poll(async () => appFrame.locator('body').getAttribute('data-theme')).toBe('dark');

    await page.evaluate((theme) => window.__applyShellTheme(theme), initialNormalized);

    const expectedFinalTheme = initialNormalized;
    await expect.poll(async () => root.getAttribute('data-theme')).toBe(expectedFinalTheme);
    await expect.poll(async () => appFrame.locator('body').getAttribute('data-theme')).toBe(expectedFinalTheme);
    await expect.poll(async () => catalogRoot.getAttribute('data-theme')).toBe(expectedFinalTheme);

    const storedTheme = await page.evaluate(() => localStorage.getItem('miniapp-shell.theme'));
    expect(storedTheme).toBe(initialNormalized);
  });
});
