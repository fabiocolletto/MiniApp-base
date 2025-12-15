export async function fetchWithFallback(path,opts={}){
const baseLocal=opts.baseLocal||'';
const baseCDN=opts.baseCDN||'';
const localURL=baseLocal+path;
const cdnURL=baseCDN?baseCDN+path:null;
async function tryFetch(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error('fetch-failed');return r.text();}
try{return await tryFetch(localURL);}catch(e){if(cdnURL){try{return await tryFetch(cdnURL);}catch(_){}}throw e;}
}
