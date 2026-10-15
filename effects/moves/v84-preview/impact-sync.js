/* Pokémon Torre V84: exclusive opt-in four-grass-hit synchronizer.
 * Uses the existing real v359 attack queue; never calls hitTarget and
 * never changes damage, accuracy, energy, status, or cooldown.
 */
(function(){
 'use strict';
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
   .toLowerCase().replace(/[^a-z0-9]/g,'');
 const names=new Set(['chicotedevinha','folhanavalha','chicotesemarea','vinewhip']);
 const log={version:'84.0',scheduled:0,suppressed:0,last:null};
 const previous=BattleEngine.prototype.useMove;
 BattleEngine.prototype.useMove=function(slot){
  const priorAttacks=new Set(this.v359Attacks||[]);
  const priorMiss=new Set(this.v47MissingCollisions||[]);
  const priorContacts=new Set(this.v47ContactToLand||[]);
  const accepted=previous.apply(this,arguments);
  if(accepted===false||!battle?.active||battle?.paused)return accepted;
  const attack=(this.v359Attacks||[]).findLast(a=>a&&!priorAttacks.has(a)&&
    a.battle===battle&&a.owner===current()&&
    names.has(norm(a.move?.name))&&a.hits===0&&
    Number.isFinite(a.at)&&a.duration>0);
  if(!attack)return accepted;
  const config=window.PokemonTorreGrassFourPreviewV84?.timings;
  const ratio=config?.contacts?.[attack.move.name];
  const speed=config?.speeds?.[attack.move.name];
  if(!Number.isFinite(ratio)||!(ratio>0&&ratio<1)||
     !Number.isFinite(speed)||speed<1.5||speed>5)return accepted;
  // The renderer and native HP share the same per-move time scale.
  const visualMs=Math.max(400,attack.duration)*speed;
  const moment=attack.at+visualMs*ratio;
  // The battle engine reads times as a multiple of attack.duration.
  // No extra damage event is created. Allow delay beyond original cast.
  attack.times=[(moment-attack.at)/attack.duration];
  attack.end=Math.max(attack.end||0,attack.at+visualMs+240);
  attack.v84Synced=true;
  attack.v84ImpactAt=moment;
  attack.v84VisualUntil=attack.at+visualMs;
  // Only remove redundant old recoveries spawned by THIS cast.
  const wasMissing=this.v47MissingCollisions?.length||0;
  if(wasMissing)this.v47MissingCollisions=this.v47MissingCollisions.filter(x=>
    priorMiss.has(x)||norm(x.name)!==norm(attack.move.name)||
    x.owner!==attack.owner||x.victim!==attack.target);
  const wasContact=this.v47ContactToLand?.length||0;
  if(wasContact)this.v47ContactToLand=this.v47ContactToLand.filter(x=>
    priorContacts.has(x)||norm(x.name)!==norm(attack.move.name)||
    x.owner!==attack.owner||x.victim!==attack.target);
  log.suppressed+=(wasMissing-(this.v47MissingCollisions?.length||0))+
     (wasContact-(this.v47ContactToLand?.length||0));
  log.scheduled++;
  log.last={name:attack.move.name,impactAt:moment,visualUntil:attack.v84VisualUntil,
    singleHit:attack.times.length===1,realCastDuration:attack.duration,speed};
  return accepted;
 };
 window.PokemonTorreGrassImpactV84=()=>({...log,last:log.last&&{...log.last}});
})();
