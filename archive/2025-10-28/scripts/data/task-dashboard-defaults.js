export const DEFAULT_TASKS = Object.freeze([
  Object.freeze({
    id: 'task-dashboard-widgets',
    title: 'Consolidar indicadores do painel administrativo',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2025-10-28',
    lastUpdate: '2025-10-25T13:20:00-03:00',
    owner: { name: 'Ana Martins', role: 'Líder de UX' },
    summary: 'Integra os cards de métricas com as novas fontes de assinaturas e implantações.',
    description:
      'Revisar o layout dos cards de indicadores do painel administrativo, conectando dados simulados de assinaturas e '
      + 'implantações para validar espaçamentos, contrastes e acessibilidade. Atualizar a documentação do widget e sinalizar '
      + 'pontos de monitoramento ao time de produto.',
    checklist: [
      { label: 'Revisar layout responsivo dos cards', done: true },
      { label: 'Sincronizar métricas de assinaturas', done: true },
      { label: 'Publicar guia de uso no Figma', done: false },
    ],
    tags: ['Dashboard', 'Indicadores'],
    activity: [
      { label: 'Design refinado aprovado', at: '2025-10-25T09:05:00-03:00' },
      { label: 'Dados de assinaturas conectados', at: '2025-10-25T12:35:00-03:00' },
    ],
    focus: 'Impacta a visibilidade da adoção do painel administrativo.',
    progress: 68,
  }),
  Object.freeze({
    id: 'task-task-dashboard-launch',
    title: 'Lançar painel de tarefas no dashboard principal',
    status: 'review',
    priority: 'high',
    dueDate: '2025-10-26',
    lastUpdate: '2025-10-25T14:10:00-03:00',
    owner: { name: 'Diego Rocha', role: 'Product Manager' },
    summary: 'Publica o novo painel de tarefas com indicadores e fluxo de detalhes no modal global.',
    description:
      'Validar o conteúdo do novo painel de tarefas, conferir os textos dos indicadores e garantir que o modal reaproveite '
      + 'o backdrop global do shell. Após o aceite, registrar o lançamento no Log e comunicar a versão no rodapé.',
    checklist: [
      { label: 'Revisar textos e hierarquia de títulos', done: true },
      { label: 'Homologar abertura do modal no mobile', done: true },
      { label: 'Atualizar Log.md com a release', done: false },
    ],
    tags: ['Dashboard', 'Experiência'],
    activity: [
      { label: 'Conteúdo revisado com UX', at: '2025-10-25T10:25:00-03:00' },
      { label: 'Modal homologado no mobile', at: '2025-10-25T13:40:00-03:00' },
    ],
    focus: 'Entrega chave para comunicar o fluxo de trabalho no MiniApp Base.',
    progress: 92,
  }),
  Object.freeze({
    id: 'task-miniapp-roadmap',
    title: 'Publicar roadmap dos miniapps priorizados',
    status: 'blocked',
    priority: 'medium',
    dueDate: '2025-10-27',
    lastUpdate: '2025-10-25T08:45:00-03:00',
    owner: { name: 'Camila Farias', role: 'Coordenadora de Produto' },
    summary: 'Lista os miniapps priorizados com status e estimativas de entrega para compartilhar com stakeholders.',
    description:
      'Mapear os miniapps planejados para o próximo ciclo, registrar status inicial e dependências conhecidas. '
      + 'Publicar visão resumida no painel do projeto e alinhar expectativas com o time comercial.',
    checklist: [
      { label: 'Consolidar lista de miniapps', done: true },
      { label: 'Receber datas estimadas do time técnico', done: false },
      { label: 'Adicionar dependências críticas', done: false },
    ],
    tags: ['Roadmap', 'Planejamento'],
    activity: [
      { label: 'Lista preliminar enviada para engenharia', at: '2025-10-24T18:15:00-03:00' },
    ],
    focus: 'Depende do alinhamento com engenharia para avançar.',
    progress: 42,
  }),
  Object.freeze({
    id: 'task-session-feedback',
    title: 'Aprimorar feedback visual do estado da sessão',
    status: 'backlog',
    priority: 'low',
    dueDate: '2025-10-30',
    lastUpdate: '2025-10-24T21:10:00-03:00',
    owner: { name: 'Marcos Lima', role: 'Front-end Engineer' },
    summary: 'Melhora o contraste e a descrição da legenda de status da sessão na barra inferior.',
    description:
      'Reavaliar o feedback visual da sessão, ajustando texto auxiliar, contraste e sequência de foco no popover. '
      + 'Validar com ferramentas assistivas e registrar resultados.',
    checklist: [
      { label: 'Atualizar tokens de cor do indicador', done: false },
      { label: 'Rever descrição de acessibilidade', done: false },
      { label: 'Executar testes com NVDA', done: false },
    ],
    tags: ['Sessão', 'Acessibilidade'],
    activity: [],
    focus: 'Dependente da priorização após o lançamento do painel de tarefas.',
    progress: 0,
  }),
  Object.freeze({
    id: 'task-cep-integration',
    title: 'Homologar integração ViaCEP no painel do usuário',
    status: 'done',
    priority: 'medium',
    dueDate: '2025-10-24',
    lastUpdate: '2025-10-24T17:20:00-03:00',
    owner: { name: 'Bruna Azevedo', role: 'Engenheira de Software' },
    summary: 'Valida o fluxo automático de preenchimento de endereço com ViaCEP e documenta o comportamento.',
    description:
      'Executar casos de teste com CEPs válidos e inválidos, registrar mensagens de erro e atualizar a documentação '
      + 'do painel do usuário com os cenários cobertos. Compartilhar evidências com o time de atendimento.',
    checklist: [
      { label: 'Testar CEPs válidos', done: true },
      { label: 'Mapear mensagens para CEP inválido', done: true },
      { label: 'Registrar evidências no Log da ferramenta', done: true },
    ],
    tags: ['Integração', 'Usuário'],
    activity: [
      { label: 'Fluxo validado com QA', at: '2025-10-24T16:05:00-03:00' },
      { label: 'Documentação publicada no repositório', at: '2025-10-24T17:05:00-03:00' },
    ],
    focus: 'Disponível como referência para as próximas integrações de dados.',
    progress: 100,
  }),
]);

