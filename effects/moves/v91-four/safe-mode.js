/* V91: standalone safety hook only for ?safe=1 (no Pixi/FX plugin loaded).
 * Preserves original 35.79 game mechanics but draws the same four leaf/whip
 * animations in the original 2D canvas instead of the generic bullet.
 */
(()=>{
 'use strict';
 if(typeof grassFallbackV91==='undefined'||typeof BattleEngine==='undefined')return;
 const saved=BattleEngine.prototype.useMove;
 BattleEngine.prototype.useMove=function(slot){
  const mon=battle?.active?current():null;
  const mv=mon&&Number.isInteger(slot)?skillSet(mon)?.[slot]:null;
  const key=grassFallbackV91.keyOf(mv?.name);
  if(!key)return saved.apply(this,arguments);
  const energy=battle.energy,cd=Number(cooldowns[slot])||0;
  const before=new Set(this.projectiles||[]);
  const time=performance.now();
  const out=saved.apply(this,arguments);
  if(out===false||!battle?.active||battle.paused||
    !(battle.energy<energy||Number(cooldowns[slot])>cd))return out;
  if(grassFallbackV91.start(this,mv.name,time)){
   for(const shot of this.projectiles||[])
    if(!before.has(shot)&&shot.from==='player'&&shot.type==='grass')
     shot.__v91CoveredByPlant=true;
  }
  return out;
 };
 const paint=BattleEngine.prototype.drawProjectile;
 if(typeof paint==='function')BattleEngine.prototype.drawProjectile=function(shot){
  if((shot?.__v91CoveredByPlant||
   (shot?.type==='grass'&&shot?.from==='player'&&
    grassFallbackV91.active(this)))&&battle?.active)return;
  return paint.apply(this,arguments);
 };
 const draw=BattleEngine.prototype.draw;
 BattleEngine.prototype.draw=function(now){
  const result=draw.apply(this,arguments);
  if(battle?.active)grassFallbackV91.draw(this,now);
  return result;
 };
 if(typeof window.PokemonTorreV360Paint==='function'){
  const painter=window.PokemonTorreV360Paint;
  window.PokemonTorreV360Paint=function(g,f,now,engine){
   if(grassFallbackV91.suppressLegacy(engine,f?.move?.name||f?.name,now))return true;
   return painter.apply(this,arguments);
  };
 }
 const originalStop=stopTimers;
 stopTimers=function(){
  if(typeof engine!=='undefined'&&engine)grassFallbackV91.clear(engine);
  return originalStop.apply(this,arguments);
 };
 window.PokemonTorreGrassSafetyV91=true;
})();
