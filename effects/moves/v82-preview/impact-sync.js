/* V82 staged grass, opt-in hit synchronization.
   Wraps the native attack queue AFTER existing V47 and V80 wrappers.
   No damage API interception; no fake hits, changes only hit timestamp.
 */
(function(){
 'use strict';
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
   .toLowerCase().replace(/[^a-z0-9]/g,'');
 const tracked=new Set(['chicotedevinha','folhanavalha','chicotesemarea','vinewhip']);
 const log={version:'82.0',scheduled:0,suppressed:0,last:null};
 const old=BattleEngine.prototype.useMove;
 BattleEngine.prototype.useMove=function(slot){
  const before=new Set(this.v359Attacks||[]);
  const oldFallbacks=new Set(this.v47MissingCollisions||[]);
  const oldContacts=new Set(this.v47ContactToLand||[]);
  const result=old.apply(this,arguments);
  if(result===false||!battle?.active||battle.paused)return result;
  const cast=(this.v359Attacks||[]).findLast(fx=>fx&&!before.has(fx)&&
     fx.battle===battle&&fx.owner===current()&&tracked.has(normalize(fx.move?.name))&&
     fx.hits===0&&Number.isFinite(fx.at)&&fx.duration>0);
  if(!cast)return result;
  const settings=window.PokemonTorreEquippedFourPreviewV82?.timings;
  const ratio=settings?.contacts?.[cast.move.name];
  if(!Number.isFinite(ratio)||!settings||settings.speed!==2.8)return result;
  const visualMs=Math.max(400,cast.duration)*settings.speed;
  const impactMs=visualMs*ratio;
  cast.times=[impactMs/cast.duration];
  cast.end=Math.max(cast.end||0,cast.at+visualMs+240);
  cast.v82Synced=true;
  cast.v82ImpactAt=cast.at+impactMs;
  const beforeFallbacks=this.v47MissingCollisions?.length||0;
  if(beforeFallbacks){
   this.v47MissingCollisions=this.v47MissingCollisions.filter(f=>
     oldFallbacks.has(f)||normalize(f.name)!==normalize(cast.move.name)||
     f.owner!==cast.owner||f.victim!==cast.target);
  }
  const beforeContacts=this.v47ContactToLand?.length||0;
  if(beforeContacts){
   this.v47ContactToLand=this.v47ContactToLand.filter(f=>
     oldContacts.has(f)||normalize(f.name)!==normalize(cast.move.name)||
     f.owner!==cast.owner||f.victim!==cast.target);
  }
  log.scheduled++;
  log.suppressed+=(beforeFallbacks-(this.v47MissingCollisions?.length||0))+
    (beforeContacts-(this.v47ContactToLand?.length||0));
  log.last={name:cast.move.name,impactAt:cast.v82ImpactAt,visualUntil:cast.at+visualMs,
    duration:cast.duration,hitTimes:cast.times.length};
  return result;
 };
 window.PokemonTorreGrassImpactV82=()=>({...log,last:log.last&&{...log.last}});
})();
