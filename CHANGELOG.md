# Changelog

Todas as mudanças relevantes deste projeto serão registradas aqui.
Entradas passam a ser geradas automaticamente pelo Release Please após merges na branch main.

## [Unreleased]
- Menu de Configurações recebeu atalho rápido para ajustar o tamanho do texto, exibindo a escala atual e acessando os cinco níveis disponíveis.
- Adicionada cobertura automatizada garantindo que o menu principal do rodapé seja fechado ao clicar novamente no botão de configurações, mantendo painel e overlay ocultos até nova interação.
- Documentados no `AGENTS.md` e no `README.md` os procedimentos obrigatórios de validação visual com screenshots em formato paisagem e retrato do Samsung Galaxy Tab S9.
- Painel principal inicia com um widget flutuante listando todos os MiniApps e filtros rápidos para modalidades grátis, assinatura e produtos.
- Rodapé expandido mantém ícone, dados legais e controles alinhados na mesma barra, liberando a faixa inferior para distribuir atalhos e metadados em largura total.
- Rodapé expandido passa a revelar painel multilinhas com transição suave, reservando um container para atalhos rápidos e links adicionais no futuro.
- Corrigido o estado expandido do widget "MiniApps gratuitos" eliminando regras que mantinham o container esticado e deixavam espaços vazios mesmo após a remoção das alturas mínimas.
- Ajustadas as alturas mínimas do painel "MiniApps gratuitos" para evitar espaços vazios acima e abaixo do conteúdo quando expandido.
- Painel "MiniApps gratuitos" passa a iniciar como janela flutuante no canto superior direito e expande sob demanda para ocupar todo o painel de convidado.
- Eliminado o vazamento do painel principal abaixo do rodapé bloqueando o overflow do shell e delegando a rolagem à área de conteúdo.
- Rodapé da tela de autenticação permanece fixo na base da viewport sem revelar faixas fora do painel principal.
- Eliminada a faixa cinza entre o painel principal e o rodapé em tablets, alinhando o preenchimento inferior da área de conteúdo ao safe area disponível.
- Mensagem de painel vazio passa a ser exibida na área expandida do rodapé, aparecendo apenas quando o detalhe é aberto e sem a faixa residual sob o rodapé.
- Menu principal abre com o título "Menu principal" e agora exibe uma faixa de categorias com botões em formato de pílula, sublistas com links para os painéis e preserva o ícone isolado no acionador do rodapé.
- Botão do menu principal passa a mostrar apenas o ícone tanto online quanto offline, mantendo o rótulo dinâmico via `aria-label` e alinhando o acionador ao layout compacto solicitado.
- Estilo do botão do menu principal foi alinhado ao controle que expande o rodapé, mantendo ambos com aparência consistente em todas as larguras de tela.
- Ajustada a vitrine "MiniApps gratuitos" do modo convidado para contrair conforme o conteúdo, eliminando a faixa vazia percebida abaixo da lista de MiniApps.
- Fundo do shell de autenticação foi ajustado para reutilizar o gradiente principal, eliminando a faixa clara entre o painel e o rodapé.
- Ajustado o overlay do menu desktop para usar layout flexível ancorado ao rodapé, evitando centralização indevida da janela do menu.
- Registro do Service Worker valida o cache local em cada carregamento e força atualização automática quando uma versão nova é publicada.
- Painel principal do shell de autenticação passa a alinhar-se ao topo, ocupar toda a área entre cabeçalho e rodapé e abandona os cantos arredondados para seguir o layout solicitado.
- Botão de detalhes do rodapé permanece disponível em qualquer largura de tela e mantém o menu com as mesmas informações exibidas no modo mobile.
- Adicionada versão legada do bootstrap com script `nomodule` garantindo o menu principal e o rodapé funcionais em tablets sem suporte a módulos ES.
- Menu principal do rodapé passa a expor o rótulo textual e organizar as opções em categorias e subcategorias expansíveis, incluindo a seção de Configurações com acesso direto às preferências do usuário.
- Botão de instalação do PWA agora só aparece em navegadores móveis compatíveis e garante que o fluxo de download seja iniciado no dispositivo.
- Adicionado botão flutuante de instalação do MiniApp com controlador PWA acoplado ao bootstrap do shell.
- Botão de instalação do PWA foi movido para dentro do menu principal, ocupando a lista de ações apenas quando o prompt estiver disponível.
- Compactados os paddings do shell de autenticação e os espaçamentos dos painéis de convidado/MiniApp Store em viewports até 480px, ampliando a área útil em mobile sem perder a compensação de safe area.
- Eliminados os preenchimentos laterais do painel de views em telas pequenas para evitar acúmulo duplo de espaçamentos com os MiniApps renderizados.
- Ajustado o rodapé móvel com botão de detalhes apenas em ícone, offsets dinâmicos para evitar sobreposição e alinhamento total à base da viewport.
- Rodapé móvel expandido passa a quebrar os rótulos completos (MiniApps, painel atual e versão) sem cortes, com espaçamentos reorganizados para leitura integral.
- Preferências de usuário passam a incluir listas `miniApps.saved` e `miniApps.favorites`, com saneamento de IDs, deduplicação e compatibilidade com dados existentes.
- Criado módulo de preferências de MiniApps com operações de salvar/favoritar, limite de favoritos, sincronização da sessão ativa e cobertura de testes para os novos fluxos.
- Implantada camada oficial de IndexedDB com vendor `idb` 7.x, bancos `marco_core`/`pesquisa_studio`, APIs compartilhadas, migrador de `localStorage` e monitoramento de persistência/cota.
- Boot do shell sincroniza o catálogo com IndexedDB, solicita persistência, expõe eventos `storage:*` no MarcoBus e atualiza o estado do painel.
- Painel "Painel da conta" exibe status do armazenamento (persistência, uso/cota e auditoria local dos últimos eventos).
- Documentação atualizada (README e AGENTS.md) descrevendo arquitetura IndexedDB, convenções, boas práticas e acesso oficial por MiniApps.
- Extraído o bootstrap do shell de autenticação para `scripts/app/auth-shell.js` com a função pública `initAuthShell`.
- Exportados utilitários das views de cadastro e MiniApp Store para permitir testes modulares.
- Adicionada suíte de testes de integração do shell com Node Test Runner + jsdom e documentação atualizada sobre execução local.
- Substituída a dependência externa do jsdom por um simulador de DOM embutido utilizado pela suíte de testes, permitindo execuções sem acesso à internet.
- Adicionada rotina de limpeza completa do dispositivo acionável pelo painel de gerenciamento, removendo cadastros locais,
  encerrando a sessão e sincronizando o banco global vazio.
