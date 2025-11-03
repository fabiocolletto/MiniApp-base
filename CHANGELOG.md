# Changelog

Todas as mudanças relevantes deste projeto serão registradas aqui.
Entradas passam a ser geradas automaticamente pelo Release Please após merges na branch main.

## [Unreleased]
- Nenhuma alteração registrada.

## [1.0.0] - 2025-11-01T09:00:00-03:00 (BRT)
- Menu principal simplificado com navegação responsiva (Início, MiniApps, Ajustes, Ajuda e Diagnóstico).
- Painel inicial renovado com grade de MiniApps internos e carregamento integrado do Pesquisas ▸ Cidades.
- Tela “Sobre o MiniApp Base” com logotipos temáticos, links legais e metadados de versão sincronizados.
- Rodapé com ícone dinâmico conforme tema e indicador de status de auto-salvamento (desatualizado ▸ salvando ▸ salvo).
- Preferências globais (tema, idioma e escala de fonte) persistidas em IndexedDB e propagadas via BroadcastChannel.
- Diagnóstico de armazenamento exibindo persistência, quota e uso compartilhados entre Shell e MiniApp.
- MiniApp Pesquisas ▸ Cidades publicado como conteúdo interno com sincronização de rascunhos no IndexedDB comum.
- Documentação de integração em `/docs/miniapp-interno.md` descrevendo requisitos de MiniApps internos.

## [3.1.2] - 2025-10-31T09:12:07-03:00 (BRT)
- Menu principal do rodapé passa a exibir apenas um atalho em ícone para as Configurações, removendo as listas de painéis, widgets e MiniApps do overlay.
- Versão do aplicativo atualizada para 3.1.2 (`package.json`, `public/meta/app-version.json` e `scripts/data/system-release-source.js`) refletindo o novo comportamento do menu simplificado.

## [3.1.2] - 2025-10-31T18:51:16-03:00 (BRT)
- Atalhos de tema, idioma e tamanho de fonte no menu do rodapé mantêm o painel aberto após os cliques, permitindo ajustar as preferências sem reabrir a janela.

## [3.1.1] - 2025-10-31T08:57:12-03:00 (BRT)
- Ajustada a janela do menu principal para aproveitar até 92 vh (ou 40 rem) nas viewports compactas e até 70 vh (ou 42 rem) em desktops, exibindo o conteúdo sem exigir barras de rolagem desnecessárias.
- Versão do aplicativo sincronizada para 3.1.1 nas fontes públicas (`package.json`, `public/meta/app-version.json` e `scripts/data/system-release-source.js`) refletindo o ajuste visual.

## [3.1.0] - 2025-10-30T12:15:26-03:00 (BRT)
- Menu principal reorganizado em categorias e tipos que espelham as jornadas do shell, com descrições contextuais e toggles para
  fixar widgets correspondentes.
- Estabelecido painel de widgets no corpo do aplicativo que reúne cartões dinâmicos para cada item ativado, com ações de acesso
  rápido e remoção.
- Aplicado visual inspirado no Windows 98 ao botão e à janela do menu em telas largas, incluindo rótulo textual exposto e painel
  acoplado ao rodapé.
- Criado teste automatizado garantindo que a ativação dos widgets via menu atualize o painel principal.

## [3.0.1] - 2025-10-30T11:43:53-03:00 (BRT)
- Eliminados os preenchimentos laterais do painel `.auth-screen` em telas largas, mantendo apenas o `padding-block` para aproveitar toda a largura útil sem criar barras horizontais e preservando o alinhamento do rodapé.
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
- Painel do menu de autenticação agora limita a altura e habilita rolagem interna para listas extensas em mobile e desktop.
- Botão do menu principal informa a existência do painel por meio de `aria-haspopup` para leitores de tela.
- MiniApp Base convertido em PWA com manifesto, ícones instaláveis e Service Worker para navegação offline.
- Auditada a conversão PWA com relatório de validação cobrindo manifesto, service worker e próximos ajustes.
- Ícones do PWA convertidos para SVG vetoriais com suporte maskable, evitando o uso de assets binários no repositório.
- Ícone instalável atualizado para utilizar o asset oficial hospedado em 5horas.com.br.
- Corrigido o manifesto PWA para que o aplicativo instalado abra a tela inicial em dispositivos móveis e mantenha os atalhos funcionais.
- Manifesto PWA movido para a raiz com `start_url` e `scope` relativos ao shell, evitando erro 404 ao abrir o app instalado pelo atalho.
- Documentação atualizada para refletir o novo local do manifesto e os atalhos ativos.
- Evitado o deslocamento involuntário da tela ao abrir o menu principal, preservando a posição do usuário durante a navegação.
- Rodapé do painel de autenticação passa a expor a dica contextual diretamente em `#statusHint` como região ao vivo (`role="status"`) para garantir o anúncio automático em leitores de tela.
- Painel de autenticação amplia-se para ocupar toda a área útil em telas largas, com tipografia reajustada para leitura confortável.

