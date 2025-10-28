let msalLoader = null;

function ensureMsalScript() {
  if (window.msal) {
    return Promise.resolve(window.msal);
  }

  if (!msalLoader) {
    msalLoader = new Promise((resolve, reject) => {
      let script = document.querySelector('script[data-msal]');

      const cleanup = () => {
        if (script) {
          script.removeEventListener('load', onLoad);
          script.removeEventListener('error', onError);
        }
      };

      const onLoad = () => {
        cleanup();
        resolve(window.msal);
      };

      const onError = () => {
        cleanup();
        msalLoader = null;
        reject(new Error('MSAL script failed to load'));
      };

      if (!script) {
        script = document.createElement('script');
        script.src = 'https://alcdn.msauth.net/browser/2.38.0/js/msal-browser.min.js';
        script.async = true;
        script.defer = true;
        script.setAttribute('data-msal', '1');
      }

      script.addEventListener('load', onLoad, { once: true });
      script.addEventListener('error', onError, { once: true });

      if (!script.isConnected) {
        document.head.appendChild(script);
      } else if (script.readyState === 'complete' || script.readyState === 'loaded') {
        onLoad();
      }
    });
  }

  return msalLoader;
}

const tpl = document.createElement('template');
tpl.innerHTML = `
  <style>
    .social-wrap { display: grid; gap: 12px; margin: 12px 0 0; }
    .divider { display:flex; align-items:center; gap:10px; color:#6b7280; font: 500 12px/1 system-ui; }
    .divider::before, .divider::after { content:""; flex:1; height:1px; background: #e5e7eb; }
    .btn { width:100%; border:1px solid #d1d5db; background:#fff; border-radius:10px; padding:10px 12px;
           display:flex; align-items:center; gap:10px; cursor:pointer; font:600 14px/1 system-ui; }
    .btn:active { transform: translateY(1px); }
    .ico { width:18px; height:18px; display:inline-block; }
    .g { background:#fff; }
    .m { background:#fff; }
    .hint { color:#6b7280; font: 400 12px/1.2 system-ui; margin-top:4px; }
  </style>

  <div class="social-wrap">
    <div class="divider">ou</div>
    <button id="btnGoogle" class="btn">
      <span class="ico g">
        <svg viewBox="0 0 48 48" width="18" height="18"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 18-8.1 18-18c0-1.3-.1-2.2-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 14 24 14c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.4 4 9.8 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.1C29.1 35.4 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C9.6 39.7 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.4-4.6 8-11.3 8-6.6 0-12-5.4-12-12 0-6.6 5.4-12 12-12 3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4v0c-11.1 0-20 8.9-20 20s8.9 20 20 20 18-8.1 18-18c0-1.3-.1-2.2-.4-3.5z"/></svg>
      </span>
      <span>Continuar com Google</span>
    </button>

    <button id="btnMicrosoft" class="btn">
      <span class="ico m">
        <svg viewBox="0 0 23 23" width="18" height="18"><path fill="#f25022" d="M0 0h10.5v10.5H0z"/><path fill="#7fba00" d="M12.5 0H23v10.5H12.5z"/><path fill="#00a4ef" d="M0 12.5h10.5V23H0z"/><path fill="#ffb900" d="M12.5 12.5H23V23H12.5z"/></svg>
      </span>
      <span>Continuar com Microsoft</span>
    </button>

    <div id="hint" class="hint"></div>
  </div>
`;

