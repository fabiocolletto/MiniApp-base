# MiniApp 5 Horas v3.0

Reestruturação modular com modo offline-first, UniqueID via Apps Script e sincronização com Firestore.

## Estrutura

```
/src
  /core (app, estado global e persistência)
  /components (UI modular)
  /services (UniqueID + Firestore)
/assets
  /css
index.html
```

## Fluxo de usuário

1. Telefone preenchido aciona `getUniqueId` (Apps Script) para criar o ID principal.
2. Dados são armazenados primeiro no `localStorage` (funciona offline).
3. Quando houver conexão, o documento `users/{uniqueId}` é criado/atualizado no Firestore.
4. Ao reconectar, o app envia automaticamente o que estiver marcado como `needsSync`.

## Scripts

- `npm test` — testes unitários (Vitest)
- `npm run lint` — ESLint + Prettier

## Configurações

Defina `window.FIREBASE_CONFIG` (browser) ou `globalThis.FIREBASE_CONFIG` (testes) para usar Firestore real. Sem configuração, o app utiliza o fallback em memória.

Defina `globalThis.UNIQUE_ID_ENDPOINT` para apontar para a URL real do Apps Script. Caso contrário, um endpoint de placeholder é usado.
