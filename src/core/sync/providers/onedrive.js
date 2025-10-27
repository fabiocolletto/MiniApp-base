export class OneDriveAdapter {
  async init() { /* TODO: OAuth PKCE + approot */ }
  async getManifest() {
    return { manifest: null };
  }
  async putManifest() {
    throw new Error('OneDrive putManifest: não implementado');
  }
  async upload() {
    throw new Error('OneDrive upload: não implementado');
  }
  async download() {
    throw new Error('OneDrive download: não implementado');
  }
  async list() { return []; }
  async exists() { return false; }
  async unlink() { /* TODO: revogar tokens e limpar pasta */ }
}
