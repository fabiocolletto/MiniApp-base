const GOOGLE_SCOPES = ["https://www.googleapis.com/auth/drive.file"];

const scriptCache = new Map();

function loadExternalScript(src) {
  if (scriptCache.has(src)) return scriptCache.get(src);
  const promise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (
        existing.dataset.loaded === "true" ||
        existing.readyState === "complete" ||
        existing.readyState === "loaded"
      ) {
        resolve(true);
        return;
      }

      existing.addEventListener("load", () => {
        existing.dataset.loaded = "true";
        resolve(true);
      });
      existing.addEventListener("error", () =>
        reject(new Error(`Falha ao carregar script: ${src}`)),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve(true);
    };
    script.onerror = () =>
      reject(new Error(`Falha ao carregar script: ${src}`));
    document.head.appendChild(script);
  });

  scriptCache.set(src, promise);
  return promise;
}

async function ensureGoogleApis() {
  await loadExternalScript("https://apis.google.com/js/api.js");
  await loadExternalScript("https://accounts.google.com/gsi/client");
  if (!window.google || !window.google.accounts?.oauth2) {
    throw new Error("Google Identity Services não inicializado.");
  }
  return new Promise((resolve, reject) => {
    if (!window.gapi) {
      reject(new Error("Google API SDK não disponível."));
      return;
    }

    window.gapi.load("client", {
      callback: () => resolve(true),
      onerror: () =>
        reject(new Error("Não foi possível inicializar gapi.client.")),
    });
  });
}

function getGoogleClientId() {
  if (window.__BACKUP_OAUTH__?.googleClientId)
    return window.__BACKUP_OAUTH__.googleClientId;
  if (window.__env?.GOOGLE_CLIENT_ID) return window.__env.GOOGLE_CLIENT_ID;
  if (window.GOOGLE_CLIENT_ID) return window.GOOGLE_CLIENT_ID;
  return null;
}

function requestGoogleToken(clientId) {
  return new Promise((resolve, reject) => {
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: GOOGLE_SCOPES.join(" "),
        prompt: "consent",
        callback: (tokenResponse) => {
          if (tokenResponse?.access_token) {
            resolve(tokenResponse);
          } else {
            reject(new Error("Token do Google Drive não retornado."));
          }
        },
        error: (err) => reject(err),
      });

      tokenClient.requestAccessToken({ prompt: "consent" });
    } catch (error) {
      reject(error);
    }
  });
}

export async function connectGoogleDrive(ownerId = "") {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error(
      "Client ID do Google não configurado. Defina window.GOOGLE_CLIENT_ID.",
    );
  }

  await ensureGoogleApis();
  const tokenResponse = await requestGoogleToken(clientId);
  const expiresInMs = (tokenResponse.expires_in || 0) * 1000;
  const now = Date.now();

  return {
    provider: "google",
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token || "",
    tokenExpiry: expiresInMs ? new Date(now + expiresInMs).toISOString() : "",
    activatedAt: new Date().toISOString(),
    ownerId,
  };
}
