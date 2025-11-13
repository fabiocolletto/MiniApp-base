# Testes automatizados

Esta pasta concentra todas as suítes automatizadas do projeto. A hierarquia segue as boas práticas para manter a descoberta de testes simples e facilitar a manutenção dos utilitários compartilhados.

- `e2e/`: cenários de ponta a ponta escritos com Playwright.
- `helpers/`: stubs e utilidades comuns às suítes.

Sempre que novos tipos de teste forem adicionados (por exemplo, testes de integração ou lint customizado), crie um subdiretório dedicado dentro de `tests/` e registre as instruções de execução correspondentes neste arquivo.
