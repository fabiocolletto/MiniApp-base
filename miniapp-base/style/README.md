# miniapp-base/style/

Folhas de estilo compartilhadas pelos miniapps.

## Arquivos
- `styles.css` – design system completo escopado em `.ma` com camadas `reset`, `tokens`, `base`, `components`, `utilities` e `compat`.

## Manutenção
- Alterações devem preservar as camadas existentes. Novos componentes ou utilitários precisam ser documentados com comentários na seção correspondente.
- Evite dependências externas de fontes ou bibliotecas. Se necessário, documente no `README.md` raiz e avalie impacto em PWA offline.
- Sempre teste o shell (`index.html`) e o MiniApp Prefeito após ajustes significativos de CSS.
