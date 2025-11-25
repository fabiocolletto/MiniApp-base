# Roteiro de Smoke Test

Roteiro para validação manual rápida do MiniApp Hub, cobrindo tema, painel do usuário e navegação por todas as rotas principais.

## Preparação
- Iniciar servidor estático na raiz do projeto (`python -m http.server 8000`).
- Limpar cache/localStorage/IndexedDB do navegador antes de começar.
- Validar em desktop e mobile (modo responsivo) nos temas claro e escuro.

## Fluxo de tema global
1. Acessar `/` e alternar o tema claro/escuro pelo controle global (header unificado).
2. Confirmar que a preferência de tema persiste após refresh e ao navegar para todas as rotas listadas abaixo.
3. Verificar contraste e legibilidade dos textos, links e botões em ambos os temas.

## Painel do usuário
1. Entrar em `/painel-aluno` e conferir se o header unificado exibe avatar/nome carregados do armazenamento compartilhado.
2. Abrir `/painel-aluno/aulas`, `/painel-aluno/atividades`, `/painel-aluno/notas` e `/painel-aluno/configuracoes` validando:
   - Breadcrumb/estado ativo acompanhando a rota.
   - Cards totalmente clicáveis levando à rota ou detalhe configurado.
   - Botões flutuantes recolhendo ao rolar para baixo e reaparecendo ao rolar para cima, sem cobrir texto.
3. Alternar entre as subpáginas verificando que dados do perfil e preferências de tema permanecem sincronizados via armazenamento local compartilhado.

## Navegação e rotas
1. Na home `/`, abrir um card do catálogo e confirmar redirecionamento para a MiniApp ou rota declarada.
2. Validar as rotas do painel do aluno: `/painel-aluno`, `/painel-aluno/aulas`, `/painel-aluno/atividades`, `/painel-aluno/notas`, `/painel-aluno/configuracoes`.
3. Abrir `/public/legacy/index-legacy.html` para garantir que a home legada continua acessível.
4. Acessar `/public/miniapps/educacao/` e navegar entre suas telas confirmando carregamento de assets/manifest.

## Armazenamento local compartilhado
1. Atualizar dados do perfil (nome/avatar) no painel e confirmar que o header em todas as rotas reflete a atualização.
2. Fechar e reabrir o navegador verificando que o perfil e preferências permanecem carregados via armazenamento local compartilhado.
3. Abrir o app em duas abas e garantir que mudanças de tema/perfil propagam após refresh em ambas.

## Encerramento
- Registrar evidências rápidas (prints ou gravação curta) apenas se algum passo falhar.
- Em caso de falha, abrir issue com rota, tema e dispositivo afetado.