## [3.0.0] - 2025-10-30T06:02:57-03:00 (BRT)
- Criado helper compartilhado (`tests/helpers/dom-env.js`) para reutilizar o ambiente DOM simulado em toda a suíte automatizada.
- Adicionada bateria de testes `tests/miniapp-store.view.test.js` cobrindo cartões, favoritos/salvos e navegação da MiniApp Store em layout conversacional.
- Atualizada documentação (README + `docs/testing/release-3.0-validation.md`) com roteiro de validação completa e referências para o novo shell inspirado na OpenAI.

## [0.2.4] - 2025-10-30T02:02:29-03:00 (BRT)
- Ajustada a quebra do rodapé móvel expandido para permitir múltiplas linhas sem separar o ícone da marca do texto legal, mantendo a tipografia consistente nos metadados adicionais.

## [0.2.5] - 2025-10-30T05:50:57-03:00 (BRT)
- Recriado o painel da MiniApp Store com layout conversacional inspirado no ChatGPT, incluindo sidebar de jornadas, thread central e compositor de mensagens responsivo.
- Atualizada a paleta de tokens e o tema global para tons esverdeados e neutros utilizados pela identidade da OpenAI, propagando o novo visual para botões, cartões e focos.
- Adicionados controles de navegação lateral para mobile/desktop, lista de conversas sincronizada com destaques de MiniApps e melhorias de acessibilidade no fluxo convidado.

## [0.2.3] - 2025-10-29T15:27:46-03:00 (BRT)
- Mantido o layout horizontal do cabeçalho, rodapé e cartão de autenticação em todas as larguras, ajustando apenas espaçamentos para telas menores sem alterar a hierarquia visual.

## [0.2.2] - 2025-10-29T15:21:24-03:00 (BRT)
- Ajustada a largura do cartão de autenticação para seguir o contêiner em telas menores, mantendo o espaçamento interno aprovado e a consistência responsiva entre mobile e desktop.

## [0.2.1] - 2025-10-29T14:39:13-03:00 (BRT)
- Ajustadas as superfícies translúcidas do cabeçalho e rodapé do shell de autenticação para respeitarem a paleta ativa em temas claro e escuro, preservando contraste em telas móveis.
- Publicado `public/meta/app-version.json` como fonte estável da versão exibida no rodapé e atualizado o carregamento assíncrono para consumir o novo recurso.
- Atualizado o painel de convidados para ignorar MiniApps sem identificador válido, evitando atalhos quebrados que apontavam para `miniapp.md`.

## [0.2.0] - 2025-10-28T06:41:39-03:00 (BRT)
- Arquivada a árvore legada (`app/`, `router/`, `ui/`, `src/`, `tests/`, `MiniApps/` e utilitários redundantes) em `archive/2025-10-28/` para preservar histórico sem poluir o shell ativo.
- Consolidada a estrutura PWA: manifesto renomeado para `.webmanifest`, service worker com fallback offline dedicado e pré-cache dos atalhos `/?app=<slug>`.
- Migrado estilos inline para `styles/auth.css`, adicionada página `public/offline.html` e criados ícones específicos para os atalhos de MiniApps.
- Criadas fichas vivas em `docs/miniapps/`, além dos guias [`docs/pwa.md`](docs/pwa.md) e [`docs/migration-pre-to-post-pwa.md`](docs/migration-pre-to-post-pwa.md) documentando manutenção e rastreabilidade.
- Publicado relatório de limpeza (`reports/pwa-cleanup-2025-10-28/`) com inventário automatizado, cobertura CSS/JS e validações de instalabilidade/offline.
- Reduzido `styles/main.css` ao conjunto efetivamente usado pelo shell, eliminando utilitários órfãos destacados nos relatórios de coverage.
- Atualizado `service-worker.js` para usar navigation preload, evitar cache de navegação stale e priorizar o fallback `public/offline.html` quando a conexão falhar.
- Documentado no `README.md` o procedimento visual para demonstrar o fallback offline e os atalhos do catálogo durante as validações manuais.
