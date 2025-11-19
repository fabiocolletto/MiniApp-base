# MiniApp - Configurações do Sistema

Status: **Em criação**, agora com quatro cards React (Perfil, Pagamentos, MiniSystems e Monitoramento de Memória) renderizados com Material UI no mesmo stage.

Painel destinado às preferências unificadas (tema, idioma, integrações) associadas ao ícone de configurações do rodapé. O código existente seguirá evoluindo até a homologação final.

## Estrutura atual
- `index.html`: aplica React + Material UI, envolve o conteúdo em `AppModalProvider`, usa `AppCard/AppButton/AppSection` e distribui os cards via `Grid` responsivo (xs 12 / sm 6 / md 4).
- `config-control.js`: expõe utilitários (`getStoredPreferences`, `syncPreferences`, `fetchStorageEstimate`, `formatBytes`, `getMemoryStatus`) consumidos pelos hooks React.
- `docs/components/app-shared-ui.js`: wrappers visuais para cartões/botões/seções.
- `docs/components/app-modal-context.js`: contexto oficial para abrir `Dialog`, `Drawer` e `Snackbar`.
- `CHANGELOG.md`: histórico de mudanças.

## Funcionalidades implementadas
1. `UserProfileCard` com resumo de nome/e-mail/função, edição via `Dialog` (inputs MUI) e Snackbar de confirmação usando `useAppModal`.
2. `PaymentsCard` com snapshot do MiniApp dedicado e links AppButton (`primary` + `subtle`) para abrir o painel completo.
3. `PreferencesCard` para tema/idioma utilizando radio groups MUI, persistência/localStorage e broadcast automático (`postMessage` + `CustomEvent`).
4. `MemoryStatusCard` com AppCard compacto, barra `LinearProgress` e `Dialog` detalhado (quota/uso/livre) alimentado por `StorageManager.estimate()`.
5. Layout global controlado por `Grid`/`Box` do Material UI; `docs/miniapp-global.css` mantém apenas tokens/layout base.
6. Cópias multilíngues (PT/EN/ES) sincronizam hero, cards, dialogs e alertas conforme a preferência global, além de atualizar os rótulos dos rádios de tema/idioma em tempo real.

## Próximos passos
1. Revisar campos e fluxos finais de configurações.
2. Integrar com o carregamento oficial de dados quando disponível.
3. Substituir mensagens de "em criação" por conteúdo definitivo após QA.
