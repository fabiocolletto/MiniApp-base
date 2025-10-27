export class GDriveAdapter {
  async init() { /* TODO: OAuth PKCE + pasta app */ }
  async getManifest() {
    return { manifest: null };
  }
  async putManifest() {
    throw new Error('GDrive putManifest: não implementado');
  }
  async upload() {
    throw new Error('GDrive upload: não implementado');
  }
  async download() {
    throw new Error('GDrive download: não implementado');
  }
  async list() { return []; }
  async exists() { return false; }
  async unlink() { /* TODO: revogar tokens e limpar pasta */ }
}
