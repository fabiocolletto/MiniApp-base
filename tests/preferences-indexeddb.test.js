import { test, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';

import './helpers/fake-indexeddb.js';
import { savePreferences, loadPreferences } from '../miniapp-base/preferences.js';
import { openMarcoCore } from '../shared/storage/idb/databases.js';

beforeEach(async () => {
  await new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase('marco_core');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });
});

after(async () => {
  await new Promise((resolve) => {
    const request = indexedDB.deleteDatabase('marco_core');
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
});

test('Preferências persistem no IndexedDB compartilhado', async () => {
  const prefs = { theme: 'dark', lang: 'en-US', fontScale: 2 };
  await savePreferences(prefs);

  const db = await openMarcoCore();
  const stored = await db.get('prefs', 'ui_prefs');
  db.close();

  assert.equal(stored.theme, 'dark');
  assert.equal(stored.lang, 'en-US');
  assert.equal(stored.fontScale, 2);
  assert.equal(stored.navCollapsed, false);

  const reloaded = await loadPreferences();
  assert.equal(reloaded.theme, 'dark');
  assert.equal(reloaded.lang, 'en-US');
  assert.equal(reloaded.fontScale, 2);
  assert.equal(reloaded.navCollapsed, false);
});

test('Preferência de menu recolhido persiste corretamente', async () => {
  await savePreferences({ navCollapsed: true });
  const reloaded = await loadPreferences();
  assert.equal(reloaded.navCollapsed, true);

  await savePreferences({ navCollapsed: false });
  const secondReload = await loadPreferences();
  assert.equal(secondReload.navCollapsed, false);
});
