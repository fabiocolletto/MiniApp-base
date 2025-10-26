import SYSTEM_RELEASE_SOURCE from '../data/system-release-source.js';

function normalizeVersionInput(rawVersion) {
  if (typeof rawVersion === 'number' && Number.isFinite(rawVersion)) {
    return rawVersion.toString();
  }

  if (typeof rawVersion === 'string') {
    const cleaned = rawVersion.trim();
    if (cleaned) {
      return cleaned.replace(/^v/i, '');
    }
  }

  return '';
}

function ensureVersionLabel(rawVersion) {
  const normalized = normalizeVersionInput(rawVersion);
  return normalized ? `v${normalized}` : 'v0';
}

function resolveSource(overrides = {}) {
  const base = {
    version: SYSTEM_RELEASE_SOURCE.version,
    versionLabel: null,
    publishedAt: SYSTEM_RELEASE_SOURCE.publishedAt,
    changelogPath: SYSTEM_RELEASE_SOURCE.changelogPath,
  };

  const merged = { ...base, ...overrides };
  const versionInput =
    typeof merged.versionLabel === 'string' && merged.versionLabel.trim() !== ''
      ? merged.versionLabel
      : merged.version;

  const version = normalizeVersionInput(versionInput);
  const versionLabel = ensureVersionLabel(versionInput);
  const publishedAt = merged.publishedAt ?? null;
  const changelogPath =
    typeof merged.changelogPath === 'string' && merged.changelogPath.trim() !== ''
      ? merged.changelogPath.trim()
      : './Log.md';

  return {
    version,
    versionLabel,
    publishedAt,
    changelogPath,
  };
}

export function getSystemVersionSource() {
  return SYSTEM_RELEASE_SOURCE.version;
}

export function getSystemVersion() {
  const version = normalizeVersionInput(SYSTEM_RELEASE_SOURCE.version);
  return version || '0';
}

export function getSystemVersionLabel() {
  return ensureVersionLabel(SYSTEM_RELEASE_SOURCE.version);
}

export function getSystemReleaseMetadata(overrides = {}) {
  return resolveSource(overrides);
}
