# MiniApps – RodaPack 3.0

O diretório `miniapps/` concentra os painéis que serão carregados pelo RodaPack. A navegação é controlada pelo rodapé global e, nesta fase, cada aba abre apenas um placeholder com o título do MiniApp correspondente até que a versão homologada seja publicada.

## Estrutura mínima
- Cada MiniApp deve ficar em `miniapps/<slug>/` com um `index.html` mobile-first.
- Utilize `<app-shared-footer>` para manter o controle do stage. O header é opcional e apenas para fluxos que realmente precisem de barra superior interna.
- Estilos customizados precisam seguir `docs/miniapp-global.css` e o design system. Evite criar tokens ad-hoc.

## Ícones atuais do rodapé
- **Home (RodaPack)**: hub compacto para blocos globais.
- **Alertas**: área dedicada para notificações transversais.
- **Catálogo**: lista oficial dos MiniApps publicados.
- **Configurações**: preferências unificadas (tema, idioma, integrações).
- **Conta do Usuário**: primeiro MiniApp a ser concluído na revisão 3.0.

Quando um MiniApp estiver pronto para ir ao ar, atualize `docs/miniapp-data.js` e substitua o placeholder pelo iframe ou painel embutido correspondente. Até lá, mantenha o placeholder para garantir consistência visual e de navegação.
