export type Provider = 'gdrive' | 'onedrive';
export type SyncPolicy = 'local_only' | 'cloud_primary';

export interface UserSyncSettings {
  policy: SyncPolicy;
  provider?: Provider;
  cipher?: 'AES-GCM';
  salt?: string;
  iterations?: number;
  hasTokens?: boolean;
}

export const defaultSyncSettings: UserSyncSettings = { policy: 'local_only' };
