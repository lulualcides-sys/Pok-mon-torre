/* V123 ONE-PATCH | smooth casts, cautious mobile caches, larger arena and sprites.
 * Never changes hitboxes, HP, player moves, energy, approval sprites or save schema.
 */
(()=>{
'use strict';
if(window.PokemonTorrePerformanceV123?.installed)return;
const stats={casts:0,overBudgetCasts:0,maxCastMs:0,frames:0,slowFrames:0,
 maxFrameMs:0,prunedParticles:0,prunedRings:0,prunedLabels:0,
 imagesWarmed:0,imagesFailed:0,monstersScaled:0,draws:0};
const mobile=/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent||'');
const warmSet=new WeakSet();
function warm(engine){
 if(!mobile||!engine?.assets)return;
 const task=()=>{
  if(!engine.running||!battle?.active)return;
  let loaded=0;
  for(const id of [current()?.id,foe()?.id]){
   const a=engine.assets.get(id);if(!a)continue;
   for(const img of Object.values({...a.sheets,...a.custom,art:a.art,offline:a.offline})){
    if(!img||warmSet.has(img)||!img.complete||!img.naturalWidth||typeof img.decode!=='function')continue;
    warmSet.add(img);img.decode().then(()=>stats.imagesWarmed++).catch(()=>stats.imagesFailed++);
    if(++loaded>=6)return;
   }
  }
 };
 if(typeof requestIdleCallback==='function')requestIdleCallback(task,{timeout:2000});
 else Promise.resolve().then(task);
}
const oldStart=BattleEngine.prototype.start,oldNext=BattleEngine.prototype.newEnemy,
 oldSwitch=BattleEngine.prototype.switchMon;
if(typeof oldStart==='function')BattleEngine.prototype.start=function(){
 const r=oldStart.apply(this,arguments);warm(this);return r;
};
if(typeof oldNext==='function')BattleEngine.prototype.newEnemy=function(){
 const r=oldNext.apply(this,arguments);warm(this);return r;
};
if(typeof oldSwitch==='function')BattleEngine.prototype.switchMon=function(){
 const r=oldSwitch.apply(this,arguments);warm(this);return r;
};
let recentCast=0;
const oldMove=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(){
 const started=performance.now();
 try{return oldMove.apply(this,arguments)}
 finally{
  const cost=performance.now()-started;
  stats.casts++;stats.maxCastMs=Math.max(stats.maxCastMs,Math.round(cost*10)/10);
  if(cost>24)stats.overBudgetCasts++;
  recentCast=performance.now();
 }
};
const oldFrame=BattleEngine.prototype.frame;
BattleEngine.prototype.frame=function(now){
 const s=performance.now();
 // Bounded transient particles during/after large casts. Never prune projectiles,
 // attack VFX timelines, spritesheets, battle damage or status indicators.
 if(mobile&&this.running&&battle?.active){
  const warmDown=now-recentCast<1100;
  const low=this.fps>0&&this.fps<37;
  if(low||warmDown){
   const cap=low?58:85;
   if(Array.isArray(this.particles)&&this.particles.length>cap){
    const before=this.particles.length;
    this.particles.splice(0,before-cap);stats.prunedParticles+=before-cap;
   }
   if(Array.isArray(this.rings)&&this.rings.length>28){
    const before=this.rings.length;this.rings.splice(0,before-28);stats.prunedRings+=before-28;
   }
   if(Array.isArray(this.damageLabels)&&this.damageLabels.length>18){
    const before=this.damageLabels.length;this.damageLabels.splice(0,before-18);stats.prunedLabels+=before-18;
   }
  }
 }
 const result=oldFrame.apply(this,arguments);
 const dt=performance.now()-s;stats.frames++;
 stats.maxFrameMs=Math.max(stats.maxFrameMs,Math.round(dt*10)/10);
 if(dt>26)stats.slowFrames++;
 return result;
};
// V122 1.24x now owns Pokémon drawing proportions. Do not wrap drawMon
// again: avoid nested Canvas function substitutions on every active frame.
const style=document.createElement('style');style.id='v123-battle-size';
style.textContent='#modal.combatModal{overflow-x:hidden!important;overflow-y:auto!important}'+
 '#modal.combatModal .arenaPro{height:clamp(435px,60dvh,740px)!important;max-height:none!important}'+
 '@media(max-width:650px) and (orientation:portrait){#modal.combatModal .arenaPro{height:clamp(405px,62dvh,670px)!important;min-height:405px!important}'+
 '#modal.combatModal .battleHeading{margin-bottom:3px!important}'+
 '#modal.combatModal .arenaPro .hudPro{max-width:43%!important}'+
 '#modal.combatModal .battleFooter{padding-bottom:8px!important}}'+
 '@media(orientation:landscape) and (max-height:650px){#modal.combatModal .arenaPro{height:100%!important;min-height:0!important;max-height:none!important}'+
 '#modal.combatModal #combatContainer{min-height:0!important}'+
 '#modal.combatModal .battleFooter{overflow:auto!important}}'+
 '@media(max-height:600px) and (orientation:portrait){#modal.combatModal .arenaPro{height:400px!important;min-height:400px!important}}';
document.head.appendChild(style);
window.PokemonTorrePerformanceV123=Object.freeze({installed:true,official:true,
 diagnostics:()=>({...stats,mobile,oldV122Preserved:!!window.PokemonTorreBattleV122?.installed,
  extraVisualScale:1,noSecondFrameLoop:true,stable60fpsPromised:false})});
})();