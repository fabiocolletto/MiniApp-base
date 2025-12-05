<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>ENEM Dump Tool – Importador de Cursos</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      max-width: 900px;
      margin: 20px auto;
      padding: 0 16px;
    }
    #progressContainer {
      width: 100%;
      background: #ddd;
      height: 20px;
      border-radius: 5px;
      margin: 10px 0;
      overflow: hidden;
    }
    #progressBar {
      height: 100%;
      width: 0%;
      background: #4caf50;
      border-radius: 5px;
      transition: width 0.3s ease;
    }
    textarea {
      width: 100%;
      height: 300px;
      font-family: monospace;
      font-size: 12px;
    }
    button {
      padding: 6px 12px;
      margin-top: 4px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <h1>ENEM Dump Tool – Importador de Cursos</h1>
  <p>
    Este painel baixa as questões de um ano do ENEM, monta o JSON de forma
    incremental (1 questão por segundo) e deixa pronto para você copiar e colar
    no repositório.
  </p>

  <label for="yearSelect">Ano da prova:</label>
  <select id="yearSelect">
    <option value="2023">2023</option>
    <option value="2022">2022</option>
    <option value="2021">2021</option>
    <option value="2020">2020</option>
    <option value="2019">2019</option>
    <option value="2018">2018</option>
    <option value="2017">2017</option>
    <option value="2016">2016</option>
    <option value="2015">2015</option>
    <option value="2014">2014</option>
    <option value="2013">2013</option>
    <option value="2012">2012</option>
    <option value="2011">2011</option>
    <option value="2010">2010</option>
    <option value="2009">2009</option>
  </select>
  <button id="btnGenerate" onclick="generateExam()">Gerar Prova</button>

  <pre id="status"></pre>

  <!-- Barra de progresso -->
  <div id="progressContainer">
    <div id="progressBar"></div>
  </div>

  <!-- Caixa com JSON e botão de copiar -->
  <h3>JSON Gerado</h3>
  <textarea id="jsonOutput"></textarea>
  <br />
  <button onclick="copyJSON()">Copiar JSON</button>

  <script>
let currentInterval = null;
let collected = [];
let consecutiveErrors = 0;
const PAGE_LIMIT = 50; // coleta robusta

async function generateExam() {
  const year = document.getElementById("yearSelect").value;
  const status = document.getElementById("status");
  const output = document.getElementById("jsonOutput");
  const progress = document.getElementById("progressBar");
  const btn = document.getElementById("btnGenerate");

  if (currentInterval) clearInterval(currentInterval);

  collected = [];
  output.value = "";
  progress.style.width = "0%";
  btn.disabled = true;

  status.textContent = `Buscando páginas de questões do ENEM ${year}...`;

  let offset = 0;
  let total = null;
  let hasMore = true;

  try {
    while (hasMore) {
      const url = `https://api.enem.dev/v1/exams/${year}/questions?limit=${PAGE_LIMIT}&offset=${offset}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
      const data = await res.json();

      const questions = data.questions || [];
      total = data.metadata.total;
      hasMore = data.metadata.hasMore;

      collected.push(...questions);
      offset += PAGE_LIMIT;

      const pct = Math.round((collected.length / total) * 100);
      progress.style.width = pct + "%";
      status.textContent = `Coletando ${collected.length} de ${total} questões...`;
    }
  } catch (e) {
    status.textContent = "Erro na coleta paginada: " + e.message;
    btn.disabled = false;
    return;
  }

  status.textContent = `Estruturando questões (1 por segundo)...`;

  let index = 0;
  const finalList = [];
  output.value = "";

  currentInterval = setInterval(() => {
    if (index >= collected.length) {
      clearInterval(currentInterval);
      status.textContent = `Concluído! Total de ${finalList.length} questões.`;
      btn.disabled = false;
      return;
    }

    const q = collected[index];
    if (!q) {
      finalList.push({ index: index + 1, error: true, message: "Questão inválida.", raw: q });
    } else {
      finalList.push(q);
    }

    const pct = Math.round(((index + 1) / collected.length) * 100);
    progress.style.width = pct + "%";

    output.value = JSON.stringify({ year, questions: finalList }, null, 2);
    status.textContent = `Processando questão ${index + 1} de ${collected.length}...`;

    index++;
  }, 1000);
}

function copyJSON() {
  const textarea = document.getElementById("jsonOutput");
  textarea.select();
  document.execCommand("copy");
  alert("JSON copiado!");
}
</script>
</body>
</html>
