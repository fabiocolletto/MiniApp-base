# MiniApp Base

Este repositório reúne protótipos HTML/CSS simples utilizados para validar fluxos de interface de miniaplicativos. Os artefatos principais ficam na pasta `miniapp-base`.

## Estrutura
- `index.html`: catálogo interativo com cabeçalho dinâmico, painel administrativo para gestão de usuários e MiniApps, além de
  footer com indicadores de sincronização e uso de memória.
- `miniapp-base/`: assets e folhas de estilo do miniaplicativo base.
- *(miniapps experimentais foram removidos na versão 1.2.0)*

## Recursos principais
- Persistência em IndexedDB utilizando [Dexie.js](https://dexie.org/) com fallback implícito do navegador.
- Gestão visual de usuários e catálogos com suporte a criação, edição e exclusão.
- Indicadores de sincronização, memória e atualizações do IndexedDB fixos no rodapé.
- Interface traduzida para `pt-BR`, `en-US` e `es-ES` com alternância imediata.

## Como trabalhar
1. Leia `AGENTE.md` e `CHANGELOG.md` antes de começar qualquer alteração para entender as convenções vigentes.
2. Utilize `npm`, `pnpm` ou `yarn` apenas se necessário; os protótipos funcionam abrindo o HTML diretamente no navegador.
3. Ao alterar estilos, mantenha a responsividade e valide o layout em breakpoints menores (altura e largura).
4. Sempre atualize o `CHANGELOG.md` descrevendo as mudanças relevantes antes de abrir um PR.

## Licença
Uso interno apenas; consulte os responsáveis pelo projeto antes de compartilhar externamente.
