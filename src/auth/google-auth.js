// google-auth.js
// Módulo de autenticação Google para o MiniApp Base
// Responsável por: login, logout, verificação de sessão, retorno de token
// Não contém lógica de backup; apenas autenticação.

/*
 * CONFIGURAÇÕES: Substituir pelo CLIENT_ID criado no Google Cloud
 */
export const GOOGLE_CLIENT_ID = "364285430958-pk1hg8j3ci2e1qf600landobp529bl1a.apps.googleusercontent.com";

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
export async function initGoogleAuth() {
  await loadGoogleScript();

  return window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: "openid profile email https://www.googleapis.com/auth/drive.file",
    callback: (response) => {
      accessToken = response.access_token;
    },
  });
}

/*
 * Realiza login e retorna dados básicos do usuário + token
 */
export async function loginWithGoogle() {
  return new Promise(async (resolve, reject) => {
    try {
      const client = await initGoogleAuth();

      client.requestAccessToken();

      const interval = setInterval(() => {
        if (accessToken) {
          clearInterval(interval);
          resolve({ accessToken });
        }
      }, 200);
    } catch (err) {
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
