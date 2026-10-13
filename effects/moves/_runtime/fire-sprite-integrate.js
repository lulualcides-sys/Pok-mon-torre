/* V42.5: isolate blue Will-O-Wisp over the foe; Sunny Day uses a real sun sprite. */
(function(){
'use strict';
const K=fireSpriteV41;
const stats={casts:0,frames:0,lastMove:'',lastError:'',removedLegacy:0,overlapPrevented:0,hiddenNearEnemy:0};
// Only these three visual replacements are controlled; gameplay status stays intact.
const correctedKeys=new Set(['fireBlast','sunnyDay','willOWisp']);
const statusKeys=new Set(['sunnyDay','willOWisp']);
// Weather mechanics may remain active, but the SUN and BLUE STATUS visual overlays
// must never run concurrently. Other fire move timelines stay unchanged.
function isExclusiveStatus(f){return statusKeys.has(K.resolve(f)?.key);}
function keepOnlyCurrentStatus(events){
 const selected=events.filter(isExclusiveStatus);
 if(selected.length<=1)return events;
 let latest=selected[0];
 for(const f of selected.slice(1))if((f.at||0)>=(latest.at||0))latest=f;
 const filtered=events.filter(f=>!isExclusiveStatus(f)||f===latest);
 stats.overlapPrevented+=events.length-filtered.length;
 return filtered;
}
const legacyArrays=[
 'v3568StatusFX','v3580Visuals','v356FX','v352FX','v352OtherFX',
 'v343Named','v344Fx','v342StatusFx','v351Effects','v346Attacks',
 'v354SpecialAttacks','v343StatusFx','v344StatusFX',
 'v25StatusFX','v26StatusFX','v30StatusFX','v32WeatherFX','v348StatusFX'
];
const castOnlyVisuals=['particles','rings','v26Particles','v19Impacts','v19Beams'];
function moveKey(f){
 if(!f||typeof f!=='object')return '';
 const candidates=[f.move?.name,f.move,f.name,f.moveName,f.skillName,
  f.attackName,f.skill?.name,f.attack?.name,f.originalMove,f.moveId,f.id,
  f.label,f.statusName,f.sourceMove,f.sourceMoveName,f.meta?.moveName];
 for(const name of candidates){
  if(typeof name!=='string')continue;
  const found=K.resolve({name});
  if(found)return found.key;
 }
 return '';
}
function scrubReplacedEffects(engine,excludeOnlyActiveStatus=false){
 for(const prop of legacyArrays){
  const items=engine[prop];if(!Array.isArray(items)||!items.length)continue;
  const kept=items.filter(f=>{
   const k=moveKey(f);
   return !(excludeOnlyActiveStatus?statusKeys:correctedKeys).has(k);
  });
  if(kept.length!==items.length){
   stats.removedLegacy+=items.length-kept.length;
   engine[prop]=kept;
  }
 }
}
function snapshotCastVisuals(engine){
 const snapshot={};
 for(const prop of [...castOnlyVisuals,...legacyArrays]){
  snapshot[prop]=Array.isArray(engine[prop])?engine[prop].slice():[];
 }
 return snapshot;
}
function revertStatusCastVisuals(engine,snapshot){
 // The old status renderer generates unlabelled particles and impact rings.
 // Remove only visual entries born during this accepted cast. Never touch damage,
 // target status, energy, cooldowns, enemy projectiles, weather, or HP.
 for(const [prop,previous] of Object.entries(snapshot)){
  if(!Array.isArray(engine[prop]))continue;
  const now=engine[prop];
  if(now.length>previous.length){
   stats.removedLegacy+=now.length-previous.length;
   engine[prop]=previous.slice();
  }
 }
}

// Will-O-Wisp owns the opponent's immediate visual space while blue fire is up.
// Suppress other short-lived combat VISUALS there, without deleting projectiles,
// altering HP/damage, or delaying enemy attacks. All original lists are restored
// after rendering, so update() and the rules engine remain fully untouched.
const enemyVisualLists=['particles','rings','v19Impacts','v19Beams','v26Particles','projectiles'];
function nearEnemyVisual(item,enemy,h){
 if(!item||!enemy)return false;
 const x=Number(item.x),y=Number(item.y);
 if(!Number.isFinite(x)||!Number.isFinite(y))return false;
 const centerY=enemy.y-h*.065;
 const rx=Math.max(56,h*.155),ry=Math.max(69,h*.175);
 const dx=(x-enemy.x)/rx,dy=(y-centerY)/ry;
 return dx*dx+dy*dy<=1;
}
function paintBehindBlueOnly(engine,paint){
 const enemy=engine.enemy;
 if(!enemy)return paint();
 const h=engine.h||560,original=Object.create(null);
 let storedEnemyAttack=null,attackHidden=false;
 for(const list of enemyVisualLists){
  const items=engine[list];
  if(!Array.isArray(items)||!items.length)continue;
  const filtered=items.filter(item=>!nearEnemyVisual(item,enemy,h));
  if(filtered.length<items.length){
   original[list]=items;
   engine[list]=filtered;
   stats.hiddenNearEnemy+=items.length-filtered.length;
  }
 }
 // Do not overlay the yellow/white Attack pose arcs on the blue spectral flame.
 // This only masks the actor's drawing timer, not an attack or its damage.
 if(engine.attackActs && Number.isFinite(engine.attackActs.enemy)){
  storedEnemyAttack=engine.attackActs.enemy;
  engine.attackActs.enemy=-1;
  attackHidden=true;
 }
 try{return paint();}
 finally{
  for(const list of Object.keys(original))engine[list]=original[list];
  if(attackHidden)engine.attackActs.enemy=storedEnemyAttack;
 }
}

const previousPainter=window.PokemonTorreV360Paint;
window.PokemonTorreV360Paint=function(g,fx,now,engine){
 if(K.resolve(fx))return true; // no duplicate generic effect
 return typeof previousPainter==='function'?previousPainter(g,fx,now,engine):false;
};
const previousUse=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(slot){
 const b=battle,mon=b?.active?current():null,move=mon&&Number.isInteger(slot)?skillSet(mon)?.[slot]:null;
 const descriptor=K.resolve(move);
 if(!descriptor)return previousUse.apply(this,arguments);
 const now=performance.now(),cost=b.energy,oldCooldown=cooldowns[slot]||0;
 const oldQueue=this.v359Attacks?.length||0;
 // Snapshot ONLY the status-move cast VFX; the original game still applies
 // Will-O-Wisp's condition and Sunny Day's weather through previousUse.
 const visualSnapshot=descriptor.status?snapshotCastVisuals(this):null;
 const result=previousUse.apply(this,arguments);
 const active=b===battle&&b?.active;
 const accepted=active&&(result!==false)&&(
  b.energy<cost||(cooldowns[slot]||0)>now&&(cooldowns[slot]||0)!==oldCooldown||
  (this.v359Attacks?.length||0)>oldQueue
 );
 if(!accepted)return result;
 if(visualSnapshot)revertStatusCastVisuals(this,visualSnapshot);
 scrubReplacedEffects(this);
 const length=descriptor.duration;
 const event={at:now,end:now+length,duration:length,battle:b,move:{name:move.name},owner:mon,
  from:[this.player.x,this.player.y-this.h*.13],to:[this.enemy.x,this.enemy.y-this.h*.12],
  target:descriptor.stickToTarget?foe():null};
 this.v41FireVisuals=(this.v41FireVisuals||[]).filter(f=>f.battle===b&&f.end>now);
 if(isExclusiveStatus(event)){
  // A newly cast Will-O-Wisp cancels only Sunny Day's old on-screen SUN
  // animation (or a previous wisp animation), and vice versa.
  // Do not touch battle.v32Weather, damage, cooldowns or other statuses.
  const before=this.v41FireVisuals.length;
  this.v41FireVisuals=this.v41FireVisuals.filter(f=>!isExclusiveStatus(f));
  stats.overlapPrevented+=before-this.v41FireVisuals.length;
 }
 this.v41FireVisuals.push(event);
 this.v41FireVisuals=this.v41FireVisuals.slice(-8);
 // Legacy catalog status queue must not overlay these four new pixel-art effects.
 if(Array.isArray(this.v3580Visuals))
  this.v3580Visuals=this.v3580Visuals.filter(f=>!K.resolve(f));
 if(descriptor.status && Array.isArray(this.v3568StatusFX))
  this.v3568StatusFX=this.v3568StatusFX.filter(f=>!K.resolve(f));
 stats.casts++;stats.lastMove=move.name;
 return result;
};
const previousDraw=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(now){
 const valid=!!battle?.active;
 const queued=this.v41FireVisuals||[];
 const active=valid?keepOnlyCurrentStatus(queued.filter(f=>
  f.battle===battle&&f.end>now&&f.owner===current()&&
  (!K.resolve(f)?.stickToTarget||f.target===foe())
 )):[];
 this.v41FireVisuals=active;
 // The older status animation can be queued again during combat updates.
 if(active.some(f=>correctedKeys.has(K.resolve(f)?.key)))scrubReplacedEffects(this);
 for(const fx of active){
  if(K.resolve(fx)?.stickToTarget&&this.enemy){
   // Keep the spectral flames on top of the foe even if it moves or dodges.
   fx.to=[this.enemy.x,this.enemy.y-Math.max(13,(this.h||560)*.028)];
  }
 }
 const actor=this.player,target=this.enemy,originalX=actor?.x,originalY=actor?.y;
 // Only Fire Claw moves the actual attacker. The sprite itself remains small.
 const contact=active.findLast?.(f=>K.resolve(f)?.contact) ||
   [...active].reverse().find(f=>K.resolve(f)?.contact);
 if(contact&&actor&&target){
  const t=K.clamp((now-contact.at)/contact.duration);
  const reach=K.ease((t-.08)/.35)*(1-K.ease((t-.64)/.23));
  const dx=target.x-actor.x,dy=target.y-actor.y,len=Math.hypot(dx,dy)||1;
  const distance=Math.max(0,len-Math.max(42,this.h*.09))*reach;
  actor.x+=dx/len*distance;
  actor.y+=dy/len*distance;
 }
 let result;
 try{
  const wispActive=active.some(f=>K.resolve(f)?.key==='willOWisp');
  result=wispActive
   ?paintBehindBlueOnly(this,()=>previousDraw.call(this,now))
   :previousDraw.call(this,now);
 }finally{
  if(actor&&contact){actor.x=originalX;actor.y=originalY;}
  // Some old painters queue their status VFX during draw(). Purge after rendering
  // as well, so they cannot be replayed in subsequent frames.
  if(active.some(f=>statusKeys.has(K.resolve(f)?.key)))scrubReplacedEffects(this,true);
 }
 if(!valid||!this.ctx)return result;
 for(const fx of active){
  if(K.paint(this.ctx,fx,now,this))stats.frames++;
 }
 return result;
};
function markVersion(){
 const tag=document.getElementById('ptFireSpriteV41Badge')||document.createElement('span');
 if(!tag.id){
  tag.id='ptFireSpriteV41Badge';
  tag.style.cssText='position:fixed;bottom:6px;left:6px;z-index:2147483637;padding:3px 6px;border-radius:5px;background:#102335;color:#b9ddf5;font:700 10px system-ui;pointer-events:none';
  document.body.appendChild(tag);
 }
 tag.textContent='SPRITES FOGO V42.5';
}
markVersion();
window.PokemonTorreFireSpriteV41=()=>({
 version:'41.0',engine:'frame-by-frame source GIF atlas 75 frames',
 ...K.diagnostics(),casts:stats.casts,drawEvents:stats.frames,
 active:(engine?.v41FireVisuals||[]).length,lastMove:stats.lastMove,error:stats.lastError||K.diagnostics().error
});
window.PokemonTorreFireSpriteV42=()=>({
 ...window.PokemonTorreFireSpriteV41(),
 version:'42.5',
 newMoves:['Fire Blast','Will-O-Wisp','Sunny Day','Brasa'],
 previousMovesPreserved:['Chamas de Moltres','Rajada Flamejante','Chama Circular','Garra de Fogo'],
 willOWispFollowsEnemy:true,suppressedLegacy:stats.removedLegacy,
 overlapPrevented:stats.overlapPrevented,hiddenNearEnemy:stats.hiddenNearEnemy,
 exclusiveStatusVisuals:['Sunny Day','Will-O-Wisp']
});
})();
