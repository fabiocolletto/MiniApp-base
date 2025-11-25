// GoogleBackupService – compatível com CDN, GSI e ES Modules
import localforage from "https://cdn.jsdelivr.net/npm/localforage/dist/localforage.mjs";

const BACKUP_FILE_NAME = "miniapp-backup.json";

let tokenClient = null;
let accessToken = null;
let initialized = false;
let CLIENT_ID = null;

const GoogleBackupService = {
  init(clientId) {
    if (!clientId) {
      console.error("GoogleBackupService.init: CLIENT_ID ausente");
      return false;
    }

    CLIENT_ID = clientId;

    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: "https://www.googleapis.com/auth/drive.appdata",
      callback: (response) => {
        if (response.access_token) {
          accessToken = response.access_token;
        } else {
          console.error("Erro ao obter token:", response);
        }
      }
    });

    initialized = true;
    return true;
  },

  async ensureToken() {
    return new Promise((resolve) => {
      if (!initialized || !tokenClient) {
        console.error("GoogleBackupService: init() não foi executado.");
        return resolve(false);
      }

      if (accessToken) {
        return resolve(true);
      }

      tokenClient.requestAccessToken();
      
      setTimeout(() => {
        resolve(!!accessToken);
      }, 500);
    });
  },

  async uploadBackup() {
    try {
      const ok = await this.ensureToken();
      if (!ok) return false;

      const data = await this._generateLocalBackup();
      const metadata = {
        name: BACKUP_FILE_NAME,
        parents: ["appDataFolder"]
      };

      const boundary = "-------314159265358979323846";
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const multipartBody =
        delimiter +
        "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
        JSON.stringify(metadata) +
        delimiter +
        "Content-Type: application/json\r\n\r\n" +
        JSON.stringify(data) +
        closeDelimiter;

      const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`
        },
        body: multipartBody
      });

      return response.ok;
    } catch (err) {
      console.error("GoogleBackupService.uploadBackup error:", err);
      return false;
    }
  },

  async _generateLocalBackup() {
    const storageKeys = await localforage.keys();
    const backup = {};

    for (const key of storageKeys) {
      backup[key] = await localforage.getItem(key);
    }

    return {
      generatedAt: new Date().toISOString(),
      data: backup
    };
  },

  async restoreBackup(fileContent) {
    try {
      if (!fileContent?.data) return false;

      const entries = Object.entries(fileContent.data);
      for (const [key, value] of entries) {
        await localforage.setItem(key, value);
      }

      return true;
    } catch (err) {
      console.error("GoogleBackupService.restoreBackup error:", err);
      return false;
    }
  }
};

export default GoogleBackupService;
