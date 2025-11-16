# Catálogo de Elementos do Sistema – MiniApp 5Horas

> Versão inicial de documentação dos elementos visuais, componentes de interface,
> padrões de interação e entidades de dados usados no catálogo MiniApp 5Horas.

---

## 1. Propósito deste catálogo

Este documento descreve **o que existe** no sistema (elementos, componentes e padrões),
**onde vive no repositório** e **como deve se comportar**.

Ele é a referência para:

- Criar novos MiniApps mantendo consistência visual e de interação.
- Manter alinhamento entre HTML, CSS, JavaScript e dados de catálogo.
- Ajudar o agente (e futuros contribuidores) a tomar decisões sem quebrar o padrão.

---

## 2. Mapa geral do sistema

| Camada           | Elemento / Papel                                       | Arquivos principais                      |
| ---------------- | ------------------------------------------------------ | ---------------------------------------- |
| Shell PWA        | Estrutura base do catálogo, grid, modais, header      | `index.html`                             |
| Catálogo         | Cards de MiniApp, modais de detalhes, filtros, busca  | `docs/miniapp-card.js` / `.css`          |
| Dados            | Lista de MiniApps e propriedades de negócio           | `docs/miniapp-data.js`                   |
| Persistência     | IndexedDB (favoritos, carrinho, fila offline)         | `js/indexeddb-store.js`                  |
| Sincronização    | Fila offline + Google Sign-In + indicadores de status | `js/googleSync.js`                       |
| MiniApps externos| Implementações específicas (quando aplicável)         | `miniapps/` (ex.: `gestao-de-catalogo/`) |

---

## 3. Fundamentos visuais

> **Objetivo:** registrar os “átomos” do sistema – cores, tipografia, espaçamentos,
> ícones e comportamento de tema (claro/escuro), mesmo que hoje venham direto do Tailwind/CDN.

### 3.1. Cores (tokens lógicos)

| Token lógico       | Uso principal                              | Origem atual         |
| ------------------ | ------------------------------------------- | -------------------- |
| `color-primary`    | Ações principais (botões, destaques)       | Tailwind + CSS local |
| `color-secondary`  | Ações secundárias / contornos              | Tailwind + CSS local |
| `color-bg`         | Fundo principal da aplicação               | Tailwind             |
| `color-surface`    | Fundo de cards e modais                    | Tailwind + CSS local |
| `color-success`    | Estados de sync ok, itens processados      | Tailwind + CSS local |
| `color-warning`    | Itens pendentes de sync / atenção          | Tailwind + CSS local |
| `color-danger`     | Erros de sync, falhas de carregamento      | Tailwind + CSS local |
| `color-muted`      | Textos auxiliares, descrições, metadados   | Tailwind             |

> **TODO:** mapear para classes utilitárias do Tailwind ou variáveis CSS reais
> assim que o CSS for revisado (`docs/miniapp-card.css` + estilos em `index.html`).

### 3.2. Tipografia

| Elemento                | Papel                          | Estilo esperado             |
| ----------------------- | ------------------------------ | --------------------------- |
| Título do MiniApp       | Hierarquia principal do card   | Fonte sem serifa, peso 600+ |
| Subtítulo / categoria   | Contexto rápido                | Fonte menor, peso 500       |
| Descrição               | Texto principal do card/modal  | Peso normal, boa legibilidade |
| Metadados (preço, tags) | Informação compacta            | Tamanho menor, cor `muted`  |

### 3.3. Espaçamentos e raios

| Token lógico     | Uso                             |
| ---------------- | -------------------------------- |
| `radius-card`    | Borda arredondada dos cards     |
| `radius-modal`   | Borda dos modais                |
| `gap-grid`       | Espaçamento entre cards no grid |
| `padding-card`   | Respiro interno dos cards       |
| `padding-modal`  | Respiro interno do conteúdo     |

> **TODO:** associar esses tokens aos utilitários Tailwind reais usados hoje.

---

## 4. Componentes de Interface (UI)

### 4.1. Shell principal do catálogo

**Nome:** Shell do Catálogo  
**Tipo:** Layout / estrutura  
**Arquivos:** `index.html`

**Responsabilidades:**

- Montar a estrutura base da página PWA.
- Declarar containers onde o grid de MiniApps será injetado.
- Declarar áreas de:
  - Header (logo/título do catálogo, ações globais).
  - Barra de filtros e busca.
  - Grid de cards.
  - Modais (detalhes do MiniApp).
  - Indicadores de status (offline, sync, login).

