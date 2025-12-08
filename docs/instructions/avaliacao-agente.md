# Avaliação do novo AGENTE.md

Esta nota resume a leitura do AGENTE.md na raiz e aponta a parte mais sensível da base que precisa estar pronta ao implantar ou ajustar o repositório.

## Pontos-chave do AGENTE.md
- Atuação limitada a organização, padronização e manutenção técnica, sem alterar textos ou significados originais.
- Toda ação deve ser solicitada explicitamente e registrada em log/PR.
- Estrutura limpa e padronizada é obrigatória; nada de arquivos obsoletos ou duplicados.
- Internacionalização envolve apenas sincronizar chaves entre idiomas, sem traduzir conteúdos.
- Segurança: não modificar conteúdos autorais nem dados protegidos.

## Parte crítica a manter/implantar
Para um deploy confiável, é essencial garantir que o **núcleo do AppShell** (conforme `README.md`) esteja íntegro e alinhado às regras do AGENTE:
- `src/core/layout/AppShell.jsx` deve carregar e isolar miniapps, coordenando IndexedDB, WebAuthn e Supabase.
- `src/core/orchestrator/ScreenOrchestrator.jsx` precisa centralizar a montagem de telas, evitando lógica duplicada nos miniapps.
- `src/core/db/indexdb.js` é a base do modo offline; falhas aqui quebram a operação sem rede.
- `src/core/api/supabase.js` faz a sincronização com backend; deve seguir os contratos descritos no README.

## Recomendações imediatas
- Revisar se os arquivos do núcleo existem e seguem o padrão descrito no README (caminhos relativos, sem dependências externas).
- Manter o `products/<categoria>/<miniapp>/index.html` como ponto único de entrada por miniapp, sem acoplamento direto ao núcleo.
- Atualizar `change.md` a cada ajuste para cumprir a governança do repositório.

## Passo a passo obrigatório para a próxima análise/implantação
Use esta lista como checklist de trabalho. Em cada nova tarefa, o agente deve ler este passo a passo, definir o que será executado e, ao final, registrar o resultado e atualizar a lista conforme o progresso.

1. **Revisar objetivo final**: garantir um micro front-end que opere apenas com memória local via DeX e cubra toda a gestão de usuários (famílias, hierarquias) e do produto Educação (professores, tutores, instituições, alunos responsáveis).
2. **Mapear estado atual**: conferir AppShell, ScreenOrchestrator, IndexedDB e DeX para confirmar que funcionam offline e que não dependem de serviços externos além do previsto.
3. **Planejar incrementos**: identificar o próximo incremento para aproximar o objetivo (ex.: cadastro familiar/hierárquico, fluxo de players de educação, sincronização local). Definir escopo claro antes de editar código.
4. **Executar e validar**: aplicar as mudanças planejadas respeitando o AGENTE.md; priorizar isolamento de miniapps, consistência de dados locais e rotas de cadastro dos perfis de educação e família.
5. **Registrar e atualizar**: documentar o que foi feito, o que falta e quaisquer bloqueios. Atualizar esta lista se algum passo for concluído ou precisar de detalhamento adicional.
