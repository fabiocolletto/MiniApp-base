<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MiniApp Conta – 5 Horas</title>

  <link rel="stylesheet" href="https://fabiocolletto.github.io/miniapp/docs/global/shell.css" />
</head>
<body class="shell">
  <header class="shell-header">
    <button onclick="mostrar('dados')">Dados pessoais</button>
    <button onclick="mostrar('preferencias')">Preferências</button>
    <button onclick="mostrar('produtos')">Produtos</button>
    <button onclick="mostrar('seguranca')">Segurança</button>
  </header>

  <div id="app-root"></div>

  <script>
    // BANCO SIMPLES (pode virar Dexie depois)
    const contaStore = {
      nome: localStorage.getItem('conta_nome') || '',
      email: localStorage.getItem('conta_email') || '',
      telefone: localStorage.getItem('conta_telefone') || '',
      tema: localStorage.getItem('conta_tema') || 'claro',
      contato: localStorage.getItem('conta_contato') || 'whatsapp'
    };

    function salvar() {
      localStorage.setItem('conta_nome', contaStore.nome);
      localStorage.setItem('conta_email', contaStore.email);
      localStorage.setItem('conta_telefone', contaStore.telefone);
      localStorage.setItem('conta_tema', contaStore.tema);
      localStorage.setItem('conta_contato', contaStore.contato);
      alert('Dados salvos com sucesso!');
    }

    const telas = {
      dados: `
        <div style="padding:24px; max-width:600px; margin:auto;">
          <h1>Dados pessoais</h1>

          <label>Nome<br>
            <input id="nome" value="${contaStore.nome}" style="width:100%; padding:10px; margin-bottom:10px;">
          </label>

          <label>Email<br>
            <input id="email" value="${contaStore.email}" style="width:100%; padding:10px; margin-bottom:10px;">
          </label>

          <label>Telefone<br>
            <input id="telefone" value="${contaStore.telefone}" style="width:100%; padding:10px; margin-bottom:20px;">
          </label>

          <button onclick="atualizarDados()" style="padding:10px 20px;">Salvar</button>
        </div>
      `,

      preferencias: `
        <div style="padding:24px; max-width:600px; margin:auto;">
          <h1>Preferências</h1>

          <label>Tema<br>
            <select id="tema" style="width:100%; padding:10px; margin-bottom:20px;">
              <option value="claro" ${contaStore.tema === 'claro' ? 'selected' : ''}>Claro</option>
              <option value="escuro" ${contaStore.tema === 'escuro' ? 'selected' : ''}>Escuro</option>
            </select>
          </label>

          <label>Preferência de contato<br>
            <select id="contato" style="width:100%; padding:10px; margin-bottom:20px;">
              <option value="whatsapp" ${contaStore.contato === 'whatsapp' ? 'selected' : ''}>WhatsApp</option>
              <option value="email" ${contaStore.contato === 'email' ? 'selected' : ''}>Email</option>
            </select>
          </label>

          <button onclick="atualizarPreferencias()" style="padding:10px 20px;">Salvar</button>
        </div>
      `,

      produtos: `
        <div style="padding:24px; max-width:600px; margin:auto;">
          <h1>Produtos ativos</h1>

          <ul style="line-height:2; font-size:18px;">
            <li>Assistente Marco — <strong>Ativo</strong></li>
            <li>Bot Pesquisa — <strong>Ativo</strong></li>
            <li>Bot Cerimonial — <strong>Ativo</strong></li>
          </ul>
        </div>
      `,

      seguranca: `
        <div style="padding:24px; max-width:600px; margin:auto;">
          <h1>Segurança</h1>

          <p>Gerencie privacidade e dados da sua conta.</p>
          <button onclick="limparDados()" style="padding:10px 20px; background:red; color:white; border:none;">Limpar dados locais</button>
        </div>
      `
    };

    function mostrar(nome) {
      document.getElementById('app-root').innerHTML = telas[nome];
    }

    function atualizarDados() {
      contaStore.nome = document.getElementById('nome').value;
      contaStore.email = document.getElementById('email').value;
      contaStore.telefone = document.getElementById('telefone').value;
      salvar();
    }

    function atualizarPreferencias() {
      contaStore.tema = document.getElementById('tema').value;
      contaStore.contato = document.getElementById('contato').value;
      salvar();
    }

    function limparDados() {
      localStorage.removeItem('conta_nome');
      localStorage.removeItem('conta_email');
      localStorage.removeItem('conta_telefone');
      localStorage.removeItem('conta_tema');
      localStorage.removeItem('conta_contato');
      alert('Dados apagados! Recarregue a página.');
    }

    mostrar('dados');
  </script>
</body>
</html>
