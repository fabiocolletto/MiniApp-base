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
  constructor() {
    super();
    this.messageTimeout = null;
    this.handleGlobalAlert = this.handleGlobalAlert.bind(this);
  }

  static get observedAttributes() {
    return ["active-tab", "variant", "state", "show-settings", "show-meta"];
  }

  connectedCallback() {
    this.render();
    window.addEventListener("app:notify", this.handleGlobalAlert);
  }

  attributeChangedCallback() {
    this.render();
  }

  disconnectedCallback() {
    window.removeEventListener("app:notify", this.handleGlobalAlert);
  }

  get showSettingsTab() {
    const attributeValue = (this.getAttribute("show-settings") || "true").toLowerCase();
    if (attributeValue === "false") {
      return false;
    }
    return true;
  }

  get visibleNavItems() {
    return NAV_ITEMS.filter((item) => {
      if (item.key === "settings") {
        return this.showSettingsTab;
      }
      return true;
    });
  }

  get showMeta() {
    const attributeValue = (this.getAttribute("show-meta") || "true").toLowerCase();
    if (attributeValue === "false") {
      return false;
    }
    return true;
  }

  get activeTab() {
    return this.getAttribute("active-tab") || DEFAULT_ACTIVE_TAB;
  }

  get variant() {
    return (this.getAttribute("variant") || "default").toLowerCase();
  }

  get footerState() {
    const state = (this.getAttribute("state") || DEFAULT_STATE).toLowerCase();
    return state === "collapsed" ? "collapsed" : "expanded";
  }

  handleGlobalAlert(event) {
    const { type, message } = event.detail;
    this.showAlert(message, type);
  }

  showAlert(message, type = "info") {
    const messageContainer = this.querySelector("#messageContainer");
    const alertRow = this.querySelector("#footerAlertRow");

    if (!messageContainer || !alertRow) return;

    messageContainer.className = `message-box p-3 rounded-lg shadow-xl`;
    messageContainer.innerHTML = message;
    
    // Adiciona classes de cor
    switch (type.toLowerCase()) {
      case "error":
        messageContainer.classList.add("bg-red-600", "text-white");
        break;
      case "success":
        messageContainer.classList.add("bg-green-600", "text-white");
        break;
      case "warning":
        messageContainer.classList.add("bg-yellow-500", "text-black");
        break;
      default:
        messageContainer.classList.add("bg-indigo-600", "text-white");
        break;
    }

    alertRow.classList.remove("hidden");
    messageContainer.classList.remove("hidden");

    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
    this.messageTimeout = setTimeout(() => {
      messageContainer.classList.add("hidden");
      alertRow.classList.add("hidden");
    }, 5000);
  }
  
  // Renderiza os botões de navegação
  renderNavLinks({ isCompact, footerState }) {
    const activeTab = this.activeTab;
    const compactClasses = isCompact ? "" : "justify-between";
    const navItems = this.visibleNavItems;
    const expandToggle = this.renderExpandToggle({ isCompact, footerState });

    return `
      <nav class="flex ${compactClasses} text-gray-400">
        ${navItems
          .map((item) => {
            const isActive = item.key === activeTab;
            const itemClasses = isActive
              ? "text-indigo-400 font-bold"
              : "hover:text-indigo-200";
            
            const iconClasses = isCompact ? "text-3xl" : "text-2xl";
            const labelClasses = isCompact ? "text-xs" : "text-sm";
            const wrapperClasses = isCompact 
                ? "flex flex-col items-center justify-center p-1" 
                : "flex flex-col items-center justify-center p-2";

              return `
              <a href="#" class="nav-item ${wrapperClasses} ${itemClasses} transition duration-150 ease-in-out" data-key="${item.key}" aria-current="${isActive ? 'page' : 'false'}">
                  <span class="material-icons-sharp ${iconClasses}" aria-hidden="true">${item.icon}</span>
                  <span class="${labelClasses} mt-0.5">${item.label}</span>
              </a>
            `;
          })
          .join("")}
        ${expandToggle}
      </nav>
    `;
  }

  renderExpandToggle({ isCompact, footerState }) {
    if (isCompact || !this.showMeta) return "";

    const isExpanded = footerState === "expanded";
    const icon = isExpanded ? "expand_less" : "expand_more";
    const label = isExpanded ? "Recolher" : "Expandir";
    const wrapperClasses = "flex flex-col items-center justify-center p-2";

    return `
      <button
        type="button"
        class="nav-item ${wrapperClasses} hover:text-indigo-200 transition duration-150 ease-in-out"
        data-role="toggle-footer"
        aria-expanded="${isExpanded}"
        aria-label="${label} footer"
      >
        <span class="material-icons-sharp text-2xl" aria-hidden="true">${icon}</span>
        <span class="text-sm mt-0.5">${label}</span>
      </button>
    `;
  }

  // Renderiza o metadado (visível apenas quando o footer está collapsed)
  renderCollapsedMeta() {
    if (!this.showMeta) return "";

    const legalText = "© 2025 5 Horas Pesquisa e Análise Ltda.";
    return `
      <div id="collapsedMeta" class="collapsed-meta-row flex justify-center items-center text-xs text-gray-500 mt-2">
          ${legalText}
      </div>
    `;
  }

  // Renderiza o bloco de detalhes (visível quando o footer está expanded)
  renderDetails({ isCompact }) {
    if (isCompact || !this.showMeta) return "";

    const legalText = "© 2025 5 Horas Pesquisa e Análise Ltda. | CNPJ: 50.455.262/0001-19 | Brasil";

    return `
      <div id="footerDetails" class="footer-details-row p-3 w-full border-t border-gray-700 bg-gray-700 mt-3 text-sm text-gray-400">
          <div class="flex justify-between items-center w-full">
              <div class="flex space-x-4">
                  <a href="#" class="hover:text-white transition duration-150">Termos de Uso</a>
                  <a href="#" class="hover:text-white transition duration-150">Privacidade</a>
                  <a href="#" class="hover:text-white transition duration-150">Contato</a>
              </div>
              <div class="text-xs text-gray-500">
                <img
                  src="https://fabiocolletto.github.io/miniapp/wp-content/uploads/2025/10/Icone-Light-Transparente-500x500px.webp"
                  alt="Ícone 5Horas"
                  class="h-3 w-3 inline-block align-text-top mr-1"
                  onerror="this.style.display='none';"
                >
                ${legalText}
            </div>
        </div>
      </div>
    `;
  }

  render() {
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }
    const isCompact = this.variant === "compact";
    const footerState = isCompact ? "collapsed" : this.footerState;
    const navLinks = this.renderNavLinks({ isCompact, footerState });
    const collapsedMeta = this.renderCollapsedMeta();
    const details = this.renderDetails({ isCompact });

    this.innerHTML = `
          <footer class="app-footer py-2 px-3 ${isCompact ? "rounded-t-xl" : "flex flex-col justify-center rounded-t-xl"}" data-footer-state="${footerState}">
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
    this.setupExpandToggle();
    this.setupStateToggle();
  }

  setupNavigation() {
    this.querySelectorAll(".nav-item[data-key]").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const key = item.getAttribute("data-key");
        this.setAttribute("active-tab", key);
        // Dispara evento global, se necessário, para a navegação da app
        this.dispatchEvent(new CustomEvent("app:navigate", { detail: { target: key }, bubbles: true, composed: true }));
      });
    });
  }

  setupExpandToggle() {
    const expandButton = this.querySelector('[data-role="toggle-footer"]');
    if (!expandButton) return;

    expandButton.addEventListener("click", (event) => {
      event.preventDefault();
      const currentState = this.getAttribute("state") || DEFAULT_STATE;
      const newState = currentState === "expanded" ? "collapsed" : "expanded";
      this.setAttribute("state", newState);
    });
  }

  setupStateToggle() {
    const collapsedMeta = this.querySelector("#collapsedMeta");
    const details = this.querySelector("#footerDetails");
    const isCompact = this.variant === "compact";

    if (!this.showMeta) return;

    if (isCompact) return; // Não permite toggle no modo compact

    if (collapsedMeta && details) {
      const toggleState = () => {
        const currentState = this.getAttribute("state") || DEFAULT_STATE;
        const newState = currentState === "expanded" ? "collapsed" : "expanded";
        this.setAttribute("state", newState);
      };

      // Adiciona listener ao metadado para expandir/colapsar
      collapsedMeta.addEventListener("click", toggleState);
      
      // Adiciona listener aos detalhes para expandir/colapsar
      // Isso permite que o usuário clique em qualquer lugar para fechar
      details.addEventListener("click", toggleState);
    }
  }
}
customElements.define("app-shared-footer", AppSharedFooter);
