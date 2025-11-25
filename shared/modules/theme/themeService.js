import localforage from "localforage";

const themeStore = localforage.createInstance({
  name: "app5h",
  storeName: "theme"
});

const ThemeService = {
  async load(onThemeApplied) {
    try {
      const stored = await themeStore.getItem("theme");
      const system =
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

      const theme = stored || system;
      this.apply(theme, onThemeApplied);
      return theme;
    } catch {
      return "light";
    }
  },

  async apply(theme, onThemeApplied) {
    document.documentElement.setAttribute("data-theme", theme);

    if (typeof onThemeApplied === "function") {
      onThemeApplied(theme);
    }

    try {
      await themeStore.setItem("theme", theme);
    } catch {}
  },

  async toggle(onThemeApplied) {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    await this.apply(next, onThemeApplied);
    return next;
  }
};

export default ThemeService;
