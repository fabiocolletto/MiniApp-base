/**
 * @typedef {'gdrive' | 'onedrive'} Provider
 * @typedef {'local_only' | 'cloud_primary'} SyncPolicy
 *
 * @typedef {Object} UserSyncSettings
 * @property {SyncPolicy} policy
 * @property {Provider} [provider]
 * @property {'AES-GCM'} [cipher]
 * @property {string} [salt]
 * @property {number} [iterations]
 * @property {boolean} [hasTokens]
 */

/** @type {UserSyncSettings} */
export const defaultSyncSettings = { policy: 'local_only' };
