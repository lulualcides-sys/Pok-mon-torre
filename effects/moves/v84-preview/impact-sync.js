/* Pokémon Torre V84: exclusive opt-in four-grass-hit synchronizer.
 * Uses the existing real v359 attack queue; never calls hitTarget and
 * never changes damage, accuracy, energy, status, or cooldown.
 */
(function(){
 'use strict';
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
   .toLowerCase().replace(/[^a-z0-9]/g,'');
 const names=new Set(['chicotedevinha','folhanavalha','chicotesemarea','vinewhip']);
 const log={version:'84.2',scheduled:0,suppressed:0,last:null};
 const previous=BattleEngine.prototype.useMove;
 BattleEngine.prototype.useMove=function(slot){
  const priorAttacks=new Set(this.v359Attacks||[]);
  const priorVisuals=new Set(this.v3580Visuals||[]);
  const priorMiss=new Set(this.v47MissingCollisions||[]);
  const priorContacts=new Set(this.v47ContactToLand||[]);
  const accepted=previous.apply(this,arguments);
  if(accepted===false||!battle?.active||battle?.paused)return accepted;
  const attack=(this.v359Attacks||[]).findLast(a=>a&&!priorAttacks.has(a)&&
    a.battle===battle&&a.owner===current()&&
    names.has(norm(a.move?.name))&&a.hits===0&&
    Number.isFinite(a.at)&&a.duration>0);
  // The original game has TWO move queues. V359 attacks are one; some
  // authenticated casts only create V3580 visuals and a V47 recovery.
  const visual=!attack&&(this.v3580Visuals||[]).findLast(f=>f&&!priorVisuals.has(f)&&
    names.has(norm(f.move?.name))&&Number.isFinite(f.at)&&f.duration>0);
  const event=attack||visual;
  if(!event)return accepted;
  const config=window.PokemonTorreGrassFourPreviewV84?.timings;
  const ratio=config?.contacts?.[event.move.name];
  const speed=config?.speeds?.[event.move.name];
  if(!Number.isFinite(ratio)||!(ratio>0&&ratio<1)||
     !Number.isFinite(speed)||speed<1.5||speed>5)return accepted;
  // The renderer and native HP share the same per-move time scale.
  const visualMs=Math.max(400,event.duration)*speed;
  const moment=event.at+visualMs*ratio;
  if(!attack){
   // Move only the native V47 registered recovery for THIS fresh cast.
   // No direct hitTarget or fake damage. Do not touch unrelated recoveries.
   const recovery=(this.v47MissingCollisions||[]).findLast(x=>
     !priorMiss.has(x)&&norm(x.name)===norm(event.move.name)&&
     x.owner===current());
   const contact=(this.v47ContactToLand||[]).findLast(x=>
     !priorContacts.has(x)&&norm(x.name)===norm(event.move.name)&&
     x.owner===current());
   const native=recovery||contact;
   if(!native)return accepted;
   native.at=moment;
   native.until=Math.max(Number(native.until)||0,event.at+visualMs+250);
   event.v84ImpactAt=moment;
   event.v84VisualUntil=event.at+visualMs;
   log.scheduled++;
   log.last={name:event.move.name,impactAt:moment,
      visualUntil:event.v84VisualUntil,via:'native-v47',speed};
   return accepted;
  }
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
