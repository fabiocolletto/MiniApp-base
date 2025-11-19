# MiniApp - Configurações do Sistema

Status: **Em criação**, com o monitoramento do IndexedDB já funcional.

Painel destinado às preferências unificadas (tema, idioma, integrações) associadas ao ícone de configurações do rodapé. O código existente seguirá evoluindo até a homologação final.

## Estrutura atual
- `index.html`: painel inicial do MiniApp com o card de memória local e o painel detalhado de armazenamento.
- `config-control.js`: script responsável por ler o consumo do IndexedDB e controlar a expansão automática do painel.
- `CHANGELOG.md`: histórico de mudanças.

## Funcionalidades implementadas
1. Card compacto de 300px que resume uso atual, status (Estável/Atenção/Crítico) e memória livre.
2. Indicador visual com setinha que sinaliza a expansão do card em telas menores.
3. Painel detalhado com barra de progresso, capacidade total e atualização em tempo real via `StorageManager.estimate()`.
4. Expansão automática do painel em telas maiores (>= 1024px) e atualização periódica a cada 30 segundos.

## Próximos passos
1. Revisar campos e fluxos finais de configurações.
2. Integrar com o carregamento oficial de dados quando disponível.
3. Substituir mensagens de "em criação" por conteúdo definitivo após QA.
