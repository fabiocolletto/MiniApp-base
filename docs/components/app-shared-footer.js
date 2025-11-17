const NAV_ITEMS = [
  { key: "home", icon: "home", label: "Home" },
  { key: "catalog", icon: "grid_view", label: "Catálogo" },
  { key: "settings", icon: "settings", label: "Configurações" },
  { key: "account", icon: "person", label: "Conta" },
];

const DEFAULT_ACTIVE_TAB = "catalog";
const DEFAULT_STATE = "collapsed";

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
    if (this.variant === "compact") {
      return "collapsed";
    }
    return state === "collapsed" ? "collapsed" : DEFAULT_STATE;
  }

  renderNavLinks({ isCompact }) {
    const navLinks = NAV_ITEMS.map((item) => {
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
        <a href="#" class="${baseClasses.join(" ")}" aria-label="${item.label}" data-nav-key="${item.key}">
            <span class="material-icons-sharp text-3xl" aria-hidden="true">${item.icon}</span>
            ${label}
        </a>
      `;
    }).join("");

    if (isCompact) {
      return navLinks;
    }

    const toggleIcon = this.footerState === "expanded" ? "unfold_less" : "unfold_more";
    const toggleLabel = this.footerState === "expanded" ? "Recolher" : "Expandir";
    const ariaExpanded = this.footerState === "expanded" ? "true" : "false";

    return `
      ${navLinks}
      <button
        id="footerToggleButton"
        class="footer-toggle-nav-item flex flex-col items-center transition duration-150"
        type="button"
        aria-expanded="${ariaExpanded}"
        aria-controls="footerDetails"
      >
        <span class="material-icons-sharp text-3xl footer-toggle-icon" aria-hidden="true">${toggleIcon}</span>
        <span id="footerToggleLabel" class="nav-link-label text-xs mt-1">${toggleLabel}</span>
        <span class="sr-only">${toggleLabel} rodapé</span>
      </button>
    `;
  }

  getBasePath() {
    const path = window.location.pathname;
    const miniappsIndex = path.indexOf("/miniapps/");

    if (miniappsIndex !== -1) {
      return path.slice(0, miniappsIndex + 1);
    }

    if (path.endsWith("/index.html")) {
      return path.slice(0, -"index.html".length);
    }

    return path.endsWith("/")
      ? path
      : path.slice(0, path.lastIndexOf("/") + 1);
  }

  navigateTo(key) {
    const basePath = this.getBasePath();
    const navigationMap = {
      home: `${basePath}`,
      catalog: `${basePath}`,
      settings: `${basePath}miniapps/gestao-de-catalogo/`,
      account: `${basePath}miniapps/gestao-de-conta-do-usuario/`,
    };

    const destination = navigationMap[key];
    if (destination) {
      window.location.href = destination;
    }
  }

  setupNavigation() {
    const navLinks = this.querySelectorAll(".nav-link[data-nav-key]");
    navLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const key = link.getAttribute("data-nav-key");
        if (key) {
          this.navigateTo(key);
        }
      });
    });
  }

  renderCollapsedMeta() {
    return "";
  }

  renderDetails({ isCompact }) {
    if (isCompact) {
      return "";
    }
    const legalText =
      "&copy; 2024 5 Horas Pesquisa e Análise Ltda. CNPJ: 50.455.262/0001-19 | Curitiba, PR.";

    return `
      <div id="footerDetails" class="footer-details w-full mt-3">
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

          <div class="footer-meta-bottom flex items-center justify-between text-xs muted-text mt-2 px-1">
              <div class="status-indicators-group flex items-center space-x-4">
                  <div class="flex items-center space-x-2">
                      <span id="connectionDot" class="status-dot status-offline inline-block"></span>
                      <span id="connectionLabel">Offline</span>
                  </div>
                  <span id="syncStatusLabel" class="hidden sm:inline">Sincronização não iniciada</span>
              </div>
              <div class="footer-legal footer-legal-expanded text-right hidden sm:block">
                  ${legalText}
              </div>
          </div>

          <div class="footer-legal footer-legal-expanded text-center text-xs muted-text mx-auto mt-1 sm:hidden">
              ${legalText}
          </div>
      </div>
    `;
  }

  render() {
    const isCompact = this.variant === "compact";
    const footerState = isCompact ? "collapsed" : this.footerState;
    const navLinks = this.renderNavLinks({ isCompact });
    const collapsedMeta = this.renderCollapsedMeta();
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

    this.setupNavigation();
  }
}

if (!customElements.get("app-shared-footer")) {
  customElements.define("app-shared-footer", AppSharedFooter);
}