class SocialAuth extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' }).appendChild(tpl.content.cloneNode(true));
    this.$hint = this.shadowRoot.getElementById('hint');
    this.shadowRoot.getElementById('btnGoogle')?.addEventListener('click', () => this.google());
    this.shadowRoot.getElementById('btnMicrosoft')?.addEventListener('click', () => this.microsoft());
    this.ensureScripts();
  }

  ensureScripts() {
    if (!window.__ENV__) {
      console.warn('env.js não carregado; crie public/env.js a partir de public/env.example.js');
    }
    // Google Identity Services
    if (!document.querySelector('script[data-gis]')) {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.setAttribute('data-gis', '1');
      document.head.appendChild(s);
    }
    // MSAL (Microsoft Identity)
    ensureMsalScript().catch((err) => {
      console.error('Falha ao preparar MSAL', err);
    });
  }

  // --- Google: ID token (OIDC) via GIS ---
  async google() {
    const cid = window.__ENV__?.GOOGLE_CLIENT_ID;
    if (!cid || !window.google || !google.accounts || !google.accounts.id) {
      return this.setHint('Google indisponível. Verifique env.js e permissões.');
    }
    const nonce = crypto.getRandomValues(new Uint8Array(16)).join('');
    google.accounts.id.initialize({
      client_id: cid,
      callback: (resp) => this.onGoogleCredential(resp),
      auto_select: false,
      ux_mode: 'popup',
      nonce
    });
    // Renderizar e disparar o botão invisível para 1 clique real
    const div = document.createElement('div');
    this.shadowRoot.appendChild(div);
    google.accounts.id.renderButton(div, { theme: 'outline', size: 'large', type: 'standard', text: 'continue_with', shape: 'rectangular' });
    // dispara o clique do botão renderizado
    div.querySelector('div[role=button]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }

  onGoogleCredential(resp) {
    try {
      const idToken = resp.credential; // JWT
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      const profile = {
        provider: 'google',
        sub: payload.sub,
        email: payload.email,
        name: payload.name || payload.given_name || '',
        picture: payload.picture || '',
        idToken
      };
      this.finish(profile);
    } catch (e) {
      this.setHint('Falha ao processar resposta do Google.');
    }
  }

  // --- Microsoft: OIDC via MSAL popup ---
  async microsoft() {
    this.setHint('Preparando login Microsoft...');

    let msalLib;
    try {
      msalLib = await ensureMsalScript();
    } catch (error) {
      console.error('MSAL indisponível', error);
      return this.setHint('Não foi possível carregar o login Microsoft. Verifique sua conexão e permissões.');
    }

    const cid = window.__ENV__?.MSAL_CLIENT_ID;
    const tenant = window.__ENV__?.MSAL_TENANT_ID || 'common';
    if (!cid || !msalLib) {
      return this.setHint('Microsoft indisponível. Verifique env.js e permissões.');
    }
    const { PublicClientApplication } = msalLib;
    this.setHint('');
    const msalConfig = {
      auth: { clientId: cid, authority: `https://login.microsoftonline.com/${tenant}`, redirectUri: location.origin },
      cache: { cacheLocation: 'localStorage', storeAuthStateInCookie: false }
    };
    const pca = new PublicClientApplication(msalConfig);
    try {
      const res = await pca.loginPopup({
        scopes: ['openid', 'profile', 'email'],
        prompt: 'select_account'
      });
      const account = res.account;
      const idToken = res.idToken;
      const profile = {
        provider: 'microsoft',
        sub: account.localAccountId,
        email: account.username,
        name: account.name || '',
        picture: '',
        idToken
      };
      this.finish(profile);
    } catch (e) {
      this.setHint('Login Microsoft cancelado ou falhou.');
    }
  }

  // --- Finalização comum ---
  async finish(profile) {
    try {
      // Persistência local mínima (troque por IndexedDB + criptografia do seu projeto)
      const session = { userId: `${profile.provider}:${profile.sub}`, profile, at: Date.now() };
      localStorage.setItem('app.session', JSON.stringify(session));

      // Se existir um handler global, chame-o (ex.: para criar usuário na store local)
      if (window.AppAuth?.onSocialLogin) {
        await window.AppAuth.onSocialLogin(session);
      }

      // Navegar para o app (router existente)
      if (window.AppRouter?.navigate) {
        window.AppRouter.navigate('home');
      } else {
        location.hash = '#home';
      }
    } catch {
      this.setHint('Não foi possível concluir a sessão local.');
    }
  }

  setHint(msg) { this.$hint.textContent = msg; }
}

const registry = typeof globalThis === 'object' && globalThis ? globalThis.customElements : undefined;

if (registry && typeof registry.define === 'function') {
  if (!registry.get || !registry.get('social-auth')) {
    registry.define('social-auth', SocialAuth);
  }
}
