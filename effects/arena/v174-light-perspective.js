/* Pokémon Torre V174 — light 2.5D without an additional WebGL context.
 * Static pixel-room perspective is baked ONCE by Pillow at deploy time.
 * Game renders the image in its EXISTING 2D battle canvas and retains native
 * PMD sprites, combat inputs, hitboxes, attacks, HP and approved effects.
 * Nothing modifies the official index.html or persistent campaign saves.
 */
(()=>{
'use strict';
const q=new URLSearchParams(location.search);
const info={installed:true,enabled:!!window.__V174_LAB,version:'174.0-light-2p5d',
 renderer:'native-battle-canvas',three:false,extraWebGLContexts:0,
 textureCount:1,staticEnvironment:true,dynamicShadowPasses:0,
 materialsReady:false,source:'assets/arena-v174/arena-light-2p5d.png',
 backdropApplied:0,mounts:0,drawFrames:0,avgFPS:0,errors:[],
 preserveApprovedMoves:true,campaignUntouched:true,sandboxOnly:true};
window.PokemonTorreV174Stage={diagnostics:()=>({...info})};
if(!window.__V174_LAB||q.get('safe')==='1'||typeof BattleEngine!=='function')return;
const raw=BattleEngine.prototype,oldBg=raw.generateBackdrop,oldDraw=raw.draw;
const oldDestroy=raw.destroy;
const stage=new Image();stage.decoding='async';
let ready=false,seen=new WeakSet(),lastSample=performance.now(),frames=0;
stage.onload=()=>{
 if(stage.naturalWidth!==960||stage.naturalHeight!==600){
  info.errors.push('Unexpected arena image dimensions '+stage.naturalWidth+'x'+stage.naturalHeight);return;
 }
 ready=true;info.materialsReady=true;
};
stage.onerror=()=>info.errors.push('V174 baked arena material missing');
stage.src='assets/arena-v174/arena-light-2p5d.png?build=v174-1';
function attach(e){
 if(!ready||!e?.canvas?.isConnected||!e.w||!e.h)return false;
 if(!seen.has(e)){seen.add(e);info.mounts++;}
 // Keep the scene as ONE background image, never a second display canvas.
 if(e.bg!==stage){e.bg=stage;info.backdropApplied++;}
 return true;
}
raw.generateBackdrop=function(){
 const res=oldBg.apply(this,arguments);
 attach(this);return res;
};
raw.draw=function(){
 try{
  attach(this);
  info.drawFrames++;
  frames++;
  const now=performance.now();
  if(now-lastSample>1100){
   info.avgFPS=Math.round(frames*1000/(now-lastSample));
   lastSample=now;frames=0;
  }
 }catch(err){if(info.errors.length<10)info.errors.push(String(err?.message||err));}
 return oldDraw.apply(this,arguments);
};
raw.destroy=function(){return oldDestroy.apply(this,arguments);};
})();