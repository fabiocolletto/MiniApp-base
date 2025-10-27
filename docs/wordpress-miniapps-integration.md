# Integração da página `/miniapps/` no WordPress (Elementor)

Este guia descreve como padronizar o cabeçalho e o rodapé da página pública dos MiniApps no site WordPress da 5 Horas,
utilizando Elementor. Siga todas as etapas para evitar sobreposições do iframe com os templates globais.

## 1. Ajustes de layout no Elementor
1. Abra a página `/miniapps/` no Elementor.
2. Acesse **Configurações da página** (ícone de engrenagem) e defina **Layout da página** como **Elementor Full Width**.
   - Se estiver configurado como *Canvas*, troque para *Full Width* para que o header e o footer globais sejam exibidos.
3. Localize a seção que contém o widget HTML e configure:
   - **Largura do conteúdo**: *Largura total*.
   - **Esticar seção**: *Ativado*.
   - **Padding** esquerda/direita: `0`.
4. No **Theme Builder** do Elementor, confirme que os templates de header e footer estão atribuídos ao site inteiro ou que,
   no mínimo, incluem a página `/miniapps/` sem exclusões.

## 2. Substituição do widget HTML
1. Substitua o conteúdo do widget HTML atual pelo snippet abaixo. Ele ajusta automaticamente a altura do iframe com base nas
   dimensões do header e do footer carregados pelo tema/Elementor, evitando barras de rolagem indesejadas.

```html
<style>
  /* Evita scroll horizontal em telas menores */
  html, body { overflow-x: hidden; }

  /* Container do app dentro da área de conteúdo (sem “escapar” para as bordas) */
  .miniapps-frame {
    width: 100%;
    margin: 0;
    padding: 0;
  }

  .miniapps-frame iframe {
    display: block;
    width: 100%;
    height: calc(100vh - var(--header-h, 0px) - var(--footer-h, 0px));
    border: 0;
    background: transparent;
  }

  /* Compensa barra admin do WP, se houver */
  body.admin-bar .miniapps-frame iframe {
    height: calc(100vh - var(--header-h, 0px) - var(--footer-h, 0px) - 32px);
  }
</style>

<div id="miniapps-host" class="miniapps-frame">
  <iframe
    src="https://fabiocolletto.github.io/MiniApp-base/"
    title="MiniApps — 5 Horas"
    loading="eager"
    referrerpolicy="no-referrer"
    allow="clipboard-read; clipboard-write; fullscreen">
  </iframe>
</div>

<script>
(function () {
  const host = document.getElementById('miniapps-host');
  const iframe = host?.querySelector('iframe');

  function headerEl() {
    // Tenta localizar header do tema/Elementor
    return document.querySelector(
      'header.site-header, .elementor-location-header, header#masthead'
    );
  }

  function footerEl() {
    return document.querySelector(
      'footer.site-footer, .elementor-location-footer, footer#colophon'
    );
  }

  function px(n){ return (n || 0) + 'px'; }

  function fit() {
    const h = headerEl();
    const f = footerEl();
    const hh = h ? h.getBoundingClientRect().height : 0;
    const fh = f ? f.getBoundingClientRect().height : 0;

    // Expõe como CSS vars para o cálculo do height
    document.documentElement.style.setProperty('--header-h', px(hh));
    document.documentElement.style.setProperty('--footer-h', px(fh));

    // Fallback em navegadores antigos
    const admin = document.getElementById('wpadminbar');
    const adminH = admin ? admin.offsetHeight : 0;
    const calc = window.innerHeight - hh - fh - adminH;
    if (iframe) iframe.style.height = Math.max(calc, 320) + 'px';
  }

  // Reajusta em resize/scroll (headers “sticky” mudam altura ao rolar)
  window.addEventListener('resize', fit, { passive: true });
  window.addEventListener('scroll', fit, { passive: true });
  // Observa mudanças em header/footer (menus colapsáveis, etc.)
  const ro = new ResizeObserver(fit);
  headerEl() && ro.observe(headerEl());
  footerEl() && ro.observe(footerEl());

  fit();
})();
</script>
```

## 3. CSS de contingência
Se, mesmo com o layout *Full Width*, o tema aplicar `max-width` na área de conteúdo desta página, adicione o CSS abaixo no
campo **CSS personalizado** da seção ou em **Aparência → Personalizar → CSS adicional**. Ajuste `XXXX` para o ID real da
página (visível na tag `<body>` pelo Inspector).

```css
/* Use o ID da página, ex.: .page-id-1907 */
.page-id-XXXX .elementor-section.elementor-section-boxed > .elementor-container {
  max-width: 100% !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}
```

## 4. Critérios de aceite
- A página `/miniapps/` deve exibir o mesmo header e footer dos demais templates globais.
- O MiniApp precisa ocupar todo o espaço entre o header e o footer, sem barras de rolagem horizontais.
- Em desktop e mobile, o iframe deve reajustar a altura quando o header for *sticky* (expandir/encolher) ou quando a barra
  administrativa do WordPress estiver visível.
