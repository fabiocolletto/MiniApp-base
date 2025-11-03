# MiniApp Base

Shell web/PWA pronto para hospedar MiniApps internos sob a mesma origem, sincronizando preferências globais, armazenamento IndexedDB e canais de comunicação via BroadcastChannel.

## Estrutura principal

```
/miniapp-base/          # Shell, scripts e estilos compartilhados
/miniapps/pesquisas-cidades/  # Primeiro MiniApp interno publicado
/assets/brand/          # Referências oficiais de logotipos/ícones
/docs/                  # Guias operacionais (inclui miniapp-interno.md)
/public/                # Metadados públicos (manifesto, versão, offline)
/shared/storage/idb/    # Camada oficial de IndexedDB (mesma origem)
/tests/                 # Suíte de testes automatizados em Node Test Runner
```

## Recursos do shell

- **Menu principal simplificado** (Início, MiniApps, Ajustes, Ajuda e Diagnóstico) com layout responsivo: barra inferior em mobile e lateral em telas maiores.
- **Painel inicial** com grade de MiniApps configurados, carregando o conteúdo interno `Pesquisas ▸ Cidades` diretamente no host quando disponível.
- **Tela “Sobre o MiniApp Base”** obrigatória com logotipos oficiais, links legais, versão (`public/meta/app-version.json`) e data da última atualização.
- **Rodapé dinâmico** com ícone temático (claro/escuro), link para 5 Horas e indicador de auto-salvamento (`Desatualizado ▸ Salvando… ▸ Salvo`).
- **Preferências globais** (tema, idioma, escala tipográfica) persistidas em IndexedDB e propagadas via BroadcastChannel (`marco:prefs`).
- **Diagnóstico** exibindo persistência solicitada (`navigator.storage.persist()`), quota e uso do storage (`navigator.storage.estimate()`).
- **Fallback de incorporação**: se um MiniApp bloquear `<iframe>` por CSP/X-Frame-Options, o shell exibe toast e abre o destino em nova aba.

## MiniApp interno: Pesquisas ▸ Cidades

- Hospedado em `miniapps/pesquisas-cidades/` com HTML/CSS/JS modulares.
- O script consome preferências do shell, publica estados de auto-salvamento no canal `marco:store` e salva rascunhos no `kv_cache` do `marco_core` (IndexedDB compartilhado).
- Layout responsivo com painel de sincronização exibindo status atual e horário da última gravação.

## Executando localmente

1. Instale dependências: `npm install`.
2. Suba um servidor estático apontando para a raiz do projeto (`npx serve .` ou `python -m http.server 4173`).
3. Acesse `http://localhost:<porta>/index.html`.
4. Ajuste tema, idioma e escala; abra `/?app=pesquisas-cidades` para validar a sincronização imediata entre shell e MiniApp.

## Testes automatizados

- `npm test` executa os cenários em Node Test Runner (`tests/*.test.js`).
- Cobertura mínima exigida para esta release:
  - Propagação de mensagens pelos canais `marco:prefs` e `marco:store`.
  - Persistência de preferências no IndexedDB compartilhado (`marco_core`).
  - Formatação/relato de persistência, quota e uso via `checkStorageStatus`.

> A suíte utiliza `fake-indexeddb` para simular IndexedDB no ambiente de teste.

## Validação visual obrigatória

Antes de qualquer commit definitivo:

1. Execute o shell em um navegador.
2. Capture **dois screenshots** do Samsung Galaxy Tab S9 (modo retrato e modo paisagem) destacando:
   - Menu principal, painel Início e rodapé com feedback de salvamento.
   - MiniApp `Pesquisas ▸ Cidades` carregado internamente mostrando auto-salvamento.
3. Anexe as imagens ao relatório/PR e cite os caminhos no resumo final.

## Publicação

- Habilite o GitHub Pages apontando para a branch principal (`index.html` na raiz).
- Para WordPress/Elementor, incorpore o shell via widget HTML apontando para a URL pública.
- Garanta que todos os MiniApps internos sigam o checklist documentado em [`docs/miniapp-interno.md`](docs/miniapp-interno.md).
