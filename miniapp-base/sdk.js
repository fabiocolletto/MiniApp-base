import { openMarcoCore, openPesquisaStudio } from '../shared/storage/idb/databases.js';
import { getSetting, setSetting } from '../shared/storage/idb/marcocore.js';
import { ensureDeviceId, getSyncState } from '../shared/storage/idb/sync.js';
import { createPrefsBus, createStoreBus } from './event-bus.js';
import {
  DEFAULT_PREFS,
  loadPreferences,
  applyPreferences,
  savePreferences,
  getCurrentPreferences,
  getFontMultiplier,
  applyTheme,
  applyLanguage,
  applyFontScale,
  applyNavCollapsed,
} from './preferences.js';
import { createAutosaveController } from './autosave.js';
import { initSync, getSyncController, SYNC_STATUSES } from './sync.js';

export const sdk = {
  storage: {
    openMarcoCore,
    openPesquisaStudio,
    getSetting,
    setSetting,
  },
  events: {
    createPrefsBus,
    createStoreBus,
  },
  preferences: {
    DEFAULT_PREFS,
    loadPreferences,
    applyPreferences,
    savePreferences,
    getCurrentPreferences,
    getFontMultiplier,
    applyTheme,
    applyLanguage,
    applyFontScale,
    applyNavCollapsed,
  },
  autosave: {
    createAutosaveController,
  },
  sync: {
    initSync,
    getSyncController,
    ensureDeviceId,
    getSyncState,
    SYNC_STATUSES,
  },
};

export {
  openMarcoCore,
  openPesquisaStudio,
  getSetting,
  setSetting,
  createPrefsBus,
  createStoreBus,
  DEFAULT_PREFS,
  loadPreferences,
  applyPreferences,
  savePreferences,
  getCurrentPreferences,
  getFontMultiplier,
  applyTheme,
  applyLanguage,
  applyFontScale,
  applyNavCollapsed,
  createAutosaveController,
  initSync,
  getSyncController,
  ensureDeviceId,
  getSyncState,
  SYNC_STATUSES,
};
