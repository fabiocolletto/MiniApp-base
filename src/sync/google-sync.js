// src/sync/google-sync.js
// Lógica de comunicação com a API do Google Drive

// CORREÇÃO DE IMPORTAÇÃO: Usar CDN absoluto para garantir que funcione em qualquer ambiente
import { getGoogleToken } from "https://cdn.jsdelivr.net/gh/fabiocolletto/miniapp@main/src/auth/google-auth.js";

const BACKUP_FOLDER = "appdata"; // Nome da pasta/app no Drive
const BACKUP_MIME_TYPE = "application/json";

/**
 * Retorna o ID do arquivo de backup se ele existir, ou null.
 * @param {string} fileName - Nome do arquivo de backup (ex: 'backup.json').
 */
async function findBackupFile(fileName) {
  const token = getGoogleToken();
  if (!token) throw new Error("Não autenticado com o Google.");
  // ... (RESTO DA FUNÇÃO PERMANECE IGUAL)
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and trashed=false and 'root' in parents&fields=files(id, modifiedTime, size)`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar arquivo no Drive.");
  }

  const result = await response.json();
  return result.files.length > 0 ? result.files[0] : null;
}

/**
 * Salva (ou atualiza) os dados no Google Drive.
 * @param {object} appData - Os dados a serem salvos (JSON).
 * @param {string} fileName - Nome do arquivo (ex: 'backup.json').
 */
export async function syncUpload(appData, fileName) {
  const token = getGoogleToken();
  if (!token) throw new Error("Não autenticado com o Google.");

  const fileInfo = await findBackupFile(fileName);
  // ... (RESTO DA FUNÇÃO PERMANECE IGUAL)
  const metadata = {
    name: fileName,
    mimeType: BACKUP_MIME_TYPE,
  };

  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  form.append(
    "file",
    new Blob([JSON.stringify(appData)], { type: BACKUP_MIME_TYPE })
  );

  let url;
  let method;

  if (fileInfo) {
    // Atualiza arquivo existente
    url = `https://www.googleapis.com/upload/drive/v3/files/${fileInfo.id}?uploadType=multipart`;
    method = "PATCH";
  } else {
    // Cria novo arquivo
    url = `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;
    method = "POST";
  }

  const response = await fetch(url, {
    method: method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!response.ok) {
    throw new Error("Falha ao salvar o arquivo no Google Drive.");
  }

  return await response.json();
}

/**
 * Baixa os dados do Google Drive.
 * @param {string} fileName - Nome do arquivo (ex: 'backup.json').
 * @returns {object | null} O objeto de dados restaurado ou null se não houver backup.
 */
export async function syncDownload(fileName) {
  const token = getGoogleToken();
  if (!token) throw new Error("Não autenticado com o Google.");

  const fileInfo = await findBackupFile(fileName);
  if (!fileInfo) return null;
  // ... (RESTO DA FUNÇÃO PERMANECE IGUAL)
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileInfo.id}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao baixar o conteúdo do backup.");
  }

  return await response.json();
}
