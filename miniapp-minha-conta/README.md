# MiniApp Minha Conta

Estrutura base para o painel onde o usuário final gerencia seus próprios dados e preferências do ecossistema de MiniApps. Este miniapp consome o Google Drive `appDataFolder` do usuário autenticado através do fluxo OAuth do Google Identity Services e nunca compartilha dados com o administrador.

## Componentes
- `index.html`: carrega o shell visual, scripts compartilhados, a configuração pública (`config/app-config.js`), a folha de estilos específica e o módulo JavaScript que orquestra a interface.
- `minha-conta.css`: estilos adicionais escopados em `.ma` para as abas, cartões de ação e mensagens de status.
- `minha-conta.js`: ponto de entrada da SPA; inicializa OAuth, conecta-se ao adaptador `drive-appdata` e expõe as ações de exportar/restaurar dados e salvar preferências.

## Notas de implementação
- Preserve o handshake com o shell: o módulo anuncia `{ action: 'miniapp-header' }`, confirma tema (`miniapp-theme-ready`/`miniapp-theme-applied`) e responde a mudanças via `postMessage`.
- O token OAuth deve permanecer apenas em memória. Nunca persista credenciais, backups ou preferências fora do `appDataFolder` do próprio usuário.
- Antes de liberar para produção, substitua o cabeçalho e textos descritivos pelos conteúdos definidos pela equipe de UX.
