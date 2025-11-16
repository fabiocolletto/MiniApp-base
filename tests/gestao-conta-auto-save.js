const assert = require('assert');
const { chromium } = require('playwright');
const path = require('path');
const { startStaticServer } = require('./helpers/server');

const ROOT = path.join(__dirname, '..');

const waitForSyncMessage = async (page) => {
    await page.waitForSelector('#syncStatusDisplay', { state: 'attached' });
    await page.waitForTimeout(250);
};

(async () => {
    const server = await startStaticServer({ root: ROOT });
    const BASE_URL = `http://localhost:${server.port}/miniapps/gestao-de-conta-do-usuario/index.html`;
    const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    const page = await browser.newPage();
    page.on('console', (msg) => console.log('browser:', msg.text()));

    const results = [];
    const record = (name, passed, details) => results.push({ name, passed, details });

    try {
        await page.goto(BASE_URL);
        await page.waitForSelector('[data-panel-action="profile"]');

        // Teste 1: Auto-save de dados do perfil
        try {
            await page.click('[data-panel-action="profile"]');
            await page.waitForSelector('#profileEditModal.active');

            const newName = 'Teste QA - Perfil';
            const newEmail = 'qa.perfil@5horas.com';
            const newPhone = '(11) 90000-0001';

            await page.fill('#inputName', newName);
            await page.fill('#inputEmail', newEmail);
            await page.fill('#inputPhone', newPhone);
            await page.waitForTimeout(800);
            await waitForSyncMessage(page);
            await page.waitForFunction(
                (expected) => {
                    const nameField = document.querySelector('[data-field="userName"]');
                    return nameField && nameField.textContent.trim() === expected;
                },
                newName,
            );
            await page.click('[data-modal-close="profileEditModal"]');
            await page.reload();
            await page.waitForSelector('[data-panel-action="profile"]');
            await page.waitForFunction(
                (expected) => {
                    const nameField = document.querySelector('[data-field="userName"]');
                    return nameField && nameField.textContent.trim() === expected;
                },
                newName,
            );
            await page.click('[data-panel-action="profile"]');
            await page.waitForSelector('#profileEditModal.active');

            const savedName = await page.inputValue('#inputName');
            const savedEmail = await page.inputValue('#inputEmail');
            const savedPhone = await page.inputValue('#inputPhone');

            assert.strictEqual(savedName, newName, 'Nome não persistiu após recarregar.');
            assert.strictEqual(savedEmail, newEmail, 'Email não persistiu após recarregar.');
            assert.strictEqual(savedPhone, newPhone, 'Telefone não persistiu após recarregar.');
            record('Perfil: auto-save de nome, email e telefone', true, 'Campos mantiveram valores após reload.');
            await page.click('[data-modal-close="profileEditModal"]');
        } catch (error) {
            record('Perfil: auto-save de nome, email e telefone', false, error.message);
            throw error;
        }

        // Teste 2: Auto-save de MFA
        try {
            await page.click('[data-panel-action="security"]');
            await page.waitForSelector('#securityModal.active');
            await page.selectOption('#mfaSelect', { label: 'Chave de Segurança Física' });
            await page.waitForTimeout(600);
            await waitForSyncMessage(page);
            await page.click('[data-modal-close="securityModal"]');
            await page.reload();
            await page.waitForSelector('[data-panel-action="security"]');
            await page.click('[data-panel-action="security"]');
            await page.waitForSelector('#securityModal.active');
            const savedMfa = await page.$eval('#mfaSelect', (el) => el.value);
            assert.strictEqual(savedMfa, 'Chave de Segurança Física', 'MFA não persistiu após reload.');
            record('Segurança: auto-save de MFA', true, 'Seleção de MFA permaneceu após reload.');
            await page.click('[data-modal-close="securityModal"]');
        } catch (error) {
            record('Segurança: auto-save de MFA', false, error.message);
            throw error;
        }

        // Teste 3: Auto-save de notificações
        try {
            await page.click('[data-panel-action="notifications"]');
            await page.waitForSelector('#notificationsModal.active');
            const toggleSelector = '.toggle-switch[data-setting="productNews"]';
            await page.click(toggleSelector);
            await page.waitForTimeout(600);
            await waitForSyncMessage(page);
            const expectedState = await page.getAttribute(toggleSelector, 'data-active');
            await page.click('[data-modal-close="notificationsModal"]');
            await page.reload();
            await page.waitForSelector('[data-panel-action="notifications"]');
            await page.click('[data-panel-action="notifications"]');
            await page.waitForSelector('#notificationsModal.active');
            const persistedState = await page.getAttribute(toggleSelector, 'data-active');
            assert.strictEqual(persistedState, expectedState, 'Toggle de notificações não persistiu.');
            record('Notificações: auto-save de toggles', true, `Estado persistido como ${persistedState}.`);
            await page.click('[data-modal-close="notificationsModal"]');
        } catch (error) {
            record('Notificações: auto-save de toggles', false, error.message);
            throw error;
        }

        // Teste 4: Auto-save de favoritos
        try {
            await page.click('[data-panel-action="favorites"]');
            await page.waitForSelector('#favoritesModal.active');
            const favoriteSelector = 'input[type="checkbox"][data-favorite="aprovacao-despesas"]';
            const initialState = await page.isChecked(favoriteSelector);
            await page.click(favoriteSelector);
            await page.waitForTimeout(600);
            await waitForSyncMessage(page);
            const expectedFavorites = !initialState;
            await page.click('[data-modal-close="favoritesModal"]');
            await page.reload();
            await page.waitForSelector('[data-panel-action="favorites"]');
            await page.click('[data-panel-action="favorites"]');
            await page.waitForSelector('#favoritesModal.active');
            const persistedFavorites = await page.isChecked(favoriteSelector);
            assert.strictEqual(persistedFavorites, expectedFavorites, 'Favorito não persistiu após reload.');
            record('Favoritos: auto-save de seleção', true, `Checkbox persistido como ${persistedFavorites}.`);
            await page.click('[data-modal-close="favoritesModal"]');
        } catch (error) {
            record('Favoritos: auto-save de seleção', false, error.message);
            throw error;
        }

    } catch (error) {
        console.error('Falha em algum teste:', error);
        console.table(results);
        await browser.close();
        server.stop();
        process.exit(1);
    }

    await browser.close();
    server.stop();
    console.table(results);
})();
