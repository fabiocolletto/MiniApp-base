# Validação da versão 3.0.0

- **Data/hora (BRT)**: 2025-10-30T06:02:57-03:00
- **Ambiente**: Node.js v22.19.0, npm v10.9.0
- **Escopo**: Conversão da MiniApp Store para o shell conversacional, atualização da paleta inspirada na OpenAI e consolidação da base para o marco 3.0.

## Testes automatizados executados

| Status | Comando | Cobertura |
| --- | --- | --- |
| ✅ | `npm test` | Execução integral da suíte Node Test Runner (14 casos) cobrindo bootstrap do Auth Shell, preferências de MiniApps, limpeza de dados e nova bateria de validação da MiniApp Store em layout conversacional. |

### Destaques da suíte

- **`tests/miniapp-store.view.test.js`** (novo) garante o comportamento dos cartões (`createMiniAppCard`), bloqueio de ações sem sessão ativa e alternância da sidebar/conversas no layout inspirado no ChatGPT.
- **`tests/auth-shell.init.test.js`** continua a validar o fluxo convidado/cadastro com ambiente DOM reutilizável, agora compartilhando um helper único para acoplar janelas simuladas.
- **`tests/miniapp-preferences.test.js`** confirma limites de favoritos, sincronização de salvos e tratamento de sessão inativa.

## Testes manuais recomendados

Os cenários abaixo compõem o roteiro manual oficial da versão 3.0.0. Eles permanecem indicados para validações periódicas em navegadores reais e complementam as simulações automatizadas que executamos nesta entrega:

1. **Fallback offline** – ativar o modo "Offline" no DevTools e recarregar deve exibir `public/offline.html` e restaurar o shell ao reconectar.
2. **Atalhos de MiniApp** – acessos diretos `/?app=task-manager` e `/?app=exam-planner` devem destacar os cartões corretos e abrir a documentação correspondente.
3. **Instalabilidade PWA** – o prompt de instalação precisa listar nome, ícones maskable e atalhos definidos no manifesto.
4. **Navegação conversacional** – alternância do botão de sidebar, seleção de conversas e foco automático no cartão correspondente (testar em diferentes larguras).
5. **Ações de MiniApp** – autenticação local seguida dos fluxos de salvar/favoritar, com feedbacks de limite e mensagens acessíveis.

## Evidências adicionais

- Foi criado o helper `tests/helpers/dom-env.js` para padronizar o acoplamento do DOM simulado em todas as suítes.
- Os novos testes replicam interações típicas do ChatGPT (scroll, foco, alternância de conversas) sem dependências externas, facilitando regressões futuras.
- Logs de sincronização IndexedDB permanecem tratados (erros são capturados e exibidos apenas como aviso em ambientes sem suporte a IndexedDB).

## Próximos passos sugeridos

- Monitorar métricas de UX do shell conversacional (tempo para destacar MiniApp favorito e conversão de novas jornadas).
- Preparar scripts de smoke test para navegadores reais (Chrome/Safari) a partir do plano manual descrito acima.
