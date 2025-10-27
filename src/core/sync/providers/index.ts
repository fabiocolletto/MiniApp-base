import { GDriveAdapter } from './gdrive.js';
import { OneDriveAdapter } from './onedrive.js';

export interface SyncManifest {
  version: number;
  lastSeq: number;
  snapshotETag?: string;
  createdAt: string;
  updatedAt: string;
  deviceIdPrimary: string;
  cipher: 'AES-GCM';
  salt: string;
  iterations: number;
}

export interface StorageAdapter {
  init(): Promise<void>;
  getManifest(): Promise<{ manifest: SyncManifest | null; etag?: string }>;
  putManifest(m: SyncManifest, ifMatch?: string): Promise<string>;
  upload(path: string, blob: Blob, ifMatch?: string): Promise<string>;
  download(path: string): Promise<{ blob: Blob; etag?: string }>;
  list(prefix: string): Promise<string[]>;
  exists(path: string): Promise<boolean>;
  unlink(): Promise<void>;
}

export const adapters = {
  get(provider: 'gdrive' | 'onedrive'): StorageAdapter {
    return provider === 'gdrive' ? new GDriveAdapter() : new OneDriveAdapter();
  }
};
