// Dexie = armazenamento local
// WebAuthn = API nativa, sem libs externas
// UX seguindo boas práticas de produtos digitais no Brasil

import React, { useEffect, useState } from "react";
import Dexie from "dexie";

// ========================
// 1. IndexedDB com Dexie
// ========================
const db = new Dexie("fiveHoursFamilyDB");

db.version(1).stores({
  user: "userId",
  profiles: "type, code",
  links: "++id, from, to",
  notifications: "id, to",
  cache: "key"
});

// ========================
// 2. WebAuthn nativo com fallback seguro
// ========================
function hasNativeWebAuthn() {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    navigator.credentials &&
    typeof window.PublicKeyCredential !== "undefined"
  );
}

async function registrarBiometriaSeguro(options) {
  if (!hasNativeWebAuthn()) return null;
  try {
    return await navigator.credentials.create({ publicKey: options });
  } catch (err) {
    console.warn("WebAuthn create falhou:", err);
    return null;
  }
}

async function autenticarSeguro(options) {
  if (!hasNativeWebAuthn()) return null;
  try {
    return await navigator.credentials.get({ publicKey: options });
  } catch (err) {
    console.warn("WebAuthn get falhou:", err);
    return null;
  }
}

// ========================
// 3. Loader de MiniApps
// ========================
const MiniAppLoader = ({ path }) => (
  <iframe
    src={`./products/${path}/index.html`}
    title="MiniApp"
    style={{ width: "100%", height: "100%", border: "none" }}
    sandbox="allow-scripts allow-same-origin allow-forms"
  />
);

