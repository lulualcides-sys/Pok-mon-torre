/* V119 · Camera/hit synchronization AFTER verified native damage.
 * Uses existing hit flash, rings and animation. Approved move VFX untouched.
 */
(()=>{
'use strict';
if(new URLSearchParams(location.search).get('kanto119')==='0')return;
const stats={hits:0,frames:0,physical:0,special:0,darkFrames:0};
const oldHit=BattleEngine.prototype.hitTarget;
BattleEngine.prototype.hitTarget=function(side,type,power){
 const mon=side==='enemy'?(typeof foe==='function'?foe():null):(typeof current==='function'?current():null);
 const hp=Number(mon?.hp);
 const result=oldHit.apply(this,arguments);
 const dealt=Number.isFinite(hp)?Math.max(0,hp-(Number(mon?.hp)||0)):0;
 if(dealt>0&&battle?.active){
  const cat=['normal','fighting','rock','ground','steel','bug','flying','dark'].includes(type)?'physical':'special';
  stats.hits++;stats[cat]++;
  const now=performance.now();
  this.v119Impact={at:now,until:now+210,kind:cat,type,dealt};
  // Camera intensity is restrained, so no screen tearing in mobile.
  this.shake=Math.min(6.5,Math.max(this.shake||0,cat==='physical'?4.0:3.0));
 }
 return result;
};
const oldDraw=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(now){
 const result=oldDraw.apply(this,arguments);
 const fx=this.v119Impact;
 if(!fx||!battle?.active||!this.ctx)return result;
 const t=Math.max(0,Math.min(1,1-(performance.now()-fx.at)/210));
 if(t<=0){this.v119Impact=null;return result;}
 const ctx=this.ctx;
 ctx.save();
 try{
  ctx.globalAlpha=(fx.kind==='physical'?.060:.045)*t*t;
  ctx.fillStyle=fx.kind==='physical'?'#fff0ce':'#d5e4ff';
  ctx.fillRect(0,0,this.w,this.h);
  stats.frames++;
 }finally{ctx.restore();}
 return result;
};
window.PokemonTorreCinemaV119=Object.freeze({installed:true,previewOnly:false,official:true,
 diagnostics:()=>({...stats,nativeDamagePreserved:true,approvedMoveEffectsUntouched:true})});
})();