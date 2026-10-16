/* V111 mobile frame-time optimization: no second battle loop and no
 * arbitrary 30 FPS cap. Reduce high-DPI raster fill work and expensive
 * 12.5 Hz DOM HUD refresh. Physics & V104 move timings remain unchanged.
 */
window.PokemonTorreMobilePerfV111=(()=>{
 'use strict';
 const mobile=()=>/Android|iPhone|iPad|Mobile/i.test(navigator?.userAgent||'')||
  !!window.matchMedia?.('(pointer: coarse)')?.matches;
 let resizing=0,hudSkipped=0,hudRuns=0,lastResize=null;
 const originalResize=BattleEngine.prototype.resize;
 BattleEngine.prototype.resize=function(){
  const value=originalResize.apply(this,arguments);
  const max=mobile()?1.25:1.65;
  if(this.dpr>max&&this.canvas&&this.ctx){
   this.dpr=max;
   this.canvas.width=Math.max(1,Math.round(this.w*max));
   this.canvas.height=Math.max(1,Math.round(this.h*max));
   this.ctx.setTransform(max,0,0,max,0,0);
   resizing++;
  }
  lastResize={width:this.w,height:this.h,dpr:this.dpr,pixels:this.canvas.width*this.canvas.height};
  return value;
 };
 const originalHud=BattleEngine.prototype.updateHud;
 BattleEngine.prototype.updateHud=function(now){
  const clock=Number.isFinite(now)?now:performance.now();
  // ~6-8 DOM refreshes/sec is smooth and dramatically cheaper on Android.
  if(this.__v111HudTime!=null&&clock-this.__v111HudTime<142){hudSkipped++;return;}
  this.__v111HudTime=clock;hudRuns++;
  return originalHud.apply(this,arguments);
 };
 return {diagnostics:()=>({version:'111.0',mobile:mobile(),resizing,
  hudSkipped,hudRuns,lastResize,
  currentFps:typeof engine!=='undefined'&&engine?.running?engine.fps:null,
  activeDpr:typeof engine!=='undefined'?engine?.dpr:null})};
})();