// ========================
// 4. Orquestrador de Telas (Stage)
// ========================
function ScreenOrchestrator({
  screen,
  miniapp,
  onRegisterBio,
  onAuthenticate,
  userData,
  setUserData,
  saveState,
  onSaveUser,
  formPulse
}) {
  if (screen === "miniapp" && miniapp) {
    return <MiniAppLoader path={miniapp} />;
  }

  if (screen === "user") {
    return (
      <div className="p-4 space-y-6">
        <h2 className="text-xl font-semibold mb-2">Painel do Usuário</h2>
        <p className="text-sm text-gray-600">Gerencie seus dados locais neste dispositivo.</p>

        {/* FORMULÁRIO COM UX FINAL */}
        <form
          className={`space-y-4 bg-white p-4 rounded shadow transition ${
            formPulse ? "animate-pulse" : ""
          }`}
        >
          {/* Nome */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium">Nome completo</label>
            <div className="relative">
              <input
                type="text"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                placeholder="Digite seu nome"
                className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring focus:border-blue-400"
              />
              {userData.name && (
                <span className="absolute right-2 top-2 text-green-600 text-xs">✓</span>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium">E-mail</label>
            <div className="relative">
              <input
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                placeholder="seuemail@exemplo.com"
                className={`border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring focus:border-blue-400 ${
                  userData.email && !userData.email.includes("@") ? "border-red-400" : ""
                }`}
              />
              {userData.email && userData.email.includes("@") && (
                <span className="absolute right-2 top-2 text-green-600 text-xs">✓</span>
              )}
            </div>
          </div>

          {/* Telefone */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium">Telefone</label>
            <div className="relative">
              <input
                type="tel"
                value={userData.phone}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring focus:border-blue-400"
              />
              {userData.phone && userData.phone.length >= 10 && (
                <span className="absolute right-2 top-2 text-green-600 text-xs">✓</span>
              )}
            </div>
          </div>

          {/* Botão inteligente */}
          <button
            type="button"
            disabled={saveState === "saving"}
            onClick={onSaveUser}
            className={`w-full py-2 rounded text-sm shadow text-white transition-all duration-300
              ${
                saveState === "saving"
                  ? "bg-blue-400"
                  : saveState === "success"
                  ? "bg-green-600"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {saveState === "idle" && "Salvar dados"}
            {saveState === "saving" && "Salvando…"}
            {saveState === "success" && "Salvo ✓"}
          </button>
        </form>

        {/* Tabela de dados existentes */}
        <div className="bg-white rounded shadow p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">Tabela de dados do usuário</h3>
              <p className="text-xs text-gray-600">Edite direto na tabela e salve para persistir no Dexie.</p>
            </div>
            {userLoaded ? (
              <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">dados carregados</span>
            ) : (
              <span className="text-xs text-gray-500">sincronizando…</span>
            )}
          </div>

          <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-3 py-2 font-semibold text-gray-700 border-b">Campo</th>
                  <th className="px-3 py-2 font-semibold text-gray-700 border-b">Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2 border-b align-middle">Nome completo</td>
                  <td className="px-3 py-2 border-b">
                    <input
                      type="text"
                      value={userData.name}
                      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-400"
                      placeholder="Digite seu nome"
                    />
                  </td>
                </tr>
                <tr className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2 border-b align-middle">E-mail</td>
                  <td className="px-3 py-2 border-b">
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-400"
                      placeholder="seuemail@exemplo.com"
                    />
                  </td>
                </tr>
                <tr className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2 border-b align-middle">Telefone</td>
                  <td className="px-3 py-2 border-b">
                    <input
                      type="tel"
                      value={userData.phone}
                      onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-400"
                      placeholder="(11) 99999-9999"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-right text-xs text-gray-600">
            Última atualização local: {userLoaded ? "pronta para edição" : "aguardando dados"}
          </div>
        </div>

        {/* Biometria */}
        <div className="space-y-3">
          <button
            onClick={onRegisterBio}
            className="text-sm px-3 py-2 border rounded w-full"
          >
            Registrar biometria
          </button>
          <button
            onClick={onAuthenticate}
            className="text-sm px-3 py-2 border rounded w-full"
          >
            Autenticar
          </button>
        </div>
      </div>
    );
  }

  if (screen === "dashboard") {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-semibold mb-2">Dashboard Familiar</h2>
        <p className="text-sm text-gray-600">Modo offline ativo via Dexie.</p>
      </div>
    );
  }

  return <div className="p-4">Carregando…</div>;
}

// ========================
// 5. AppShell
// ========================
export default function AppShell() {
  const [screen, setScreen] = useState("loading"); // "dashboard" | "miniapp" | "user"
  const [miniapp, setMiniapp] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [bioStatus, setBioStatus] = useState(null); // { type: 'error' | 'info', message: string }

  const [userData, setUserData] = useState({ name: "", email: "", phone: "" });
  const [saveState, setSaveState] = useState("idle"); // "idle" | "saving" | "success"
  const [formPulse, setFormPulse] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);

  // Inicialização
  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const existing = await db.table("user").get("local");
        if (existing) {
          setUserData({
            name: existing.name || "",
            email: existing.email || "",
            phone: existing.phone || ""
          });
        } else {
          await db.table("user").put({
            userId: "local",
            name: "",
            email: "",
            phone: "",
            createdAt: Date.now()
          });
        }
        if (active) setUserLoaded(true);
        setScreen("dashboard");
      } catch (err) {
        console.warn(err);
        setScreen("dashboard");
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  // SALVAR USUÁRIO COM UX COMPLETA
  async function onSaveUser() {
    setSaveState("saving");
    await db.table("user").update("local", userData);

    // animação rápida no card
    setFormPulse(true);
    setTimeout(() => setFormPulse(false), 400);

    // estado de sucesso + banner
    setSaveState("success");
    setBannerVisible(true);
    setBioStatus({ type: "info", message: "Dados salvos localmente." });

    // esconder banner após 3s
    setTimeout(() => setBannerVisible(false), 3000);
    // voltar botão para estado idle após 1.5s
    setTimeout(() => setSaveState("idle"), 1500);
  }

  async function handleRegistrarBiometria() {
    const cred = await registrarBiometriaSeguro({
      challenge: new Uint8Array([1, 2, 3, 4]),
      rp: { name: "5 Horas" },
      user: {
        id: new Uint8Array([1]),
        name: "local",
        displayName: "Usuário Local"
      },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }]
    });

    if (!cred) {
      setBioStatus({
        type: "error",
        message: "Não foi possível registrar a biometria neste dispositivo."
      });
      setBannerVisible(true);
      setTimeout(() => setBannerVisible(false), 3000);
    } else {
      setBioStatus({ type: "info", message: "Biometria registrada com sucesso." });
      setBannerVisible(true);
      setTimeout(() => setBannerVisible(false), 3000);
    }
  }

  async function handleAutenticar() {
    const cred = await autenticarSeguro({
      challenge: new Uint8Array([1, 2, 3, 4]),
      allowCredentials: [],
      timeout: 60000
    });

    if (!cred) {
      setBioStatus({
        type: "error",
        message: "Não foi possível autenticar via biometria neste dispositivo."
      });
      setBannerVisible(true);
      setTimeout(() => setBannerVisible(false), 3000);
    } else {
      setBioStatus({
        type: "info",
        message: "Autenticado com sucesso pela biometria."
      });
      setBannerVisible(true);
      setTimeout(() => setBannerVisible(false), 3000);
    }
  }

  function abrirMiniapp(nome) {
    setMiniapp(nome);
    setScreen("miniapp");
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* Banner superior para feedback (salvamento / biometria) */}
      {(bioStatus && bannerVisible) && (
        <div
          className={`px-4 py-2 text-xs border-b ${
            bioStatus.type === "error"
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-green-50 text-green-700 border-green-200"
          }`}
        >
          {bioStatus.message}
        </div>
      )}

      <header className="p-4 bg-white shadow flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-semibold">5 Horas — Família</span>
          {userLoaded ? (
            <span className="text-xs text-green-600">offline (Dexie)</span>
          ) : (
            <span className="text-xs text-gray-400">inicializando…</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setScreen("dashboard")}
            className="text-sm text-blue-600"
          >
            Home
          </button>
          <button
            onClick={() => setScreen("user")}
            className="text-sm text-blue-600"
          >
            User
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <ScreenOrchestrator
          screen={screen}
          miniapp={miniapp}
          onRegisterBio={handleRegistrarBiometria}
          onAuthenticate={handleAutenticar}
          userData={userData}
          setUserData={setUserData}
          saveState={saveState}
          onSaveUser={onSaveUser}
          formPulse={formPulse}
        />
      </main>

      {screen !== "user" && (
      <footer className="p-3 bg-white border-t flex justify-around text-sm">
        <button
          onClick={() => abrirMiniapp("educacao/app-base")}
          className="px-3 py-1 rounded border"
        >
          Educação
        </button>
        <button
          onClick={() => abrirMiniapp("financeiro/app-base")}
          className="px-3 py-1 rounded border"
        >
          Financeiro
        </button>
      </footer>
      )}
    </div>
  );
}

// ========================
// Test cases (comentados)
// ========================
// 1) Boot
//    - Ao montar o AppShell, deve criar userId "local" se não existir.
//    - Deve carregar dados existentes em userData se já houver no Dexie.
//    - Deve ir para screen = "dashboard".
//
// 2) Painel do Usuário
//    - Ao clicar em "User" no header, screen deve ser "user" e o formulário deve
//      exibir os valores vindo de userData.
//    - Ao editar campos, userData deve ser atualizado (controlado).
//    - Ao clicar em "Salvar dados":
//        * saveState: "idle" -> "saving" -> "success" -> "idle".
//        * Dexie.user["local"] deve refletir os novos valores.
//        * Deve aparecer banner "Dados salvos localmente." por ~3 segundos.
//
// 3) Miniapps
//    - Ao clicar em "Educação" ou "Financeiro" no footer, deve trocar para screen
//      "miniapp" e carregar o iframe em ./products/<categoria>/app-base/index.html.
//
// 4) WebAuthn sem suporte
//    - Em ambiente sem WebAuthn, registrarBiometriaSeguro/autenticarSeguro devem
//      retornar null sem lançar erro.
//    - O AppShell deve exibir mensagem de erro amigável e seguir funcionando.
//
// 5) WebAuthn com suporte
//    - Em ambiente com WebAuthn, sucesso em create/get deve atualizar banner com
//      mensagens de sucesso e não quebrar o fluxo do app.
