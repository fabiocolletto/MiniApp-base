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
    error: "bg-red-600 text-white",
    success: "bg-green-600 text-white",
    warning: "bg-yellow-500 text-black",
    info: "bg-indigo-600 text-white",
  };

  function normalizeState(value) {
    return value === "collapsed" ? "collapsed" : "expanded";
  }

  function AppSharedFooter({
    activeTab = "catalog",
    variant = "full",
    state = "expanded",
    showSettings = true,
    showMeta = true,
    onNavigate,
    onStateChange,
  }) {
    const [footerState, setFooterState] = useState(normalizeState(state));
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertType, setAlertType] = useState("info");
    const alertTimeoutRef = useRef(null);

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

    const isCompact = footerState === "collapsed" || variant === "compact";
    const navJustifyClass = isCompact ? "justify-around" : "justify-between";

    const footerClasses = [
      "app-shared-footer",
      "fixed",
      "bottom-0",
      "left-0",
      "w-full",
      "bg-gray-900",
      "text-white",
      "shadow-2xl",
      "rounded-t-3xl",
      "px-4",
      "pt-3",
      footerState === "collapsed" ? "pb-3" : "pb-6",
      "z-30",
    ].join(" ");

    const metaRowClasses = showMeta
      ? "flex items-center justify-between text-xs text-gray-300 mb-3"
      : "sr-only";

    const alertClasses = [
      "message-box",
      "p-3",
      "rounded-lg",
      "shadow-xl",
      "text-sm",
      ALERT_CLASS_MAP[alertType] || ALERT_CLASS_MAP.info,
    ].join(" ");

    return h(
      "footer",
      { className: footerClasses, role: "contentinfo" },
      alertMessage && showMeta
        ? h("div", { className: `${alertClasses} mb-3`, id: "messageContainer" }, alertMessage)
        : null,
      showMeta
        ? h(
            "div",
            { className: metaRowClasses, id: "footerMetaRow" },
            h(
              "p",
              { className: "font-semibold" },
              footerState === "collapsed" ? "Navegação rápida" : "Explorar MiniApps"
            ),
            h(
              "button",
              {
                type: "button",
                className: "text-indigo-200 hover:text-white flex items-center gap-1",
                onClick: handleToggleState,
              },
              h(
                "span",
                { className: "material-icons-sharp", "aria-hidden": "true" },
                footerState === "collapsed" ? "expand_less" : "expand_more"
              ),
              footerState === "collapsed" ? "Expandir" : "Recolher"
            )
          )
        : null,
      h(
        "nav",
        { className: `flex ${navJustifyClass} text-gray-400`, role: "navigation" },
        visibleNavItems.map((item) => {
          const isActive = item.key === activeTab;
          const buttonClasses = [
            "nav-item",
            "flex",
            "flex-col",
            "items-center",
            "justify-center",
            isCompact ? "p-1" : "p-2",
            "transition",
            "duration-150",
            isActive ? "text-indigo-400 font-bold" : "hover:text-indigo-200",
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
            h(
              "span",
              { className: `${isCompact ? "text-xs" : "text-sm"} mt-0.5` },
              item.label
            )
          );
        })
      )
    );
  }

  global.AppSharedFooter = AppSharedFooter;
})(window);
