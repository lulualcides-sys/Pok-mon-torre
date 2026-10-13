/* V42.1 combat bridge: preserve V41 and replace old fire/status animations. */
(function(){
'use strict';
const K=fireSpriteV41;
const stats={casts:0,frames:0,lastMove:'',lastError:'',removedLegacy:0};
const correctedKeys=new Set(['fireBlast','sunnyDay','willOWisp']);
const legacyArrays=['v3568StatusFX','v3580Visuals','v356FX','v352FX','v352OtherFX','v343Named','v344Fx'];
function scrubReplacedEffects(engine){
 for(const prop of legacyArrays){
  const items=engine[prop];if(!Array.isArray(items)||!items.length)continue;
  const kept=items.filter(f=>!correctedKeys.has(K.resolve(f)?.key));
  if(kept.length!==items.length){stats.removedLegacy+=items.length-kept.length;engine[prop]=kept;}
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
 // Prevent old unlabelled orange particles from these replacement status moves.
 const oldParticles={};
 if(descriptor.stickToTarget||descriptor.weather){
  for(const prop of ['particles','rings','v26Particles']){
   if(Array.isArray(this[prop]))oldParticles[prop]=this[prop].length;
  }
 }
 const result=previousUse.apply(this,arguments);
 const active=b===battle&&b?.active;
 const accepted=active&&(result!==false)&&(
  b.energy<cost||(cooldowns[slot]||0)>now&&(cooldowns[slot]||0)!==oldCooldown||
  (this.v359Attacks?.length||0)>oldQueue
 );
 if(!accepted)return result;
 if(descriptor.stickToTarget||descriptor.weather){
  for(const [prop,before] of Object.entries(oldParticles)){
   if(Array.isArray(this[prop])&&this[prop].length>before){
    stats.removedLegacy+=this[prop].length-before;
    this[prop].length=before;
   }
  }
 }
 scrubReplacedEffects(this);
 const length=descriptor.duration;
 const event={at:now,end:now+length,duration:length,battle:b,move:{name:move.name},owner:mon,
  from:[this.player.x,this.player.y-this.h*.13],to:[this.enemy.x,this.enemy.y-this.h*.12]};
 this.v41FireVisuals=(this.v41FireVisuals||[]).filter(f=>f.battle===b&&f.end>now);
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
 const active=valid?queued.filter(f=>f.battle===battle&&f.end>now&&f.owner===current()):[];
 this.v41FireVisuals=active;
 // The older status animation can be queued again during combat updates.
 if(active.some(f=>correctedKeys.has(K.resolve(f)?.key)))scrubReplacedEffects(this);
 for(const fx of active){
  if(K.resolve(fx)?.stickToTarget&&this.enemy){
   // Keep the spectral flames on top of the foe even if it moves or dodges.
   fx.to=[this.enemy.x,this.enemy.y-Math.max(26,(this.h||560)*.12)];
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
 try{result=previousDraw.call(this,now);}
 finally{if(actor&&contact){actor.x=originalX;actor.y=originalY;}}
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
 tag.textContent='SPRITES FOGO V42.1';
}
markVersion();
window.PokemonTorreFireSpriteV41=()=>({
 version:'41.0',engine:'frame-by-frame source GIF atlas 75 frames',
 ...K.diagnostics(),casts:stats.casts,drawEvents:stats.frames,
 active:(engine?.v41FireVisuals||[]).length,lastMove:stats.lastMove,error:stats.lastError||K.diagnostics().error
});
window.PokemonTorreFireSpriteV42=()=>({
 ...window.PokemonTorreFireSpriteV41(),
 version:'42.1',
 newMoves:['Fire Blast','Will-O-Wisp','Sunny Day','Brasa'],
 previousMovesPreserved:['Chamas de Moltres','Rajada Flamejante','Chama Circular','Garra de Fogo'],
 willOWispFollowsEnemy:true,suppressedLegacy:stats.removedLegacy
});
})();
