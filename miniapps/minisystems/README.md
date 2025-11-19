# MiniApp - MiniSystems Preferences

Status: **Em criação**, com foco na transmissão de preferências globais (tema e idioma) para todo o shell.

O MiniSystems nasce como o hub dedicado às preferências que precisam ser aplicadas de forma imediata nos demais MiniApps. Embora o cartão esteja embutido no painel de Configurações, esta pasta concentra a documentação e servirá como base para o futuro painel autônomo quando o projeto sair do modo snapshot.

## Estrutura atual
- `index.html`: placeholder detalhando o objetivo do MiniSystems e oferecendo links de retorno para o painel de Configurações.
- `README.md`: este arquivo, descrevendo o escopo inicial.
- `CHANGELOG.md`: histórico de evolução.

## Próximos passos
1. Definir o formulário final de preferências dentro do painel autônomo.
2. Conectar-se ao storage centralizado (IndexedDB/localStorage) utilizado pelos demais MiniApps.
3. Publicar endpoints reais para sincronizar preferências com o backend corporativo.
