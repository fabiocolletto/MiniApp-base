# Testes end-to-end

Os arquivos `.spec.js` desta pasta são executados via Playwright e assumem o uso do servidor estático definido em `playwright.config.js`.

- Execute `npm test` para rodar toda a suíte.
- Ao criar novos cenários, prefira reutilizar funções que preparem o estado local (armazenamento, service workers e caches) de forma consistente.
