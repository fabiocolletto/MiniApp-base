import UserDataService from "../user/userDataService.js";

const SCOPES = "https://www.googleapis.com/auth/drive.appdata";
const FILE_NAME = "app5h-user-backup.json";

let tokenClient;
let accessToken = null;

const GoogleBackupService = {
  init(clientId) {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: token => {
        accessToken = token.access_token;
      }
    });
  },

  async authenticate() {
    return new Promise(resolve => {
      if (accessToken) return resolve(accessToken);
      tokenClient.requestAccessToken();
      const interval = setInterval(() => {
        if (accessToken) {
          clearInterval(interval);
          resolve(accessToken);
        }
      }, 100);
    });
  },

  async findBackupFile() {
    const res = await fetch(
      "https://www.googleapis.com/drive/v3/files?q=name='" +
        FILE_NAME +
        "' and mimeType='application/json' and trashed=false&spaces=appDataFolder",
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    const data = await res.json();
    return data.files?.[0] || null;
  },

  async uploadBackup() {
    const backup = {
      version: 1,
      updated: new Date().toISOString(),
      data: await UserDataService.load()
    };

    await this.authenticate();

    const file = await this.findBackupFile();
    const metadata = {
      name: FILE_NAME,
      parents: ["appDataFolder"],
      mimeType: "application/json"
    };

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    form.append(
      "file",
      new Blob([JSON.stringify(backup)], { type: "application/json" })
    );

    const endpoint = file
      ? `https://www.googleapis.com/upload/drive/v3/files/${file.id}?uploadType=multipart`
      : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";

    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form
    });

    return res.ok;
  }
};

export default GoogleBackupService;
