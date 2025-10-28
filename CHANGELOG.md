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
- Unificado o acesso em um painel de boas-vindas com seletor para login e cadastro sem o uso de modal separado.
- Corrigido o painel de boas-vindas para respeitar os limites de tela em dispositivos móveis, mantendo a dica contextual visível.
- Reintroduzido cabeçalho e rodapé fixos na tela de autenticação, mantendo-os sempre visíveis com a versão dinâmica do MiniApp.
- Simplificado o fluxo de acesso removendo integrações sociais e referências a outras páginas dentro do cartão de boas-vindas.
- Adicionada aba de convidado ao painel de boas-vindas com vitrine de MiniApps gratuitos e botão de acesso rápido.
- Arquivado o componente legado de autenticação social e seus testes, concentrando o fluxo na tela unificada.
- Login e acesso convidado passam a abrir diretamente o painel MiniApp Store após a autenticação ou seleção gratuita.
- MiniApp Base convertido em PWA com manifesto, ícones instaláveis e Service Worker para navegação offline.
- Auditada a conversão PWA com relatório de validação cobrindo manifesto, service worker e próximos ajustes.
- Ícones do PWA convertidos para SVG vetoriais com suporte maskable, evitando o uso de assets binários no repositório.
