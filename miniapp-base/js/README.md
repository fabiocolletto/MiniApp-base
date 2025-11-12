# miniapp-base/js

Módulos JavaScript compartilhados entre o shell e os MiniApps. Utilize este diretório para utilitários de autenticação, integrações com serviços externos e adaptadores consumidos no cliente. Todos os arquivos devem ser módulos ES e evitar dependências circulares.

## Adaptadores disponíveis

- `adapters/users-appscript.js`: comunicação com o Web App do Apps Script responsável pelo cadastro de usuários administradores.
- `adapters/drive-appdata.js`: helper para acessar o `appDataFolder` do usuário autenticado via Google Identity Services, oferecendo operações de leitura, escrita e remoção de arquivos JSON.
