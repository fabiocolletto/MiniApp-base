# AGENT.md – Diretrizes Oficiais do Repositório 5Horas PWA / Miniapps

Documento mestre para todos os desenvolvedores, designers e contribuidores do ecossistema **5Horas Miniapps + PWA Familiar**. Aqui estão todas as regras, padrões, estruturas e políticas que regem o funcionamento do repositório.

> **Processo obrigatório:** toda alteração deve ser registrada no `change.md` na raiz do repositório.

---

# 1. Propósito do Projeto

Este repositório abriga a **plataforma PWA Familiar**, um sistema modular baseado em **Miniapps (MFE)**, capaz de atender múltiplos produtos:

* Educação
* Financeiro
* Saúde
* Tarefas
* Outros módulos futuros

O projeto segue três princípios:

* **Simplicidade** – mínimo código, máximo efeito
* **Padronização** – todos os miniapps seguem a mesma estrutura
* **Escalabilidade** – adicionar produtos sem reescrever o sistema

---

# 2. Estrutura Obrigatória do Repositório

A árvore do repositório deve sempre seguir este formato:

```
src/
  core/
    layout/         → AppShell.jsx
    orchestrator/   → ScreenOrchestrator.jsx
    db/             → indexdb.js
    auth/           → webauthn.js
    api/            → supabase.js

  screens/          → telas internas essenciais

products/
  <categoria>/
    <miniapp>/
      index.html     → arquivo OBRIGATÓRIO
      assets/...     → quando necessário

public/
  manifest.webmanifest
  icons/...          → ícones 72–512 px
```

### Regras:

* Nenhuma outra estrutura é permitida.
* Cada miniapp deve viver isolado em sua pasta.
* Apenas arquivos **atuais** e **necessários** podem permanecer.
* Ao alterar algo, executar **processo de limpeza** (ver item 11).

---

# 3. Arquitetura MFE (Micro-Frontends)

O sistema utiliza uma arquitetura baseada em:

### **AppShell**

Carregado via `src/core/layout/AppShell.jsx`.
É o núcleo que provê:

* IndexedDB
* WebAuthn
* Supabase
* Navegação
* Carregamento de Miniapps

### **Loader de Miniapps**

Carrega `products/<categoria>/<miniapp>/index.html` em sandbox leve.

### **ScreenOrchestrator**

Função única que monta qualquer tela da plataforma.

### Regras principais:

* Miniapps **não podem acessar o núcleo diretamente**.
* Toda comunicação passa pelo AppShell.
* Miniapps usam apenas caminhos relativos `./`.
* Nenhum miniapp pode registrar rotas internas.

---

# 4. Banco Local – IndexedDB

Arquivo: `src/core/db/indexdb.js`

### Deve conter:

* dados do usuário
* perfis
* vínculos
* assinaturas
* cache dos miniapps
* notificações pendentes

### IndexedDB é o modo **offline completo** do app.

---

# 5. Backend – Supabase

Arquivo: `src/core/api/supabase.js`

Usado para:

* sincronização familiar
* salvar perfis
* salvar vínculos
* notificações
* assinaturas (Mercado Pago)
* permissões e acessos

### Variáveis de ambiente

O cliente do Supabase depende das variáveis `SUPABASE_URL` e `SUPABASE_KEY`, que devem estar definidas no ambiente de execução para que o app possa se conectar com segurança.

Em máquinas de desenvolvimento onde essas variáveis não estão configuradas, o bootstrap ignora o health-check e o app continua operando no modo offline-first (IndexedDB), permitindo testar a experiência local sem Supabase.

---

# 6. Autenticação – WebAuthn

Arquivo: `src/core/auth/webauthn.js`

É a camada padrão de biometria para acesso ao app.
Substitui login tradicional.

---

# 7. Perfis do Produto Educação

Um usuário pode ter múltiplos perfis simultaneamente.
Cada perfil vive como uma entidade separada.

## Perfis oficiais

* **Aluno**
* **Responsável**
* **Tutor**
* **Instituição**

## Cada perfil tem:

* seus próprios dados
* suas próprias permissões
* seu próprio código `XXX-XXX-XXX`
* pode ser renovado
* pode ser compartilhado
* pode ser vinculado a qualquer outro perfil permitidos

## Dados mínimos por perfil

### Aluno

