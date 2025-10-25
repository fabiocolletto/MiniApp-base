const SYSTEM_METADATA = Object.freeze({
  version: '0.1.234',
  publishedAt: '2025-10-25T15:03:00-03:00',
  changelogPath: './Log.md',
});

export function getSystemMetadata() {
  return { ...SYSTEM_METADATA };
}

export function getSystemVersion() {
  return SYSTEM_METADATA.version;
}

export function getSystemVersionLabel() {
  const version = getSystemVersion();
  if (typeof version === 'string' && version.trim() !== '') {
    const normalized = version.trim().replace(/^v/i, '');
    return `v${normalized}`;
  }
  return 'v0';
}

export function getSystemReleaseDate() {
  return SYSTEM_METADATA.publishedAt;
}

export function getSystemChangelogPath() {
  return SYSTEM_METADATA.changelogPath;
}
