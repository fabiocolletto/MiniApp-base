# MiniApp Base

Este repositório reúne protótipos HTML/CSS simples utilizados para validar fluxos de interface de miniaplicativos. Os artefatos principais ficam na pasta `miniapp-base`, mas há variações experimentais em `miniapp-prefeito`.

## Estrutura
- `index.html`: página de entrada que referencia os estilos compartilhados.
- `miniapp-base/`: assets e folhas de estilo do miniaplicativo base.
- `miniapp-importador/`: miniapp dedicado ao fluxo de importação de pesquisas.
- `miniapp-prefeito/`: variantes visuais e fluxos específicos para cenários municipais.
- `miniapp-catalogo/index.html`: variante do catálogo publicada em ambientes de homologação.

## Como trabalhar
1. Leia `AGENTE.md` e `CHANGELOG.md` antes de começar qualquer alteração para entender as convenções vigentes.
2. Utilize `npm`, `pnpm` ou `yarn` apenas se necessário; os protótipos funcionam abrindo o HTML diretamente no navegador.
3. Ao alterar estilos, mantenha a responsividade e valide o layout em breakpoints menores (altura e largura).
4. Utilize o componente `miniapp-base/components/carousel.js` sempre que precisar criar containers roláveis de miniapps, mantendo consistência com os demais fluxos.
5. Sempre atualize o `CHANGELOG.md` descrevendo as mudanças relevantes antes de abrir um PR.

## Miniapps disponíveis
- **Painel do Prefeito** – painel com KPIs, filtros e relatórios setoriais acessível em `miniapp-prefeito/index.html`.
- **Importador de Pesquisas** – fluxo para importar arquivos CSV e revisar resultados em `miniapp-importador/index.html`.

## Licença
Uso interno apenas; consulte os responsáveis pelo projeto antes de compartilhar externamente.
