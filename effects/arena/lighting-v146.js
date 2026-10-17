/* Pokemon Torre V146 — scene lighting above original tiles, via ONE Pixi stage.
 * Backdrop V97/V98, approved moves, native hit timing & HUD are untouched.
 * Diagnostic rollback: ?lighting146=0 (or ?safe=1 or ?arena_preview=off).
 */
(()=>{
'use strict';
if(typeof BattleEngine!=='function'||window.PokemonTorreLightingV146?.installed)return;
const q=new URLSearchParams(location.search);
const enabled=q.get('lighting146')!=='0'&&q.get('safe')!=='1'&&
 q.get('arena_preview')!=='off';
window.PokemonTorreLightingV146Active=enabled;
const diag={calls:0,active:enabled,success:0,misses:0,frames:0};
const nativeDraw=BattleEngine.prototype.draw;
if(enabled)BattleEngine.prototype.draw=function(now){
 const result=nativeDraw.apply(this,arguments);
 // Throttle readiness checks; the WebGL Pixi ticker handles light updates.
 const stamp=Number.isFinite(now)?now:performance.now();
 if(battle?.active&&this.canvas?.isConnected&&stamp-(this._light146LastTry||0)>115){
  this._light146LastTry=stamp;diag.calls++;
  const bridge=window.PokemonTorrePixelFlyingBridge;
  try{
   if(bridge?.frameLighting146?.(this))diag.success++;
   else diag.misses++;
  }catch(error){diag.misses++;diag.lastError=String(error?.message||error);}
 }
 return result;
};
window.PokemonTorreLightingV146=Object.freeze({
 installed:true,enabled,
 reference:'PokéSouls mood: warm lamps, cyan reflections, navy ambience, contact occlusion',
 engine:'shared PixiJS v7 WebGL GPU stage; no extra WebGL context',
 affects:'environment color + contact shadows + spell light only',
 rollback:'?lighting146=0',
 diagnostics:()=>({...diag,renderer:window.PokemonTorrePixelFlyingBridge?.diagnostics?.()||null})
});
})();
