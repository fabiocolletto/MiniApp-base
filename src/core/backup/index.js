// src/core/backup/index.js
// Lógica de aplicação para coordenar o backup (chama o loader e o sync)

import { syncUpload, syncDownload } from "../../sync/google-sync.js";
import { UserService } from "../header/loader.js"; // Importa o serviço de dados local

const CONFIG_KEY = "app5-backup-config";
const FILENAME = "miniapp-backup-user.json";

/**
 * Retorna as configurações de backup salvas localmente.
 */
export async function getBackupConfig() {
    return UserService.getBackupConfig() || null; // Assumindo que você adicione esta função no UserService
}

/**
 * Função mock para simular a ativação (para ser usado no loader.js)
 * NOTA: Esta função precisa ser ajustada, pois o login é feito no backup-google.html
 */
export async function activateBackup(provider, ownerId) {
    // Retorna uma configuração básica para que o loader.js consiga mostrar um status
    return {
        provider: 'google',
        pendingSync: false,
    };
}


// --- Implementação do Backup/Restauro ---

/**
 * Envia o backup do LocalStorage para o Google Drive.
 */
export async function performBackupUpload() {
    const localData = await UserService.get();
    if (!localData) {
        throw new Error("Nenhum dado local para salvar.");
    }
    
    // O syncUpload agora só precisa do objeto de dados e do nome do arquivo
    const result = await syncUpload(localData, FILENAME);
    
    // Opcional: Aqui você pode salvar o fileId e a data da sincronização no UserService localmente.
    // await UserService.setLastSync(new Date().toLocaleString('pt-BR')); 
    
    return result;
}

/**
 * Restaura o backup do Google Drive para o LocalStorage.
 * @returns {boolean} True se restaurou, false se não encontrou backup.
 */
export async function performBackupDownload() {
    const cloudData = await syncDownload(FILENAME);
    
    if (cloudData) {
        await UserService.save(cloudData);
        // Opcional: Recarregar a página ou o painel do usuário para exibir os dados restaurados
        window.location.reload(); 
        return true;
    }
    
    return false;
}
