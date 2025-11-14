# MiniApp Base — Reset 100%

Este repositório entrega o shell PWA básico utilizado para hospedar MiniApps. O estado atual representa um catálogo limpo — o ú
nico cartão disponível é o próprio catálogo — para que novos MiniApps possam ser adicionados sem carregar integrações legadas (F
irebase, autenticação ou planilhas externas).

> **Uso recomendado**: publique a pasta raiz em um host estático (GitHub Pages, Vercel, Netlify, etc.) e incorpore `index.html`
via `<iframe>` no site principal. Evite importar o CSS/JS diretamente em plataformas como WordPress ou Elementor.

### WordPress / Elementor

- O shell agora resolve automaticamente os assets relativos (CSS, JS, manifestos e ícones) a partir do atributo `data-miniapp-base`
  definido na tag `<html>`. O valor padrão `/miniapp-base/` cobre a instalação atual no WordPress (`https://5horas.com.br/miniapp-base/`).
- Se o diretório público for diferente, ajuste o atributo para apontar para a pasta onde `config/`, `js/` e `miniapp-base/` estão publicados.
- Ao incorporar via Elementor, utilize um bloco HTML com o conteúdo de `index.html` *ou*, preferencialmente, um `<iframe>` apontando
  para a URL publicada. Em ambos os casos, mantenha o atributo `data-miniapp-base` sincronizado com o caminho real dos assets.
- O arquivo `config/app-config.js` continua opcional: carregado após o bootstrap automático, ele pode definir chaves extras em
  `window.__APP_CONFIG__` sem sobrescrever o objeto criado pelo shell.

## Componentes principais

- **Shell PWA (`index.html` + `js/app.js`)** – controla a navegação entre o catálogo embutido e o iframe de MiniApps, expõe as
APIs globais `window.loadMiniApp(url, metadata)` e `window.changeView('catalog'|'app')`, gerencia idioma/tema, registra o Servic
e Worker e mantém o histórico local do último MiniApp aberto.
- **Catálogo embutido (`js/catalog-app.js`)** – renderiza o array `STATIC_CATALOG_ITEMS`, aplica busca e filtro por categoria, e
mite o evento `load-miniapp` quando um cartão é selecionado.
- **Design system (`miniapp-base/style/styles.css`)** – CSS escopado na classe `.ma` com tokens, componentes e utilitários compa
rtilhados entre shell e MiniApps.

## Idiomas e tema

- O shell oferece alternância entre português (`pt-BR`) e inglês (`en-US`). O botão de idioma apenas percorre os locais disponív
eis configurados em `js/i18n.js` e a escolha fica salva em `localStorage` (`miniapp-shell.language`).
- O botão de tema alterna entre claro e escuro, respeita o `prefers-color-scheme` na primeira carga e persiste a seleção em `loc
alStorage` (`miniapp-shell.theme`). O catálogo e o iframe recebem notificações via `postMessage` sempre que o tema muda.

## Mantendo o catálogo

1. Adicione novos MiniApps editando o array `STATIC_CATALOG_ITEMS` em `js/catalog-app.js`. Cada item deve declarar `id`, `name`,
`description`, `url`, `icon_url`, `category`, `category_key`, `status` e `status_key`. Traduções opcionais ficam em `translations
[locale]`.
2. O catálogo pode combinar itens locais salvos em `localStorage` (`miniapp-catalog.admin.activeItems`) com os itens estáticos.
Esse recurso permanece disponível para cenários offline, mas não depende de nenhum serviço remoto.
3. Quando um cartão é acionado, o catálogo emite `load-miniapp`; o shell consome o evento e chama `window.loadMiniApp`, atualizan
do o cabeçalho e abrindo o iframe correspondente.

## Estrutura

```
index.html               # Shell PWA
manifest.webmanifest     # Manifesto do app
sw.js                    # Service Worker (cache-first)
js/
  app.js                 # Lógica do shell
  catalog-app.js         # Catálogo embutido
  i18n.js                # Mensagens e metadados de idioma
config/
  app-config.js          # Inicializa window.__APP_CONFIG__ (vazio por padrão)
miniapp-base/
  style/styles.css       # Design system compartilhado
  icons/README.md        # Orientações para os ícones PWA
```

## Fluxo de desenvolvimento

1. Leia `AGENTE.md` antes de iniciar qualquer alteração.
2. Atualize `STATIC_CATALOG_ITEMS` sempre que adicionar ou remover MiniApps.
3. MiniApps devem enviar `window.parent.postMessage({ action: 'miniapp-header', title, subtitle })` para atualizar o cabeçalho q
uando carregarem.
4. Ajustes de estilo devem respeitar o escopo `.ma` e a divisão por camadas (`@layer`).
5. Registre mudanças relevantes em `CHANGELOG.md` ao concluir a tarefa.

## Publicação

1. Hospede a pasta raiz do projeto em um servidor estático.
2. Abra `index.html` no navegador, confirme o carregamento do catálogo e teste a instalação PWA pelo botão **Instalar**.
3. Valide a experiência offline: com a conexão desligada, o catálogo e o shell devem continuar acessíveis graças ao cache do Ser
vice Worker.

## Licença

Uso interno. Consulte os responsáveis antes de compartilhar ou reutilizar.
