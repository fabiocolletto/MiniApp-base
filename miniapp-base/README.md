# miniapp-base/

Design system compartilhado pelos miniapps e pelo shell.

## Conteúdo
- `style/styles.css` – único arquivo CSS responsável por reset, tokens, componentes e utilitários escopados pela classe `.ma`.
- `icons/` – ícones base utilizados no manifesto PWA. Atualmente contém placeholders brancos (substitua pelos definitivos quando disponíveis).

## Diretrizes
- Toda alteração de estilo deve respeitar o escopo `.ma` e manter a organização por camadas (`@layer reset, tokens, base, components, utilities, compat`).
- Prefira ajustar tokens existentes antes de criar novos. Documente tokens adicionais no topo do arquivo.
- Sempre que atualizar ícones, mantenha arquivos PNG com as dimensões declaradas no manifesto.
