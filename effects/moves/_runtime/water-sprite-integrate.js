/* Pokémon Torre V45 — independent Tsunami, Amnesia, Hydro Pump VFX.
 * Preserves all Fire V42.5 effects, hit calculations, real projectiles,
 * cooldowns, status buffs, enemy attacks and the existing sprite renderer.
 */
(function(){
 'use strict';
 const W=waterSpriteV43;
 const stats={casts:0,renderedFrames:0,contactFrames:0,statusDiscarded:0,lastMove:'',errors:[]};
 const visualQueues=['v3568StatusFX','v3580Visuals','v352FX','v352OtherFX','v342StatusFx','v344Fx',
  'v351Effects','v346Attacks','v356FX','v354SpecialAttacks','v343Named','v344StatusFX','v348StatusFX'];
 function matchesNew(f){return !!W.resolve(f||{});}
 // The original offensive painter can still process damage and its attack queue,
 // but must not draw a second generic VFX over these four source-sprite modules.
 const oldPainter=window.PokemonTorreV360Paint;
 window.PokemonTorreV360Paint=function(ctx,fx,now,engine){
  if(matchesNew(fx))return true;
  return typeof oldPainter==='function'?oldPainter(ctx,fx,now,engine):false;
 };
 function eraseOldOverlay(e){
  for(const list of visualQueues){
   const items=e[list];if(!Array.isArray(items))continue;
   const clean=items.filter(f=>!matchesNew(f));
   if(items.length>clean.length){stats.statusDiscarded+=items.length-clean.length;e[list]=clean;}
  }
 }
 function snapshot(e){
  return Object.fromEntries(visualQueues.concat(['particles','rings','v19Impacts','v19Beams','v26Particles'])
    .map(p=>[p,Array.isArray(e[p])?e[p].slice():null]));
 }
 function removeNewStatusVisuals(e,old){
  // Only remove VFX produced by the accepted status move during the cast.
  // Existing nearby attacks and all gameplay objects are unchanged.
  for(const [key,before] of Object.entries(old)){
   if(!before||!Array.isArray(e[key]))continue;
   if(e[key].length>before.length){
    stats.statusDiscarded+=e[key].length-before.length;
    e[key]=before.slice();
   }
  }
 }
 const prevUse=BattleEngine.prototype.useMove;
 BattleEngine.prototype.useMove=function(slot){
  const active=battle?.active,mon=active?current():null;
  const move=mon&&Number.isInteger(slot)?skillSet(mon)?.[slot]:null;
  const descriptor=W.resolve(move);
  if(!descriptor)return prevUse.apply(this,arguments);
  const b=battle,now=performance.now(),cost=b.energy,cd=cooldowns[slot]||0;
  const oldAttacks=(this.v359Attacks||[]).length;
  const saved=descriptor.status?snapshot(this):null;
  const result=prevUse.apply(this,arguments);
  const allowed=result!==false&&b===battle&&b?.active&&(
   b.energy<cost||((cooldowns[slot]||0)>now&&(cooldowns[slot]||0)!==cd)||
   (this.v359Attacks||[]).length>oldAttacks
  );
  if(!allowed)return result;
  if(saved)removeNewStatusVisuals(this,saved);
  eraseOldOverlay(this);
  const fx={at:now,end:now+descriptor.duration,duration:descriptor.duration,battle:b,
   owner:mon,move:{name:move.name},target:foe(),
   from:[this.player.x,this.player.y-this.h*.13],to:[this.enemy.x,this.enemy.y-this.h*.12]};
  this.v43WaterFX=(this.v43WaterFX||[]).filter(f=>f.end>now&&f.battle===b&&f.owner===mon);
  this.v43WaterFX.push(fx);
  this.v43WaterFX=this.v43WaterFX.slice(-7);
  stats.casts++;stats.lastMove=move.name;
  return result;
 };
 const prevDraw=BattleEngine.prototype.draw;
 BattleEngine.prototype.draw=function(now){
  const active=!!battle?.active,mon=active?current():null;
  const visible=active?(this.v43WaterFX||[]).filter(f=>f.battle===battle&&f.end>now
   &&f.owner===mon&&(W.resolve(f)?.selfTarget||f.target===foe())):[];
  this.v43WaterFX=visible;
  if(visible.length)eraseOldOverlay(this);
  const p=this.player,q=this.enemy;
  const origin=p?[p.x,p.y]:null;
  const hit=visible.findLast?.(f=>W.resolve(f)?.contact)||
   [...visible].reverse().find(f=>W.resolve(f)?.contact);
  if(hit&&p&&q){
   const moveDesc=W.resolve(hit);
   const t=W.clamp((now-hit.at)/hit.duration);
   // Approved Skull Bash remains byte-for-byte the same motion when style absent.
   const approach=moveDesc?.contactStyle==='surge'
    ?W.ease((t-.18)/.24)*(1-W.ease((t-.59)/.20))
    :moveDesc?.contactStyle==='tail'
     ?W.ease((t-.24)/.22)*(1-W.ease((t-.67)/.18))
     :W.ease((t-.24)/.23)*(1-W.ease((t-.64)/.20));
   const dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy)||1;
   const stop=moveDesc?.contactStyle==='surge'?Math.max(35,(this.h||560)*.068):
    moveDesc?.contactStyle==='tail'?Math.max(49,(this.h||560)*.09):
    Math.max(42,(this.h||560)*.091);
   const dist=Math.max(0,len-stop)*approach;
   p.x+=dx/len*dist;p.y+=dy/len*dist;
   // Water cloak/tail remains attached to the ACTUAL moving actor.
   hit.actor=[p.x,p.y-(this.h||560)*.13];
   stats.contactFrames++;
  }
  // Draw all game mechanics through existing renderer, including foe damage;
  // only move the Pokémon for the accepted headbutt, then restore immediately.
  let result;
  try{result=prevDraw.call(this,now);}
  finally{
   if(hit&&p&&origin){p.x=origin[0];p.y=origin[1];}
   if(visible.length)eraseOldOverlay(this);
  }
  if(!active||!this.ctx)return result;
  for(const fx of visible){
   // The TWO Hydro Pump jets keep meeting on the actual moving foe;
   // this affects the sprite only, not damage or projectile collision.
   if(W.resolve(fx)?.followTarget&&q){
    fx.to=[q.x,q.y-(this.h||560)*.12];
   }
   if(W.resolve(fx)?.selfTarget&&p){
    fx.from=[p.x,p.y-(this.h||560)*.13];
   }
   if(W.paint(this.ctx,fx,now,this))stats.renderedFrames++;
  }
  return result;
 };
 const prior=window.PokemonTorreFireSpriteV42;
 window.PokemonTorreWaterV43=()=>({
  ...W.diagnostics(),castsAccepted:stats.casts,drawEvents:stats.renderedFrames,
  contactFrames:stats.contactFrames,oldOverlaysRemoved:stats.statusDiscarded,
  lastMove:stats.lastMove,originalFire:typeof prior==='function'?prior().version:'unknown',
  active:(engine?.v43WaterFX||[]).map(f=>f.move?.name)
 });
 function versionTag(){
  const tag=document.getElementById('ptFireSpriteV41Badge');
  if(tag)tag.textContent='SPRITES ÁGUA V45 · FOGO V42.5';
 }
 versionTag();
})();
