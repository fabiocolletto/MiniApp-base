// src/sync/google-sync.js
// Lógica de comunicação com a API do Google Drive

// Importa o token de autenticação (src/auth/google-auth.js)
import { getGoogleToken } from "../auth/google-auth.js"; 

const BACKUP_FOLDER = "appdata"; // Nome da pasta/app no Drive
const BACKUP_MIME_TYPE = "application/json";

/**
 * Retorna o ID do arquivo de backup se ele existir, ou null.
 */
async function findBackupFile(fileName) {
  const token = getGoogleToken();
  if (!token) throw new Error("Não autenticado com o Google.");

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and trashed=false and 'root' in parents&fields=files(id, modifiedTime, size)`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar arquivo no Drive: " + response.statusText);
  }

  const result = await response.json();
  return result.files.length > 0 ? result.files[0] : null;
}

/**
 * Salva (ou atualiza) os dados no Google Drive usando multipart/related.
 */
export async function syncUpload(appData, fileName) {
  const token = getGoogleToken();
  if (!token) throw new Error("Não autenticado com o Google.");

  const fileInfo = await findBackupFile(fileName);

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
    url = `https://www.googleapis.com/upload/drive/v3/files/${fileInfo.id}?uploadType=multipart`;
    method = "PATCH";
  } else {
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
    throw new Error("Falha ao salvar o arquivo no Google Drive: " + response.statusText);
  }

  return await response.json();
}

/**
 * Baixa os dados do Google Drive.
 */
export async function syncDownload(fileName) {
  const token = getGoogleToken();
  if (!token) throw new Error("Não autenticado com o Google.");

  const fileInfo = await findBackupFile(fileName);
  if (!fileInfo) return null;

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileInfo.id}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao baixar o conteúdo do backup: " + response.statusText);
  }

  return await response.json();
}
