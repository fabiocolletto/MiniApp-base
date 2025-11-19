(function (global) {
  if (!global.React) {
    throw new Error("React precisa estar disponível para montar o header compartilhado.");
  }

  const h = global.React.createElement;

  const BASE_CLASSES = {
    header:
      "app-header p-4 shadow-lg grid grid-cols-[auto_1fr_auto] items-center rounded-b-xl gap-2 justify-items-center sticky top-0 z-20",
    iconWrapper:
      "flex items-center justify-center space-x-2 col-start-2 col-end-3 text-center w-full justify-self-center",
    actionsWrapper:
      "flex space-x-2 items-center justify-self-end justify-end col-start-3 col-end-4",
    searchButton: "icon-button p-2 rounded-full transition duration-150",
    installButton:
      "button-primary font-semibold py-1 px-3 rounded-full transition duration-150 text-sm shadow-md",
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
            BASE_CLASSES.actionsWrapper +
            " header-actions-placeholder col-start-1 col-end-2",
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
