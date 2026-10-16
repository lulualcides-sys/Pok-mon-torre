/* V111 — four true Poison move sprites from the user's GBA gallery.
 * Independent 12/12/16/12 frame WEBP atlases painted by native drawImage.
 * Avoids Pixi/WebGL startup on mobile, Canvas paths, gradients or CSS FX.
 * V359 retains ALL native damage, energy, cooldown and save logic.
 */
window.PokemonTorrePoisonV111=(()=>{
 'use strict';
 const specs={
  picadatoxica:{frames:12,impact:.53,name:'Picada Tóxica'},
  picadavenenosa:{frames:12,impact:.78,name:'Picada Venenosa'},
  venoshock:{frames:16,impact:.48,name:'Venoshock'},
  ferraovenenoso:{frames:12,impact:.70,name:'Ferrão Venenoso'}
 };
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/[^a-z0-9]/g,'');
 const assets=new Map(),draws={},last={};let impacts=0,coveredShots=0,loads=0,errors=[];
 for(const [id] of Object.entries(specs)){
  const image=new Image();image.decoding='async';
  image.addEventListener?.('load',()=>loads++);
  image.addEventListener?.('error',()=>errors.push('WEBP '+id+' not found'));
  image.src='effects/moves/v111-poison/sheets/'+id+'.webp?build=v111-poison-pixel';
  assets.set(id,image);
 }
 const known=name=>Object.prototype.hasOwnProperty.call(specs,normalize(name))?
  normalize(name):null;
 const ready=id=>{
  const image=assets.get(id),spec=specs[id];
  return !!(image?.complete&&image.naturalWidth===spec.frames*96&&image.naturalHeight===96);
 };
 // Appends to existing V359 painter, which owns hit timing. Never changes
 // hitTarget or spawns a competing visual projectile.
 const previousPaint=window.PokemonTorreV360Paint;
 window.PokemonTorreV360Paint=function(g,fx,now,e){
  const id=known(fx?.move?.name||fx?.name);
  if(!id||!ready(id)||!g||!fx||!e)
   return typeof previousPaint==='function'?previousPaint.apply(this,arguments):false;
  const spec=specs[id],duration=Math.max(1,fx.duration||820),
   t=Math.max(0,Math.min(1,(now-fx.at)/duration)),
   hit=Math.max(.05,Math.min(.95,fx.times?.[0]??.64));
  if(now<fx.at||now>fx.at+duration)return true;
  // Remap frame-clock so its peak happens exactly at the native HP impact.
  const phase=t<=hit ? t/hit*spec.impact:
   spec.impact+(t-hit)/(1-hit)*(1-spec.impact);
  const index=Math.min(spec.frames-1,Math.floor(phase*spec.frames));
  const target=e.enemy||{},actor=e.player||{};
  const cx=Number.isFinite(target.x)?target.x:fx.to[0],
   cy=(Number.isFinite(target.y)?target.y:fx.to[1])-(e.h||420)*.13;
  const scale=Math.max(.66,Math.min(1.30,(target.r||33)/38));
  const w=80*scale,h=80*scale;
  const image=assets.get(id);
  const targetPoint=[cx,cy],from=[actor.x??fx.from[0],(actor.y??fx.from[1])-(e.h||420)*.12];
  let px=cx,py=cy;
  if(id==='picadavenenosa'||id==='ferraovenenoso'){
   const advance=Math.min(1,t/hit),q=advance*advance*(3-2*advance);
   px=from[0]+(targetPoint[0]-from[0])*q;
   py=from[1]+(targetPoint[1]-from[1])*q;
  }
  g.save();
  try{
   g.imageSmoothingEnabled=false;
   g.drawImage(image,index*96,0,96,96,px-w*.5,py-h*.5,w,h);
  }finally{g.restore();}
  draws[id]=(draws[id]||0)+1;
  if(t>=hit&&t<hit+.09)impacts++;
  last.id=id;last.frame=index+1;last.frames=spec.frames;last.nativeHit=hit;
  last.x=px;last.y=py;last.renderer='GBA sprites 2D';
  return true;
 };
 // Engine can draw a second generic orb for a bolt in older adapters. Tag
 // ONLY the newly created poison shots of these four exact moves.
 const oldUse=BattleEngine.prototype.useMove;
 BattleEngine.prototype.useMove=function(i){
  const move=battle?.active&&Number.isInteger(i)?skillSet(current())?.[i]:null,
   key=known(move?.name);
  if(!key||!ready(key))return oldUse.apply(this,arguments);
  const before=new Set(this.projectiles||[]);
  const result=oldUse.apply(this,arguments);
  if(!battle?.active||result===false)return result;
  for(const shot of (this.projectiles||[]))
   if(!before.has(shot)&&shot.from==='player'){
    shot.__v111PoisonVisual=key;coveredShots++;
   }
  return result;
 };
 const oldProjectile=BattleEngine.prototype.drawProjectile;
 if(typeof oldProjectile==='function')
  BattleEngine.prototype.drawProjectile=function(shot){
   if(shot?.__v111PoisonVisual&&ready(shot.__v111PoisonVisual))return;
   return oldProjectile.apply(this,arguments);
  };
 return {known,diagnostics:()=>({
  version:'111.0',loaded:loads,ready:Object.keys(specs).filter(ready),
  draws:{...draws},last:{...last},impacts,coveredShots,
  source:'original Pokemon GBA gallery (Pillow WebP)',errors:errors.slice(-8)
 })};
})();