**Estados relevantes:**

- Modo “lista carregando” (esqueleto ou placeholder).
- Estado offline / sem conexão.
- Estado com usuário logado no Google vs não logado.

---

### 4.2. Card de MiniApp

**Nome:** Card de MiniApp  
**Tipo:** Componente de exibição + ações  
**Arquivos:** `docs/miniapp-card.js`, `docs/miniapp-card.css`  
**Dependências:** `docs/miniapp-data.js` (fonte de dados)

**Função:**

Representar **um** MiniApp no grid, com nome, descrição resumida, imagem, tags
(e possivelmente preço, categoria, link para contrato, etc).

**Conteúdo mínimo esperado:**

- Imagem / ícone do MiniApp.
- Título (`title`).
- Descrição curta (`description`).
- Categoria(s) (`category`).
- Preço ou indicação de custo (`price`).
- Ações:
  - Abrir detalhes.
  - Favoritar.
  - Adicionar à fila/carrinho.

**Estados:**

- Normal.
- Hover / foco.
- Favoritado (ex.: ícone preenchido).
- Adicionado ao carrinho/fila (ex.: badge ou tag visual).
- Desabilitado (se MiniApp indisponível/indiscreto).

> **TODO:** documentar as classes CSS reais e os atributos data-* usados para binds.

---

### 4.3. Modal de detalhes do MiniApp

**Nome:** Modal de Detalhes  
**Tipo:** Componente de overlay  
**Arquivos:** implementado via HTML em `index.html` + lógica em `docs/miniapp-card.js`

**Função:**

Exibir detalhes completos do MiniApp selecionado:

- Descrição estendida.
- Informações de contrato (`contract`).
- URL oficial (`url`).
- Imagem maior (se houver).
- Ações principais (ex.: “Abrir MiniApp”, “Ver contrato”).

**Estados:**

- Aberto / fechado.
- Carregando conteúdo (se for preenchido dinamicamente).
- Erro (caso algum dado não possa ser carregado).

---

### 4.4. Barra de filtros e busca

**Nome:** Filtros & Busca  
**Tipo:** Componente de controle  
**Arquivos:** `index.html` (markup) + `docs/miniapp-card.js` (listeners)

**Função:**

Permitir que o usuário:

- Busque MiniApps por texto (título, descrição, categoria).
- Filtre MiniApps por categoria, tipo, faixa de preço etc (conforme evoluir o data schema).
- Reorganize a exibição (ex.: favoritos, mais usados, mais recentes).

**Elementos típicos:**

- Campo de busca.
- Select/dropdown de categoria.
- Botões / chips de filtro (ex.: “Todos”, “Pesquisa”, “Eventos”, “Crédito”).
- Switch para exibir apenas favoritos (quando implementado).

**Estados:**

- Input vazio vs com termo de busca.
- Nenhum resultado encontrado (mensagem clara + CTA).

---

### 4.5. Indicadores de status (sync & Google)

**Nome:** Indicadores de Sincronização e Conta Google  
**Tipo:** Componentes informativos  
**Arquivos:** `js/googleSync.js`, `index.html`

**Função:**

Comunicar o estado da camada de sincronização:

- Usuário logado / deslogado na conta Google.
- Fila offline com itens pendentes.
- Última sincronização bem sucedida.
- Erros de autenticação ou permissão.

**Possíveis elementos visuais:**

- Badge com ícone de nuvem + contador de itens na fila.
- Ícone de usuário / Google com estado (conectado, desconectado).
- Toasts / alertas pequenos para erros ou sucesso de sync.

**Estados:**

- `online` vs `offline`.
- `sync-idle`, `sync-pending`, `sync-error`.
- `auth-required`, `auth-ok`.

---

### 4.6. Controles de favoritos e carrinho/fila

**Nome:** Favoritos / Fila de Sync  
**Tipo:** Ação de usuário + persistência local  
**Arquivos:** `docs/miniapp-card.js`, `js/indexeddb-store.js`

**Função:**

- Permitir que o usuário marque MiniApps como “favoritos”.
- Adicionar MiniApps a uma fila/carrinho para ações futuras (ex.: contratar, sincronizar).

**Elementos visuais:**

