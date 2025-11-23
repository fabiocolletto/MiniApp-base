# MiniApp React

Este repositório agora contém apenas o app React salvo anteriormente em `index.html`. O projeto foi movido para uma estrutura padrão com Vite para facilitar o desenvolvimento e a visualização local.

## Scripts
- `npm install` – instala as dependências do React e as ferramentas de build.
- `npm run dev` – executa o servidor de desenvolvimento na porta padrão do Vite.
- `npm run build` – gera os arquivos estáticos de produção em `dist/`.
- `npm run preview` – serve o build gerado para validação.

## Executando
1. Instale as dependências com `npm install`.
2. Rode `npm run dev -- --host --port 4173` para expor o app no container.
3. Abra o navegador apontando para `http://localhost:4173` para testar.

O app depende do Tailwind via CDN para aplicar as classes utilitárias usadas no JSX e mantém toda a lógica original de áudio e navegação entre telas, sem configuração de sincronização ou Firebase.
