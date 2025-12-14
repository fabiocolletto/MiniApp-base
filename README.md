# PWAO – Progressive Web App Orgânico

Bem-vindo ao repositório oficial do **PWAO**, o primeiro organismo digital vivo construído com Genoma, Células, Órgãos e OPP (Organic Progressive Package). 

O PWAO não é um PWA tradicional, nem um aplicativo. Ele é uma nova categoria: **um organismo digital que cresce, aprende e evolui por meio de um ecossistema de módulos independentes, descobertos dinamicamente**.

Este arquivo apresenta:
- O conceito do PWAO
- A estrutura oficial do repositório
- Como o organismo funciona internamente
- Como instalar e rodar
- Como contribuir

---

# 🌱 1. O que é o PWAO?

O **PWAO (Progressive Web App Orgânico)** é um organismo digital inspirado na biologia. Ele possui:

- **Genoma** – o núcleo do organismo (`index.html`)
- **Células** – módulos independentes (como telas, apps, funcionalidades)
- **Órgãos** – motores funcionais que alimentam cada célula
- **Memória Orgânica** – sistema de registro e estado persistente (IndexedDB)
- **Narrador** – canal interno de eventos
- **OPP – Organic Progressive Package** – pacote instalável (manifest + service worker)

O PWAO cresce por meio de **autodiscovery**, aprendendo novas células automaticamente sem que o Genoma seja alterado.

---

# 🧬 2. Arquitetura Geral

A arquitetura é formada por quatro blocos principais:

### **Genoma**
Arquivo raiz. Controla:
- Inicialização do organismo
- Descoberta de células
- Renderização
- Registro do OPP
- Ciclo de vida

### **Células**
Unidades de interface + lógica. Cada célula contém:
- `index.html`
- órgãos (`orgao-*.js`)
- datasets locais
- manifesto celular

### **Órgãos**
Scripts isolados que contêm a lógica funcional.

### **OPP**
Pacote instalável do PWAO:
- `manifest.webmanifest`
- `service-worker.js`
- ícones

---

# 🗂️ 3. Estrutura Oficial do Repositório

```
pwao/
│
├── index.html                 ← Genoma do organismo
│
├── opp/                       ← Organic Progressive Package
│   ├── manifest.webmanifest
│   ├── service-worker.js
│   ├── icon-192.png
│   └── icon-512.png
│
├── celulas/                   ← Células vivas do organismo
│   ├── educacao/
│   │   └── quiz/
│   │       ├── index.html
│   │       ├── orgao-quiz.js
│   │       └── datasets/
│   │           ├── cursos.json
│   │           └── enem/2021/questions.json
│   │
│   └── sistema/
│       ├── auth/
│       └── admin/
│
├── README.md
├── AGENT.md
├── ARCHITECTURE.md
├── CONTRIBUTING.md
├── STYLEGUIDE.md
├── SECURITY.md
└── ROADMAP.md
```

---

# 🚀 4. Como o Organismo Funciona

### **Autodiscovery**
Quando o Genoma inicia, ele lê a Memória Orgânica e descobre todas as células já registradas.

### **Manifesto Celular**
Cada célula se registra via:
```js
window.PWAO_RegistrarCelula({...})
```

### **Expressão de Células**
Células são exibidas via Narrador:
```js
Narrador.emitir({ tipo: "celula.expressar", nome: "educacao.quiz" })
```

### **OPP & Instalação**
O service worker torna o PWAO instalável e offline.

---

# 📦 5. Instalação (Local e Produção)

## **Local**
Apenas abra o arquivo `index.html` em um servidor local:
```
npx serve
```

## **Produção**
O PWAO funciona perfeitamente no GitHub Pages:
- Basta publicar na branch principal
- O Genoma será carregado automaticamente
- O OPP ativará instalação e cache offline

### **Guia rápido de UX para instalar o OPP**
Para facilitar a instalação pelos usuários finais, siga este fluxo dentro das suas células ou do Genoma:

1. **Detecte disponibilidade do prompt nativo** – observe o evento `beforeinstallprompt` no carregamento e mostre um botão “Instalar app” somente quando ele existir.
2. **Explique o benefício imediato** – no botão ou tooltip, destaque que o OPP funciona offline, abre em tela cheia e guarda progresso localmente.
3. **Use instruções claras por plataforma**:
   - **Android/Chrome**: acione `prompt()` do evento capturado e, em fallback, mostre a ação “Adicionar à tela inicial” (menu ⋮ → Adicionar à tela inicial).
   - **iOS/Safari**: indique o fluxo do menu de compartilhamento → “Adicionar à Tela de Início”.
   - **Desktop (Chromium/Edge)**: peça para clicar no ícone de instalação da barra de endereços ou use `beforeinstallprompt.prompt()` quando disponível.
4. **Valide que o OPP está pronto** – antes de pedir a instalação, confirme que o service worker `/opp/service-worker.js` está ativo e que os assets principais foram armazenados em cache (útil para evitar instalações com offline incompleto).
5. **Mantenha um checklist visual** – apresente um pequeno card com o status: HTTPS/localhost ✅, manifest ✅, service worker ✅, cache inicial ✅. Isso reduz fricção e cria confiança.
6. **Ofereça reentrada** – se o usuário dispensar o prompt, grave a decisão na Memória Orgânica e reexiba o convite apenas após nova sessão ou uma ação explícita (por exemplo, abrir o menu “Instalar”).

Este guia garante uma experiência consistente mesmo em navegadores que não exibem o prompt nativo, mantendo o OPP instalável e bem comunicado.

### Testes automatizados do botão “Instalar app”
- Rode `npm test` para validar a experiência de instalação em um navegador Chromium headless.
- Os testes simulam:
  - **Android/Chromium**: emissão do `beforeinstallprompt` e clique no botão disparando `prompt()` com feedback de instalação iniciada.
  - **iOS/Safari**: ausência de prompt nativo com exibição das instruções manuais (“Compartilhar → Adicionar à Tela de Início”).
- O Playwright inicia um `python3 -m http.server` localmente para garantir que o service worker e o manifest sejam servidos no mesmo host utilizado em produção.

---

# 🛠️ 6. Desenvolvimento

### Criar nova célula
```
celulas/<dominio>/<nome>/
  index.html
  orgao-<função>.js
  datasets/
```

Criar manifesto:
```js
window.PWAO_RegistrarCelula({...})
```

### Importante
- Células devem ser autocontidas
- Órgãos devem rodar como ES Modules
- Caminhos sempre relativos

---

# 🔐 7. Segurança

- Service worker só registra em HTTPS ou localhost
- Nenhuma célula pode acessar outra
- Dados permanentes residem na Memória Orgânica

Mais detalhes em `SECURITY.md`.

---

# 🤝 8. Como Contribuir
Leia primeiro:
- AGENT.md
- ARCHITECTURE.md
- SECURITY.md
- CREDITS.md

Depois siga o fluxo de PR descrito em `ARCHITECTURE.md` e registre as mudanças no `CHANGELOG.md`.

---

# 🧭 9. Roadmap
Consulte o `CHANGELOG.md` e o `ARCHITECTURE.md` para acompanhar próximos passos e a evolução planejada do Genoma.

---

# 📄 10. Licença
A definir pelo mantenedor do projeto.

---

# 🌿 Versão
README v1.0 – Estrutura inicial do repositório PWAO
