import type { StorageAdapter, SyncManifest } from './index.js';

export class OneDriveAdapter implements StorageAdapter {
  async init(): Promise<void> { /* TODO: OAuth PKCE + approot */ }
  async getManifest(): Promise<{ manifest: SyncManifest | null; etag?: string }> {
    return { manifest: null };
  }
  async putManifest(_m: SyncManifest, _ifMatch?: string): Promise<string> {
    throw new Error('OneDrive putManifest: não implementado');
  }
  async upload(_path: string, _blob: Blob, _ifMatch?: string): Promise<string> {
    throw new Error('OneDrive upload: não implementado');
  }
  async download(_path: string): Promise<{ blob: Blob; etag?: string }> {
    throw new Error('OneDrive download: não implementado');
  }
  async list(_prefix: string): Promise<string[]> { return []; }
  async exists(_path: string): Promise<boolean> { return false; }
  async unlink(): Promise<void> { /* TODO: revogar tokens e limpar pasta */ }
}