// Local Chromium integration check. NOT an in-game editor; visible in localhost only.
(()=>{
 if(!/^(localhost|127\.0\.0\.1)$/.test(location.hostname))return;
 const qa=window.PokemonTorreLocalCombatTestV47;
 if(!qa)return;
 const poisonNames=['Picada Tóxica','Picada Venenosa','Venoshock','Ferrão Venenoso'];
 qa.castPoisonV111=function(slot=0){
  if(!Number.isInteger(slot)||slot<0||slot>3)return {error:'bad Poison slot'};
  if(this._v111OldSkills){skillSet=this._v111OldSkills;this._v111OldSkills=null;}
  this.start(150,143);
  const owner=current(),target=foe(),oldSkills=skillSet;
  const skills=poisonNames.map((name,i)=>({
   name,type:'poison',kind:i===0?'dash':'bolt',
   cat:'special',power:37+i,cost:i===0?0:13,cd:900,level:1
  }));
  this._v111OldSkills=oldSkills;skillSet=mon=>mon===owner?skills:oldSkills(mon);
  engine.player.x=engine.enemy.x-engine.h*.52;
  engine.player.y=engine.enemy.y;
  engine.enemy.inv=0;engine.enemy.spawn=0;
  engine.enemyAttackCD=999;engine.foeDodgeCD=999;
  engine.v33Windup=null;engine.running=true;
  battle.paused=false;battle.energy=100;cooldowns=[0,0,0,0];
  const hpBefore=Number(target.hp),energyBefore=battle.energy;
  const cast=engine.useMove(slot);
  return {name:poisonNames[slot],accepted:cast!==false,
   hpBefore,energyBefore,energyAfter:battle.energy,
   dpr:engine.dpr,spriteReady:window.PokemonTorrePoisonV111.diagnostics().ready,
   perf:window.PokemonTorreMobilePerfV111?.diagnostics()};
 };
 qa.poisonStateV111=()=>({
  hp:Number(foe()?.hp),active:!!battle?.active,paused:!!battle?.paused,
  running:!!engine?.running,canvasReady:!!engine?.canvas?.isConnected,
  fps:engine?.fps,dpr:engine?.dpr,
  poison:window.PokemonTorrePoisonV111.diagnostics(),
  perf:window.PokemonTorreMobilePerfV111?.diagnostics(),
  safe:new URLSearchParams(location.search).get('safe')==='1'
 });
})();
