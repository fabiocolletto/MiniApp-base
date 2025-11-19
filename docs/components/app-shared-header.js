(function (global) {
  if (!global.React) {
    throw new Error("React precisa estar disponível para montar o header compartilhado.");
  }

  const h = global.React.createElement;

  const BASE_CLASSES = {
    header: "app-header",
    iconWrapper: "app-header__title-group",
    actionsWrapper: "app-header__actions",
    searchButton: "app-header__icon-button",
    installButton: "app-header__install-button",
  };

  const DEFAULT_PROPS = {
    title: "MiniApp 5Horas",
    icon: "flash_on",
    searchLabel: "Pesquisar MiniApps",
    installLabel: "Instalar",
    hideSearch: false,
    installVisible: false,
  };

  function buildButtonClass(baseClasses, hidden) {
    return hidden ? `${baseClasses} hidden` : baseClasses;
  }

  function AppSharedHeader(props) {
    const mergedProps = { ...DEFAULT_PROPS, ...props };
    const {
      title,
      icon,
      hideSearch,
      installVisible,
      searchLabel,
      installLabel,
      onSearch,
      onInstall,
    } = mergedProps;

    const searchButtonClass = buildButtonClass(BASE_CLASSES.searchButton, hideSearch);
    const installButtonClass = buildButtonClass(BASE_CLASSES.installButton, !installVisible);

    return h(
      "header",
      { className: BASE_CLASSES.header },
      h(
        "div",
        {
          className:
            `${BASE_CLASSES.actionsWrapper} header-actions-placeholder`,
          "aria-hidden": "true",
        },
        h("button", {
          className: searchButtonClass,
          type: "button",
          tabIndex: -1,
          "aria-hidden": "true",
        }),
        h("button", {
          className: installButtonClass,
          type: "button",
          tabIndex: -1,
          "aria-hidden": "true",
        })
      ),
      h(
        "div",
        { className: BASE_CLASSES.iconWrapper },
        h(
          "span",
          { className: "material-icons-sharp icon-accent text-2xl", "aria-hidden": "true" },
          icon
        ),
        h("h1", { className: "text-xl font-extrabold title-text w-full text-center" }, title)
      ),
      h(
        "div",
        { className: BASE_CLASSES.actionsWrapper },
        h(
          "button",
          {
            className: searchButtonClass,
            type: "button",
            id: "searchToggle",
            "aria-label": searchLabel,
            onClick: onSearch,
          },
          h("span", { className: "material-icons-sharp text-2xl", "aria-hidden": "true" }, "search")
        ),
        h(
          "button",
          {
            className: installButtonClass,
            type: "button",
            id: "installButton",
            onClick: onInstall,
          },
          installLabel
        )
      )
    );
  }

  global.AppSharedHeader = AppSharedHeader;
})(window);
