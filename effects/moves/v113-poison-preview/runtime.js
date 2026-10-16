/* Pokémon Torre V113 — four EQUIPPED Poison attacks, opt-in battle preview.
 * Built from sixteen-frame pixel-art WebP sheets taken from the user's
 * original Pokémon Mystery Dungeon Poison Attack Effects gallery. Native V359 owns real HP timing. No official move is replaced.
 * The PixiJS GPU sheet renderer is preferred; Canvas drawImage is the safe
 * pixel-perfect fallback only, never hand-drawn runtime Canvas shapes.
 */
window.PokemonTorrePoisonPreviewV113=(()=>{
 'use strict';
 const QUERY='poison113';
 const enabled=new URLSearchParams(location.search).get('battle_preview')===QUERY;
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/[^a-z0-9]/g,'');
 const allowed=new Set(['nevoavenenosa','poisonjab','acido','lamacorrosiva']);
 const registered=new Map(),images=new Map(),contact=new WeakMap(),stats={casts:0,draws:0,pixi:0,fallback:0,
  hiddenGeneric:0,approaches:0,retreats:0,minContactDistance:null,previewOnly:enabled,damageModified:false,last:null,errors:[]};
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
 const lerp=(a,b,t)=>a+(b-a)*t;
 function register(spec){
  if(!allowed.has(spec?.id)||norm(spec?.name)!==spec.id||
     registered.has(spec.id)||spec.frames!==16||
     !(spec.impact>.2&&spec.impact<.9))throw Error('Invalid or duplicate V113 move: '+spec?.id);
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
  const base=spec.mode==='area'?153:spec.mode==='contact'?112:
   spec.id==='lamacorrosiva'?132:108;
  const width=base*worldScale,height=width;
  const fade=progress>.91?clamp((1-progress)/.09):1;
  const isSafe=new URLSearchParams(location.search).get('safe')==='1';
  let gpu=false;
  if(!isSafe&&typeof pixiFX!=='undefined'&&
   typeof pixiFX.paintFightingSheet==='function'){
   gpu=pixiFX.paintFightingSheet(e,'v113-'+id,image,frame,{
    width:128,height:128,frames:spec.frames,x,y,
    displayW:width,displayH:height,alpha:fade,
    t:progress,hit:2 // V113: no Fighting-color automatic particles
   });
  }
  if(gpu)stats.pixi++;
  else{
   // Native drawImage is the safe-mode fallback for the SAME authored pixels.
   g.save();
   try{
    g.imageSmoothingEnabled=false;
    g.globalAlpha*=fade;
    g.drawImage(image,frame*128,0,128,128,x-width/2,y-height/2,width,height);
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
    const prevEvents=new Set(this.v359Attacks||[]);
    const home=key==='poisonjab'&&this.player?
      {x:this.player.x,y:this.player.y,actor:this.player,victim:this.enemy,
       battle,owner:current(),at:performance.now()}:null;
    const result=oldUse.apply(this,arguments);
    if(result===false||!battle?.active)return result;
    stats.casts++;
    if(home&&this.player===home.actor){
     const hitEvent=(this.v359Attacks||[]).find(f=>!prevEvents.has(f)&&
       norm(f?.move?.name)==='poisonjab');
     home.at=Number(hitEvent?.at)||home.at;
     home.duration=Math.max(550,Number(hitEvent?.duration)||880);
     home.hit=clamp(Number(hitEvent?.times?.[0])||.64,.2,.85);
     contact.set(this,home);
    }
    for(const shot of this.projectiles||[])
     if(!prior.has(shot)&&shot.from==='player'){
      shot.__v113PreviewHidden=key;
      stats.hiddenGeneric++;
     }
    return result;
   };
   // V113 Poison Jab is a REAL close-contact attack: move the actual Pokémon,
   // never just its VFX. Native V359 still owns damage, cooldown and energy.
   const oldUpdate=BattleEngine.prototype.update;
   BattleEngine.prototype.update=function(dt,now){
    const result=oldUpdate.apply(this,arguments);
    const m=contact.get(this),clock=Number.isFinite(now)?now:performance.now();
    if(!m)return result;
    if(!battle?.active||battle.paused||!this.running||
       this.player!==m.actor||this.enemy!==m.victim||
       battle!==m.battle||current()!==m.owner){
      contact.delete(this);return result;
    }
    const t=clamp((clock-m.at)/m.duration);
    const dx=m.x-this.enemy.x,dy=m.y-this.enemy.y,dist=Math.hypot(dx,dy)||1;
    const gap=Math.max(60,Math.min(this.h*.235,(this.enemy.r||34)+(this.player.r||32)+22));
    const cx=this.enemy.x+dx/dist*gap,cy=this.enemy.y+dy/dist*gap;
    const q=t<m.hit?ease(t/m.hit):1-ease((t-m.hit)/.32);
    this.player.x=lerp(m.x,cx,q);this.player.y=lerp(m.y,cy,q);
    this.bounds?.(this.player);
    const proximity=Math.hypot(this.enemy.x-this.player.x,this.enemy.y-this.player.y);
    stats.minContactDistance=stats.minContactDistance===null?
      proximity:Math.min(stats.minContactDistance,proximity);
    if(q>.95&&!m.didApproach){stats.approaches++;m.didApproach=true;}
    if(t>=.98){
     this.player.x=m.x;this.player.y=m.y;
     contact.delete(this);stats.retreats++;
    }
    return result;
   };
   const oldShot=BattleEngine.prototype.drawProjectile;
   if(typeof oldShot==='function')
    BattleEngine.prototype.drawProjectile=function(shot){
     if(shot?.__v113PreviewHidden&&isReady(shot.__v113PreviewHidden))return;
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
  qa.castPoisonPreviewV113=function(slot=0){
   const names=['Névoa Venenosa','Poison Jab','Ácido','Lama Corrosiva'];
   if(!Number.isInteger(slot)||slot<0||slot>3)return {error:'invalid slot'};
   if(this._v111OldSkills){skillSet=this._v111OldSkills;this._v111OldSkills=null;}
   if(this._v113OldSkills){skillSet=this._v113OldSkills;this._v113OldSkills=null;}
   this.start(150,143);
   const owner=current(),target=foe(),originalSkills=skillSet;
   const skills=names.map((name,i)=>({
    name,type:'poison',kind:['area','dash','bolt','hazard'][i],
    cat:i===1?'physical':'special',power:40+i*4,cost:13,cd:900,level:1
   }));
   this._v113OldSkills=originalSkills;
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
  qa.poisonPreviewStateV113=()=>({
   hp:Number(foe()?.hp),active:!!battle?.active,paused:!!battle?.paused,
   running:!!engine?.running,canvasReady:!!engine?.canvas?.isConnected,
   dpr:engine?.dpr,fps:engine?.fps,
   preview:window.PokemonTorrePoisonPreviewV113?.diagnostics(),
   safe:new URLSearchParams(location.search).get('safe')==='1'
  });
 }
}
