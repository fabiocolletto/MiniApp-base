# AGENT.md – Guia Oficial do Projeto Miniapp Familiar

Este documento é a referência central para qualquer pessoa que vá atuar no repositório. Ele descreve a arquitetura, padrões, responsabilidades e regras essenciais para manter o projeto organizado, escalável e seguro. **Todos os colaboradores devem ler este documento antes de contribuir.**

---

## 1. Visão Geral do Projeto

O Miniapp Familiar é um **PWA modular**, baseado em **MFE (Micro Frontend Architecture)**, criado para hospedar miniapps independentes dentro de um ecossistema unificado. O objetivo é permitir que famílias utilizem ferramentas para educação, tarefas, finanças, rotina e gestão familiar em vários dispositivos, com sincronização e acesso seguro.

A visão do projeto é manter um núcleo leve (App Shell) e permitir que miniapps adicionem funcionalidades sem aumentar a complexidade da base.

---

## 2. Arquitetura Central

A arquitetura é composta por quatro pilares fundamentais:

### 2.1 App Shell

O coração do PWA. Carrega:

* inicialização global
* WebAuthn
* IndexedDB
* Supabase
* estado do usuário e da família
* orquestrador de telas

Arquivo: `src/core/layout/AppShell.jsx`

### 2.2 Orquestrador de Telas

Controla a navegação interna entre telas sem rotas externas. Ele decide que tela renderizar com base no estado do usuário e permissões.

Arquivo: `src/core/orchestrator/ScreenOrchestrator.jsx`

### 2.3 Infraestrutura (Core)

Responsável por tudo que é compartilhado pelo ecossistema:

* banco local: `src/core/db/indexdb.js`
* autenticação: `src/core/auth/webauthn.js`
* API familiar: `src/core/api/supabase.js`

### 2.4 Miniapps

Cada miniapp vive isolado na pasta:

```
products/<categoria>/<miniapp>/index.html
```

Eles usam apenas o App Shell e APIs expostas.

---

## 3. Padrões de Código e Importações

Para garantir consistência, todos os arquivos do projeto seguem o mesmo padrão:

### 3.1 Uso obrigatório de caminhos relativos

Todo import deve começar com `./` ou `../`.

Ex.:

```jsx
import AppShell from "./core/layout/AppShell.jsx";
```

### 3.2 Nunca usar aliases (@, ~ etc.)

Isso garante portabilidade entre miniapps e compatibilidade com GitHub Pages.

### 3.3 Nunca usar caminhos absolutos (/src/...)

Sempre usar `./src/...` no index.html.

### 3.4 Extensões completas

Sempre incluir `.jsx` ou `.js` no final dos imports.

### 3.5 Componentes React

* apenas **funções** (não classes)
* sem estilos inline excessivos
* UI base futura será Ionic (MVP usa HTML básico)

---

## 4. Estrutura Obrigatória do Repositório

A estrutura abaixo é **obrigatória**. Toda pessoa que atuar no repositório deve manter este formato. Alterações só podem ser feitas mediante consenso e atualização deste documento.

```
miniapp/
  src/
    core/
      layout/          # AppShell
      orchestrator/    # Navegação interna
      db/              # IndexedDB
      auth/            # WebAuthn
      api/             # Supabase

    screens/           # Telas oficiais do app
      Auth.jsx
      Home.jsx
      Perfil.jsx
      Master.jsx
      Miniapps.jsx
      Loader.jsx
      Settings.jsx
      Error.jsx

  products/            # Miniapps independentes
    educacao/
      app-quiz/
        index.html
    financas/
    tarefas/

  public/
    manifest.webmanifest
    icons/

  index.html           # Entrada do PWA
  vite.config.js       # Configuração do Vite + PWA
  package.json         # Dependências e scripts
  README.md
  AGENT.md             # Este documento
```

### Explicação Detalhada

