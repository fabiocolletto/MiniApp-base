import { adapters } from './providers/index.js';
import { settingsStore } from '../settings.js';
import { defaultSyncSettings, type UserSyncSettings } from './policy.js';

type Listener = (s: UserSyncSettings) => void;

export class SyncPolicyManager {
  private current: UserSyncSettings = defaultSyncSettings;
  private listeners: Listener[] = [];

  async init(): Promise<void> {
    this.current = await settingsStore.loadSyncSettings();
    this.emit();
  }

  subscribe(cb: Listener): () => void {
    this.listeners.push(cb);
    return () => { this.listeners = this.listeners.filter(x => x !== cb); };
  }

  private emit() { this.listeners.forEach(l => l(this.current)); }

  get(): UserSyncSettings { return this.current; }

  async enableMultiDevice(next: Omit<UserSyncSettings,'policy'>): Promise<void> {
    this.current = { policy: 'cloud_primary', ...next };
    await settingsStore.saveSyncSettings(this.current);

    // Tenta inicializar o provedor (sem quebrar a UI se ainda não implementado)
    try {
      if (next.provider) {
        const adapter = adapters.get(next.provider);
        await adapter.init();
        // Primeira sync será responsabilidade do worker.
      }
    } catch {
      // Mantém política ativa mesmo sem adapter pronto.
    }
    this.emit();
  }

  async disableMultiDevice(opts: { removeRemote: boolean }): Promise<void> {
    const prev = this.current;
    this.current = { policy: 'local_only' };
    await settingsStore.saveSyncSettings(this.current);

    if (opts.removeRemote && prev.provider) {
      try {
        const adapter = adapters.get(prev.provider);
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
