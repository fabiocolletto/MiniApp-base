// ==============================================
// CÉLULA EDUCACIONAL: QUIZ – MODELO PWAO OFICIAL
// ==============================================
// A célula segue três princípios fundamentais:
// 1. DECLARAÇÃO DE IDENTIDADE
// 2. CICLO DE VIDA (iniciar / finalizar)
// 3. ISOLAMENTO TOTAL DO ORGANISMO
// ==============================================


window.CELULA = {
id: "educacao.quiz",
nome: "Quiz Educacional",
versao: "1.0.0",


// ================================
// INÍCIO DO CICLO DA CÉLULA
// ================================
iniciar(container, estado) {
this.container = container;
this.estado = estado || {};


container.innerHTML = `
<h1 style="color:#1a237e;">Quiz Educacional</h1>
<p>Escolha um curso para começar:</p>
<select id="quiz-select" style="padding:10px; width:100%; max-width:320px;">
<option value="enem-2021">ENEM 2021</option>
<option value="enem-2022">ENEM 2022</option>
<option value="enem-2023">ENEM 2023</option>
</select>
<br/><br/>
<button id="iniciar-quiz" style="padding:12px 20px; background:#ff6a00; color:white; border:none; border-radius:6px; cursor:pointer;">Iniciar Quiz</button>
<div id="quiz-area" style="margin-top:20px;"></div>
`;


document.getElementById("iniciar-quiz").onclick = () => this.carregarQuiz();
},


// ================================
// CARREGAR DATASET DO QUIZ
// ================================
async carregarQuiz() {
const area = document.getElementById("quiz-area");
const curso = document.getElementById("quiz-select").value;


area.innerHTML = "Carregando questões...";


try {
const url = `./datasets/${curso}/questions.json`;
const resp = await fetch(url);
const questoes = await resp.json();
};
