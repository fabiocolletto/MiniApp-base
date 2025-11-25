// ThemeService – versão compatível com CDN e ES Modules
import localforage from "https://cdn.jsdelivr.net/npm/localforage/dist/localforage.mjs";

const STORAGE_KEY = "theme";

const ThemeService = {
  async load(callback) {
    try {
      const saved = await localforage.getItem(STORAGE_KEY);

      const systemDefault = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

      const theme = saved || systemDefault;
      this.apply(theme);

      if (callback) callback(theme);
      return theme;
    } catch (err) {
      console.error("ThemeService.load error:", err);
      return "light";
    }
  },

  async apply(theme) {
    try {
      document.documentElement.setAttribute("data-theme", theme);
      await localforage.setItem(STORAGE_KEY, theme);
    } catch (err) {
      console.error("ThemeService.apply error:", err);
    }
  },

  async toggle(callback) {
    try {
      const current = document.documentElement.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      await this.apply(next);

      if (callback) callback(next);
      return next;
    } catch (err) {
      console.error("ThemeService.toggle error:", err);
      return null;
    }
  }
};

export default ThemeService;
