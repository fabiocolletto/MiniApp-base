// =============================================================
// 3) docs/microapps/educacao/Educacao.js
// =============================================================
export const educacaoJs = `
let container = null;


export function bootstrap() { return Promise.resolve(); }


export function mount() {
container = document.getElementById('app-root');
container.innerHTML = ` + "`" + `
<div style="padding:20px; font-family:Inter">
<h1>Educação</h1>
<p>Tela do módulo de Educação carregada.</p>
</div>
` + "`" + `;
return Promise.resolve();
}


export function unmount() {
if (container) container.innerHTML = '';
return Promise.resolve();
}
`;
