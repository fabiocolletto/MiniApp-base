// =============================================================
// 4) docs/microapps/catalogo/Catalogo.js
// =============================================================
export const catalogoJs = `
let container = null;


export function bootstrap() { return Promise.resolve(); }


export function mount() {
container = document.getElementById('app-root');
container.innerHTML = ` + "`" + `
<div style="padding:20px; font-family:Inter">
<h1>Catálogo</h1>
<p>Lista de produtos e miniapps aparecerá aqui.</p>
</div>
` + "`" + `;
return Promise.resolve();
}


export function unmount() {
if (container) container.innerHTML = '';
return Promise.resolve();
}
`;
