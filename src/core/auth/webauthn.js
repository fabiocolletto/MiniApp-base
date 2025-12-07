// src/core/auth/webauthn.js

// Gera desafio simples (recomendado: random 32 bytes)
function generateChallenge() {
  return window.crypto.getRandomValues(new Uint8Array(32));
}

// Converte array para base64url (WebAuthn exige)
function toBase64Url(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function initWebAuthn() {
  // Checa se o dispositivo suporta WebAuthn
  if (!window.PublicKeyCredential) {
    console.warn("WebAuthn não suportado neste dispositivo.");
    return false;
  }

  // Já existe uma credencial salva?
  const existing = localStorage.getItem("webauthn-credential");
  if (existing) {
    // Autenticar usuário automaticamente
    try {
      await loginWithWebAuthn();
      return true;
    } catch (err) {
      console.warn("Falha no login biométrico:", err);
      return false;
    }
  }

  // Senão, criar uma nova credencial
  try {
    const credential = await createCredential();
    localStorage.setItem("webauthn-credential", credential);
    return true;

  } catch (err) {
    console.error("Erro ao criar credencial WebAuthn:", err);
    return false;
  }
}

// Cria credencial WebAuthn (somente no primeiro acesso)
async function createCredential() {
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: generateChallenge(),
      rp: {
        name: "5 Horas – Sistema Familiar",
      },
      user: {
        name: "LocalUser",
        id: new Uint8Array(16), // ID fixo local, não precisa servidor
        displayName: "LocalUser",
      },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "preferred",
        userVerification: "required", // força biometria
      },
      timeout: 60000,
    },
  });

  return toBase64Url(credential.rawId);
}

// Executa autenticação por biometria ao abrir o app
async function loginWithWebAuthn() {
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: generateChallenge(),
      userVerification: "required",
      timeout: 60000,
    },
  });

  return true; // Se chegou até aqui, biometria validada
}
