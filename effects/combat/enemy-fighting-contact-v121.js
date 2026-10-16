/* Pokémon Torre V121 — enemy Fighting-type REAL contact AI.
 * Fixes Bruno's Machamp, Hitmonlee, Hitmonchan, Machoke, Primeape and
 * Poliwrath. No generic fighting bolt at long range, no instant damage.
 * Works in official V117/V118 and optional V119; safe/mobile too.
 * Does not change player move code, approved move sprites or saves.
 */
(()=>{
'use strict';
if(window.PokemonTorreEnemyFightingV121?.installed)return;
const stats={frames:0,approaches:0,attempts:0,hits:0,misses:0,
  suppressedRanged:0,blockedInvulnerable:0,resets:0,last:null};
const isFighter=mon=>{
 const p=mon&&typeof D!=='undefined'?D[mon.id]:null;
 return !!p&&(p.type==='fighting'||p.type2==='fighting');
};
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const prev=BattleEngine.prototype.update;
BattleEngine.prototype.update=function(dt,now){
 const b=typeof battle!=='undefined'?battle:null;
 const mon=b?.active&&typeof foe==='function'?foe():null;
 const enabled=!!(b?.active&&!b.paused&&mon?.hp>0&&isFighter(mon)&&
   this.player&&this.enemy&&Number.isFinite(dt)&&dt>0);
 if(!enabled){
  if(this._v121Melee){
   this._v121Melee=null;stats.resets++;
  }
  return prev.apply(this,arguments);
 }
 const e=this.enemy,p=this.player,step=Math.min(Math.max(dt,0),.07);
 let ai=this._v121Melee;
 if(!ai||ai.mon!==mon){
  ai={mon,cd:1.0,pending:null};this._v121Melee=ai;stats.resets++;
 }
 // The old AI shoots Fighting bolts at long range and orbits at 39% of the
 // arena height. Suspend ONLY that attack timer for Fighting opponents.
 // All other types, projectiles, beams and approved player effects are native.
 if(!Number.isFinite(this.enemyAttackCD)||this.enemyAttackCD<.65)
  this.enemyAttackCD=.65;
 if(this.telegraph?.from==='enemy'&&this.telegraph.type==='fighting'){
  this.telegraph=null;stats.suppressedRanged++;
 }
 const result=prev.apply(this,arguments);
 if(!b.active||b.paused||foe()!==mon||mon.hp<=0)return result;
 if(this.telegraph?.from==='enemy'&&this.telegraph.type==='fighting'){
  this.telegraph=null;stats.suppressedRanged++;
 }
 if(Array.isArray(this.projectiles)){
  for(let i=this.projectiles.length-1;i>=0;i--){
   const shot=this.projectiles[i];
   if(shot?.from==='enemy'&&shot.type==='fighting'){
    this.projectiles.splice(i,1);stats.suppressedRanged++;
   }
  }
 }
 const h=Number.isFinite(this.h)&&this.h>0?this.h:450;
 const reach=h*.198; // the actual hit zone, not a remote ranged attack
 const approachTo=h*.154; // leave a visible gap; no body overlap
 const d=distance(e,p);
 // Native orbiting AI keeps ranged enemies at ~0.39 h.
 // For Fighting enemies, advance using existing collision and bounds logic.
 if(d>approachTo+.5){
  const blocked=typeof this.clearPath==='function'&&
   !this.clearPath(e.x,e.y,p.x,p.y);
  const goal=blocked&&typeof this.nextAiGoal==='function'?
    this.nextAiGoal(e,p):p;
  const dist=distance(e,goal);
  if(dist>.001){
   const speed=h*.72*step;
   const change=Math.min(speed,blocked?dist:Math.max(0,d-approachTo));
   const before={x:e.x,y:e.y};
   e.x+=(goal.x-e.x)/dist*change;
   e.y+=(goal.y-e.y)/dist*change;
   if(typeof this.collideRocks==='function')this.collideRocks(e);
   else if(typeof this.bounds==='function')this.bounds(e);
   if(distance(before,e)>.05)stats.approaches++;
  }
 }
 // Existing status effects still suppress physical attacks.
 const conditions=this.v25?.stats?.enemy?.conditions||mon.conditions||[];
 const stopped=Array.isArray(conditions)&&conditions.some(x=>
  /sleep|freeze|frozen|congela|dorm/i.test(String(x)));
 const inv=Number(p.inv)||0;
 ai.cd-=step;
 if(ai.pending){
  if(this.time<ai.pending.until)return result;
  const move=ai.pending;
  ai.pending=null;
  // Damage and impact happen at the END of the windup, at contact only.
  const close=distance(e,p)<=reach;
  if(close&&!stopped&&inv<=0&&typeof this.hitTarget==='function'){
   const hpBefore=typeof current==='function'?current()?.hp:null;
   this.hitTarget('player','fighting',move.power);
   const hpAfter=typeof current==='function'?current()?.hp:null;
   if(Number.isFinite(hpBefore)&&Number.isFinite(hpAfter)&&hpAfter<hpBefore){
    stats.hits++;
   }else{stats.blockedInvulnerable++;}
  }else{stats.misses++;}
  return result;
 }
 if(ai.cd<=0&&distance(e,p)<=reach&&!stopped&&(Number(e.spawn)||0)<=0){
  ai.cd=Math.max(1.4,2.18-Math.min(.62,Math.max(0,Number(save?.gym)||0)*.052));
  ai.pending={until:this.time+.27,power:23+Math.min(13,Math.max(0,Number(save?.gym)||0))*2};
  if(this.attackActs)this.attackActs.enemy=Math.max(this.attackActs.enemy||0,this.time+.46);
  e.focus=Math.max(e.focus||0,.37);
  if(typeof this.particlesAt==='function')
   this.particlesAt(e.x+(p.x-e.x)*.3,e.y+(p.y-e.y)*.3,
    (typeof TYPE_COLOR!=='undefined'?TYPE_COLOR.fighting:null)||'#ffcba6',5,60);
  stats.attempts++;
 }
 stats.frames++;
 stats.last={id:mon.id,range:reach,distance:distance(e,p),
  winding:!!ai.pending,cooldown:ai.cd};
 return result;
};
window.PokemonTorreEnemyFightingV121=Object.freeze({
 installed:true,official:true,version:'121.0',
 diagnostics:()=>({...stats,last:stats.last?{...stats.last}:null}),
 isFighter
});
})();