# Log da ferramenta `log`

## 2025-10-25 08:04 BRT
- Inclui a função `syncSystemReleaseIndicators` para sincronizar automaticamente a versão do sistema no rodapé e na navegação administrativa, registrando o evento no console.

## 2025-10-25 07:58 BRT
- Migração do utilitário de log para `sys/tools/log.ts` e `sys/tools/log.js`, mantendo as funções `logInfo`, `logWarn` e `logError` com prefixo padronizado.
- Cadastro do módulo no README de `sys/tools` e criação deste log dedicado para orientar futuras evoluções da ferramenta.
