const NAV_ITEMS = [
  { key: "home", icon: "home", label: "Home" },
  { key: "alerts", icon: "notifications", label: "Alertas" },
  { key: "catalog", icon: "grid_view", label: "Catálogo" },
  { key: "settings", icon: "settings", label: "Configurações" },
  { key: "account", icon: "person", label: "Conta" },
];

const DEFAULT_ACTIVE_TAB = "catalog";
const DEFAULT_STATE = "expanded";

class AppSharedFooter extends HTMLElement {
  static get observedAttributes() {
    return ["active-tab", "variant", "state", "show-settings"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  get showSettingsTab() {
    const attributeValue = (this.getAttribute("show-settings") || "").toLowerCase();
    if (attributeValue === "true") {
      return true;
    }
    if (attributeValue === "false") {
      return false;
    }
    return false;
  }

  get visibleNavItems() {
    return NAV_ITEMS.filter((item) => {
      if (item.key === "settings") {
        return this.showSettingsTab;
      }
      return true;
    });
  }

  get activeTab() {
    const tab = (this.getAttribute("active-tab") || "").toLowerCase();
    const visibleItems = this.visibleNavItems;
    if (visibleItems.some((item) => item.key === tab)) {
      return tab;
    }

    if (visibleItems.some((item) => item.key === DEFAULT_ACTIVE_TAB)) {
      return DEFAULT_ACTIVE_TAB;
    }

    return visibleItems[0]?.key || DEFAULT_ACTIVE_TAB;
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
    const navLinks = this.visibleNavItems.map((item) => {
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
      alerts: `${basePath}`,
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
        if (!key) {
          return;
        }

        const navigateEvent = new CustomEvent("footer:navigate", {
          detail: { key },
          bubbles: true,
          cancelable: true,
        });

        const shouldNavigate = this.dispatchEvent(navigateEvent);
        this.setAttribute("active-tab", key);

        if (shouldNavigate) {
          this.navigateTo(key);
        }
      });
    });
  }

  setupToggle() {
    if (this.variant === "compact") {
      return;
    }

    const toggleButton = this.querySelector("#footerToggleButton");
    if (!toggleButton) {
      return;
    }

    toggleButton.addEventListener("click", () => {
      const nextState = this.footerState === "expanded" ? "collapsed" : "expanded";
      this.setAttribute("state", nextState);

      this.dispatchEvent(
        new CustomEvent("footer:state-change", {
          detail: { state: nextState },
          bubbles: true,
        })
      );
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
      "&copy; 2024 5 Horas Pesquisa e Análise Ltda. CNPJ: 50.455.262/0001-19 | Brasil.";

    return `
      <div id="footerDetails" class="footer-details w-full mt-3">
          <div class="footer-meta-bottom flex items-center justify-between text-xs muted-text mt-2 px-1">
              <div class="status-indicators-group flex items-center space-x-4">
                  <div class="flex items-center space-x-2">
                      <span id="connectionDot" class="status-dot status-offline inline-block"></span>
                      <span id="connectionLabel">Offline</span>
                  </div>
                  <span id="syncStatusLabel" class="hidden sm:inline">Sincronização não iniciada</span>
              </div>
              <div class="footer-actions flex items-center space-x-2">
                  <button
                    id="footer-config-icon"
                    class="icon-button p-2 rounded-full transition duration-150 hidden"
                    type="button"
                    aria-label="Abrir painel de controles do admin"
                    aria-hidden="true"
                    tabindex="-1"
                  >
                    <span class="material-icons-sharp text-2xl" aria-hidden="true">settings</span>
                  </button>
              </div>
          </div>

          <div class="footer-legal footer-legal-expanded text-center text-xs muted-text mx-auto mt-1">
              <img
                src="https://5horas.com.br/wp-content/uploads/2025/10/Icone-Light-Transparente-500x500px.webp"
                alt="Ícone 5Horas"
                class="h-3 w-3 inline-block align-text-top mr-1"
                onerror="this.style.display='none';"
              >
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
              <div class="footer-quick-nav w-full">
                  ${navLinks}
              </div>
              <div id="footerAlertRow" class="footer-alert-row hidden">
                  <div id="messageContainer" class="message-box p-3 rounded-lg shadow-xl hidden"></div>
              </div>
              ${collapsedMeta}
          </div>
          ${details}
      </footer>
    `;

    this.setupNavigation();
    this.setupToggle();
  }
}

if (!customElements.get("app-shared-footer")) {
  customElements.define("app-shared-footer", AppSharedFooter);
}
