# miniapp-prefeito/

MiniApp focado em consumo de dados públicos para prefeitos. A interface agora permite salvar várias planilhas do Google Sheets e alternar rapidamente entre elas sem depender de prompts.

## Estrutura
- `index.html` – interface principal com painel de gerenciamento de planilhas, seletor da fonte ativa, prévia dos dados e integração com o shell (`postMessage`).
- `js/config-source-simple.js` – controlador que persiste fontes (`prefeito.sources`), mantém o identificador ativo (`prefeito.activeSource`) e gerencia o cache por planilha (`prefeito.cache`). Também cuida do carregamento do CSV, fallback DEMO e status enviados ao shell.
- `data/demo_fato_kpi_diario.csv` – conjunto de dados local utilizado como demonstração/offline quando ainda não há cache para a planilha ativa.

## Fluxo de gerenciamento de planilhas
1. Clique em **Adicionar planilha** para abrir o formulário. Informe um identificador (opcional), o ID da planilha e o nome da aba compartilhada com leitura pública. Se o identificador ficar em branco, um slug é gerado automaticamente.
2. Ao salvar, a planilha passa a integrar a lista, fica habilitada e se torna a fonte ativa. O status no rodapé reflete o total de planilhas salvas, quantas estão habilitadas e qual está em exibição.
3. Use o checkbox **Habilitada** para incluir ou excluir a planilha da rotação. Desabilitar ou remover a fonte ativa limpa a seleção e oculta a prévia até que outra planilha seja escolhida.
4. No seletor **Fonte ativa** escolha qual identificador habilitado deve alimentar o preview. O botão **Atualizar** sempre atua sobre a planilha ativa.
5. O botão **Remover** exclui a entrada da lista e apaga o cache correspondente. Se nenhuma planilha permanecer ativa, a prévia fica escondida e o shell recebe subtítulo informando a situação.
6. Ao clicar em **Atualizar**, o miniapp busca o CSV via `gviz`, compara com o cache e salva somente quando há novidades. Em caso de falha, o cache existente (ou a DEMO local) é reexibido automaticamente.

Os valores são guardados em `localStorage` e aplicados a cada recarregamento. Qualquer ajuste de integração deve preservar o envio de `{ action: 'miniapp-header', title, subtitle }` sempre que o estado mudar, além de respeitar o fallback DEMO para ambientes offline.
