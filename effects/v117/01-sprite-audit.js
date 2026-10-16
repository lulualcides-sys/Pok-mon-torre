/* V117 | 01 — sprite audit for all 151 Kanto Pokemon; runtime evidence only.
 * Base action PNGs are loaded by the existing BattleEngine. We observe
 * decoded assets and AnimData metadata, never claim remote frames exist.
 */
(()=>{
'use strict';
const mode117=new URLSearchParams(location.search).get('kanto117');
if(mode117==='off'||(mode117!==null&&mode117!=='1'))return;
const rows=new Map(),errors=[];
const tracked=["Idle","Walk","Attack","Hurt","Faint"];
const auditEntry=(id,e)=>{
 if(!Number.isInteger(+id)||+id<1||+id>151||!e)return;
 const state=rows.get(+id)||{id:+id,actions:{},directions:{},shiny:false,source:"PMD plus local fallbacks",checked:false};
 const check=(name,img)=>{
  if(!img)return;
  const run=()=>{
   const ready=img.complete&&img.naturalWidth>0&&img.naturalHeight>0;
   const md=e.meta?.[name];
   state.actions[name]=ready?"decoded":"missing_or_pending";
   state.directions[name]=(ready&&md?.height>0)?Math.floor(img.naturalHeight/md.height):0;
   state.checked=true;
  };
  run();
  if(!img.complete){img.addEventListener?.("load",run,{once:true});img.addEventListener?.("error",run,{once:true});}
 };
 for(const action of tracked)check(action,e.sheets?.[action]||e.custom?.[action]);
 if(e.art)check("OfficialArtwork",e.art);
 if(e.offline)check("OfflineFallback",e.offline);
 rows.set(+id,state);
};
const prev=BattleEngine.prototype.loadArt;
BattleEngine.prototype.loadArt=function(id){
 const r=prev.apply(this,arguments);
 const e=this.assets?.get(id);
 auditEntry(id,e);
 // The previously unused PMD Faint sprite is lazy: load it only for battles
 // which actually encounter the species; no 151-image network burst.
 if(e&&!e.sheets?.Faint&&typeof Image==='function'&&typeof SPRITE_SRC==='string'){
  const sprite=new Image();sprite.crossOrigin='anonymous';sprite.decoding='async';
  sprite.src=SPRITE_SRC+String(id).padStart(4,'0')+'/Faint-Anim.png';
  e.sheets.Faint=sprite;auditEntry(id,e);
 }
 return r;
};
const observe=()=>{
 if(typeof engine!=='undefined'&&engine?.assets)
  for(const [id,e] of engine.assets.entries())auditEntry(id,e);
};
observe();
window.PokemonTorreSpriteAuditV117=Object.freeze({
 installed:true,previewOnly:false,approved:true,version:'117.0',
 refresh:observe,
 getSpecies:id=>{observe();const record=rows.get(Number(id));return record?JSON.parse(JSON.stringify(record)):null},
 diagnostics:()=>{observe();const data=[...rows.values()];
  return {registeredSpecies:typeof D==='object'?Object.keys(D).filter(x=>+x>=1&&+x<=151).length:0,
   observedSpecies:rows.size,decodedSpecies:data.filter(x=>Object.values(x.actions).includes('decoded')).length,
   actionsDecoded:data.reduce((a,s)=>a+Object.values(s.actions).filter(x=>x==='decoded').length,0),
   missingOrPending:data.reduce((a,s)=>a+Object.values(s.actions).filter(x=>x!=='decoded').length,0),
   rowsWithEightDirections:data.filter(s=>Object.values(s.directions).some(n=>n>=8)).length,
   errors:errors.slice(-6),examples:data.slice(-6)};}
});
})();