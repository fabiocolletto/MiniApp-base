const { test, expect } = require('@playwright/test');
const { stubFirebase } = require('./helpers/firebase');

const STORAGE_NAMESPACE = 'miniapp-catalog.admin';
const ACTIVE_KEY = `${STORAGE_NAMESPACE}.activeItems`;
const SHEET_KEY = `${STORAGE_NAMESPACE}.sheetId`;
const SHELL_SHEET_KEY = 'miniapp-shell.sheetId';

function seedActiveItem() {
  return {
    id: 'existing-app',
    name: 'MiniApp Existente',
    status: 'Ativo',
    category: 'Administração',
    lastImport: '10:00',
    description: 'Exemplo recuperado do dispositivo.',
    url: 'miniapp-base/index.html',
  };
}

test.describe('Miniapp gestor de catálogo', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => console.log('[manager-console]', msg.text()));
  });

  test('restaura catálogo ativo e ID da planilha salvos localmente', async ({ page }) => {
    await page.addInitScript((keys) => {
      localStorage.clear();
      localStorage.setItem(keys.active, JSON.stringify({ items: [keys.payload] }));
      localStorage.setItem(keys.sheet, 'sheet-123');
    }, { active: ACTIVE_KEY, sheet: SHEET_KEY, payload: seedActiveItem() });

    await stubFirebase(page);
    await page.goto('/miniapp-gestor-de-catalogo/index.html');

    await page.waitForFunction(() => document.querySelector('#sheetUrlInput')?.value === 'sheet-123');
    await expect(page.locator('#loaded-summary-container')).toContainText('MiniApp Existente');
  });

  test('importa CSV público simulando Google Sheets e persiste no armazenamento local', async ({ page }) => {
    await page.route('https://docs.google.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'text/csv' },
        body: [
          'id,name,status,category,description,url',
          'csv-app,Catálogo CSV,Disponível,Serviços,Importado via teste,miniapp-base/index.html',
        ].join('\n'),
      });
    });

    await page.addInitScript(() => localStorage.clear());

    await stubFirebase(page);
    await page.goto('/miniapp-gestor-de-catalogo/index.html');

    await page.fill('#sheetUrlInput', 'https://docs.google.com/spreadsheets/d/TEST/edit#gid=0');
    await page.click('#testSheetButton');

    const previewRow = page.locator('#preview-data-container td', { hasText: 'Catálogo CSV' });
    await expect(previewRow).toBeVisible();
    await expect(page.locator('#importCatalogButton')).toBeEnabled();

    await page.click('#importCatalogButton');

    await expect(page.locator('#status-message')).toContainText('Importação Completa');
    await expect(page.locator('#loaded-summary-container')).toContainText('Catálogo CSV');

    const persisted = await page.evaluate((keys) => ({
      storedCatalog: JSON.parse(localStorage.getItem(keys.active)),
      storedSheetId: localStorage.getItem(keys.sheet),
      shellSheetId: localStorage.getItem(keys.shellSheet),
    }), { active: ACTIVE_KEY, sheet: SHEET_KEY, shellSheet: SHELL_SHEET_KEY });

    expect(persisted.storedCatalog?.items?.some((item) => item.id === 'csv-app')).toBeTruthy();
    expect(persisted.storedSheetId).toBe('TEST');
    expect(persisted.shellSheetId).toBe('TEST');
  });
});
