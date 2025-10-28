# Changelog

Todas as mudanças relevantes deste projeto serão registradas aqui.
Entradas passam a ser geradas automaticamente pelo Release Please após merges na branch main.

## [Unreleased]
- Removido o botão "Fazer outro cadastro" do painel de sucesso para simplificar o fluxo após o cadastro.
- Estrutura inicial de automação do log criada.
- Documentado o procedimento de integração da página `/miniapps/` no WordPress com Elementor.
- Exposta a instância global de roteador para habilitar a navegação dos botões da tela inicial.
- Adicionada janela modal de autenticação na tela inicial com suporte aos painéis de login e cadastro.
- Ajustado o bootstrap para abrir diretamente o painel do usuário quando houver sessão autenticada.
- Ajustado o layout dos painéis de login e cadastro para eliminar sobreposição com o cabeçalho do modal e remover espaços excedentes.
- Cadastro passa a abrir automaticamente a MiniApp Store após conclusão e inclui teste de verificação desse fluxo.
- Botão de sucesso do cadastro redireciona diretamente para a MiniApp Store.
- Ajustado o campo de código do país no formulário de autenticação para não sobrepor o número de telefone.
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
- Ícone instalável atualizado para utilizar o asset oficial hospedado em 5horas.com.br.
- Corrigido o manifesto PWA para que o aplicativo instalado abra a tela inicial em dispositivos móveis e mantenha os atalhos funcionais.
- Manifesto PWA movido para a raiz com `start_url` e `scope` relativos ao shell, evitando erro 404 ao abrir o app instalado pelo atalho.
- Documentação atualizada para refletir o novo local do manifesto e os atalhos ativos.

## [0.2.0] - 2025-10-28T06:41:39-03:00 (BRT)
- Arquivada a árvore legada (`app/`, `router/`, `ui/`, `src/`, `tests/`, `MiniApps/` e utilitários redundantes) em `archive/2025-10-28/` para preservar histórico sem poluir o shell ativo.
- Consolidada a estrutura PWA: manifesto renomeado para `.webmanifest`, service worker com fallback offline dedicado e pré-cache dos atalhos `/?app=<slug>`.
- Migrado estilos inline para `styles/auth.css`, adicionada página `public/offline.html` e criados ícones específicos para os atalhos de MiniApps.
- Criadas fichas vivas em `docs/miniapps/`, além dos guias [`docs/pwa.md`](docs/pwa.md) e [`docs/migration-pre-to-post-pwa.md`](docs/migration-pre-to-post-pwa.md) documentando manutenção e rastreabilidade.
- Publicado relatório de limpeza (`reports/pwa-cleanup-2025-10-28/`) com inventário automatizado, cobertura CSS/JS e validações de instalabilidade/offline.
- Reduzido `styles/main.css` ao conjunto efetivamente usado pelo shell, eliminando utilitários órfãos destacados nos relatórios de coverage.
- Atualizado `service-worker.js` para usar navigation preload, evitar cache de navegação stale e priorizar o fallback `public/offline.html` quando a conexão falhar.
- Documentado no `README.md` o procedimento visual para demonstrar o fallback offline e os atalhos do catálogo durante as validações manuais.