- Adicionado painel "Painel da conta" com lista de cadastros locais, ações rápidas e limpeza completa dos dados do dispositivo.
- Corrigido o botão do menu principal para manter a sobreposição aberta mesmo quando não há itens disponíveis.
- Rodapé exibe novamente o ícone da 5 Horas com variação automática para temas claro e escuro.
- Menu principal do shell de autenticação agora abre como sobreposição centralizada com desfoco do plano de fundo.
- Corrigida a sobreposição do menu principal para ocupar toda a viewport e desfocar corretamente o plano de fundo.
- Reativado o painel MiniApp Store com vitrine detalhada dos MiniApps ativos e destaque automático para atalhos acionados.
- Menu do rodapé reorganizado para listar páginas do shell e atalhos dos MiniApps publicados, com estados acessíveis e navegação por teclado.
- Botão principal de menu movido para o rodapé com painel suspenso listando os modos Convidado e Cadastro.
- Painel de menu respeita o atributo `hidden`, impedindo exibição antes da interação do usuário.
- Ajustado o rodapé do shell de autenticação para permanecer alinhado à base da tela em qualquer altura de conteúdo.
- Painel inicial abre diretamente no modo convidado e remove o formulário de login para simplificar o acesso sem credenciais.
- Textos do shell atualizados para refletir o fluxo baseado em cadastro ou navegação como convidado.
- Manifesto PWA atualizado para abrir explicitamente a página de boas-vindas ao iniciar o aplicativo instalado.

## [3.1.3] - 2025-10-31T09:26:50-03:00 (BRT)
- Menu principal agora apresenta cabeçalho visível da seção de Configurações e atalhos rápidos para escolher tema e idioma diretamente do overlay.
- Atalhos de configurações rápidas direcionam o foco para o controle correspondente ao abrir o painel completo de preferências.
- Versão do aplicativo atualizada para 3.1.3 (`package.json`, `public/meta/app-version.json` e `scripts/data/system-release-source.js`) refletindo os novos atalhos de personalização.

## [3.1.2] - 2025-10-31T09:12:07-03:00 (BRT)
- Menu principal do rodapé passa a exibir apenas um atalho em ícone para as Configurações, removendo as listas de painéis, widgets e MiniApps do overlay.
- Versão do aplicativo atualizada para 3.1.2 (`package.json`, `public/meta/app-version.json` e `scripts/data/system-release-source.js`) refletindo o novo comportamento do menu simplificado.

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
