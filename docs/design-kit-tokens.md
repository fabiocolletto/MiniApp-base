# Fonte de verdade do Painel de design

Este documento consolida as variáveis homologadas para o painel de design. Todas as opções apresentadas na interface devem utilizar exclusivamente os tokens listados aqui, garantindo consistência entre modelos, temas e novas evoluções do sistema.

## Raios de borda
- `--radius-sm` — canto suave para cartões compactos e controles menores.
- `--radius-md` — curvatura padrão aplicada em painéis, cartões e botões regulares.
- `--radius-lg` — arredondamento amplo reservado a destaques visuais.
- `--radius-pill` — formato totalmente arredondado para pills, etiquetas e botões icônicos.
- `--radius-circle` — raio circular usado em avatares ou indicadores totalmente redondos.

## Larguras de controle
- `--size-inline-sm` — largura compacta para ícones e ações secundárias.
- `--size-inline-md` — largura padrão utilizada na maioria dos botões do painel.
- `--size-inline-lg` — largura fluida que ocupa todo o espaço disponível.

## Alturas de controle
- `--size-block-sm` — altura compacta com padding reduzido.
- `--size-block-md` — altura padrão equilibrando conforto e economia de espaço.
- `--size-block-lg` — altura quadrada para botões icônicos ou controles de destaque.

## Layout do app shell
- `--layout-header-offset` — deslocamento aplicado no topo do `<main>` para compensar a altura real do cabeçalho fixo.
- `--layout-footer-offset` — deslocamento aplicado na base do `<main>` evitando sobreposição pelo rodapé fixo.
- `--view-max-block-size` — altura máxima dinâmica do conteúdo central calculada a partir da viewport subtraindo os offsets ativos.

As classes `.main--admin` e `.main--user` ativam esses tokens automaticamente, garantindo que os widgets respeitem o espaço livre entre header e footer em qualquer painel. Em cenários de tela cheia ou splash, remova essas classes e zere manualmente os offsets para liberar 100dvh para o conteúdo temporário; ao retornar ao layout padrão, restaure os offsets chamando novamente o cálculo do app shell.

## Pré-visualizações e pitch
- As janelas `panel-preview-widget__frame` exibidas no Painel de design devem expandir em altura conforme o conteúdo renderizado, sem ativar barras de rolagem internas.

## Cores primárias de botão
Cada opção combina valores para o estado base e hover.
- `--kit-color-primary-strong-base` | `--kit-color-primary-strong-hover` — degradê âmbar intenso.
- `--kit-color-primary-soft-base` | `--kit-color-primary-soft-hover` — preenchimento translúcido.
- `--kit-color-primary-highlight-base` | `--kit-color-primary-highlight-hover` — fundo realçado para pills e ícones.
- `--kit-color-primary-ghost-base` | `--kit-color-primary-ghost-hover` — alternativa fantasma com foco em contorno.

## Cores de texto de botão
- `--kit-color-text-contrast-base` | `--kit-color-text-contrast-hover` — contraste máximo para fundos fortes.
- `--kit-color-text-standard-base` | `--kit-color-text-standard-hover` — neutro aquecido para fundos suaves.
- `--kit-color-text-inverse-base` | `--kit-color-text-inverse-hover` — texto claro para aplicações sobre fundos escuros.

## Elevação de botão
Tokens responsáveis pela sombra aplicada ao estado base e ao foco/hover.
- `--kit-elevation-button-flat-base` | `--kit-elevation-button-flat-hover` — sem sombra, ideal para botões fantasma.
- `--kit-elevation-button-soft-base` | `--kit-elevation-button-soft-hover` — realce discreto para pills e ícones.
- `--kit-elevation-button-regular-base` | `--kit-elevation-button-regular-hover` — destaque equilibrado adotado pelos botões secundários.
- `--kit-elevation-button-strong-base` | `--kit-elevation-button-strong-hover` — sombra intensa destinada aos botões principais.

## Superfícies e cartões
- `--panel-padding` — espaçamento padrão aplicado no preenchimento dos cartões.
- `--panel-padding-large` — alternativa com respiro ampliado para painéis de destaque.
- `--panel-radius` — raio base das superfícies.
- `--panel-border` — borda padrão utilizada em cartões.
- `--panel-shadow` — sombra leve aplicada nas superfícies elevadas.
- `--panel-gap` — espaçamento interno entre grupos dentro dos cartões.
- `--panel-stack-gap` — espaçamento vertical entre blocos empilhados.
- `--panel-inner-gap` — espaçamento reduzido para variações compactas.
- `--panel-cluster-gap` — distância entre elementos alinhados horizontalmente.

## Campos de formulário
- `--form-field-gap` — espaço entre rótulos, controles e mensagens de ajuda.
- `--panel-input-padding-block` — padding vertical das entradas.
- `--panel-input-padding-inline` — padding horizontal das entradas.
- `--color-input-bg` — cor de fundo padrão dos campos.
- `--color-input-border` — cor da borda neutra dos campos.
- `--color-input-border-strong` — realce aplicado ao foco.
- `--color-input-placeholder` — cor da dica exibida no placeholder.

## Etiquetas e badges
- `--color-chip-bg` — fundo translúcido utilizado nos chips.
- `--color-chip-border` — borda aplicada em chips e badges.
- `--color-neutral-bg` — fundo neutro para estados de informação.
- `--color-neutral-border` — borda das etiquetas neutras.
- `--color-neutral-text` — texto padrão das etiquetas neutras.
- `--color-success-bg` — fundo para etiquetas e mensagens de sucesso.
- `--color-success-text` — texto para estados positivos.
- `--color-info-bg` — fundo de mensagens informativas.
- `--color-info-text` — texto para estados informativos.
- `--color-error-bg` — fundo para alertas de erro.
- `--color-error-text` — texto dos erros.
- `--color-error-rgb` — composição RGB usada em realces de erro.
- `--radius-pill` — raio utilizado por chips e badges.

## Mensagens de feedback
- `--color-success-bg` | `--color-success-text` — combinações aplicadas a confirmações.
- `--color-error-bg` | `--color-error-text` | `--color-error-rgb` — tokens dedicados a erros.
- `--color-info-bg` | `--color-info-text` — base informativa padrão.
- `--color-neutral-bg` | `--color-neutral-border` | `--color-neutral-text` — estados neutros e avisos genéricos.

> Última atualização: v0.1.226 (24/10/2025 15h45 BRT).
