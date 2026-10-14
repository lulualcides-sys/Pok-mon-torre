/* Pokémon Torre V49 — clean finalized electric battle integration.
 * Original game still owns HP, type multipliers, hit checks, cooldowns, AI.
 * Only the old visual overlays for THESE FOUR moves are replaced.
 * Four approved water V45 / fire V42.5 and all other moves are unchanged.
 */
(function(){
 'use strict';
 const K=electricSpriteV46;
 const stats={accepted:0,painted:0,contactFrames:0,legacySuppressed:0,hiddenGeneric:0,lastMove:''};
 const queues=['v359Attacks','v3580Visuals','v3568StatusFX','v352FX',
  'v352OtherFX','v356FX','v351Effects','v346Attacks','v354SpecialAttacks',
  'v343Named','v344Fx','v344StatusFX','v348StatusFX','v342StatusFx'];
 const oldPainter=window.PokemonTorreV360Paint;
 window.PokemonTorreV360Paint=function(g,fx,now,e){
  if(K.resolve(fx))return true;
  return typeof oldPainter==='function'?oldPainter(g,fx,now,e):false;
 };
 function suppress(e){
  for(const name of queues){
   const values=e[name];
   if(!Array.isArray(values)||!values.length)continue;
   const after=values.filter(v=>!K.resolve(v));
   if(after.length!==values.length){
    stats.legacySuppressed+=values.length-after.length;
    e[name]=after;
   }
  }
 }
 // Hide old Canvas projectile art ONLY; projectiles remain in the engine's
 // arrays and keep real velocity, collision and HP damage in update().
 const oldProjectilePainter=BattleEngine.prototype.drawProjectile;
 if(typeof oldProjectilePainter==='function'){
  BattleEngine.prototype.drawProjectile=function(shot){
   if(shot?.ptElectricSpriteV47){stats.hiddenGeneric++;return;}
   return oldProjectilePainter.apply(this,arguments);
  };
 }
 const oldUse=BattleEngine.prototype.useMove;
 BattleEngine.prototype.useMove=function(slot){
  const b=battle,m=b?.active?current():null;
  const move=m&&Number.isInteger(slot)?skillSet(m)?.[slot]:null;
  const d=K.resolve(move);
  if(!d)return oldUse.apply(this,arguments);
  const now=performance.now(),beforeEnergy=b.energy,beforeCd=cooldowns[slot]||0;
  const beforeAttacks=this.v359Attacks?.length||0;
  const projectileBefore=this.projectiles?.length||0;
  const particleBefore=this.particles?.length||0;
  const lightningBefore=this.v342Lightning?.length||0;
  const result=oldUse.apply(this,arguments);
  const accepted=result!==false&&b===battle&&b?.active&&(
   b.energy<beforeEnergy||
   ((cooldowns[slot]||0)>now&&(cooldowns[slot]||0)!==beforeCd)||
   (this.v359Attacks?.length||0)>beforeAttacks
  );
  if(!accepted)return result;
  // The original V34.2 handler spawns a generic extra yellow lightning
  // for every electric move. Remove only objects appended BY THIS cast.
  if(Array.isArray(this.v342Lightning)&&this.v342Lightning.length>lightningBefore){
   stats.legacySuppressed+=this.v342Lightning.length-lightningBefore;
   this.v342Lightning.length=lightningBefore;
  }
  suppress(this);
  for(const p of (this.projectiles||[]).slice(projectileBefore))
   if(p.from==='player'&&p.type==='electric')p.ptElectricSpriteV47=true;
  for(const p of (this.particles||[]).slice(particleBefore))
   p.ptElectricGenericV47=true;
  const fx={at:now,end:now+d.duration,duration:d.duration,battle:b,
   owner:m,target:foe(),move:{name:move.name},
   from:[this.player.x,this.player.y-(this.h||560)*.13],
   to:[this.enemy.x,this.enemy.y-(this.h||560)*.12]};
  this.v46ElectricFX=(this.v46ElectricFX||[]).filter(x=>
   x.end>now&&x.battle===b&&x.owner===m).slice(-8);
  this.v46ElectricFX.push(fx);
  stats.accepted++;stats.lastMove=move.name;
  return result;
 };
 const oldDraw=BattleEngine.prototype.draw;
 BattleEngine.prototype.draw=function(now){
  const b=battle,actor=b?.active?current():null,enemy=b?.active?foe():null;
  const fx=b?.active?(this.v46ElectricFX||[]).filter(x=>
   x.end>now&&x.battle===b&&x.owner===actor&&x.target===enemy):[];
  this.v46ElectricFX=fx;
  if(fx.length)suppress(this);
  // Prevent old yellow Canvas bubbles and straight beam guide from painting
  // on top of pixel-art sprites. Restore the arrays after every frame.
  const oldParticles=this.particles;
  const oldTelegraph=this.telegraph;
  const hideBeam=fx.length&&oldTelegraph?.from==='player'&&oldTelegraph.kind==='beam';
  if(fx.length&&oldParticles?.some(p=>p.ptElectricGenericV47))
   this.particles=oldParticles.filter(p=>!p.ptElectricGenericV47);
  if(hideBeam)this.telegraph=null;
  const player=this.player,target=this.enemy;
  const base=player?[player.x,player.y]:null;
  const dash=[...fx].reverse().find(x=>K.resolve(x)?.contact);
  if(dash&&player&&target){
   const t=K.clamp((now-dash.at)/dash.duration);
   const contact=K.ease((t-.18)/.24)*(1-K.ease((t-.60)/.19));
   const dx=target.x-player.x,dy=target.y-player.y,len=Math.hypot(dx,dy)||1;
   const gap=Math.max(39,(this.h||560)*.071);
   const advance=Math.max(0,len-gap)*contact;
   player.x+=dx/len*advance;player.y+=dy/len*advance;
   dash.actor=[player.x,player.y-(this.h||560)*.13];
   stats.contactFrames++;
  }
  let result;
  try{result=oldDraw.call(this,now);}
  finally{
   if(dash&&player&&base){player.x=base[0];player.y=base[1];}
   if(this.particles!==oldParticles)this.particles=oldParticles;
   if(hideBeam)this.telegraph=oldTelegraph;
   if(fx.length)suppress(this);
  }
  for(const v of fx){
   if(K.resolve(v)?.followTarget&&target)
    v.to=[target.x,target.y-(this.h||560)*.12];
   if(K.paint(this.ctx,v,now,this))stats.painted++;
  }
  return result;
 };
 window.PokemonTorreElectricV46=()=>({...K.diagnostics(),...stats,
  active:(engine?.v46ElectricFX||[]).map(x=>x.move.name)});
 const oldBadge=document.getElementById('ptFireSpriteV41Badge');
 if(oldBadge)oldBadge.textContent='ELÉTRICOS V51 PNG · ÁGUA V45 · FOGO V42.5';
})();
