import { adapters } from './providers/index.js';
import { settingsStore } from '../settings.js';
import { defaultSyncSettings } from './policy.js';

class SyncPolicyManager {
  constructor() {
    this.current = defaultSyncSettings;
    /** @type {Array<(s: import('./policy.js').UserSyncSettings)>} */
    this.listeners = [];
  }

  async init() {
    this.current = await settingsStore.loadSyncSettings();
    this.emit();
  }

  subscribe(cb) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== cb);
    };
  }

  emit() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.current);
      } catch (error) {
        console.error('syncPolicyManager listener error', error);
      }
    });
  }

  get() {
    return this.current;
  }

  async enableMultiDevice(next) {
    this.current = { policy: 'cloud_primary', ...next };
    await settingsStore.saveSyncSettings(this.current);

    try {
      if (next && next.provider) {
        const adapter = adapters.get(next.provider);
        await adapter.init();
      }
    } catch {
      // Mantém política ativa mesmo sem adapter pronto.
    }
    this.emit();
  }

  async disableMultiDevice(opts) {
    const previous = this.current;
    this.current = { policy: 'local_only' };
    await settingsStore.saveSyncSettings(this.current);

    if (opts.removeRemote && previous.provider) {
      try {
        const adapter = adapters.get(previous.provider);
        await adapter.init();
        await adapter.unlink();
      } catch {
        // Silencioso: remoção é "best effort"
      }
    }

    this.emit();
  }
}

export const syncPolicyManager = new SyncPolicyManager();
