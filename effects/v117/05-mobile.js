/* V117 | 05 — measured mobile budgets: DPR, particle work and sprite LRU.
 * No new animation loop and no edits to protected VFX spritesheets.
 */
(()=>{
'use strict';
const mode117=new URLSearchParams(location.search).get('kanto117');
if(mode117==='off'||(mode117!==null&&mode117!=='1'))return;
const mobile=/Android|iPhone|Mobile/i.test(navigator?.userAgent||'');
const stats={mobile,resizes:0,adjustments:0,particlesTrimmed:0,assetsEvicted:0,
 fpsSamples:[],dprSamples:[],mode:new URLSearchParams(location.search).get('safe')==='1'?'safe':'normal'};
const cap=mobile?(stats.mode==='safe'?1:1.35):2;
const baseResize=BattleEngine.prototype.resize;
BattleEngine.prototype.resize=function(){
 const ret=baseResize.apply(this,arguments);
 if(!mobile||!this.canvas||!this.ctx)return ret;
 const expected=Math.min(cap,this.dpr);
 if(this.dpr>expected+.001){
  this.dpr=expected;this.canvas.width=Math.round(this.w*expected);
  this.canvas.height=Math.round(this.h*expected);
  this.ctx.setTransform(expected,0,0,expected,0,0);
  stats.resizes++;
 }
 return ret;
};
const oldFrame=BattleEngine.prototype.frame;
BattleEngine.prototype.frame=function(now){
 const out=oldFrame.apply(this,arguments);
 if(!this.running||!mobile)return out;
 const count=Number(this.frames)||0;
 // Native engine measures FPS; only sample about every 5 seconds.
 if(!(this._v117LastMeasure>0)||now-this._v117LastMeasure>=5000){
  this._v117LastMeasure=now;
  const fps=Number(this.fps)||60;
  stats.fpsSamples.push(fps);if(stats.fpsSamples.length>24)stats.fpsSamples.shift();
  stats.dprSamples.push(this.dpr);if(stats.dprSamples.length>24)stats.dprSamples.shift();
  if(fps<40){
   // Legacy particles are separate from already-approved move sprite FX.
   if(this.particles?.length>120){
    stats.particlesTrimmed+=this.particles.length-120;
    this.particles.splice(0,this.particles.length-120);
   }
   if(this.dpr>1.05&&this.ctx&&this.canvas&&now-(this._v117LastAdjust||0)>12000){
    this.dpr=Math.max(1,Math.round((this.dpr-.17)*100)/100);
    this.canvas.width=Math.round(this.w*this.dpr);
    this.canvas.height=Math.round(this.h*this.dpr);
    this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);
    this._v117LastAdjust=now;stats.adjustments++;
   }
  }
  // Prune only non-active Pokemon artwork, not sprites currently on screen.
  if(this.assets?.size>14){
   const active=new Set([typeof current==='function'?current()?.id:0,typeof foe==='function'?foe()?.id:0]);
   for(const key of this.assets.keys()){
    if(this.assets.size<=12)break;
    if(!active.has(key)){this.assets.delete(key);stats.assetsEvicted++;}
   }
  }
 }
 return out;
};
window.PokemonTorreMobileV117=Object.freeze({
 installed:true,previewOnly:false,approved:true,diagnostics:()=>({...stats,
   measured:stats.fpsSamples.length>0,latestFps:stats.fpsSamples.at(-1)||null})
});
})();