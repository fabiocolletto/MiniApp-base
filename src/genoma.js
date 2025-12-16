import{DataOrchestrator}from'./tools/data-orchestrator.js';
import{fetchWithFallback}from'./core/fetchWithFallback.js';

(function(){'use strict';

const STAGE=document.getElementById('stage');
const FOOTER=document.getElementById('app-footer');
const HEADER_TITLE=document.getElementById('app-title');
const BTN_BACK=document.getElementById('btn-back');

let CURRENT_SCREEN=null;
const HISTORY=[];

function updateBackVisibility(){if(!BTN_BACK)return;BTN_BACK.style.visibility=HISTORY.length?'visible':'hidden';}

function toggleFooterVisibility(hasContent){if(!FOOTER)return;FOOTER.classList.toggle('visible',!!hasContent);}

function notify(msg,ttl=3000){if(!FOOTER)return;FOOTER.textContent=msg;toggleFooterVisibility(!!msg);if(ttl>0){setTimeout(()=>{if(FOOTER.textContent===msg){FOOTER.textContent='';toggleFooterVisibility(false);}},ttl);}}

function goBack(){const prev=HISTORY.pop();if(!prev){updateBackVisibility();return;}CURRENT_SCREEN=null;navigate(prev,{pushHistory:false});}

function executeScripts(container){if(!container)return;const scripts=container.querySelectorAll('script');scripts.forEach(original=>{const clone=document.createElement('script');Array.from(original.attributes||[]).forEach(attr=>clone.setAttribute(attr.name,attr.value));clone.textContent=original.textContent;original.replaceWith(clone);});}

const Memory=(()=>{const DB='pwao-organism';let db=null;const mem=new Map();
function open(){if(!('indexedDB'in window)){db=null;return Promise.resolve();}
return new Promise(resolve=>{const req=indexedDB.open(DB,1);req.onupgradeneeded=e=>{const d=e.target.result;if(!d.objectStoreNames.contains('cells'))d.createObjectStore('cells',{keyPath:'nome'});};req.onsuccess=()=>{db=req.result;resolve();};req.onerror=()=>{db=null;resolve();};});}
function saveCell(c){if(!c?.nome)return Promise.resolve();mem.set(c.nome,c);if(!db)return Promise.resolve();return new Promise((resolve,reject)=>{const tx=db.transaction('cells','readwrite');const store=tx.objectStore('cells');const req=store.put(c);req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error);});}
function getCell(n){if(!n)return Promise.resolve(null);if(mem.has(n))return Promise.resolve(mem.get(n));if(!db)return Promise.resolve(null);return new Promise(resolve=>{const tx=db.transaction('cells','readonly');const store=tx.objectStore('cells');const req=store.get(n);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>resolve(null);});}
return{open,saveCell,getCell};})();

window.PWAO_RegistrarCelula=async m=>{if(!m?.nome||!m?.caminho)return;await Memory.saveCell({nome:m.nome,caminho:m.caminho});};

async function expressarCelula(nome){const cell=await Memory.getCell(nome);if(!cell){if(STAGE)STAGE.innerHTML='<div class="error">Célula não registrada</div>';return;}try{const html=await fetchWithFallback(cell.caminho,{baseLocal:'./',baseCDN:''});if(STAGE){STAGE.innerHTML=html;executeScripts(STAGE);const cellRoot=STAGE.querySelector('[data-cell]');const title=cellRoot?.dataset?.title||nome;if(HEADER_TITLE)HEADER_TITLE.textContent=title||nome;}updateBackVisibility();}catch(e){if(STAGE)STAGE.innerHTML='<div class="error">Falha ao carregar célula</div>';}}

function navigate(screen,opts={pushHistory:true}){if(opts.pushHistory!==false&&CURRENT_SCREEN&&screen!==CURRENT_SCREEN)HISTORY.push(CURRENT_SCREEN);CURRENT_SCREEN=screen;expressarCelula(screen);}

if(STAGE){STAGE.addEventListener('click',e=>{const btn=e.target.closest('[data-action="render"]');if(!btn)return;const target=btn.dataset.target;if(!target)return;navigate(target);});}

if(BTN_BACK)BTN_BACK.addEventListener('click',goBack);

function buildWelcome(){if(!STAGE)return;const html=`<style>.welcome{display:flex;align-items:center;justify-content:center;min-height:calc(100vh - 112px);}.welcome__card{max-width:520px;margin:0 auto;padding:28px;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 12px 32px rgba(0,0,0,0.06);background:#fff;display:flex;flex-direction:column;gap:14px;font-size:15px;}.welcome__card h1{margin:0;font-size:22px;}.welcome__card p{margin:0;color:#475569;line-height:1.4;}.welcome__cta{display:flex;gap:12px;align-items:center;}.welcome__card button{border:none;background:#0f172a;color:#fff;font-weight:600;padding:12px 16px;border-radius:12px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.12);} .welcome__card button:disabled{opacity:.7;cursor:wait;}</style><section class="welcome"><div class="welcome__card"><h1>Bem-vindo ao 5 Horas</h1><p>Comece com um espaço seguro no seu dispositivo. Nenhum dado pessoal é necessário.</p><div class="welcome__cta"><button id="btn-start-anon">Entrar anônimo</button><span class="welcome__hint">Carregaremos dados padrão e exibiremos a Home.</span></div></div></section>`;STAGE.innerHTML=html;HEADER_TITLE&&(HEADER_TITLE.textContent='Boas-vindas');BTN_BACK&&(BTN_BACK.style.visibility='hidden');const btn=document.getElementById('btn-start-anon');btn?.addEventListener('click',async()=>{btn.disabled=true;btn.textContent='Preparando seu app...';await startOrganism({seedFresh:true});});}

async function registrarCelulasPadrao()
{await window.PWAO_RegistrarCelula({nome:'home',caminho:'./celulas/home/index.html'});
 await window.PWAO_RegistrarCelula({nome:'finance',caminho:'./celulas/financeiro/index.html'});
 await window.PWAO_RegistrarCelula({nome:'education',caminho:'./celulas/educacao/index.html'});
 await window.PWAO_RegistrarCelula({nome:'sistema.perfil',caminho:'./celulas/sistema/perfil_usuario.html'});}

function hasProfileGate(){const profile=DataOrchestrator.getPrimaryProfile();const hasDeviceId=!!DataOrchestrator.store?.device?.deviceId;return DataOrchestrator.isProfileMissingName()||(!profile&&hasDeviceId);}

async function startOrganism({seedFresh=false}={}){await DataOrchestrator.init({seedIfFresh:seedFresh});await Memory.open();await registrarCelulasPadrao();if(hasProfileGate()){navigate('sistema.perfil',{pushHistory:false});notify('Complete seu perfil: informe nome, papel e data de nascimento.',0);return;}navigate('home',{pushHistory:false});notify(seedFresh?'Dados iniciais prontos. Boas vindas!':'Bem-vindo de volta 👋',3000);}

(async function bootstrap(){const hasData=await DataOrchestrator.hasLocalData();if(!hasData){buildWelcome();return;}await startOrganism();})();
})();
