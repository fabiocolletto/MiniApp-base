import { defaultSyncSettings } from './sync/policy.js';

const KEY = 'syncSettings';

export const settingsStore = {
  async loadSyncSettings() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : defaultSyncSettings;
    } catch {
      return defaultSyncSettings;
    }
  },
  async saveSyncSettings(settings) {
    localStorage.setItem(KEY, JSON.stringify(settings));
  },
};
