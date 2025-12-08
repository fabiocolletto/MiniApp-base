# CHANGELOG.md – Histórico de Versões do PWAO

Este documento registra todas as mudanças estruturais, evolutivas e funcionais do **PWAO (Progressive Web App Orgânico)**.  
O objetivo é garantir rastreabilidade completa do organismo ao longo do tempo.

---

# 📌 Formato Oficial
Este projeto segue o padrão semântico adaptado para organismos:

- **Added** – novos órgãos, células ou capacidades
- **Changed** – mutações do Genoma ou melhorias internas
- **Fixed** – correções
- **Removed** – remoções estruturais
- **Security** – alterações de segurança

Cada versão do Genoma possui identificação **Vx.y**, enquanto células usam **semver (1.0.0)**.

---

# 🧬 [V4.3.2] – Sementes nativas e célula Admin
### **Status: Atual (Genoma V4.3.2)**

#### Added
- Registro automático das células nativas (quiz, auth, admin) ao iniciar o Genoma.
- Manifesto celular para `sistema.admin` com interface mínima para o painel.
- Manifesto celular para `sistema.auth` garantindo autodiscovery orgânico.

#### Fixed
- Botão "Abrir Admin" agora encontra a célula `sistema.admin` imediatamente.

---

# 🧬 [V4.3.1] – Atualização do OPP e Manifesto
### **Status: Atual (Genoma V4.3.1)**

#### Added
- Novo `manifest.webmanifest` para o OPP 5Horas.
- Inclusão dos campos modernos (`id`, `categories`, `lang`, `dir`).
- Ícones atualizados: raio laranja com fundo transparente.

#### Changed
- `start_url` e `scope` ajustados para repositórios GitHub Pages.
- Nome oficial consolidado como **5Horas**.
- `theme_color` atualizado para o laranja da marca (#FF7A00).

#### Fixed
- Caminhos relativos incorretos que impediam a instalação do PWA.

#### Security
- Manifesto validado segundo diretrizes do OPP.

---

# 🧬 [V4.2] – Autodiscovery, OPP e Melhorias do Genoma

#### Added
- Registro automático do Service Worker do OPP.
- Suporte completo ao pacote OPP (manifest + SW).
- Melhorias no autodiscovery de células.
- Mensagens aprimoradas de erro e feedback.

#### Changed
- Caminho do service worker alterado para `/opp/service-worker.js`.
- Validação de ambiente seguro antes do registro do SW.
- Tratamento aprimorado para células inexistentes.

#### Security
- Bloqueio de registro de SW fora de HTTPS/localhost.
- Prevenção contra fetch de células remotas.

---

# 🧬 [V4.1] – Autodiscovery Inicial
#### Added
- Introdução do **autodiscovery**.
- Memória Orgânica salva manifestos de células.
- Loader capaz de reconstruir mapa de células instaladas.
- Renderer simplificado com fallback.

#### Changed
- Narrador otimizado para múltiplos listeners.

---

# 🧬 [V4.0] – Nascimento do PWAO
#### Added
- Estrutura inicial do organismo: Genoma + Células + Órgãos.
- Introdução da filosofia orgânica.
- Loader básico para carregar células.
- Renderer fundamental.
- Sistema mínimo de eventos (Narrador).
- Estrutura de diretórios: `/celulas`, `/opp`.

---

# 🧬 [V3.x] – Arquitetura Experimental
Antes da consolidação do conceito orgânico, existiram versões experimentais de layout, miniapps e padrões híbridos.  
Não são compatíveis com o PWAO.

---

# 🧬 [V2.x] – Protótipo de Miniapps
- Implementação inicial de microfrontends.
- Primeira tentativa de isolamento.
- Bases conceituais para células.

---

# 🧬 [V1.x] – Fundação
- Primeiros experimentos com load dinâmico.
- Estruturação manual de telas.
- Origem da ideia do organismo digital.

---

# 🌿 Versão
CHANGELOG v1.0 – Registro inicial do histórico do PWAO
