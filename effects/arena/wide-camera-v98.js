/* Pokémon Torre V98 — expanded horizontal stadium viewport and follow camera.
 * Only ?arena_preview=cinematic. V97 floor still renders inside the REAL
 * battle canvas. The arena, not individual Pokemon, becomes wider.
 * DOM battle HUD/joystick remain fixed; attacks/AI retain world coordinates.
 */
(()=>{
'use strict';
if(typeof BattleEngine!=='function')return;
if(window.PokemonTorreArenaWideV98?.installed)return;
const enabled=new URLSearchParams(location.search).get('arena_preview')==='cinematic';
const WORLD_FACTOR=1.55; // 55% more WORLD than the visible horizontal viewport
const CAMERA_RESPONSE=6;
const stats={resizes:0,draws:0,panUpdates:0,lastPan:0,
 maxPan:0,viewportW:0,worldW:0,active:false,failures:0};
const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
const safeRect=engine=>{
 const parent=engine?.canvas?.parentElement;
 if(!parent?.getBoundingClientRect)return null;
 const r=parent.getBoundingClientRect();
 if(!(r.width>200&&r.height>200))return null;
 return r;
};
const originalResize=BattleEngine.prototype.resize;
BattleEngine.prototype.resize=function(){
 if(!enabled)return originalResize.apply(this,arguments);
 const rect=safeRect(this);
 if(!rect)return originalResize.apply(this,arguments);
 const el=this.canvas;
 // CSS width changes the actual backing / battle WORLD size via engine.resize().
 // No canvas scale-up or stretching: original pixels remain pixel-perfect.
 el.style.width=(WORLD_FACTOR*100)+'%';
 el.style.maxWidth='none';
 el.style.height='100%';
 el.style.position='absolute';
 el.style.left='0';
 el.style.top='0';
 el.style.willChange='transform';
 el.style.transform='translate3d(0px,0px,0px)';
 // Internal coordinates, collision, AI, hitboxes and every projectile all
 // use the REAL larger canvas. No world-to-screen guesses or scaling hacks.
 const result=originalResize.apply(this,arguments);
 this._stadiumV98=true;
 this._stadiumViewportW=rect.width;
 this._stadiumMaxPan=Math.max(0,this.w-rect.width);
 // Maintain camera position on viewport resize without snapping to the edge.
 this._stadiumCameraX=clamp((this.player.x+this.enemy.x)*.5-rect.width*.5,
  0,this._stadiumMaxPan);
 this._stadiumLastTime=0;
 stats.resizes++;stats.active=true;
 stats.viewportW=rect.width;stats.worldW=this.w;stats.maxPan=this._stadiumMaxPan;
 el.style.transform='translate3d('+(-this._stadiumCameraX)+'px,0,0)';
 return result;
};
const normalBounds=BattleEngine.prototype.bounds;
BattleEngine.prototype.bounds=function(actor){
 if(!enabled||!this._stadiumV98)return normalBounds.apply(this,arguments);
 // Extra horizontal range is truly walkable, stopping before the physical
 // stage edge. Keep top/bottom and the existing combat physics unchanged.
 const result=normalBounds.apply(this,arguments);
 const xPad=Math.max(this.h*.037,this.w*.017);
 actor.x=clamp(actor.x,xPad,this.w-xPad);
 return result;
};
const originalDraw=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(now){
 if(enabled&&this._stadiumV98&&battle?.active){
  const viewport=this._stadiumViewportW||this.canvas.parentElement?.clientWidth||this.w;
  const limit=Math.max(0,this.w-viewport);
  const p=this.player,e=this.enemy;
  const focus=clamp(p.x*.54+e.x*.46-viewport*.5,0,limit);
  const elapsed=Number.isFinite(now)&&this._stadiumLastTime?
   clamp((now-this._stadiumLastTime)/1000,0,.06):.016;
  const ease=1-Math.exp(-CAMERA_RESPONSE*elapsed);
  const actual=this._stadiumCameraX??focus;
  const next=clamp(actual+(focus-actual)*ease,0,limit);
  this._stadiumCameraX=next;
  this._stadiumLastTime=Number.isFinite(now)?now:0;
  // Transform only the battle canvas; HTML HUD, aim and joystick stay fixed.
  this.canvas.style.transform='translate3d('+(-next.toFixed(2))+'px,0,0)';
  stats.panUpdates++;stats.lastPan=next;stats.draws++;
 }
 return originalDraw.apply(this,arguments);
};
window.PokemonTorreArenaWideV98=Object.freeze({
 installed:true,enabled,worldFactor:WORLD_FACTOR,
 diagnostics:()=>({...stats,
  current:typeof engine!=='undefined'&&engine?{
   pan:engine._stadiumCameraX||0,
   playerX:engine.player?.x,enemyX:engine.enemy?.x,
   viewportW:engine._stadiumViewportW||0,
   worldW:engine.w,
   minX:Math.max(engine.h*.037,engine.w*.017),
   maxX:engine.w-Math.max(engine.h*.037,engine.w*.017)
  }:null})
});
})();