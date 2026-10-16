/* Pokémon Torre V112 — four EQUIPPED Poison attacks, opt-in battle preview.
 * Built from distinct 12/16-frame pixel-art WebP sheets based on the user's
 * GBA gallery. Native V359 owns real HP timing. No official move is replaced.
 * The PixiJS GPU sheet renderer is preferred; Canvas drawImage is the safe
 * pixel-perfect fallback only, never hand-drawn runtime Canvas shapes.
 */
window.PokemonTorrePoisonPreviewV112=(()=>{
 'use strict';
 const QUERY='poison112';
 const enabled=new URLSearchParams(location.search).get('battle_preview')===QUERY;
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/[^a-z0-9]/g,'');
 const allowed=new Set(['nevoavenenosa','poisonjab','acido','lamacorrosiva']);
 const registered=new Map(),images=new Map(),stats={casts:0,draws:0,pixi:0,fallback:0,
  hiddenGeneric:0,previewOnly:enabled,damageModified:false,last:null,errors:[]};
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
 const lerp=(a,b,t)=>a+(b-a)*t;
 function register(spec){
  if(!allowed.has(spec?.id)||norm(spec?.name)!==spec.id||
     registered.has(spec.id)||![12,16].includes(spec.frames)||
     !(spec.impact>.2&&spec.impact<.9))throw Error('Invalid or duplicate V112 move: '+spec?.id);
  registered.set(spec.id,Object.freeze({...spec}));
  if(enabled){
   const image=new Image();image.decoding='async';
   image.addEventListener?.('error',()=>stats.errors.push('Could not load '+spec.sheet));
   image.src=spec.sheet;images.set(spec.id,image);
  }
 }
 const isReady=id=>{
  const s=registered.get(id),im=images.get(id);
  return !!(s&&im?.complete&&im.naturalWidth===s.frames*96&&im.naturalHeight===96);
 };
 const previousPaint=window.PokemonTorreV360Paint;
 const paint=function(g,fx,now,e){
  if(!enabled)return typeof previousPaint==='function'?
    previousPaint.apply(this,arguments):false;
  const id=norm(fx?.move?.name||fx?.name);
  if(!registered.has(id)||!isReady(id)||!g||!fx||!e)
   return typeof previousPaint==='function'?previousPaint.apply(this,arguments):false;
  const spec=registered.get(id),image=images.get(id);
  const duration=Math.max(1,Number(fx.duration)||spec.ms);
  const progress=clamp((now-fx.at)/duration);
  if(now<fx.at||now>fx.at+duration)return true;
  // The ONLY actual HP hit is handled by the original V359 event.
  // Re-time the artwork's hit pose to its original hit timestamp.
  const hit=clamp(Number(fx.times?.[0])||.64,.14,.91);
  const phase=progress<=hit?spec.impact*progress/hit:
   spec.impact+(1-spec.impact)*(progress-hit)/(1-hit);
  const frame=Math.min(spec.frames-1,Math.floor(phase*spec.frames));
  const A=fx.from||[e.player?.x||0,e.player?.y||0];
  const B=fx.to||[e.enemy?.x||0,e.enemy?.y||0];
  const target=e.enemy||{},actor=e.player||{};
  const worldScale=clamp((Number(target.r)||34)/36,.72,1.23);
  const hx=Number.isFinite(target.x)?target.x:B[0],
   hy=(Number.isFinite(target.y)?target.y:B[1])-(e.h||420)*.13;
  const sx=Number.isFinite(actor.x)?actor.x:A[0],
   sy=(Number.isFinite(actor.y)?actor.y:A[1])-(e.h||420)*.12;
  let x=hx,y=hy;
  if(spec.mode==='contact'){
   const q=ease(progress/hit);
   // Poison Jab should travel to the body, not fire an isolated poison dart.
   x=lerp(sx,hx,q);y=lerp(sy,hy,q);
  }else if(spec.mode==='projectile'){
   const q=ease(progress/hit);
   x=lerp(sx,hx,q);y=lerp(sy,hy,q)-(1-q)*8;
  }else{
   x=hx-12*(1-ease(progress/hit));
   y=hy+4*Math.sin(progress*Math.PI);
  }
  const base=spec.mode==='area'?130:spec.mode==='contact'?108:
   spec.id==='lamacorrosiva'?120:104;
  const width=base*worldScale,height=width;
  const fade=progress>.91?clamp((1-progress)/.09):1;
  const isSafe=new URLSearchParams(location.search).get('safe')==='1';
  let gpu=false;
  if(!isSafe&&typeof pixiFX!=='undefined'&&
   typeof pixiFX.paintFightingSheet==='function'){
   gpu=pixiFX.paintFightingSheet(e,'v112-'+id,image,frame,{
    width:96,height:96,frames:spec.frames,x,y,
    displayW:width,displayH:height,alpha:fade,
    t:progress,hit:2 // V112: no Fighting-color automatic particles
   });
  }
  if(gpu)stats.pixi++;
  else{
   // Native drawImage is the safe-mode fallback for the SAME authored pixels.
   g.save();
   try{
    g.imageSmoothingEnabled=false;
    g.globalAlpha*=fade;
    g.drawImage(image,frame*96,0,96,96,x-width/2,y-height/2,width,height);
   }finally{g.restore();}
   stats.fallback++;
  }
  stats.draws++;
  stats.last={name:spec.name,frame:frame+1,total:spec.frames,
   nativeImpact:hit,phase:Math.round(phase*100)/100,painter:gpu?'PixiJS':'sprite fallback'};
  return true;
 };
 if(enabled){
  window.PokemonTorreV360Paint=paint;
  if(typeof BattleEngine==='function'){
   const oldUse=BattleEngine.prototype.useMove;
   BattleEngine.prototype.useMove=function(slot){
    const move=battle?.active&&Number.isInteger(slot)?skillSet(current())?.[slot]:null;
    const key=norm(move?.name);
    if(!isReady(key))return oldUse.apply(this,arguments);
    const prior=new Set(this.projectiles||[]);
    const result=oldUse.apply(this,arguments);
    if(result===false||!battle?.active)return result;
    stats.casts++;
    for(const shot of this.projectiles||[])
     if(!prior.has(shot)&&shot.from==='player'){
      shot.__v112PreviewHidden=key;
      stats.hiddenGeneric++;
     }
    return result;
   };
   const oldShot=BattleEngine.prototype.drawProjectile;
   if(typeof oldShot==='function')
    BattleEngine.prototype.drawProjectile=function(shot){
     if(shot?.__v112PreviewHidden&&isReady(shot.__v112PreviewHidden))return;
     return oldShot.apply(this,arguments);
    };
  }
 }
 return {version:'112.0-preview',enabled,register,
  diagnostics:()=>({version:'112.0-preview',...stats,
   registered:[...registered.keys()],ready:[...registered.keys()].filter(isReady),
   errors:stats.errors.slice(-8)})};
})();


