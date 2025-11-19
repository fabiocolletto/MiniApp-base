# MiniApp - Pagamentos e Assinaturas

Status: **Em criação**, com foco inicial nas assinaturas brasileiras via Mercado Pago.

MiniApp dedicado a concentrar o gerenciamento das formas de pagamento. Nesta fase inicial, o painel traz um card compacto e um painel expandido para a assinatura brasileira operada exclusivamente pelo Mercado Pago, replicando o padrão visual dos cards do catálogo. O snapshot exibido no MiniApp Configurações reaproveita os mesmos dados mockados para dar contexto rápido antes de abrir este painel completo.

## Estrutura atual
- `index.html`: painel com o card compacto/expandido e sessões detalhadas sobre o plano, histórico e ações rápidas.
- `payment-control.js`: script responsável por hidratar o card com dados mockados e controlar o comportamento de expansão.
- `CHANGELOG.md`: histórico de evolução do painel de pagamentos.

## Próximos passos
1. Preparar o carregamento dinâmico de planos por região/provedor.
2. Adicionar novos provedores quando homologados, reutilizando o mesmo card.
3. Integrar os botões ao fluxo real do Mercado Pago após definição dos endpoints oficiais.
