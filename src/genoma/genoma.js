import{DataOrchestrator}from'../tools/data-orchestrator.js';
import{fetchWithFallback}from'../core/fetchWithFallback.js';

(function(){'use strict';

const STAGE=document.getElementById('stage');
const FOOTER=document.getElementById('app-footer');
const HEADER_TITLE=document.getElementById('app-title');
const BTN_BACK=document.getElementById('btn-back');

let CURRENT_SCREEN=null;
const HISTORY=[];

function updateBackVisibility(){if(!BTN_BACK)return;BTN_BACK.style.visibility=HISTORY.length?'visible':'hidden';}

function notify(msg,ttl=3000){if(!FOOTER)return;FOOTER.textContent=msg;if(ttl>0){setTimeout(()=>{if(FOOTER.textContent===msg)FOOTER.textContent='';},ttl);}}

function goBack(){const prev=HISTORY.pop();if(!prev){updateBackVisibility();return;}CURRENT_SCREEN=null;navigate(prev,{pushHistory:false});}

const Memory=(()=>{const DB='pwao-organism';let db=null;const mem=new Map();
function open(){if(!('indexedDB'in window)){db=null;return Promise.resolve();}
return new Promise(resolve=>{const req=indexedDB.open(DB,1);req.onupgradeneeded=e=>{const d=e.target.result;if(!d.objectStoreNames.contains('cells'))d.createObjectStore('cells',{keyPath:'nome'});};req.onsuccess=()=>{db=req.result;resolve();};req.onerror=()=>{db=null;resolve();};});}
function saveCell(c){if(!c?.nome)return Promise.resolve();mem.set(c.nome,c);if(!db)return Promise.resolve();return new Promise((resolve,reject)=>{const tx=db.transaction('cells','readwrite');const store=tx.objectStore('cells');const req=store.put(c);req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error);});}
function getCell(n){if(!n)return Promise.resolve(null);if(mem.has(n))return Promise.resolve(mem.get(n));if(!db)return Promise.resolve(null);return new Promise(resolve=>{const tx=db.transaction('cells','readonly');const store=tx.objectStore('cells');const req=store.get(n);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>resolve(null);});}
return{open,saveCell,getCell};})();

window.PWAO_RegistrarCelula=async m=>{if(!m?.nome||!m?.caminho)return;await Memory.saveCell({nome:m.nome,caminho:m.caminho});};

async function expressarCelula(nome){const cell=await Memory.getCell(nome);if(!cell){if(STAGE)STAGE.innerHTML='<div class="error">Célula não registrada</div>';return;}try{const html=await fetchWithFallback(cell.caminho,{baseLocal:'./',baseCDN:''});if(STAGE)STAGE.innerHTML=html;if(HEADER_TITLE)HEADER_TITLE.textContent=nome;updateBackVisibility();}catch(e){if(STAGE)STAGE.innerHTML='<div class="error">Falha ao carregar célula</div>';}}

function navigate(screen,opts={pushHistory:true}){if(opts.pushHistory!==false&&CURRENT_SCREEN&&screen!==CURRENT_SCREEN)HISTORY.push(CURRENT_SCREEN);CURRENT_SCREEN=screen;expressarCelula(screen);}

if(STAGE){STAGE.addEventListener('click',e=>{const btn=e.target.closest('[data-action="render"]');if(!btn)return;const target=btn.dataset.target;if(!target)return;navigate(target);});}

if(BTN_BACK)BTN_BACK.addEventListener('click',goBack);

(async function bootstrap(){await DataOrchestrator.init();await Memory.open();
await window.PWAO_RegistrarCelula({nome:'finance',caminho:'./celulas/financeiro/index.html'});
await window.PWAO_RegistrarCelula({nome:'education',caminho:'./celulas/educacao/index.html'});
await window.PWAO_RegistrarCelula({nome:'health',caminho:'./celulas/saude/index.html'});
await window.PWAO_RegistrarCelula({nome:'settings',caminho:'./celulas/configuracoes/index.html'});
notify('Bem-vindo ao 5 Horas 👋',3000);
})();
})();
