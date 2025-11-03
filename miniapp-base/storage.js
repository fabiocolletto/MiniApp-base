import { ensurePersistentStorage, getStorageEstimate } from '../shared/storage/idb/persistence.js';
import { formatDate, formatNumber, getTranslation } from './i18n.js';

export async function checkStorageStatus(lang = 'pt-BR') {
  const timestamp = new Date();
  let persisted = false;
  let quota = null;
  let usage = null;

  try {
    persisted = await ensurePersistentStorage();
  } catch (error) {
    console.warn('Storage: falha ao solicitar persistência.', error);
  }

  try {
    const estimate = await getStorageEstimate();
    if (estimate) {
      persisted = estimate.persisted ?? persisted;
      quota = estimate.quota ?? null;
      usage = estimate.usage ?? null;
    }
  } catch (error) {
    console.warn('Storage: falha ao estimar espaço.', error);
  }

  const persistedLabel = persisted
    ? getTranslation(lang, 'diagnostics.persisted.yes')
    : getTranslation(lang, 'diagnostics.persisted.no');
  const unit = getTranslation(lang, 'diagnostics.storage.unit');

  return {
    persisted,
    quota,
    usage,
    timestamp,
    formatted: {
      persisted: persistedLabel,
      quota:
        typeof quota === 'number'
          ? `${formatNumber(quota / (1024 * 1024), lang, { maximumFractionDigits: 1 })} ${unit}`
          : null,
      usage:
        typeof usage === 'number'
          ? `${formatNumber(usage / (1024 * 1024), lang, { maximumFractionDigits: 1 })} ${unit}`
          : null,
      timestamp: formatDate(timestamp, lang),
    },
  };
}
