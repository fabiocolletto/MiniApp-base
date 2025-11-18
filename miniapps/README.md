# MiniApps – RodaPack 3.0

O diretório `miniapps/` concentra os painéis que serão carregados pelo RodaPack. A navegação é controlada pelo rodapé global e, nesta fase, cada aba abre apenas um placeholder com o título do MiniApp correspondente até que a versão homologada seja publicada.

## Estrutura mínima
- Cada MiniApp fica em `miniapps/<slug>/` com um `index.html` mobile-first.
- Utilize `<app-shared-footer>` para manter o controle do stage. O header é opcional e apenas para fluxos que realmente precisem de barra superior interna.
- Estilos customizados precisam seguir `docs/miniapp-global.css` e o design system. Evite criar tokens ad-hoc.
- Cada pasta já contém `README.md` e `CHANGELOG.md` iniciados com o status **“Em criação”**.

## Ícones atuais do rodapé (MiniApps obrigatórios)
Estes cinco MiniApps são a base do shell e devem existir para o rodapé funcionar. Os slugs espelham as chaves/ícones usados pelo componente `app-shared-footer`.

- **Home (RodaPack)** → `miniapps/home/`
- **Alertas** → `miniapps/alerts/`
- **Catálogo** → `miniapps/catalog/`
- **Configurações** → `miniapps/settings/`
- **Conta do Usuário** → `miniapps/account/`

Quando um MiniApp estiver pronto para ir ao ar, atualize `docs/miniapp-data.js` e substitua o placeholder pelo iframe ou painel embutido correspondente. Até lá, mantenha o placeholder para garantir consistência visual e de navegação.
