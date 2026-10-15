/* V92 recovery for safe=1 (no Pixi, no runtime plugin).
 * Make the four EQUIPPED moves visible even in Android safe mode.
 */
(()=>{
 'use strict';
 if(typeof equippedFourV92==='undefined'||typeof BattleEngine==='undefined')return;
 const oldUse=BattleEngine.prototype.useMove;
 BattleEngine.prototype.useMove=function(slot){
  const actor=battle?.active?current():null;
  const move=actor&&Number.isInteger(slot)?skillSet(actor)?.[slot]:null;
  const key=equippedFourV92.keyOf(move?.name);
  if(!key)return oldUse.apply(this,arguments);
  const beforeEnergy=Number(battle.energy),oldCd=Number(cooldowns?.[slot])||0;
  const shots=new Set(this.projectiles||[]),time=performance.now();
  const count=this.particles?.length||0;
  const result=oldUse.apply(this,arguments);
  if(result===false||!battle?.active||battle.paused||
    !(Number(battle.energy)<beforeEnergy||(Number(cooldowns?.[slot])||0)>oldCd))
   return result;
  if(equippedFourV92.begin(this,move.name,time)){
   const typ=/geada|sopro/.test(key)?'ice':'grass';
   for(const shot of this.projectiles||[])
    if(!shots.has(shot)&&shot?.from==='player'){
     shot.__v92Covered=true;shot.__v94NamedEffect=key;
    }
   if(this.particles?.length>count)this.particles.length=count;
  }
  return result;
 };
 const oldShot=BattleEngine.prototype.drawProjectile;
 if(typeof oldShot==='function')
  BattleEngine.prototype.drawProjectile=function(shot){
   if(Number.isFinite(this.enemy?.hp)&&this.enemy.hp<=0)return;
   const active=equippedFourV92.active(this,performance.now());
   if(shot?.__v92Covered||shot?.__v94NamedEffect||
     (active&&shot?.from==='player'&&
      shot.type===(/geada|sopro/.test(active.key)?'ice':'grass')))return;
   return oldShot.apply(this,arguments);
  };
 const oldPainter=window.PokemonTorreV360Paint;
 window.PokemonTorreV360Paint=function(ctx,fx,now,owner){
  if(Number.isFinite(owner?.enemy?.hp)&&owner.enemy.hp<=0)return true;
  if(equippedFourV92.hideLegacy(owner,fx?.move?.name||fx?.name,now))return true;
  return typeof oldPainter==='function'?oldPainter.apply(this,arguments):false;
 };
 const oldDraw=BattleEngine.prototype.draw;
 BattleEngine.prototype.draw=function(now){
  const defeated=Number.isFinite(this.enemy?.hp)&&this.enemy.hp<=0;
  if(defeated){
   equippedFourV92.clear(this);
   if(Array.isArray(this.particles))this.particles.length=0;
  }
  const r=oldDraw.apply(this,arguments);
  if(!defeated&&battle?.active)equippedFourV92.draw(this,now);
  return r;
 };
 const oldStop=stopTimers;
 stopTimers=function(){
  if(typeof engine!=='undefined'&&engine)equippedFourV92.clear(engine);
  return oldStop.apply(this,arguments);
 };
 window.PokemonTorreEquippedSafetyV92=true;
})();
