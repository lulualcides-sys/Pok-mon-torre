/* V122 FOUR POISON APPROVED effects in the real battle, not image or CSS mockups.
 * Authentic PMD pixel sprites derived from the user's existing V113 library.
 * Each move has independent art direction, 16 authored frames, native HP timing.
 * Official since 16/10/2026; ?poison122=0 restores the V111 renderer.
 */
(()=>{
'use strict';
const enabled=new URLSearchParams(location.search).get('poison122')!=='0';
if(!enabled||window.PokemonTorrePoisonV122?.installed)return;
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .toLowerCase().replace(/[^a-z0-9]/g,'');
const ids=new Set(['venoshock','toxinapesada','rajadaacida','golpedeveneno']);
const specs=new Map(),sources=new Map();
const stats={casts:0,draws:0,hiddenShots:0,oldFallbacks:0,errors:[],last:null};
const clip=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const ease=t=>{t=clip(t);return t*t*(3-2*t)};
const interp=(a,b,t)=>a+(b-a)*t;
function load(file){
 if(sources.has(file))return sources.get(file);
 const img=new Image();img.decoding='async';
 img.addEventListener?.('error',()=>stats.errors.push('Missing original PMD sprite '+file));
 img.src=file+'?build=v122-original-pmd';
 if(typeof img.decode==='function')img.decode().catch(()=>{});
 sources.set(file,img);return img;
}
function register(spec){
 if(!ids.has(spec?.id)||norm(spec.name)!==spec.id||
    specs.has(spec.id)||spec.frames!==16)throw Error('Invalid V122 move');
 specs.set(spec.id,Object.freeze(spec));
 spec.assets.forEach(load);
}
function ready(spec){
 return spec&&spec.assets.every(s=>{
  const i=sources.get(s);
  return i?.complete&&i.naturalWidth===2048&&i.naturalHeight===128;
 });
}
const previous=window.PokemonTorreV360Paint;
function art(ctx,img,frame,x,y,w,h,alpha=1){
 if(alpha<=0)return;
 ctx.save();
 try{
  ctx.imageSmoothingEnabled=false;
  ctx.globalAlpha*=clip(alpha);
  ctx.drawImage(img,Math.min(15,Math.max(0,frame))*128,0,128,128,
   x-w/2,y-h/2,w,h);
 }finally{ctx.restore();}
}
window.PokemonTorreV360Paint=function(ctx,fx,now,e){
 const id=norm(fx?.move?.name||fx?.name);
 const spec=specs.get(id);
 if(!ready(spec)||!ctx||!fx||!e){
  stats.oldFallbacks++;
  return typeof previous==='function'?previous.apply(this,arguments):false;
 }
 const duration=Math.max(200,Number(fx.duration)||spec.ms);
 const t=(now-fx.at)/duration;
 if(t<0||t>1)return true;
 const hit=clip(Number(fx.times?.[0])||.64,.18,.9);
 const phase=t<hit?(t/hit)*spec.impact:
  spec.impact+((t-hit)/(1-hit))*(1-spec.impact);
 const frame=Math.min(15,Math.floor(clip(phase)*16));
 const source=fx.from||[e.player?.x||0,e.player?.y||0];
 const target=fx.to||[e.enemy?.x||0,e.enemy?.y||0];
 const sx=Number.isFinite(e.player?.x)?e.player.x:source[0],
  sy=(Number.isFinite(e.player?.y)?e.player.y:source[1])-(e.h||420)*.12;
 const tx=Number.isFinite(e.enemy?.x)?e.enemy.x:target[0],
  ty=(Number.isFinite(e.enemy?.y)?e.enemy.y:target[1])-(e.h||420)*.12;
 const world=clip((e.enemy?.r||34)/35,.74,1.20);
 const fade=t>.88?clip((1-t)/.12):1;
 const img0=sources.get(spec.assets[0]),img1=spec.assets[1]?sources.get(spec.assets[1]):null;
 // All draw calls use original 128px pixel-art frame tiles; no Canvas shapes or PNG stickers.
 if(spec.mode==='shock'){
  // Venoshock: concentrated acid shock followed by a second poison reaction.
  const beat=t<hit?ease(t/hit):ease((t-hit)/(1-hit));
  const size=(94+24*beat)*world;
  art(ctx,img0,frame,tx,ty,size,size,fade);
  if(t>.24&&img1)art(ctx,img1,Math.max(0,frame-3),tx+10,ty-7,
   size*.84,size*.84,fade*.72);
 }else if(spec.mode==='toxin'){
  // Heavy toxin: dense sinking poison cloud, plus acidic sparkling nucleus.
  const swell=clip((t+.09)/.48);
  const size=(88+52*ease(swell))*world;
  art(ctx,img0,frame,tx-18*(1-t),ty-4,size,size*.86,fade);
  if(t>.23)art(ctx,img0,Math.max(0,frame-4),tx+28,ty+6,size*.72,size*.67,fade*.8);
  if(t>.48&&img1)art(ctx,img1,Math.min(15,frame+2),tx,ty+8,80*world,80*world,fade*.82);
 }else if(spec.mode==='jet'){
  // Acid Spray: three separate high-speed acid streaks toward the enemy.
  for(let j=0;j<3;j++){
   const q=ease((t-j*.105)/(hit*.90));
   if(q<=0)continue;
   const x=interp(sx,tx,q),y=interp(sy,ty,q)+(j-1)*13*(Math.sin(q*Math.PI*.85));
   art(ctx,img0,Math.max(0,frame-j*3),x,y,
    78*world,64*world,fade*(j===0?1:.72));
  }
 }else if(spec.mode==='contact'){
  // Poison Strike: native dash is physical; visual sprite meets the target at actual HP timestamp.
  const q=ease(t/hit);
  const x=interp(sx,tx,q),y=interp(sy,ty,q)-9*Math.sin(Math.PI*q);
  art(ctx,img0,frame,x,y,105*world,105*world,fade);
  if(t>=hit&&t<hit+.18)
   art(ctx,img0,Math.min(15,frame+2),tx,ty,62*world,62*world,fade*.66);
 }
 stats.draws++;
 stats.last={name:spec.name,frame:frame+1,frames:16,hitAt:hit,mode:spec.mode,
  originalPixels:true,syncNativeDamage:true};
 return true;
};
const oldUse=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(slot){
 const move=battle?.active&&Number.isInteger(slot)?skillSet(current())?.[slot]:null;
 const spec=specs.get(norm(move?.name));
 if(!ready(spec))return oldUse.apply(this,arguments);
 const shots=new Set(this.projectiles||[]);
 const result=oldUse.apply(this,arguments);
 if(result===false||!battle?.active)return result;
 stats.casts++;
 for(const shot of this.projectiles||[]){
  if(!shots.has(shot)&&shot.from==='player'){
   shot.__v122PoisonPreview=spec.id;stats.hiddenShots++;
  }
 }
 return result;
};
const oldShot=BattleEngine.prototype.drawProjectile;
if(typeof oldShot==='function')
 BattleEngine.prototype.drawProjectile=function(shot){
  if(shot?.__v122PoisonPreview&&ready(specs.get(shot.__v122PoisonPreview)))return;
  return oldShot.apply(this,arguments);
 };
window.PokemonTorrePoisonV122=Object.freeze({
 installed:true,official:true,previewOnly:false,register,
 diagnostics:()=>({...stats,registered:[...specs.keys()],
  ready:[...specs.values()].filter(ready).map(s=>s.id),errors:stats.errors.slice(-8)})
});
// Localhost test only; never a player-facing editor or persistent cheat.
if(/^(localhost|127\.0\.0\.1)$/.test(location.hostname||'')){
 const qa=window.PokemonTorreLocalCombatTestV47;
 if(qa){
  qa.castPoisonV122=function(slot=0){
   if(!Number.isInteger(slot)||slot<0||slot>3)return {error:'bad slot'};
   if(this._v122OldSkills){skillSet=this._v122OldSkills;this._v122OldSkills=null;}
   this.start(150,143);
   engine.player.x=engine.enemy.x-engine.h*.21;
   engine.player.y=engine.enemy.y;
   const player=current(),enemy=foe(),original=skillSet;
   const names=['Venoshock','Toxina Pesada','Rajada Ácida','Golpe de Veneno'];
   const skills=names.map((name,i)=>({
    name,type:'poison',kind:['bolt','area','pierce','dash'][i],
    cat:i===3?'physical':'special',power:37+i*7,cost:0,cd:800,level:1
   }));
   this._v122OldSkills=original;skillSet=m=>m===player?skills:original(m);
   engine.enemy.inv=0;engine.enemy.spawn=0;engine.enemyAttackCD=999;engine.foeDodgeCD=999;
   engine.v33Windup=null;
   engine.running=true;battle.paused=false;battle.energy=100;cooldowns=[0,0,0,0];
   const hp=enemy.hp,accepted=engine.useMove(slot)!==false;
   return {name:names[slot],hpBefore:hp,accepted,mode:specs.get(norm(names[slot]))?.mode,
    ready:window.PokemonTorrePoisonV122.diagnostics().ready};
  };
  qa.poisonStateV122=()=>({
   hp:foe()?.hp,active:!!battle?.active,paused:!!battle?.paused,
   fps:engine?.fps,dpr:engine?.dpr,running:!!engine?.running,
   canvasReady:!!engine?.canvas?.isConnected,
   safe:new URLSearchParams(location.search).get('safe')==='1',preview:window.PokemonTorrePoisonV122.diagnostics()
  });
 }
}
})();