import { getSystemMetadata, getSystemVersion } from './system-metadata.js';

const releaseDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

export function getSystemReleaseInfo() {
  const metadata = getSystemMetadata();
  const version = typeof metadata?.version === 'string' ? metadata.version : getSystemVersion();

  return {
    version,
    publishedAt: metadata?.publishedAt ?? null,
    changelogPath: metadata?.changelogPath ?? './Log.md',
  };
}

export function formatSystemReleaseDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return releaseDateFormatter.format(value);
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return releaseDateFormatter.format(date);
    }
    return '';
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return releaseDateFormatter.format(parsed);
    }
  }

  return '';
}