// Browser-only localhost smoke-test driver. No player-facing atelier or cheats.
if(/^(localhost|127\.0\.0\.1)$/.test(location.hostname||'')){
 const qa=window.PokemonTorreLocalCombatTestV47;
 if(qa){
  qa.castPoisonPreviewV112=function(slot=0){
   const names=['Névoa Venenosa','Poison Jab','Ácido','Lama Corrosiva'];
   if(!Number.isInteger(slot)||slot<0||slot>3)return {error:'invalid slot'};
   if(this._v111OldSkills){skillSet=this._v111OldSkills;this._v111OldSkills=null;}
   if(this._v112OldSkills){skillSet=this._v112OldSkills;this._v112OldSkills=null;}
   this.start(150,143);
   const owner=current(),target=foe(),originalSkills=skillSet;
   const skills=names.map((name,i)=>({
    name,type:'poison',kind:['area','dash','bolt','hazard'][i],
    cat:i===1?'physical':'special',power:40+i*4,cost:13,cd:900,level:1
   }));
   this._v112OldSkills=originalSkills;
   skillSet=mon=>mon===owner?skills:originalSkills(mon);
   engine.player.x=engine.enemy.x-engine.h*.52;
   engine.player.y=engine.enemy.y;
   engine.enemy.inv=0;engine.enemy.spawn=0;
   engine.enemyAttackCD=999;engine.foeDodgeCD=999;
   engine.v33Windup=null;engine.running=true;
   battle.paused=false;battle.energy=100;cooldowns=[0,0,0,0];
   const hpBefore=Number(target.hp),energyBefore=battle.energy;
   const cast=engine.useMove(slot);
   return {name:names[slot],accepted:cast!==false,
    hpBefore,energyBefore,energyAfter:battle.energy};
  };
  qa.poisonPreviewStateV112=()=>({
   hp:Number(foe()?.hp),active:!!battle?.active,paused:!!battle?.paused,
   running:!!engine?.running,canvasReady:!!engine?.canvas?.isConnected,
   dpr:engine?.dpr,fps:engine?.fps,
   preview:window.PokemonTorrePoisonPreviewV112?.diagnostics(),
   safe:new URLSearchParams(location.search).get('safe')==='1'
  });
 }
}
