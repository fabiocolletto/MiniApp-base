export const APP_SHELL_LAYOUT_MODELS = Object.freeze([
  Object.freeze({
    id: 'L01',
    title: 'App shell — painel administrativo',
    description:
      'Estrutura padrão com cabeçalho fixo, área central rolável e rodapé alinhado à borda inferior.',
    composition: [
      {
        slot: 'Header fixo',
        description:
          'Fica visível em toda a navegação e concentra logotipo, atalhos e status de sessão do administrador.',
      },
      {
        slot: 'Painel central',
        description:
          'Recebe os widgets do painel e utiliza `--view-max-block-size` para respeitar o espaço livre entre header e footer.',
      },
      {
        slot: 'Footer',
        description:
          'Mantém versão e créditos encostados à borda, acompanhando a largura do conteúdo.',
      },
    ],
    tokens: ['--layout-header-offset', '--layout-footer-offset', '--view-max-block-size'],
    notes: [
      'Aplica a classe `main--admin` ao elemento `<main>` garantindo a malha e espaçamentos do painel administrativo.',
      'O cálculo de offsets evita sobreposição do conteúdo ao reduzir ou ampliar o cabeçalho fixo.',
    ],
  }),
  Object.freeze({
    id: 'L02',
    title: 'App shell — painel do usuário',
    description:
      'Variação aplicada a contas finais mantendo a mesma hierarquia de cabeçalho, conteúdo e rodapé.',
    composition: [
      {
        slot: 'Header fixo',
        description:
          'Mantém navegação do usuário e acesso rápido ao painel de conta, seguindo o mesmo offset superior.',
      },
      {
        slot: 'Painel central',
        description:
          'Herda `--view-max-block-size` para evitar overflow e respeitar a responsividade em tablets e celulares.',
      },
      {
        slot: 'Footer',
        description:
          'Reaproveita o mesmo deslocamento inferior garantindo alinhamento com o conteúdo visível.',
      },
    ],
    tokens: ['--layout-header-offset', '--layout-footer-offset', '--view-max-block-size'],
    notes: [
      'Utiliza a classe `main--user` no `<main>` para ativar a malha e os ajustes do painel de conta.',
      'Compartilha os offsets globais, garantindo que a transição entre painéis mantenha a altura segura.',
    ],
  }),
]);
