const DESIGN_KIT_RELEASE_INFO = Object.freeze({
  version: 'v0.1.207',
  publishedAt: '2025-10-25T11:00:00-03:00',
});

const releaseDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

export function getDesignKitReleaseInfo() {
  return { ...DESIGN_KIT_RELEASE_INFO };
}

export function formatDesignKitReleaseDate(value) {
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
