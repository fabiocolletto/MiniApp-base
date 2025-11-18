const BASE_CLASSES = {
  header:
    "app-header p-4 shadow-lg grid grid-cols-[auto_1fr_auto] items-center rounded-b-xl gap-2 justify-items-center",
  iconWrapper:
    "flex items-center justify-center space-x-2 col-start-2 col-end-3 text-center w-full justify-self-center",
  actionsWrapper:
    "flex space-x-2 items-center justify-self-end justify-end col-start-3 col-end-4",
  searchButton: "icon-button p-2 rounded-full transition duration-150",
  installButton:
    "button-primary font-semibold py-1 px-3 rounded-full transition duration-150 text-sm shadow-md",
};

const DEFAULT_TITLE = "MiniApp 5Horas";
const DEFAULT_ICON = "flash_on";
const DEFAULT_SEARCH_LABEL = "Pesquisar MiniApps";
const DEFAULT_INSTALL_LABEL = "Instalar";

const buildButtonClass = (baseClasses, { hidden = false } = {}) => {
  return hidden ? `${baseClasses} hidden` : baseClasses;
};

class AppSharedHeader extends HTMLElement {
  static get observedAttributes() {
    return [
      "title",
      "icon",
      "hide-search",
      "install-visible",
      "search-label",
      "install-label",
    ];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  get titleText() {
    const text = this.getAttribute("title");
    return text && text.trim().length ? text.trim() : DEFAULT_TITLE;
  }

  get iconName() {
    const name = this.getAttribute("icon");
    return name && name.trim().length ? name.trim() : DEFAULT_ICON;
  }

  get searchLabel() {
    const label = this.getAttribute("search-label");
    return label && label.trim().length ? label.trim() : DEFAULT_SEARCH_LABEL;
  }

  get installLabel() {
    const label = this.getAttribute("install-label");
    return label && label.trim().length ? label.trim() : DEFAULT_INSTALL_LABEL;
  }

  render() {
    const hideSearch = this.hasAttribute("hide-search");
    const showInstall = this.hasAttribute("install-visible");

    const searchButtonClass = buildButtonClass(BASE_CLASSES.searchButton, {
      hidden: hideSearch,
    });
    const installButtonClass = buildButtonClass(BASE_CLASSES.installButton, {
      hidden: !showInstall,
    });

    this.innerHTML = `
            <header class="${BASE_CLASSES.header}">
                <div class="${BASE_CLASSES.actionsWrapper} header-actions-placeholder col-start-1 col-end-2" aria-hidden="true">
                    <button
                        class="${searchButtonClass}"
                        type="button"
                        tabindex="-1"
                        aria-hidden="true"
                    ></button>
                    <button
                        class="${installButtonClass}"
                        type="button"
                        tabindex="-1"
                        aria-hidden="true"
                    ></button>
                </div>
                <div class="${BASE_CLASSES.iconWrapper}">
                    <span class="material-icons-sharp icon-accent text-2xl" aria-hidden="true">${this.iconName}</span>
                    <h1 class="text-xl font-extrabold title-text w-full text-center">${this.titleText}</h1>
                </div>
                <div class="${BASE_CLASSES.actionsWrapper}">
                    <button
                        id="searchToggle"
                        class="${searchButtonClass}"
                        type="button"
                        aria-label="${this.searchLabel}"
                    >
                        <span class="material-icons-sharp text-2xl" aria-hidden="true">search</span>
                    </button>
                    <button
                        id="installButton"
                        class="${installButtonClass}"
                        type="button"
                    >
                        ${this.installLabel}
                    </button>
                </div>
            </header>
        `;
  }
}

if (!customElements.get("app-shared-header")) {
  customElements.define("app-shared-header", AppSharedHeader);
}