* **src/core/** → contém toda a infraestrutura do sistema. Nada aqui pode ser alterado sem revisão.
* **src/screens/** → telas oficiais. São parte do App Shell.
* **products/** → miniapps independentes. Cada miniapp vive isolado.
* **public/** → arquivos estáticos do PWA.
* **index.html** → entrada única. Sempre usa caminhos relativos.
* **vite.config.js** → ativa PWA e bundling.
* **AGENT.md** → regras do repositório.
* **README.md** → explicações gerais para novos colaboradores.

```
src/
  core/
    layout/          # AppShell
    orchestrator/    # Navegação interna
    db/              # IndexedDB
    auth/            # WebAuthn
    api/             # Supabase

  screens/           # Telas principais do app

products/             # Miniapps independentes
  educacao/
  financas/
  tarefas/

public/
  manifest.webmanifest
  icons/
```

Cada pasta possui papel definido e **não deve** ser reorganizada sem consenso da equipe.

---

## 5. Telas Oficiais do MVP

As telas mínimas que o PWA deve ter:

1. Auth – autenticação e onboarding
2. Home – dashboard familiar
3. Perfil – dados do usuário
4. Master – gestão dos membros da família
5. Miniapps – lista de miniapps carregáveis
6. Loader – carregamento de miniapp (MFE)
7. Settings – configurações
8. Error – fallback

Todas estão em: `src/screens/`

---

## 6. Regras de Segurança

### 6.1 WebAuthn obrigatório

Todo usuário deve autenticar-se via biometria (quando o dispositivo permitir).

### 6.2 Usuário Master

* controla família
* controla menores
* aprova permissões

### 6.3 Offline-first seguro

Nenhum dado sensível é enviado sem criptografia ou Supabase com RLS ativa.

---

## 7. IndexedDB – Estrutura Local

Tabelas oficiais:

* `family`
* `members`
* `permissions`
* `session`
* `sharedData`
* `logs`

Nenhum miniapp deve criar novas stores.

---

## 8. Supabase – Sincronização

Usos permitidos:

* baixar dados de família
* salvar permissões
* enviar logs
* receber eventos realtime

Não usamos login do Supabase.
Tudo é controlado pelo App Shell.

---

## 9. Miniapps – Regras

Miniapps são módulos desacoplados hospedados em:

```
products/<categoria>/<miniapp>/index.html
```

Eles são carregados dinamicamente pelo Loader.

### 9.1 Ao adicionar um novo miniapp

* criar a pasta no formato:

```
products/<categoria>/<nome-do-miniapp>/
```

* arquivo obrigatório: `index.html`
* deve ser independente e autocontido
* usar apenas importações relativas `./`
* não registrar novas rotas nem telas no core
* não acessar IndexedDB diretamente
* comunicar ações apenas via:

  * Supabase (registerAction)
  * sharedData (via API do App Shell)
* atualizar README e AGENT.md se for um novo módulo oficial

### 9.2 Ao editar um miniapp existente

* manter compatibilidade com o Loader
* nunca alterar estrutura do App Shell
* mudanças que afetam múltiplos miniapps devem ser discutidas via issue
* não adicionar dependências externas sem aprovação
* manter o miniapp isolado sem impacto no resto do sistema

### 9.3 Ao remover um miniapp

* excluir apenas a pasta do miniapp
* remover apenas referências diretas nos locais necessários
* nunca apagar código do núcleo ou de outro miniapp
* criar registro no changelog descrevendo a remoção
* atualizar documentação (lista de miniapps disponíveis)

### 9.4 Como manter versões e histórico dos miniapps

* cada miniapp deve ter seu próprio versionamento interno (comentário ou JSON simples)
* mudanças maiores devem aparecer no CHANGELOG raiz
* commits devem seguir padrão:

```
feat(miniapp-nome): descrição
fix(miniapp-nome): correção
refactor(miniapp-nome): melhoria
```

* caso miniapps compartilhem componentes futuros, estes devem ir para `/src/shared/`

---

## 14. Regras para Manutenção do Repositório

### 14.1 Estrutura do repositório

A estrutura descrita neste documento é fixa e não deve ser alterada sem consenso da equipe.

### 14.2 Registros obrigatórios em mudanças estruturais

Toda modificação deve registrar:

* o que mudou
* por quê mudou
* impacto em miniapps
* impacto no App Shell
* impacto no Loader

### 14.3 Organização e limpeza contínua

* remover código morto

* evitar arquivos duplicados

* garantir consistência no uso de `./`

* revisar imports quebrados antes de PR

* **após qualquer alteração, executar processo de limpeza:**

  * apagar arquivos antigos, versões obsoletas e componentes que não são mais usados
  * remover assets desnecessários em `public/`
  * excluir miniapps que foram substituídos ou migrados
  * revisar pastas para garantir que apenas arquivos atuais e necessários permaneçam
  * garantir que cada pasta contenha somente o que pertence a ela
  * validar que não existem restos de testes, temporários, rascunhos ou protótipos no repositório

* remover código morto

* evitar arquivos duplicados

* garantir consistência no uso de `./`

* revisar imports quebrados antes de PR

### 14.4 Proteção do núcleo

As pastas abaixo só podem ser editadas após análise:

```
src/core/
src/screens/
```

Estas pastas definem o funcionamento geral do sistema.

Miniapps nunca devem alterar estas pastas.

### 14.5 Regra de compatibilidade

Qualquer alteração deve ser reversível e não pode quebrar:

* o App Shell
* o Loader
* miniapps existentes
* sincronização com Supabase
* funcionamento offline

### 14.6 Checklist antes de aceitar PR

* [ ] imports relativos corretos
* [ ] nenhuma alteração indevida no core
* [ ] nenhum miniapp quebrado
* [ ] build rodando localmente
* [ ] App Shell funcionando
* [ ] Loader funcionando

---

Miniapps são:

* independentes
* isolados
* livres para usar UI própria
* carregados via Loader

Eles **não** podem:

* acessar DB diretamente
* registrar telas novas no core

Eles **podem**:

* usar APIs expostas (Supabase, actions)
* armazenar dados em `sharedData`

---

## 10. Commits e Colaboração

### 10.1 Padrão de commit

```
feat: nova funcionalidade
fix: correção
refactor: melhoria
style: ajustes visuais
docs: documentação
chore: tarefas gerais
```

### 10.2 Pull requests

Todos os PRs devem:

* seguir este documento
* não quebrar miniapps
* explicar impactos

---

## 11. Deploy

O deploy acontece via **GitHub Pages**.
Caminhos relativos garantem compatibilidade.

---

## 12. Filosofia Geral do Projeto

* simplicidade acima de tudo
* modularidade acima de complexidade
* app shell enxuto
* miniapps independentes
* segurança herdada do sistema
* código limpo, legível e reutilizável

---

## 15. Contato

Dúvidas e discussões técnicas devem ser feitas via issues.

**Este documento deve ser atualizado sempre que mudanças estruturais forem feitas no projeto.**
