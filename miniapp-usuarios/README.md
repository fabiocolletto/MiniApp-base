# MiniApp Usuários

Interface para bootstrap do administrador e gestão de contas. Este MiniApp depende do módulo `miniapp-base/js/auth.js` e do adaptador `miniapp-base/js/adapters/users-appscript.js` para comunicar com o backend em Apps Script ou operar em modo local (persistindo os dados no `localStorage` do dispositivo). O arquivo `index.html` possui duas visões: configuração inicial do administrador (`mode=setup`) e painel de gestão (requer papel `admin`).

Quando o adaptador de usuários está em modo local, o painel exibe o bloco “Backup no Google Drive”. O recurso usa o `drive-appdata` (`miniapp-base/js/adapters/drive-appdata.js`) para solicitar um token via Google Identity Services e sincronizar o estado local (`miniapp.users.local.state`) no arquivo `miniapp-usuarios.backup.json` dentro do `appDataFolder` da conta autenticada. Configure `window.__APP_CONFIG__.OAUTH_CLIENT_ID` com um Client ID OAuth 2.0 de Desktop/Web para habilitar a autorização.
