export function collectDeviceInfo() {
  if (typeof navigator === 'undefined') {
    return 'Desconhecido';
  }

  const platform = typeof navigator.platform === 'string' ? navigator.platform.trim() : '';
  const language = typeof navigator.language === 'string' ? navigator.language.trim() : '';
  const userAgent = typeof navigator.userAgent === 'string' ? navigator.userAgent.trim() : '';

  const parts = [platform, language, userAgent].filter(Boolean);
  const summary = parts.join(' | ');

  return summary.slice(0, 512) || 'Desconhecido';
}
