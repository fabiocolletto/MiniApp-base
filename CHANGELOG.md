# Changelog

## 3.0.0

- Reestruturação completa em módulos (`src/core`, `src/components`, `src/services`).
- Implementação do modo offline-first com armazenamento local e sincronização automática.
- Suporte a UniqueID via Apps Script para indexar usuários no Firestore.
- Serviços de Firestore com fallback em memória para ambientes sem configuração.
- Painel do usuário reorganizado e renderizado dinamicamente em `app.js`.
- Testes unitários (Vitest) cobrindo UniqueID, armazenamento local e integração simulada com Firestore.
