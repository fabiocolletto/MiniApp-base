import { test, beforeEach } from 'node:test';
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

test('Preferências persistem no IndexedDB compartilhado', async () => {
  const prefs = { theme: 'dark', lang: 'en-US', fontScale: 2 };
  await savePreferences(prefs);

  const db = await openMarcoCore();
  const stored = await db.get('prefs', 'ui_prefs');
  db.close();

  assert.equal(stored.theme, 'dark');
  assert.equal(stored.lang, 'en-US');
  assert.equal(stored.fontScale, 2);

  const reloaded = await loadPreferences();
  assert.equal(reloaded.theme, 'dark');
  assert.equal(reloaded.lang, 'en-US');
  assert.equal(reloaded.fontScale, 2);
});