- Ícone de coração / estrela para favoritos.
- Botão “Adicionar ao carrinho” ou similar nos cards/modais.
- Indicador global (ex.: contador de itens no carrinho/fila).

**Estados:**

- Item favoritado vs não favoritado (visual consistente em todos os lugares).
- Item na fila vs não na fila.
- Persistência após reload (testado via IndexedDB).

---

## 5. Entidades de dados do catálogo

> Baseadas na estrutura documentada no README para `miniapp-data.js`.

### 5.1. Entidade `MiniApp`

**Fonte:** `docs/miniapp-data.js`

**Campos documentados:**

- `id` (string, único e estável)  
- `title` (string, nome exibido)  
- `description` (string, descrição curta)  
- `price` (string ou número, ex.: "R$ 350/mês")  
- `category` (string ou array de strings)  
- `contract` (URL ou identificador para o contrato do serviço)  
- `url` (URL para o MiniApp ou demo)  
- `image` (URL para imagem do card)  

**Regras:**

- `id` deve seguir padrão estável (ex.: `miniapp-nome-versao`).
- `title` deve ser exclusivo (também usado como fallback em buscas/favoritos).
- Novos campos introduzidos devem ter valores padrão para MiniApps antigos.

---

### 5.2. Entidade `Favorite`

**Fonte:** `js/indexeddb-store.js` (conceito lógico)

**Campos sugeridos:**

- `miniAppId` (string, chave do MiniApp)
- `createdAt` (timestamp)
- Campos adicionais conforme necessidade (ex.: origem da ação, device, etc.)

---

### 5.3. Entidade `SyncQueueItem`

**Fonte:** `js/googleSync.js` / `js/indexeddb-store.js`

**Campos sugeridos:**

- `id` (chave única da entrada na fila)
- `miniAppId` (referência ao MiniApp)
- `operation` (ex.: `"favorite"`, `"unfavorite"`, `"add-to-cart"` etc.)
- `payload` (dados extras, se necessário)
- `status` (`pending`, `processing`, `synced`, `error`)
- `createdAt`, `updatedAt`

---

## 6. Padrões de interação

### 6.1. Fluxo de descoberta

1. Usuário abre o catálogo (shell PWA).
2. Sistema carrega lista de MiniApps de `miniapp-data.js`.
3. Cards são renderizados no grid.
4. Usuário:
   - Rola o grid,
   - Filtra por categoria,
   - Faz busca por texto,
   - Abre detalhes em modal.

### 6.2. Fluxo de favoritos

1. Clique no ícone de favoritar no card ou no modal.
2. Sistema:
   - Atualiza visual do card (estado favoritado).
   - Persiste no IndexedDB (entidade `Favorite`).
   - Opcionalmente adiciona evento na fila de sync (Google).
3. Ao recarregar a página:
   - Estado é restaurado de IndexedDB.
   - Indicadores globais são atualizados.

### 6.3. Fluxo de fila/carrinho

1. Usuário clica em “Adicionar ao carrinho” / “Adicionar à fila”.
2. Sistema cria um `SyncQueueItem` associado ao `miniAppId`.
3. Indicador global é atualizado (contador de itens).
4. Em momento de sync:
   - `googleSync.js` processa a fila,
   - Atualiza estado (ok/erro),
   - Em caso de erro, apresenta feedback visual.

---

## 7. Próximos passos de documentação

1. **Completar tokens visuais**  
   Abrir `docs/miniapp-card.css` e mapear:
   - Classes CSS → tokens deste documento.
   - Estados (hover, active, disabled).
   - Breakpoints de grid (desktop, tablet, mobile).

2. **Mapear funções JS críticas**  
   Abrir `docs/miniapp-card.js`, `js/indexeddb-store.js` e `js/googleSync.js` e registrar:
   - Nome da função,
   - Responsabilidade,
   - Eventos DOM escutados,
   - Dependências entre funções.

3. **Adicionar exemplos de código**  
   Para cada componente chave (card, modal, filtros, indicadores), incluir:
   - Exemplo de HTML mínimo,
   - Classes CSS relevantes,
   - Assinatura das funções JS usadas.

4. **Versão do catálogo**  
   Manter um cabeçalho de versão neste arquivo e atualizar sempre que:
   - Surgir um novo componente,
   - For alterada a estrutura de dados,
   - For introduzido novo padrão de interação.

---
