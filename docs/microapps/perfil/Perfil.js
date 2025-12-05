// =============================================================
// 5) docs/microapps/perfil/Perfil.js
// =============================================================
export const perfilJs = `
import Dexie from 'https://cdn.jsdelivr.net/npm/dexie@latest/dist/dexie.mjs';


let container = null;
let db;


export function bootstrap() {
db = new Dexie('perfilDB');
db.version(1).stores({ usuario: '++id, nome, email' });
return Promise.resolve();
}


export async function mount() {
container = document.getElementById('app-root');


const dados = await db.usuario.toArray();
const nome = dados[0]?.nome || 'Visitante';


container.innerHTML = ` + "`" + `
<div style="padding:20px; font-family:Inter">
<h1>Perfil</h1>
<p>Nome salvo: <strong>${nome}</strong></p>
</div>
` + "`" + `;


return Promise.resolve();
}


export function unmount() {
if (container) container.innerHTML = '';
return Promise.resolve();
}
`;
