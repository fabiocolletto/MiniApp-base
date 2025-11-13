const { test, expect } = require('@playwright/test');

test.describe('Catálogo embutido', () => {
  test('renderiza apenas o cartão do catálogo padrão', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('#catalog-view[data-active="true"]');

    const cards = page.locator('[data-catalog-card]');
    await expect(cards).toHaveCount(1);
    await expect(cards.first().locator('h4')).toHaveText(/Catálogo de MiniApps/i);
  });

  test('mostra estado vazio quando a busca não encontra itens', async ({ page }) => {
    await page.goto('/index.html');
    const catalogList = page.locator('[data-catalog-list]');
    await page.waitForSelector('#catalog-view[data-active="true"]');
    await expect.poll(async () => catalogList.getAttribute('data-render-state')).toBe('ready');

    await page.locator('[data-catalog-search]').fill('não existe');

    await expect.poll(async () => catalogList.getAttribute('data-render-state')).toBe('empty');
    await expect(page.getByText('Nenhum MiniApp corresponde aos seus filtros de busca.', { exact: false })).toBeVisible();
  });
});
