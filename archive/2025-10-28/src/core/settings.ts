import { defaultSyncSettings, type UserSyncSettings } from './sync/policy.js';

const KEY = 'syncSettings';

export const settingsStore = {
  async loadSyncSettings(): Promise<UserSyncSettings> {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : defaultSyncSettings;
    } catch {
      return defaultSyncSettings;
    }
  },
  async saveSyncSettings(s: UserSyncSettings): Promise<void> {
    localStorage.setItem(KEY, JSON.stringify(s));
  }
};
