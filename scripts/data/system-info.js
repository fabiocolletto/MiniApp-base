const SYSTEM_RELEASE_INFO = Object.freeze({
  version: '0.1.198',
  publishedAt: '2025-10-24T22:30:00-03:00',
});

const releaseDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

export function getSystemReleaseInfo() {
  return { ...SYSTEM_RELEASE_INFO };
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
