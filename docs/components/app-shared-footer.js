(function (global) {
  if (!global.React) {
    throw new Error("React precisa estar disponível para montar o footer compartilhado.");
  }

  const { useCallback, useEffect, useMemo, useRef, useState } = global.React;
  const h = global.React.createElement;

  const NAV_ITEMS = [
    { key: "catalog", icon: "grid_view", label: "Catálogo" },
    { key: "favorites", icon: "star", label: "Favoritos" },
    { key: "recents", icon: "history", label: "Recentes" },
    { key: "settings", icon: "settings", label: "Configurações" },
  ];

  const ALERT_CLASS_MAP = {
    error: "app-footer-alert--error",
    success: "app-footer-alert--success",
    warning: "app-footer-alert--warning",
    info: "app-footer-alert--info",
  };

  const DEFAULT_COPY = Object.freeze({
    nav: Object.freeze({
      catalog: "Catálogo",
      favorites: "Favoritos",
      recents: "Recentes",
      settings: "Configurações",
    }),
    meta: Object.freeze({
      heading: "Explorar MiniApps",
      collapsedLabel: "Navegação rápida",
      collapse: "Recolher",
      expand: "Expandir o rodapé",
    }),
  });

  function mergeCopy(copy = {}) {
    return {
      nav: { ...DEFAULT_COPY.nav, ...(copy.nav || {}) },
      meta: { ...DEFAULT_COPY.meta, ...(copy.meta || {}) },
    };
  }

  function normalizeState(value) {
    return value === "collapsed" ? "collapsed" : "expanded";
  }

  function AppSharedFooter({
    activeTab = "catalog",
    variant = "full",
    state = "expanded",
    showSettings = true,
    showMeta = true,
    copy,
    onNavigate,
    onStateChange,
  }) {
    const [footerState, setFooterState] = useState(normalizeState(state));
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertType, setAlertType] = useState("info");
    const alertTimeoutRef = useRef(null);
    const mergedCopy = useMemo(() => mergeCopy(copy), [copy]);

    useEffect(() => {
      setFooterState(normalizeState(state));
    }, [state]);

    useEffect(() => {
      function handleNotify(event) {
        const { message, type } = event.detail || {};
        if (!message) {
          return;
        }
        if (alertTimeoutRef.current) {
          clearTimeout(alertTimeoutRef.current);
        }
        setAlertMessage(message);
        setAlertType((type || "info").toLowerCase());
        alertTimeoutRef.current = setTimeout(() => {
          setAlertMessage(null);
        }, 5000);
      }

      window.addEventListener("app:notify", handleNotify);
      return () => {
        window.removeEventListener("app:notify", handleNotify);
        if (alertTimeoutRef.current) {
          clearTimeout(alertTimeoutRef.current);
        }
      };
    }, []);

    const visibleNavItems = useMemo(() => {
      if (showSettings) {
        return NAV_ITEMS;
      }
      return NAV_ITEMS.filter((item) => item.key !== "settings");
    }, [showSettings]);

    const handleNavigate = useCallback(
      (key) => {
        if (typeof onNavigate === "function") {
          onNavigate(key);
        }
      },
      [onNavigate]
    );

    const handleToggleState = useCallback(() => {
      const next = footerState === "collapsed" ? "expanded" : "collapsed";
      setFooterState(next);
      if (typeof onStateChange === "function") {
        onStateChange(next);
      }
    }, [footerState, onStateChange]);

    const isCollapsed = footerState === "collapsed";
    const isCompact = isCollapsed || variant === "compact";
    const navJustifyClass = isCompact ? "justify-around" : "justify-between";

    const footerClasses = [
      "app-shared-footer",
      "fixed",
      "bottom-0",
      "left-0",
      "w-full",
      "shadow-2xl",
      "rounded-t-3xl",
      "px-4",
      "pt-3",
      footerState === "collapsed" ? "pb-3" : "pb-6",
      "z-30",
    ].join(" ");

    const metaRowClasses = showMeta
      ? [
          "flex",
          "text-xs",
          "mb-3",
          isCollapsed ? "justify-end" : "items-center justify-between",
        ].join(" ")
      : "sr-only";

    const toggleButtonClasses = [
      "transition",
      "duration-150",
      isCollapsed ? "opacity-70" : "opacity-100",
      isCollapsed ? "p-2 rounded-full" : "flex items-center gap-1",
    ].join(" ");

    const alertClasses = [
      "message-box",
      "app-footer-alert",
      "p-3",
      "rounded-lg",
      "shadow-xl",
      "text-sm",
      ALERT_CLASS_MAP[alertType] || ALERT_CLASS_MAP.info,
    ].join(" ");

    const canShowAlert = Boolean(alertMessage) && showMeta && !isCollapsed;

    return h(
      "footer",
      { className: footerClasses, role: "contentinfo" },
      canShowAlert
        ? h("div", { className: `${alertClasses} mb-3`, id: "messageContainer" }, alertMessage)
        : null,
      showMeta
        ? h(
            "div",
            { className: metaRowClasses, id: "footerMetaRow" },
            isCollapsed
              ? h(
                  "span",
                  { className: "sr-only", id: "footerMetaLabel" },
                  mergedCopy.meta.collapsedLabel
                )
              : h(
                  "p",
                  { className: "font-semibold" },
                  mergedCopy.meta.heading
                ),
            h(
              "button",
              {
                type: "button",
                className: toggleButtonClasses,
                onClick: handleToggleState,
                "aria-pressed": isCollapsed ? "false" : "true",
                "aria-label": isCollapsed
                  ? mergedCopy.meta.expand
                  : mergedCopy.meta.collapse,
              },
              h(
                "span",
                { className: "material-icons-sharp", "aria-hidden": "true" },
                isCollapsed ? "expand_less" : "expand_more"
              ),
              isCollapsed ? null : mergedCopy.meta.collapse
            )
          )
        : null,
      h(
        "nav",
        { className: `flex ${navJustifyClass}`, role: "navigation" },
        visibleNavItems.map((item) => {
          const isActive = item.key === activeTab;
          const buttonClasses = [
            "nav-item",
            "flex",
            "flex-col",
            "items-center",
            "justify-center",
            isCompact ? "nav-item--compact" : "p-2",
            "transition",
            "duration-150",
            isActive ? "font-bold" : "font-medium",
          ].join(" ");

            return h(
              "button",
              {
                key: item.key,
                type: "button",
              className: buttonClasses,
              "data-key": item.key,
              "aria-current": isActive ? "page" : undefined,
                onClick: () => handleNavigate(item.key),
              },
              h(
                "span",
                {
                  className: `material-icons-sharp ${isCompact ? "text-3xl" : "text-2xl"}`,
                  "aria-hidden": "true",
                },
                item.icon
              ),
              isCompact
              ? h(
                  "span",
                  { className: "sr-only" },
                  mergedCopy.nav[item.key] || item.label
                )
              : h(
                  "span",
                  { className: `${isCompact ? "text-xs" : "text-sm"} mt-0.5` },
                  mergedCopy.nav[item.key] || item.label
                )
            );
        })
      )
    );
  }

  global.AppSharedFooter = AppSharedFooter;
})(window);
