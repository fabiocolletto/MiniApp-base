// src/core/backup/index.js
// Lógica de aplicação para coordenar o backup (chama o loader e o sync)

// Importa o módulo de sincronização do Drive (src/sync/google-sync.js)
import { syncUpload, syncDownload } from "../../sync/google-sync.js";
// Importa o serviço de dados local (src/core/header/loader.js)
import { UserService } from "../header/loader.js"; 

const FILENAME = "miniapp-backup-user.json";

// Funções mock (mantidas para compatibilidade com o seu loader.js)
export async function getBackupConfig() {
    return null; 
}

export async function activateBackup(provider, ownerId) {
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
        throw new Error("Nenhum dado local para salvar. Preencha seus dados no Painel do Usuário primeiro.");
    }
    
    // Passa os dados locais e o nome do arquivo para o serviço de API
    const result = await syncUpload(localData, FILENAME);
    
    return result;
}

/**
 * Restaura o backup do Google Drive para o LocalStorage.
 */
export async function performBackupDownload() {
    const cloudData = await syncDownload(FILENAME);
    
    if (cloudData) {
        // Salva os dados restaurados do Drive no Local Storage
        await UserService.save(cloudData);
        
        // Recarrega a página para que o app principal use os novos dados
        if (window.parent) {
             window.parent.location.reload(); 
        } else {
             window.location.reload(); 
        }
        
        return true;
    }
    
    return false;
}
