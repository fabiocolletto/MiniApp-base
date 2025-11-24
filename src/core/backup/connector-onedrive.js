const ONEDRIVE_SCOPES = ["Files.ReadWrite", "offline_access"];
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

async function ensureMsal() {
  await loadExternalScript(
    "https://alcdn.msauth.net/browser/2.37.0/js/msal-browser.min.js",
  );
  if (!window.msal) {
    throw new Error("MSAL não pôde ser carregado.");
  }
}

function getMsalClientId() {
  if (window.__BACKUP_OAUTH__?.onedriveClientId)
    return window.__BACKUP_OAUTH__.onedriveClientId;
  if (window.__env?.MS_CLIENT_ID) return window.__env.MS_CLIENT_ID;
  if (window.MS_CLIENT_ID) return window.MS_CLIENT_ID;
  return null;
}

export async function connectOneDrive(ownerId = "") {
  await ensureMsal();
  const clientId = getMsalClientId();
  if (!clientId) {
    throw new Error(
      "Client ID do Microsoft/OneDrive não configurado. Defina window.MS_CLIENT_ID.",
    );
  }

  const msalConfig = {
    auth: {
      clientId,
      redirectUri: window.location.origin,
      navigateToLoginRequestUrl: false,
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: false,
    },
  };

  const msalInstance = new window.msal.PublicClientApplication(msalConfig);
  if (typeof msalInstance.initialize === "function") {
    await msalInstance.initialize();
  }

  const loginResponse = await msalInstance.loginPopup({
    scopes: ONEDRIVE_SCOPES,
  });
  const account = loginResponse.account || null;
  const tokenRequest = { scopes: ONEDRIVE_SCOPES, account };

  let tokenResponse;
  try {
    tokenResponse = await msalInstance.acquireTokenSilent(tokenRequest);
  } catch (error) {
    tokenResponse = await msalInstance.acquireTokenPopup(tokenRequest);
  }

  const expiresOn =
    tokenResponse?.expiresOn instanceof Date
      ? tokenResponse.expiresOn.toISOString()
      : "";

  return {
    provider: "onedrive",
    accessToken: tokenResponse?.accessToken || "",
    refreshToken: tokenResponse?.refreshToken || "",
    tokenExpiry: expiresOn,
    activatedAt: new Date().toISOString(),
    ownerId: account?.homeAccountId || ownerId,
  };
}
