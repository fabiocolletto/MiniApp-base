# MiniApp Educação

Aplicativo PWA oficial da 5 Horas dedicado ao MiniApp Educação. O shell apresenta um painel inicial enxuto com mensagem de boas-vindas, controles rápidos para tema, idioma e escala tipográfica e mantém o rodapé com a versão instalada do produto. Não há catálogo de MiniApps: todo o conteúdo será disponibilizado dentro do próprio painel Educação conforme novos módulos forem publicados.

## Estrutura do repositório

- `index.html` – shell principal com o painel de acesso, seletor entre cadastro e painel Educação e menu rápido no rodapé.
- `scripts/` – módulos JavaScript responsáveis pelo bootstrap (`app/base-boot.js`), shell (`app/auth-shell.js`), preferências (`preferences/`) e integração com o service worker/PWA (`pwa/`).
- `styles/` – folhas de estilo da experiência (`main.css`, `auth.css`) construídas sobre os tokens do tema global.
- `public/` – assets estáticos servidos diretamente (tema CSS, tokens, metadados da versão, ícones instaláveis e página offline).
- `service-worker.js` – script responsável pelo cache dos assets essenciais, fallback offline e estratégia network-first (atualmente sem rotas extras além da navegação padrão).
- `shared/` – camada IndexedDB utilizada para preferências, métricas e persistência compartilhada entre módulos do MiniApp.
- `tests/` – suíte automatizada em Node Test Runner que cobre a inicialização do shell e os controles de personalização.
- `reports/` e `docs/` – material histórico da limpeza PWA original e guias de manutenção do tema/instalação.

## Painel Educação

O painel principal (`renderGuestAccessPanel` no `auth-shell`) apresenta apenas a mensagem **“Bem-vindo ao MiniApp da 5 horas, Educação.”** seguida de uma orientação para personalizar tema, idioma e tamanho do texto. Widgets e listagens de MiniApps foram removidos; o espaço central permanece reservado para futuros módulos do produto.

O rodapé mantém três ações rápidas:

1. **Tema** – alterna entre Automático, Claro e Escuro.
2. **Tamanho do texto** – percorre os cinco níveis de escala tipográfica.
3. **Idioma** – alterna entre Português (Brasil), Inglês e Espanhol.

Os rótulos são atualizados dinamicamente conforme o estado salvo em IndexedDB (`marco_core`).

## Persistência e PWA

- A camada IndexedDB é preparada em `scripts/app/base-boot.js`, que solicita armazenamento persistente, registra o service worker e emite eventos `storage:*` pelo `event-bus`.
- `service-worker.js` usa o prefixo `miniapp-educacao::pwa::`, faz cache dos assets essenciais (`index.html`, temas, manifestos, versão) e não possui mais rotas específicas em estratégia network-first.
- Versões expostas no rodapé são lidas de `public/meta/app-version.json`. O utilitário `scripts/data/system-release-source.js` registra a tag atual e o horário de publicação.

## Executando localmente

1. Instale as dependências com `npm install` (não há pacotes externos além das devDependencies padrão).
2. Suba um servidor estático apontando para a raiz do projeto (`npx serve .` ou `python -m http.server 4173`).
3. Acesse `http://localhost:<porta>/index.html` para validar o shell. A mensagem inicial deve exibir “Bem-vindo ao MiniApp da 5 horas, Educação.” e o rodapé precisa mostrar os três atalhos de personalização.
4. Execute `npm test` para rodar a suíte automatizada.

### Validação visual obrigatória

Após qualquer alteração que vá para commit, execute a interface e capture **dois screenshots** (modo retrato e modo paisagem) simulando o tablet **Samsung Galaxy Tab S9**. Anexe as imagens ao relatório/PR e cite os caminhos no resumo final.

## Testes automatizados

A suíte utiliza `node --test` com o ambiente DOM em `tests/helpers/dom-env.js`. Os cenários cobrem:

- Renderização do painel Educação e ausência de listas/atalhos de MiniApps.
- Funcionamento do menu rápido do rodapé e atualização dos rótulos de acessibilidade.
- Alternância de tema, idioma e escala tipográfica sem recarregar a página.
- Fechamento do menu principal ao clicar novamente no botão.

Execute `npm test` para verificar a cobertura antes de enviar alterações.

## Histórico e documentação

O histórico da limpeza PWA original permanece em `archive/2025-10-28/`. Guias complementares continuam disponíveis em `docs/` (tema, tokens, validações PWA e integração com WordPress). Ajustes específicos do MiniApp Educação devem ser documentados no `CHANGELOG.md` e, quando aplicável, em novos arquivos dentro de `docs/`.

