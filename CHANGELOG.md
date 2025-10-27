# Changelog

Todas as mudanças relevantes deste projeto serão registradas aqui.
Entradas passam a ser geradas automaticamente pelo Release Please após merges na branch main.

## [Unreleased]
- Estrutura inicial de automação do log criada.
- Documentado o procedimento de integração da página `/miniapps/` no WordPress com Elementor.
- Exposta a instância global de roteador para habilitar a navegação dos botões da tela inicial.
- Adicionada janela modal de autenticação na tela inicial com suporte aos painéis de login e cadastro.
- Ajustado o bootstrap para abrir diretamente o painel do usuário quando houver sessão autenticada.
- Ajustado o layout dos painéis de login e cadastro para eliminar sobreposição com o cabeçalho do modal e remover espaços excedentes.
- Cadastro passa a abrir automaticamente o painel do usuário após conclusão e inclui teste de verificação desse fluxo.
- Corrigido o painel de login para manter a view ativa e exibir feedback quando as credenciais informadas forem inválidas.
- Corrigido o carregamento de `public/env.js` na tela inicial para garantir a disponibilidade do login social em implantações sob subcaminhos.
