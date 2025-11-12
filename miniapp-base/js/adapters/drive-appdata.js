const DRIVE_FILES_ENDPOINT = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_ENDPOINT = 'https://www.googleapis.com/upload/drive/v3/files';
const APPDATA_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';

let tokenClient;
let tokenInfo = {
  accessToken: null,
  expiresAt: 0,
};

function getConfig() {
  const config = window.__APP_CONFIG__ || {};
  if (!config.OAUTH_CLIENT_ID) {
    throw new Error('OAUTH_CLIENT_ID não configurado em window.__APP_CONFIG__.');
  }
  return config;
}

function initTokenClient() {
  if (tokenClient) {
    return tokenClient;
  }

  if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
    throw new Error('Google Identity Services não carregado.');
  }

  const { OAUTH_CLIENT_ID } = getConfig();

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: OAUTH_CLIENT_ID,
    scope: APPDATA_SCOPE,
    callback: () => {},
  });

  return tokenClient;
}

async function requestAccessToken(forcePrompt = false) {
  const client = initTokenClient();

  return new Promise((resolve, reject) => {
    client.callback = (response) => {
      if (!response || response.error) {
        reject(new Error(response?.error || 'Falha ao obter token OAuth.'));
        return;
      }

      const expiresIn = Number(response.expires_in) || 3300; // ~55 minutos
      tokenInfo = {
        accessToken: response.access_token,
        expiresAt: Date.now() + expiresIn * 1000,
      };
      resolve(response.access_token);
    };

    try {
      if (forcePrompt) {
        client.requestAccessToken({ prompt: 'consent' });
      } else {
        client.requestAccessToken();
      }
    } catch (error) {
      reject(error);
    }
  });
}

export async function ensureToken(options = {}) {
  const { force = false } = options;
  const now = Date.now();

  if (!force && tokenInfo.accessToken && tokenInfo.expiresAt - 60000 > now) {
    return tokenInfo.accessToken;
  }

  return requestAccessToken(force);
}

function cloneHeaders(inputHeaders = {}) {
  const headers = new Headers(inputHeaders);
  return headers;
}

async function authorizedFetch(url, options = {}, { retryOnUnauthorized = true } = {}) {
  const headers = cloneHeaders(options.headers);
  headers.set('Authorization', `Bearer ${await ensureToken()}`);

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 && retryOnUnauthorized) {
    await ensureToken({ force: true });
    return authorizedFetch(url, options, { retryOnUnauthorized: false });
  }

  return response;
}

function escapeNameQuery(name) {
  return name.replace(/['\\]/g, '\\$&');
}

export async function listByName(name) {
  const query = name ? `name='${escapeNameQuery(name)}'` : '';
  const url = new URL(DRIVE_FILES_ENDPOINT);
  url.searchParams.set('spaces', 'appDataFolder');
  url.searchParams.set('fields', 'files(id,name,modifiedTime,size)');
  url.searchParams.set('pageSize', '10');
  if (query) {
    url.searchParams.set('q', query);
  }

  const response = await authorizedFetch(url.toString());
  if (!response.ok) {
    throw new Error('Falha ao listar arquivos no appDataFolder.');
  }

  const data = await response.json();
  return Array.isArray(data.files) ? data.files : [];
}

async function getFileIdByName(name) {
  const files = await listByName(name);
  return files[0]?.id || null;
}

export async function getJSON(name) {
  const fileId = await getFileIdByName(name);
  if (!fileId) {
    return null;
  }

  const url = `${DRIVE_FILES_ENDPOINT}/${fileId}?alt=media`;
  const response = await authorizedFetch(url);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Falha ao obter o arquivo JSON do appDataFolder.');
  }

  return response.json();
}

function buildMultipartBody({ name, content, isUpdate = false }) {
  const boundary = '-------miniapp-drive-adapter';
  const metadata = {
    name,
    mimeType: 'application/json',
    ...(isUpdate ? {} : { parents: ['appDataFolder'] }),
  };

  const bodyParts = [
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`,
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${content}`,
    `--${boundary}--`,
  ];

  return {
    body: bodyParts.join('\r\n'),
    boundary,
  };
}

export async function upsertJSON(name, object) {
  const payload = JSON.stringify(object ?? {});
  const fileId = await getFileIdByName(name);
  const isUpdate = Boolean(fileId);
  const { body, boundary } = buildMultipartBody({ name, content: payload, isUpdate });

  const baseUrl = isUpdate ? `${DRIVE_UPLOAD_ENDPOINT}/${fileId}` : DRIVE_UPLOAD_ENDPOINT;
  const url = new URL(baseUrl);
  url.searchParams.set('uploadType', 'multipart');

  const response = await authorizedFetch(url.toString(), {
    method: isUpdate ? 'PATCH' : 'POST',
    headers: {
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (!response.ok) {
    throw new Error('Falha ao salvar o arquivo no appDataFolder.');
  }

  return response.json();
}

export async function remove(name) {
  const fileId = await getFileIdByName(name);
  if (!fileId) {
    return false;
  }

  const url = `${DRIVE_FILES_ENDPOINT}/${fileId}`;
  const response = await authorizedFetch(url, { method: 'DELETE' });

  if (response.status === 404) {
    return false;
  }

  if (!response.ok && response.status !== 204) {
    throw new Error('Falha ao remover o arquivo do appDataFolder.');
  }

  return true;
}

export function resetTokenCache() {
  tokenInfo = {
    accessToken: null,
    expiresAt: 0,
  };
}
