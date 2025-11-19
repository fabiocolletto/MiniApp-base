# MiniApps – RodaPack 3.0

O diretório `miniapps/` concentra os painéis que serão carregados pelo RodaPack. A navegação é controlada pelo rodapé global e, nesta fase, cada aba abre apenas um placeholder com o título do MiniApp correspondente até que a versão homologada seja publicada.

## Estrutura mínima
- Cada MiniApp fica em `miniapps/<slug>/` com um `index.html` mobile-first.
- Utilize `<app-shared-footer>` para manter o controle do stage. O header é opcional e apenas para fluxos que realmente precisem de barra superior interna.
- Estilos customizados devem ser implementados com Material UI; use `docs/components/app-shared-ui.js` (AppCard/AppButton/AppSection) e mantenha `docs/miniapp-global.css` apenas como base de tokens.
- Modais, drawers e snackbars devem obrigatoriamente usar `docs/components/app-modal-context.js` (`AppModalProvider` + `useAppModal`).
- Cada pasta já contém `README.md` e `CHANGELOG.md` iniciados com o status **“Em criação”**.

## Ícones fixos do rodapé (MiniApps obrigatórios)
O shell React agora utiliza um rodapé com quatro ícones permanentes, e cada item aponta para um MiniApp dedicado:

- **Catálogo** → `miniapps/catalog/`
- **Favoritos** → `miniapps/favorites/`
- **Recentes** → `miniapps/recents/`
- **Configurações** → `miniapps/settings/`

O repositório também passa a contar com o MiniApp complementar `miniapps/payments/`, responsável por centralizar as formas de pagamento (iniciando com o cenário brasileiro via Mercado Pago) sem interferir nos ícones fixos do rodapé. O cartão **MiniSystems** ganhou pasta própria em `miniapps/minisystems/` para documentar o gerenciamento de preferências globais que já aparece dentro de Configurações. Os placeholders históricos `home`, `alerts` e `account` foram removidos após a implantação para que somente os painéis ativos permaneçam na base.

Quando um MiniApp estiver pronto para ir ao ar, atualize `docs/miniapp-data.js` e substitua o placeholder pelo iframe ou painel embutido correspondente. Até lá, mantenha o placeholder para garantir consistência visual e de navegação.
