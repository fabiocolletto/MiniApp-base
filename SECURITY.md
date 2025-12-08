# SECURITY.md – Política Oficial de Segurança do PWAO

Este documento define os requisitos, restrições e boas práticas para garantir a segurança do **PWAO (Progressive Web App Orgânico)**. O PWAO é um organismo digital distribuído, capaz de crescer através de células isoladas, e por isso exige um modelo de segurança igualmente orgânico, modular e descentralizado.

---

# 🔐 1. Princípios Gerais de Segurança

O PWAO adota quatro pilares fundamentais:

### **1. Isolamento Estrutural**
Células, órgãos e datasets são completamente isolados entre si.

### **2. Mínimo Privilégio**
Nenhuma célula ou órgão pode acessar mais do que sua própria área.

### **3. Confiança Zero (Zero Trust)**
O Genoma não confia em nenhuma célula até ela registrar seu manifesto.

### **4. Estado Segregado**
A Memória Orgânica mantém apenas dados essenciais e isolados.

---

# 🧬 2. Proteção do Genoma

O Genoma (`index.html`) é o ponto mais sensível do organismo.

Regras obrigatórias:
- Jamais mover ou renomear o Genoma.
- Nunca injetar lógica de células dentro do Genoma.
- Não permitir que células alterem o DOM raiz (`#root`) além de sua própria renderização.
- Nenhum órgão pode referenciar funções internas do Genoma.

O Genoma deve permanecer imutável e neutro.

---

# 🧱 3. Segurança das Células

Cada célula é um ambiente isolado.

### Regras:
- Células só podem acessar seus próprios datasets.
- Células não podem referenciar outras células.
- Células não devem incluir scripts externos não confiáveis.
- Caminhos absolutos são proibidos.
- Toda célula deve registrar seu manifesto para ser reconhecida.

### Riscos evitados:
- Cross-cell contamination
- Interferência entre módulos
- Acesso indevido a datasets

---

# ⚙️ 4. Segurança dos Órgãos

Órgãos são motores JavaScript sensíveis.

Regras obrigatórias:

- Sempre usar ES Modules.
- Jamais acessar variáveis globais.
- Nunca manipular o Genoma.
- Não fazer fetch de URLs externas sem validação.
- Tratar erros com mensagens seguras.
- Nunca executar HTML remoto sem sanitização.

Órgãos são confinados ao ambiente da célula que os carrega.

---

# 🔒 5. Memória Orgânica (IndexedDB)

A Memória Orgânica guarda apenas:
- manifestos de células
- configurações básicas
- histórico mínimo

Regras:
- Nunca armazenar dados pessoais sensíveis.
- Nunca armazenar tokens de API.
- Não persistir dados que possam identificar o usuário sem consentimento.

Recomendações:
- Criptografia local quando necessário (células são responsáveis por isso).

---

# 🌐 6. OPP (Organic Progressive Package)

A pasta `/opp` contém arquivos críticos para segurança:
- manifest.webmanifest
- service-worker.js

Regras:
- O service worker deve registrar apenas em HTTPS ou localhost.
- Nunca permitir que o service worker intercepte chamadas externas de forma irrestrita.
- O cache deve aceitar apenas respostas `status === 200`.
- Mensagens enviadas pelo service worker não devem expor caminhos internos.

Proibido:
- modificar headers de requests
- interceptar POSTs sensíveis

---

# 🌍 7. Segurança de Rede

### Allowed:
- Carregar arquivos da mesma origem (`self.origin`).
- Carregar datasets da célula.

### Blocked:
- Células acessarem URLs externas sem autorização.
- Células enviarem dados sem consentimento.
- Órgãos manipularem requests de terceiros.

O PWAO adota o princípio de **domínio mínimo**.

---

# 🔄 8. Autodiscovery e Manifestos

O autodiscovery depende da integridade dos manifestos.

Regras:
- Validar que `nome` e `caminho` estejam presentes.
- Rejeitar manifestos duplicados.
- Nunca permitir caminhos que saiam da pasta da célula.

Falhas devem ser registradas em logs internos.

---

# 🛡️ 9. Sandbox Orgânico para Células Externas (Futuro)

O PWAO terá suporte para células remotas.

Regras planejadas:
- Carregar células em iframe com sandbox.
- Restrição de scripts externos.
- Comunicação apenas via canal controlado (postMessage).
- Nenhum acesso ao DOM raiz.

Isso protege o organismo contra células maliciosas.

---

# 🪪 10. Autenticação e Perfis

Algumas células (como `sistema.auth`) podem lidar com:
- cadastro
- perfis
- permissões

Regras:
- Tratamento de credenciais deve ser 100% dentro da célula.
- O Genoma nunca manipula perfis.
- Tokens ou senhas nunca são persistidos fora da célula.

---

# 🚫 11. Comportamentos Proibidos

- Células acessarem outras células diretamente.
- Células declararem variáveis globais.
- Células alterarem o Genoma.
- Órgãos realizarem fetch de URLs externas sem necessidade.
- Inserir scripts de terceiros sem aprovação.
- Service worker interceptar conteúdo sensível.
- Usar `localStorage` para dados importantes.

---

# 📝 12. Reportar Vulnerabilidades

Caso seja encontrada vulnerabilidade:
1. Não abrir issue pública.
2. Enviar descrição técnica ao mantenedor.
3. Aguardar resposta.

O organismo deve ser protegido da exposição indevida.

---

# 🧬 Versão
SECURITY v1.0 – Primeira definição formal de segurança do PWAO
