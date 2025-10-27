import { GDriveAdapter } from './gdrive.js';
import { OneDriveAdapter } from './onedrive.js';

/**
 * @typedef {Object} SyncManifest
 * @property {number} version
 * @property {number} lastSeq
 * @property {string} [snapshotETag]
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} deviceIdPrimary
 * @property {'AES-GCM'} cipher
 * @property {string} salt
 * @property {number} iterations
 */

/**
 * @typedef {Object} StorageAdapter
 * @property {() => Promise<void>} init
 * @property {() => Promise<{manifest: SyncManifest | null, etag?: string}>} getManifest
 * @property {(m: SyncManifest, ifMatch?: string) => Promise<string>} putManifest
 * @property {(path: string, blob: Blob, ifMatch?: string) => Promise<string>} upload
 * @property {(path: string) => Promise<{blob: Blob, etag?: string}>} download
 * @property {(prefix: string) => Promise<string[]>} list
 * @property {(path: string) => Promise<boolean>} exists
 * @property {() => Promise<void>} unlink
 */

export const adapters = {
  /**
   * @param {'gdrive' | 'onedrive'} provider
   * @returns {StorageAdapter}
   */
  get(provider) {
    return provider === 'gdrive' ? new GDriveAdapter() : new OneDriveAdapter();
  },
};
