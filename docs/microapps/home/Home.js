// =============================================================
// 2) docs/microapps/home/Home.js
// =============================================================
export const homeJs = `
let container = null;


export function bootstrap() {
return Promise.resolve();
}


export function mount() {
container = document.getElementById('app-root');
container.innerHTML = ` + "`" + `
<div style="padding:20px; font-family:Inter">
<h1>MiniApp Home</h1>
<p>Bem vindo ao microapp Home.</p>
</div>
` + "`" + `;
return Promise.resolve();
}


export function unmount() {
if (container) container.innerHTML = '';
return Promise.resolve();
}
`;
