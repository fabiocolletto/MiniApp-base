// UserDataService – versão compatível com CDN e ES Modules
import localforage from "https://cdn.jsdelivr.net/npm/localforage/dist/localforage.mjs";

const STORAGE_KEY = "user-data";

const UserDataService = {
  async load() {
    try {
      const data = await localforage.getItem(STORAGE_KEY);
      return data || {};
    } catch (err) {
      console.error("UserDataService.load error:", err);
      return {};
    }
  },

  async update(newData = {}) {
    try {
      const current = await this.load();
      const merged = {
        ...current,
        ...newData,
        updated: new Date().toISOString()
      };
      await localforage.setItem(STORAGE_KEY, merged);
      return merged;
    } catch (err) {
      console.error("UserDataService.update error:", err);
      return null;
    }
  },

  async clear() {
    try {
      await localforage.removeItem(STORAGE_KEY);
      return true;
    } catch (err) {
      console.error("UserDataService.clear error:", err);
      return false;
    }
  },

  async deleteField(field) {
    try {
      const current = await this.load();
      delete current[field];
      await localforage.setItem(STORAGE_KEY, current);
      return current;
    } catch (err) {
      console.error("UserDataService.deleteField error:", err);
      return null;
    }
  }
};

export default UserDataService;
