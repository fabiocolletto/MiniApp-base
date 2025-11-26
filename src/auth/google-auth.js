// google-auth.js
// Módulo de autenticação Google para o MiniApp Base
// Responsável por: login, logout, verificação de sessão, retorno de token
// Não contém lógica de backup; apenas autenticação.

/*
 * CONFIGURAÇÕES: Fallback local apenas para desenvolvimento
 */
const DEV_FALLBACK_CLIENT_ID =
  "364285430958-pk1hg8j3ci2e1qf600landobp529bl1a.apps.googleusercontent.com";

/*
 * Estado interno simples
 */
let googleUser = null;
let accessToken = null;

/*
 * Carrega o script Google Identity Services automaticamente
 */
function loadGoogleScript() {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    document.head.appendChild(script);
  });
}

/*
 * Inicializa o client de login
 */
function getGoogleClientId() {
  const runtimeClientId =
    window.GOOGLE_CLIENT_ID || window.__BACKUP_OAUTH__?.googleClientId;

  if (runtimeClientId) return runtimeClientId;

  const isDevHost = ["localhost", "127.0.0.1"].includes(
    window.location.hostname,
  );

  if (isDevHost && DEV_FALLBACK_CLIENT_ID) {
    return DEV_FALLBACK_CLIENT_ID;
  }

  throw new Error(
    "Client ID do Google não configurado. Injete window.GOOGLE_CLIENT_ID ou window.__BACKUP_OAUTH__.googleClientId antes de carregar a página.",
  );
}

export async function initGoogleAuth() {
  await loadGoogleScript();

  return window.google.accounts.oauth2.initTokenClient({
    client_id: getGoogleClientId(),
    scope: "openid profile email https://www.googleapis.com/auth/drive.file",
    callback: (response) => {
      accessToken = response.access_token;
    },
  });
}

function formatGoogleError(error) {
  const normalized = error?.error || error?.type || error?.message;

  switch (normalized) {
    case "popup_closed":
      return "Pop-up fechado ou bloqueado antes da autenticação.";
    case "access_denied":
      return "Permissão negada pelo usuário.";
    case "invalid_request":
      return "Solicitação inválida. Verifique o Client ID configurado.";
    default:
      return normalized || "Falha ao obter token do Google.";
  }
}

/*
 * Realiza login e retorna dados básicos do usuário + token
 */
export async function loginWithGoogle() {
  const client = await initGoogleAuth();

  return new Promise((resolve, reject) => {
    let timeoutId;

    const cleanup = () => {
      clearTimeout(timeoutId);
      client.callback = () => {};
      client.error_callback = undefined;
    };

    timeoutId = setTimeout(() => {
      cleanup();
      reject(
        new Error(
          "Tempo limite ao obter token do Google. Verifique bloqueio de pop-up ou permissões.",
        ),
      );
    }, 18000);

    client.callback = (response) => {
      accessToken = response.access_token;

      if (accessToken) {
        cleanup();
        resolve({ accessToken });
      } else {
        cleanup();
        reject(new Error("Token não retornado pelo Google."));
      }
    };

    client.error_callback = (error) => {
      cleanup();
      reject(new Error(formatGoogleError(error)));
    };

    try {
      client.requestAccessToken();
    } catch (err) {
      cleanup();
      reject(err);
    }
  });
}

/*
 * Faz logout local — encerra sessão no MiniApp (não no Google)
 */
export function logoutGoogle() {
  accessToken = null;
  googleUser = null;
  return true;
}

/*
 * Retorna o token atual, se existir
 */
export function getGoogleToken() {
  return accessToken;
}
