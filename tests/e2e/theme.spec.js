const { test, expect } = require('@playwright/test');

test.describe('Alternância de tema', () => {
  test('propaga tema para catálogo e MiniApps', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
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
    await page.waitForFunction(() => typeof window.__applyShellTheme === 'function');

    const root = page.locator('#miniapp-root');
    const initialTheme = await root.getAttribute('data-theme');
    const initialNormalized = initialTheme === 'dark' ? 'dark' : 'light';
    expect(initialNormalized).toBe('light');

    await page.evaluate(() => window.__applyShellTheme('dark'));

    await expect.poll(async () => root.getAttribute('data-theme')).toBe('dark');
    await expect.poll(async () => page.locator('#catalog-app').getAttribute('data-theme')).toBe('dark');

    await page.route('**/miniapp-theme-probe.html', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `<!doctype html><html><body data-theme=""><script>\nwindow.addEventListener('message', (event) => {\n  if (event.data && event.data.action === 'shell-theme') {\n    document.body.setAttribute('data-theme', event.data.theme === 'dark' ? 'dark' : 'light');\n    if (window.parent) {\n      window.parent.postMessage({ action: 'miniapp-theme-ready' }, '*');\n      window.parent.postMessage({ action: 'miniapp-theme-applied', theme: event.data.theme }, '*');\n    }\n  } else if (event.data && event.data.action === 'shell-language') {\n    window.parent?.postMessage({ action: 'miniapp-language-ready' }, '*');\n  } else if (event.data && event.data.action === 'shell-session') {\n    window.parent?.postMessage({ action: 'miniapp-session-ready' }, '*');\n  }\n});\n</script></body></html>`
      });
    });

    await page.evaluate(() => window.loadMiniApp('/miniapp-theme-probe.html', { title: 'Probe' }));
    await page.waitForSelector('#app-view[data-active="true"]');

    const appFrame = page.frameLocator('#miniapp-panel');
    await expect.poll(async () => appFrame.locator('body').getAttribute('data-theme')).toBe('dark');

    await page.evaluate((theme) => window.__applyShellTheme(theme), initialNormalized);

    await expect.poll(async () => root.getAttribute('data-theme')).toBe(initialNormalized);
    await expect.poll(async () => appFrame.locator('body').getAttribute('data-theme')).toBe(initialNormalized);
    await expect.poll(async () => page.locator('#catalog-app').getAttribute('data-theme')).toBe(initialNormalized);

    const storedTheme = await page.evaluate(() => localStorage.getItem('miniapp-shell.theme'));
    expect(storedTheme).toBe(initialNormalized);
  });
});
