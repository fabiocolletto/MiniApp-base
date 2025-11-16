const NAV_ITEMS = [
  { key: "home", icon: "home", label: "Home" },
  { key: "catalog", icon: "grid_view", label: "Catálogo" },
  { key: "settings", icon: "settings", label: "Configurações" },
  { key: "account", icon: "person", label: "Conta" },
];

const DEFAULT_ACTIVE_TAB = "catalog";
const DEFAULT_STATE = "expanded";

class AppSharedFooter extends HTMLElement {
  static get observedAttributes() {
    return ["active-tab", "variant", "state"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  get activeTab() {
    const tab = (this.getAttribute("active-tab") || "").toLowerCase();
    return NAV_ITEMS.some((item) => item.key === tab) ? tab : DEFAULT_ACTIVE_TAB;
  }

  get variant() {
    const variant = (this.getAttribute("variant") || "").toLowerCase();
    return variant === "compact" ? "compact" : "full";
  }

  get footerState() {
    const state = (this.getAttribute("state") || "").toLowerCase();
    return state === "collapsed" ? "collapsed" : DEFAULT_STATE;
  }

  renderNavLinks({ isCompact }) {
    return NAV_ITEMS.map((item) => {
      const isActive = item.key === this.activeTab;
      const baseClasses = [
        "nav-link",
        "flex",
        "flex-col",
        "items-center",
        "transition",
        "duration-150",
      ];
      if (isActive) {
        baseClasses.push("active");
      }
      const label = isCompact
        ? ""
        : `<span class="nav-link-label text-xs mt-1">${item.label}</span>`;
      return `
        <a href="#" class="${baseClasses.join(" ")}" aria-label="${item.label}">
            <span class="material-icons-sharp text-3xl" aria-hidden="true">${item.icon}</span>
            ${label}
        </a>
      `;
    }).join("");
  }

  renderCollapsedMeta({ isCompact }) {
    if (isCompact) {
      return "";
    }
    return `
      <div class="footer-collapsed-meta flex items-center justify-between gap-2 w-full">
          <div class="footer-legal footer-legal-collapsed text-xs muted-text">
              &copy; 2024 MiniApp 5Horas. Seu PWA de Produtividade.
          </div>
          <button id="footerToggleButton" class="footer-toggle icon-button" type="button" aria-expanded="true" aria-controls="footerDetails">
              <span class="material-icons-sharp footer-toggle-icon text-2xl">unfold_less</span>
              <span class="sr-only">Recolher rodapé</span>
          </button>
      </div>
    `;
  }

  renderDetails({ isCompact }) {
    if (isCompact) {
      return "";
    }
    return `
      <div id="footerDetails" class="footer-details w-full mt-3">
          <div class="status-indicators flex items-center justify-between text-xs" id="statusIndicators">
              <div class="flex items-center space-x-2">
                  <span id="connectionDot" class="status-dot status-offline inline-block"></span>
                  <span id="connectionLabel">Offline</span>
              </div>
              <div class="text-right">
                  <span id="syncStatusLabel">Sincronização não iniciada</span>
              </div>
          </div>

          <div class="footer-actions flex justify-center space-x-2 mb-2 text-xs">
              <button id="googleSignInButton" class="button-primary text-sm px-3 py-1 rounded-full shadow transition duration-150">
                  Conectar Google
              </button>
              <button id="googleSignOutButton" class="button-muted text-sm px-3 py-1 rounded-full shadow transition duration-150 hidden">
                  Sair
              </button>
              <button id="manualSyncButton" class="button-outline px-3 py-1 rounded-full transition duration-150">
                  Sincronizar agora
              </button>
          </div>

          <div id="messageContainer" class="message-box p-3 rounded-lg shadow-xl hidden"></div>
          <div class="footer-legal footer-legal-expanded text-center text-xs muted-text mx-auto">
              &copy; 2024 MiniApp 5Horas. Seu PWA de Produtividade.
          </div>
      </div>
    `;
  }

  render() {
    const isCompact = this.variant === "compact";
    const footerState = isCompact ? "collapsed" : this.footerState;
    const navLinks = this.renderNavLinks({ isCompact });
    const collapsedMeta = this.renderCollapsedMeta({ isCompact });
    const details = this.renderDetails({ isCompact });

    this.innerHTML = `
      <footer class="app-footer p-3 ${isCompact ? "rounded-t-xl" : "flex flex-col justify-center rounded-t-xl"}" data-footer-state="${footerState}">
          <div class="footer-top w-full">
              <div class="footer-quick-nav flex justify-around w-full">
                  ${navLinks}
              </div>
              ${collapsedMeta}
          </div>
          ${details}
      </footer>
    `;
  }
}

if (!customElements.get("app-shared-footer")) {
  customElements.define("app-shared-footer", AppSharedFooter);
}
