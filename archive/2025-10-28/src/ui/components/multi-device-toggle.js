import { syncPolicyManager } from '../../core/sync/policyManager.js';

const hasDom =
  typeof window === 'object' &&
  window &&
  typeof document === 'object' &&
  document &&
  typeof window.customElements === 'object' &&
  typeof window.customElements.define === 'function';

if (!hasDom) {
  // Ambiente sem DOM (ex.: testes em Node). Não registra o componente.
} else {
  const tpl = document.createElement('template');
  tpl.innerHTML = `
  <style>
    .card { border: 1px solid var(--ac-border, #ddd); border-radius: 8px; padding: 12px; }
    .row { display: flex; align-items: center; gap: 12px; }
    .desc { font: 14px/1.4 system-ui, sans-serif; opacity: 0.9; }
    .switch { position: relative; display: inline-block; width: 46px; height: 24px; }
    .switch input { opacity:0; width:0; height:0; }
    .slider { position:absolute; cursor:pointer; inset:0; background:#ccc; transition:.2s; border-radius:24px; }
    .slider:before { position:absolute; content:""; height:18px; width:18px; left:3px; bottom:3px; background:white; transition:.2s; border-radius:50%; }
    input:checked + .slider { background: var(--ac-primary, #2e7d32); }
    input:checked + .slider:before { transform: translateX(22px); }
    .actions { margin-top: 8px; display: none; gap: 8px; }
    :host([state="on"]) .actions.off { display:flex; }
    :host([state="off"]) .actions.on { display:flex; }
    button { padding:6px 10px; border:1px solid #ccc; border-radius:6px; background:#fff; cursor:pointer; }
  </style>
  <section class="card">
    <header><h3>Sincronização Multidispositivos</h3></header>
    <div class="row">
      <label class="switch">
        <input id="chk" type="checkbox"><span class="slider"></span>
      </label>
      <div class="desc" id="desc"></div>
    </div>
    <div class="actions on">
      <button id="btnOn">Ativar e escolher provedor</button>
    </div>
    <div class="actions off">
      <button id="btnKeep">Desativar (manter backup na nuvem)</button>
      <button id="btnPurge">Desativar e apagar da nuvem</button>
    </div>
  </section>
`;

  class MultiDeviceToggle extends HTMLElement {
  constructor() {
    super();
    this.unsubscribe = null;
    this.handlePolicyUpdate = () => this.render();
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' }).appendChild(tpl.content.cloneNode(true));
      this.$chk = this.shadowRoot.getElementById('chk');
      this.$desc = this.shadowRoot.getElementById('desc');
      this.shadowRoot.getElementById('btnOn')?.addEventListener('click', () => this.turnOn());
      this.shadowRoot.getElementById('btnKeep')?.addEventListener('click', () => this.turnOff(false));
      this.shadowRoot.getElementById('btnPurge')?.addEventListener('click', () => this.turnOff(true));
      this.$chk.addEventListener('change', () => (this.$chk.checked ? this.turnOn() : this.turnOff(false)));
    }

    if (!this.unsubscribe) {
      this.unsubscribe = syncPolicyManager.subscribe(this.handlePolicyUpdate);
    }

    this.render();
  }

  disconnectedCallback() {
    if (typeof this.unsubscribe === 'function') {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  setState(on) {
    this.setAttribute('state', on ? 'on' : 'off');
    if (this.$chk) {
      this.$chk.checked = on;
    }
    if (this.$desc) {
      this.$desc.textContent = on
        ? 'Ativo — alterações serão sincronizadas com seu provedor.'
        : 'Desativado — tudo fica apenas neste dispositivo (IndexedDB).';
    }
  }

  render() {
    const settings = syncPolicyManager.get();
    const on = settings.policy === 'cloud_primary';
    this.setState(on);
  }

  async turnOn() {
    const provider = prompt('Escolha provedor: "gdrive" ou "onedrive"', 'gdrive');
    if (provider !== 'gdrive' && provider !== 'onedrive') return;
    const passphrase = prompt('Defina uma senha de criptografia (recomendado):', '');
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iterations = 150000;
    await syncPolicyManager.enableMultiDevice({
      provider,
      cipher: 'AES-GCM',
      salt: Array.from(salt).map(b => b.toString(16).padStart(2,'0')).join(''),
      iterations,
      hasTokens: false
    });
  }

  async turnOff(purge) {
    await syncPolicyManager.disableMultiDevice({ removeRemote: !!purge });
  }
  }

  if (!window.customElements.get('multi-device-toggle')) {
    window.customElements.define('multi-device-toggle', MultiDeviceToggle);
  }
}
