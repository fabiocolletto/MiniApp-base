# Guia de manutenção do PWA

Este documento descreve o checklist recorrente para manter o MiniApp Base instalado, rápido e confiável.

## Manifesto (`manifest.webmanifest`)

- Atualize `version`, `start_url`, `scope` e `shortcuts` sempre que um novo MiniApp for publicado.
- O MiniApp Educação não utiliza atalhos `/?app=<slug>` nem fichas individuais; mantenha o painel inicial atualizado diretamente no shell.
- Valide os ícones maskable (192 px e 512 px) usando [Maskable.app](https://maskable.app/editor).

## Service Worker (`service-worker.js`)

- Incrementar o valor usado na query `?v=` ao publicar nova versão (`registerServiceWorker(version)` recebe o valor do `package.json`).
- Mantenha `CORE_ASSETS` alinhado com os arquivos essenciais do shell, offline fallback e fichas dos MiniApps.
- Preserve a estratégia cache-first para assets estáticos e network-first para navegação, retornando `public/offline.html` quando necessário.
- Utilize a lista `NETWORK_FIRST_PATHS` apenas para recursos dinâmicos necessários (atualmente `components/preferences/panel.html`), garantindo que alterações recentes cheguem aos usuários sem limpar o cache manualmente.

## Atualização de versão

1. Atualize `package.json` e `package-lock.json` com a nova versão sem o prefixo `v`.
2. Sincronize `scripts/data/system-release-source.js` com a versão (inclua data/hora BRT).
3. Registre a alteração em `CHANGELOG.md` seguindo o padrão descrito nas diretrizes.

## Checklist de testes antes do merge

- **Instalabilidade**: verifique se o browser reconhece o PWA (manifesto válido + service worker ativo).
- **Offline**: abra `index.html`, aguarde o cache inicial, ative modo offline e confirme a exibição de `public/offline.html`.
- **Cobertura CSS/JS**: gere os relatórios usando o script de coverage (ver `reports/pwa-cleanup-2025-10-28/coverage-report/`).
- **Links internos**: execute o verificador estático do relatório (`reports/pwa-cleanup-2025-10-28/README.md`) ou rode o script correspondente.
- **Lighthouse**: obtenha relatórios Desktop e Mobile com foco em PWA, Performance e Acessibilidade ≥ 90.

## Rotina trimestral sugerida

1. Revisar `inventory.json` para identificar novos órfãos.
2. Consolidar assets em `public/` e mover legados para `archive/<data>/` com documentação.
  3. Revisar se novos módulos do MiniApp Educação exigem rotas dedicadas e atualizar este guia caso atalhos externos voltem a ser necessários.
4. Atualizar este guia caso políticas de cache ou suporte offline mudem.
