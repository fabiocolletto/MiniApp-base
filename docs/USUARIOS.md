# Sistema de Usuários — Fase 1

## Papéis e permissões

| Papel     | Descrição                                                       | Acesso ao catálogo |
|-----------|-----------------------------------------------------------------|--------------------|
| `admin`   | Configura integrações, gerencia usuários e vê todos os MiniApps.| Todos os cards     |
| `operador`| Opera MiniApps transacionais e dashboards liberados.            | Apenas operações   |
| `leitor`  | Consulta relatórios e visões públicas.                          | Somente leitura    |

O shell filtra os cards do catálogo com base no atributo `data-required-role`. Quando o usuário não possui papel suficiente, o card é ocultado e o shell exibe uma mensagem de acesso negado.

## Fluxo de bootstrap

1. O shell executa `Auth.bootstrap()` ao iniciar.
2. Se o endpoint `/users/bootstrap` responder com `adminMissing: true`, o MiniApp `miniapp-usuarios` é carregado em modo *setup* (`miniapp-usuarios/index.html?mode=setup`).
3. O formulário “Definir administrador” envia `POST /users/init-admin`. Após a criação, o próprio MiniApp chama `Auth.login` para registrar a sessão e o shell reabre o catálogo.
4. Com um administrador ativo, novos acessos são direcionados para o login padrão (`miniapp-usuarios/index.html`).

### Modo local (fallback)

- Quando nenhuma URL é configurada para o serviço de usuários (`UsersApi.getBaseUrl()` vazio), o adaptador entra em modo local e persiste os dados no `localStorage` (`miniapp.users.local.state`).
- O bootstrap continua exigindo a criação de um administrador antes de liberar o catálogo, exatamente como no fluxo remoto.
- As operações de login, listagem e atualização de usuários são tratadas no próprio cliente; tokens sintéticos (`local-...`) são usados apenas para manter compatibilidade com a sessão do shell.

## Endpoints expostos pelo Apps Script

| Método | Rota               | Descrição                                                      |
|--------|--------------------|----------------------------------------------------------------|
| `GET`  | `/users/bootstrap` | Verifica se existe administrador ativo.                        |
| `POST` | `/users/init-admin`| Cria o administrador único. Retorna 409 se já existir.        |
| `POST` | `/users/login`     | Valida credenciais e retorna `{ token, role, user }`.          |
| `GET`  | `/users/list`      | Lista usuários (requer `admin`).                              |
| `POST` | `/users`           | Cria usuário (requer `admin`).                                |
| `PATCH`| `/users/:id`       | Atualiza papel ou status (requer `admin`).                     |

## Decisões de segurança

- **Segredo no cliente:** nunca persistimos a senha. O cliente mantém apenas o payload de sessão em `localStorage` (`miniapp.session`) com `{ userId, email, role, token }`.
- **Hash seguro:** o backend usa PBKDF2 com salt único por usuário antes de gravar no `appDataFolder`. No modo local, o cliente aplica `SHA-256` (ou `base64` como fallback) antes de salvar o segredo no dispositivo.
- **Admin único:** enquanto existir administrador ativo, `/users/init-admin` responde `409` e o MiniApp exibe somente o login.
- **Auditoria:** cada alteração de usuário salva `updatedAt` (ISO) e `updatedBy` (ID do administrador autenticado).
- **Tokens opacos:** o Apps Script gera tokens curtos assinados via `PropertiesService`. O cliente envia em `Authorization: Bearer <token>`; o backend valida expiração antes de atender solicitações administrativas.

## Estrutura no Drive (`appDataFolder`)

```
usuarios.json
{
  "version": 1,
  "users": [
    {
      "id": "usr_...",
      "name": "Fulana",
      "email": "fulana@empresa.com",
      "role": "admin",
      "active": true,
      "hash": "...",
      "salt": "...",
      "updatedAt": "2025-11-19T23:45:00.123Z",
      "updatedBy": "usr_..."
    }
  ]
}
```

## Integração com o shell

- `Auth.require(role)` bloqueia `loadMiniApp` e envia `shell-access-denied` ao catálogo quando necessário.
- O catálogo oculta cards com `data-required-role` incompatível com a sessão.
- O MiniApp de usuários envia `auth-session-changed` após login/logout para sincronizar o shell e os demais MiniApps.
