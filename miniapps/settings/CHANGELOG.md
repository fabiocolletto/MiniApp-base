# Changelog - MiniApp Configurações do Sistema

# [0.5.1] - 2025-02-18
### Adicionado
- Tabela de cópias (PT/EN/ES) que alimenta hero, cards, dialogs e alertas de Configurações conforme a preferência `language`.
### Alterado
- `docs/components/app-shared-ui.js` passou a herdar cores/bordas do tema atual para que os cards respondam visualmente ao modo claro/escuro.
- `config-control.js` ganhou os helpers `resolveThemeLabel`/`resolveLanguageLabel` e adicionou a chave interna dos status de memória para permitir traduções.
- `index.html` passou a usar os novos helpers para rotular rádios, botões e indicadores, garantindo que o conteúdo principal reaja instantaneamente ao tema/idioma escolhidos.

# [0.5.0] - 2025-02-17
### Adicionado
- Integração com Material UI dentro do `index.html`, envolvendo o stage em `ThemeProvider` e `AppModalProvider` e adotando os novos componentes compartilhados (`AppCard`, `AppButton`, `AppSection`).
- Fluxos oficiais de `Dialog` para o Perfil do usuário (formulário editável) e para o monitoramento de memória com detalhes técnicos do IndexedDB e Snackbar de confirmação.

### Alterado
- `config-control.js` convertido em módulo de utilidades puras (`getStoredPreferences`, `syncPreferences`, `fetchStorageEstimate`, `formatBytes`, `getMemoryStatus`) consumidas pelos hooks React.
- Layout do MiniApp reorganizado em `Grid` responsivo (xs 12 / sm 6 / md 4) e `docs/miniapp-global.css` reduzido a tokens e estrutura básica.
- Card de Pagamentos e MiniSystems reescritos com componentes MUI, mantendo os links para `miniapps/payments/` e o broadcast de preferências globais (tema e idiomas PT/EN/ES).

## [0.4.1] - 2025-02-16
### Alterado
- Estrutura do `index.html` atualizada para manter todos os cards visíveis no mesmo stage, eliminando o overflow oculto que escondia o snapshot de pagamentos e o cartão MiniSystems.
- Estilos locais reorganizados para controlar o `body`/`app-main`, garantindo que o footer permaneça acessível e que o layout siga o padrão da PWA.
- Documentação alinhada ao novo MiniApp `miniapps/minisystems/` que formaliza o cartão de preferências globais.

## [0.4.0] - 2025-02-15
### Adicionado
- Card MiniSystems para preferências globais com seleção de tema (claro/escuro) e idiomas (Português, Inglês e Espanhol).
- Persistência local das preferências e transmissão para o shell React via `postMessage`.
- Stack com três cards no MiniApp (dados do usuário, pagamentos e preferências) garantindo contexto completo em Configurações.

## [0.3.0] - 2025-02-14
### Alterado
- Painel focado exclusivamente no monitoramento do IndexedDB, com o fluxo de pagamentos migrado para o novo MiniApp dedicado.

## [0.2.0] - 2025-02-14
### Adicionado
- Card compacto de 300px com resumo do uso do IndexedDB e indicador visual de expansão.
- Painel detalhado com barra de progresso, métricas de quota/uso/livre e atualização automática a cada 30 segundos.
- Comportamento responsivo que mantém o painel aberto por padrão em telas maiores.

## [0.1.0] - 2025-11-18
### Adicionado
- Registro inicial de mudanças para o painel de Configurações do Sistema.
- Documentação do status "Em criação" alinhada ao ícone de configurações do rodapé.
