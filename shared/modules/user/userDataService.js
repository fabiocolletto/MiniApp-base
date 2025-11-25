import localforage from "localforage";

const userStore = localforage.createInstance({
  name: "app5h",
  storeName: "userdata"
});

const baseModel = {
  name: "",
  phone: "",
  email: "",
  birthdate: "",
  cep: "",
  updated: ""
};

const validators = {
  name: v => typeof v === "string" && v.trim().split(" ").length >= 2,
  phone: v => (v || "").replace(/\D/g, "").length >= 10,
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || ""),
  birthdate: v => /^\d{4}-\d{2}-\d{2}$/.test(v || ""), 
  cep: v => /^\d{5}-?\d{3}$/.test((v || "").replace(/\D/g, ""))
};

const UserDataService = {
  async load() {
    try {
      const saved = await userStore.getItem("user-data");
      return { ...baseModel, ...(saved || {}) };
    } catch {
      return { ...baseModel };
    }
  },

  async save(data) {
    const merged = { ...baseModel, ...(data || {}), updated: new Date().toISOString() };
    try {
      await userStore.setItem("user-data", merged);
      return merged;
    } catch {
      return null;
    }
  },

  async update(fields) {
    const current = await this.load();
    const updated = { ...current, ...(fields || {}), updated: new Date().toISOString() };
    try {
      await userStore.setItem("user-data", updated);
      return updated;
    } catch {
      return null;
    }
  },

  async clear() {
    try {
      await userStore.removeItem("user-data");
      return true;
    } catch {
      return false;
    }
  },

  validate(field, value) {
    if (validators[field]) return validators[field](value);
    return true;
  },

  maskPhone(value) {
    let n = (value || "").replace(/\D/g, "");
    if (n.length > 13) n = n.slice(0, 13);
    const cc = n.slice(0, 2);
    const ddd = n.slice(2, 4);
    const f = n.slice(4, 9);
    const l = n.slice(9, 13);
    if (n.length <= 2) return `+${cc}`;
    if (n.length <= 4) return `+${cc} ${ddd}`;
    if (n.length <= 9) return `+${cc} ${ddd} ${f}`;
    return `+${cc} ${ddd} ${f}-${l}`;
  }
};

export default UserDataService;
