# Guia de MiniApp Interno

Este documento descreve o processo oficial para publicar novos MiniApps dentro do **MiniApp Base**. Todos os módulos devem ser hospedados na mesma origem para compartilhar preferências, IndexedDB e canais de BroadcastChannel com o shell.

## Requisitos essenciais

1. **Estrutura**
   - Crie uma pasta em `miniapps/<slug>/` contendo, no mínimo, `index.html`, `styles.css` e `app.js`.
   - O arquivo `index.html` deve carregar o script em módulo (`type="module"`).
   - Utilize somente caminhos relativos (`./` ou `../`) para que o MiniApp funcione tanto no ambiente local quanto no GitHub Pages.

2. **Metadados obrigatórios**
   - Identificador (`id`) único e em minúsculas.
   - Título, descrição e ícone (512×512 ou adaptável) definidos em `miniapp-base/miniapps.js`.
   - Conteúdo traduzido para os idiomas suportados pelo shell (`pt-BR`, `en-US`, `es-ES`).

3. **Preferências globais**
   - Importe `createPrefsBus` e `loadPreferences` para consumir atualizações do shell:
     ```js
     import { createPrefsBus } from '../../miniapp-base/event-bus.js';
     import { loadPreferences, applyPreferences } from '../../miniapp-base/preferences.js';
     ```
   - Aplique o retorno de `loadPreferences()` e reaja a mensagens `type: 'preferences'` enviadas pelo canal `marco:prefs`.

4. **Persistência compartilhada**
   - Utilize `openMarcoCore()` (de `shared/storage/idb/databases.js`) para salvar dados no mesmo IndexedDB do shell.
   - Salve rascunhos ou configurações com chaves exclusivas (`<slug>::<nome>`).
   - Publique estados de salvamento no canal `marco:store` (`dirty`, `saving`, `saved`, `error`).

5. **Acessibilidade e responsividade**
   - Garanta foco navegável por teclado, espaçamentos mínimos de 44×44 px para alvos interativos e contraste adequado.
   - Respeite as preferências de tema, escala tipográfica e idioma propagadas pelo shell.

## Checklist antes da publicação

- [ ] Pasta criada em `miniapps/<slug>/` com HTML, CSS e JS modulares.
- [ ] Entrada adicionada em `miniapp-base/miniapps.js` com título/descrição traduzidos e ícone.
- [ ] MiniApp responde imediatamente a alterações de tema, idioma e escala vindas do shell.
- [ ] Auto-salvamento publica eventos `dirty ▸ saving ▸ saved` no canal `marco:store`.
- [ ] Dados persistidos em IndexedDB via `openMarcoCore()` ou APIs utilitárias em `shared/storage/idb/`.
- [ ] Layout testado em viewports mobile (>=360px) e desktop (>=1280px), incluindo navegação por teclado.
- [ ] Testes automatizados exercitam preferências, auto-salvamento e compartilhamento de IndexedDB (ver diretório `tests/`).

## Publicação

1. Atualize `miniapp-base/miniapps.js` e o shell para reconhecer o novo MiniApp.
2. Inclua instruções e requisitos específicos no `CHANGELOG.md` da versão correspondente.
3. Execute `npm test` antes do commit e capture os screenshots solicitados (modo retrato e paisagem do Samsung Galaxy Tab S9).
4. Abra a Pull Request conforme o fluxo de release e, após o merge, publique no GitHub Pages/WordPress.

> **Importante:** MiniApps externos devem oferecer fallback seguro (toast + abertura em nova aba) caso o conteúdo bloqueie incorporação via `frame-ancestors` ou `X-Frame-Options`.
