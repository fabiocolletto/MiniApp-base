const APP_SCRIPT_URL =
  globalThis.UNIQUE_ID_ENDPOINT ||
  'https://script.google.com/macros/s/APP_SCRIPT_DEPLOYMENT_URL/exec';

export async function getUniqueId(phone) {
  const url = `${APP_SCRIPT_URL}?phone=${encodeURIComponent(phone)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Falha ao obter UniqueID');
  }
  const data = await res.json();
  return data.uniqueId;
}