* nome
* nascimento
* nível escolar
* histórico
* preferências
* código `XXX-XXX-XXX`

### Responsável

* nome
* relação com aluno
* contato
* permissões de relatórios
* código

### Tutor

* nome
* áreas
* níveis atendidos
* disponibilidade
* código

### Instituição

* nome
* tipo
* identificação oficial
* responsáveis
* código

---

# 8. Fluxo de Vínculos (Perfil ↔ Perfil)

### 1. Perfil A gera código.

### 2. Perfil B digita código.

### 3. Sistema retorna **dados mascarados**:

* nome parcial
* tipo de perfil
* idade aproximada

### 4. Perfil B valida:

* **Enviar solicitação**
* **Editar código**
* **Cancelar**

### 5. Perfil A recebe notificação e decide:

* **Aceitar** → vínculo fica *active*
* **Rejeitar** → vínculo fica *rejected*

### 6. Ambos podem quebrar vínculo.

* Vínculo vira *removed*.
* Ambos recebem notificação.

---

# 9. Notificações

Sempre registradas no Supabase e replicadas no IndexedDB.

Formato:

```
{
  id: "uuid",
  to: "userId",
  type: "vinculo",
  payload: {
    fromProfile: "aluno",
    toProfile: "responsavel",
    action: "pendente"
  },
  createdAt: "...",
  read: false
}
```

---

# 10. Assinaturas por Produto (Mercado Pago)

### Cada produto tem:

* seu próprio `mpSubscriptionId`
* seu próprio status (`active`, `inactive`, `paused`)
* seu ciclo de cobrança mensal

### Regras:

* Primeiro usuário paga valor cheio.
* Usuários adicionais têm desconto.
* Alterações só refletem na virada do mês.
* Durante o mês, apenas o status muda.

### Estrutura

```
subscriptions: [
  {
    product: "educacao",
    mpSubscriptionId: "sub_xxx",
    status: "active",
    nextBilling: "...",
    lastSync: "..."
  }
]
```

---

# 11. Processo de Limpeza Obrigatório

Toda alteração no repositório exige limpeza:

* remover arquivos antigos
* excluir protótipos
* apagar duplicados
* garantir apenas arquivos atuais
* validar imports
* limpar assets não usados
* revisar cada pasta
* não deixar restos de miniapps removidos

É estritamente proibido deixar lixo no repo.

---

# 12. Regras para Miniapps

## Ao adicionar

* criar pasta em `products/<categoria>/<miniapp>/`
* incluir apenas `index.html` + assets necessários
* usar apenas `./` nos caminhos
* miniapp deve ser autocontido

## Ao editar

* manter compatibilidade com Loader
* não alterar o núcleo
* não adicionar dependências externas

## Ao remover

* excluir única pasta do miniapp
* atualizar CHANGELOG
* remover referências internas

---

# 13. Commits e Versionamento

### Padrão de commit:

```
feat(miniapp-nome):
fix(miniapp-nome):
refactor(miniapp-nome):
chore(core):
```

### Versionamento:

* Miniapps podem ter versão interna
* Core segue versionamento centralizado

---

# 14. JSON Oficial do Usuário

```
{
  "userId": "u-uuid",
  "familyId": "f-uuid",
  "isMaster": false,
  "profiles": [
    {
      "type": "aluno",
      "code": "ABC-123-XYZ",
      "data": {}
    }
  ],
  "financial": {
    "isFinancialAdmin": false,
    "autoLinkedToEducation": true
  },
  "links": [],
  "notifications": {
    "allow": true,
    "pushToken": ""
  },
  "security": {
    "webauthnRegistered": true,
    "devices": []
  },
  "meta": {
    "version": 1
  }
}
```

---

# 15. Telas Essenciais

1. Dashboard Familiar
2. Autenticação (WebAuthn)
3. Perfil do Usuário
4. Gestão da Família (Master)
5. Lista de Miniapps
6. Loader de Miniapps
7. Configurações
8. Alertas
9. Offline / Erro

---

# 16. Padrão de Código

* Sempre usar caminhos relativos `./`
* Componentes React limpos
* Evitar duplicação
* Padrão único de UI via Ionic

---

**Este documento governa TODO o repositório.**
Qualquer divergência deve ser corrigida para alinhar ao padrão oficial.
