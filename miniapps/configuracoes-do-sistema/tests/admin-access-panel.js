const assert = require('assert');
const { chromium } = require('playwright');
const path = require('path');
const { startStaticServer } = require('../../../tests/helpers/server');

const ROOT = path.resolve(__dirname, '../../..');
const ADMIN_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwcm49CbeSuT-f8r-RvzhntPz6RRVWz3l0sNv-e_mM4ADB_CQXRvsmyWSsdWGT8qCQ6jw/exec';
const FAKE_SHEET_ID = '1TESTSHEETIDEXEMPLO1234567890ABCDE';

(async () => {
  const server = await startStaticServer({ root: ROOT });
  const BASE_URL = `http://localhost:${server.port}/index.html`;
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();

  page.on('console', (msg) => console.log('browser:', msg.text()));
  page.on('pageerror', (err) => console.log('pageerror:', err.message));
  page.on('request', (req) => {
    if (req.method() === 'POST') {
      console.log('browser: request', req.url());
    }
  });

  const results = [];
  let verifyCalls = 0;
  let catalogHeaderCalls = 0;
  const record = (name, passed, details) => results.push({ name, passed, details });

  await page.route(`${ADMIN_ENDPOINT}**`, async (route) => {
    const payload = route.request().postDataJSON?.() || {};

    if (payload.action === 'verifyAdmin') {
      verifyCalls += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, message: 'authorized' }),
      });
      return;
    }

    if (payload.action === 'getCatalogHeader') {
      catalogHeaderCalls += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, value: 'Título do catálogo QA' }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: false, message: 'unexpected action' }),
    });
  });

  await page.addInitScript((sheetId) => {
    window.__promptCount = 0;
    window.prompt = () => {
      window.__promptCount += 1;
      return `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0`;
    };
    window.alert = () => {};
  }, FAKE_SHEET_ID);

  try {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const enableAdminExists = await page.evaluate(() => typeof window.enableAdminMode === 'function');
    console.log('Teste: enableAdminMode exposto? ', enableAdminExists);

    const onlineStatus = await page.evaluate(() => navigator.onLine);
    console.log('Teste: navigator.onLine =', onlineStatus);

    const promptCountInitial = await page.evaluate(() => window.__promptCount || 0);
    console.log('Teste: promptCountInitial =', promptCountInitial);
    assert.ok(promptCountInitial >= 1, 'A validação inicial deve solicitar o ID do Apps Script.');

    const iconStatusBeforeWait = await page.evaluate(() => {
      const icon = document.getElementById('footer-config-icon');
      if (!icon) return null;
      const style = window.getComputedStyle(icon);
      const rect = icon.getBoundingClientRect();
      return {
        classes: Array.from(icon.classList),
        ariaHidden: icon.getAttribute('aria-hidden'),
        tabIndex: icon.getAttribute('tabindex'),
        display: style.display,
        visibility: style.visibility,
        width: rect.width,
        height: rect.height,
      };
    });
    console.log('Status inicial do ícone:', iconStatusBeforeWait);

    await page.waitForFunction(() => {
      const icon = document.getElementById('footer-config-icon');
      if (!icon) return false;
      const style = window.getComputedStyle(icon);
      return (
        !icon.classList.contains('hidden') &&
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        icon.getAttribute('aria-hidden') === 'false'
      );
    }, { timeout: 15000 });

    const ariaHidden = await page.getAttribute('#footer-config-icon', 'aria-hidden');
    const tabIndex = await page.getAttribute('#footer-config-icon', 'tabindex');
    const promptCount = await page.evaluate(() => window.__promptCount || 0);

    assert.ok(promptCount >= 1, 'O ID deve ser solicitado na primeira validação.');
    assert.strictEqual(ariaHidden, 'false', 'O ícone admin deve ficar visível após validação.');
    assert.strictEqual(tabIndex, '0', 'O ícone admin deve ser navegável por teclado.');

    await page.evaluate(() => {
      document.getElementById('footer-config-icon')?.click();
    });
    await page.waitForSelector('#adminControlPanel .admin-panel-value', { timeout: 6000 });
    const loadedValue = await page.textContent('#adminControlPanel .admin-panel-value');
    assert.ok(loadedValue.includes('Título do catálogo QA'), 'A1 deve ser renderizado no painel.');
    record('Validação inicial do admin com painel renderizado', true, loadedValue.trim());

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => {
      const icon = document.getElementById('footer-config-icon');
      if (!icon) return false;
      const style = window.getComputedStyle(icon);
      return (
        !icon.classList.contains('hidden') &&
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        icon.getAttribute('aria-hidden') === 'false'
      );
    }, { timeout: 6000 });
    const promptCountAfterReload = await page.evaluate(() => window.__promptCount || 0);
    assert.strictEqual(promptCountAfterReload, 0, 'O ID salvo deve ser reutilizado sem novo prompt.');

    await page.evaluate(() => {
      document.getElementById('footer-config-icon')?.click();
    });
    await page.waitForSelector('#adminControlPanel .admin-panel-value', { timeout: 6000 });
    const loadedValueAfterReload = await page.textContent('#adminControlPanel .admin-panel-value');
    assert.ok(loadedValueAfterReload.includes('Título do catálogo QA'), 'O painel deve abrir após reload usando o ID salvo.');
    record('Reabertura do painel com ID salvo em IndexedDB', true, {
      valor: loadedValueAfterReload.trim(),
      verificacoes: verifyCalls,
      leiturasCabecalho: catalogHeaderCalls,
    });
  } catch (error) {
    record('Fluxo admin', false, {
      mensagem: error.message,
      verificacoes: verifyCalls,
      leiturasCabecalho: catalogHeaderCalls,
    });
    console.error('Erro no teste de acesso admin:', error);
    console.table(results);
    console.dir(results, { depth: 5 });
    await browser.close();
    server.stop();
    process.exit(1);
  }

  await browser.close();
  server.stop();
  console.table(results);
})();
