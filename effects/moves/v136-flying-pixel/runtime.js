/* V140 PIXEL-ART FLYING MOVES — WebGL-only PixiJS + Particle Emitter.
 * Activates all four real pixel spritesheets in normal battles; V135 rejected.
 * Sprite atlases: real 12/16-frame nearest-neighbour pixel animation generated
 * by tools/build-v136-flying-pixel.py. No CanvasRenderingContext2D drawing,
 * no CSS VFX, no still-image effect, no extra renderer or requestAnimationFrame.
 */
(()=>{
'use strict';
const query=new URLSearchParams(location.search);
if(query.get('flying136')==='0'||query.get('flying135')==='preview'||
   query.get('safe')==='1')return;
const previewOnly=query.get('flying136')==='pixel';
if(window.PokemonTorreFlyingPixelV136?.installed)return;
const base='effects/moves/v136-flying-pixel/';
const specs=[
 {name:'Roost',aliases:['Pousar'],dir:'roost',frames:12,ms:1580,scale:1.15,particles:true},
 {name:'Rajada',aliases:['Gust'],dir:'gust',frames:16,ms:1390,scale:1.35,particles:true},
 {name:'Air Slash',aliases:['Airslash','Corte Aéreo'],dir:'air-slash',frames:16,ms:1510,scale:1.32,particles:true},
 {name:'Bicada',aliases:['Peck'],dir:'peck',frames:12,ms:1150,scale:1.07,particles:false}
];
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .toLowerCase().replace(/[^a-z0-9]/g,'');
const lookup=new Map(),cast=new WeakMap();
let fallbackStarted=false,lastWarning='';
function warning(message){
 if(typeof document==='undefined')return;
 // Visible diagnostic instead of pretending the GPU sprite was painted.
 // Text HUD is not an attack animation and does not use Canvas2D/CSS VFX.
 if(lastWarning===message)return;
 lastWarning=message;
 const arena=document.getElementById('arenaPro');
 if(!arena)return;
 let note=document.getElementById('pixelFlyingGpuNotice');
 if(!note){note=document.createElement('div');note.id='pixelFlyingGpuNotice';
  note.style.cssText='position:absolute;left:50%;top:54%;transform:translate(-50%,-50%);z-index:10000;color:#fff;background:#111c27f0;border:1px solid #f6d88b;border-radius:8px;padding:6px 10px;font:600 11px system-ui;max-width:80%;text-align:center;pointer-events:none';
  arena.appendChild(note);}
 note.textContent='Pixel V140: '+message;
}
function clearWarning(){
 lastWarning='';
 if(typeof document==='undefined')return;
 document.getElementById('pixelFlyingGpuNotice')?.remove();
}
function loadGpuFallback(){
 if(fallbackStarted||window.PIXI?.Application)return;
 fallbackStarted=true;
 const urls=[
  'https://unpkg.com/pixi.js@7.4.3/dist/pixi.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.4.3/pixi.min.js'
 ];
 function next(i){
  if(window.PIXI?.Application){
   const emitter=document.createElement('script');
   emitter.src='https://unpkg.com/@pixi/particle-emitter@5.0.10/dist/particle-emitter.min.js';
   emitter.async=true;document.head.appendChild(emitter);
   return;
  }
  if(i>=urls.length){state.failures.push('PixiJS indisponível após dois CDNs');warning('WebGL/PixiJS não carregou neste navegador');return;}
  const script=document.createElement('script');
  script.src=urls[i];script.async=true;
  script.onload=()=>window.PIXI?.Application?next(i+1):next(i+1);
  script.onerror=()=>next(i+1);
  document.head.appendChild(script);
 }
 next(0);
}
const state={installed:true,previewOnly,officialLoad:!previewOnly,renderer:'PixiJS WebGL',particleSystem:'@pixi/particle-emitter',
 ready:0,failures:[],casts:0,queued:0,mounted:0,suppressed2D:0,frames:0,visualStatusCasts:0,loadRetries:0,lastMountFailure:null,
 pixelPalette:'near-black with one-pixel silver contrast rim',particlePalette:'black'};
for(const spec of specs){
 for(const alias of [spec.name,...spec.aliases]){
  const key=norm(alias),other=lookup.get(key);
  if(other&&other!==spec)throw Error('V136 duplicate move alias '+alias);
  lookup.set(key,spec);
 }
 spec.loaded=false;
 spec.image=new Image();
 spec.image.decoding='async';
 spec.image.onload=()=>{spec.loaded=spec.image.naturalWidth===512&&
    spec.image.naturalHeight===64*Math.ceil(spec.frames/8);
   if(spec.loaded)state.ready++;
   else state.failures.push(spec.name+': sprite dimensions invalid');
 };
 spec.image.onerror=()=>{
  state.failures.push(spec.name+': spritesheet not served');
  warning(spec.name+': spritesheet não encontrado (verifique conexão)');
 };
 spec.image.src=base+spec.dir+'/spritesheet.png?v=139-visible-gpu';
}
window.PokemonTorreFlyingPixelV136=Object.freeze({
 installed:true,previewOnly,officialLoad:!previewOnly,moves:specs.map(s=>s.name),
 hasMove:(name)=>lookup.has(norm(name)),
 diagnostics:()=>({...state,loaded:specs.filter(s=>s.loaded).map(s=>s.name),
  protected:['Osso','Grande Fissura','Garra de Areia','Soco de Terra','Lança de Areia','Fenda Rasa']})
});
if(typeof BattleEngine!=='function')return;
function mount(engine,fx,spec){
 if(!spec.loaded){
  state.loadRetries++;
  state.lastMountFailure=spec.name+': spritesheet ainda carregando';
  return false;
 }
 // The shared PixiJS renderer lives inside the V35 IIFE. Access its explicit
 // battle-scoped window bridge; lexical 'pixiFX' is NOT visible here.
 const bridge=window.PokemonTorrePixelFlyingBridge;
 if(!bridge||typeof bridge.mountPixelFlying!=='function'){
  state.lastMountFailure=spec.name+': ponte PixiJS não instalada';
  loadGpuFallback();
  warning('ponte PixiJS indisponível para '+spec.name);
  return false;
 }
 const ok=bridge.mountPixelFlying(engine,fx,spec);
 if(ok){
  if(!cast.get(fx)){cast.set(fx,true);state.mounted++;}
  state.lastMountFailure=null;
  clearWarning();
 }else{
  const diagnosis=typeof bridge.diagnostics==='function'?bridge.diagnostics():null;
  state.lastMountFailure=spec.name+': '+(diagnosis?.error||'GPU stage not ready');
  if(!window.PIXI?.Application)loadGpuFallback();
  if(diagnosis?.error||!window.PIXI?.Application)
   warning('falha GPU: '+(diagnosis?.error||'PixiJS não carregado'));
 }
 return ok;
}
const paintBefore=window.PokemonTorreV360Paint;
window.PokemonTorreV360Paint=function(ctx,fx,now,engine){
 const spec=lookup.get(norm(fx?.move?.name));
 if(!spec||!fx||!engine||fx.battle!==battle){
  return typeof paintBefore==='function'?paintBefore.apply(this,arguments):false;
 }
 // Old visual Canvas2D painter NEVER handles one of these four.
 state.suppressed2D++;
 if(battle?.active&&now<fx.end&&engine.canvas?.isConnected!==false)
  mount(engine,fx,spec);
 return true;
};
// Status moves like Roost are handled by the NATIVE engine without emitting a
// V359 damaging attack event. Add a PURELY VISUAL zero-hit cue to the same
// attack-animation list. Roost recovery stays 100% owned by original gameplay.
function addStatusVisual(engine,move,spec,b){
 const at=performance.now();
 const cue={kind:'pixel-flying-status',move,at,end:at+spec.ms,duration:spec.ms,
  battle:b,owner:current(),target:foe(),hits:0,times:[],
  from:[engine.player.x,engine.player.y-(engine.h||420)*.13],
  to:[engine.enemy.x,engine.enemy.y-(engine.h||420)*.12]};
 if(!Array.isArray(engine.v359Attacks))engine.v359Attacks=[];
 engine.v359Attacks.push(cue);
 engine.v359Attacks=engine.v359Attacks.slice(-16);
 state.visualStatusCasts++;
 return cue;
}
const useBefore=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(slot){
 const move=battle?.active&&Number.isInteger(slot)?skillSet(current())?.[slot]:null,
       spec=lookup.get(norm(move?.name));
 if(!spec)return useBefore.apply(this,arguments);
 const before=new Set(this.v359Attacks||[]);
 const beforeEnergy=battle.energy;
 const beforeCD=typeof cooldowns!=='undefined'&&Array.isArray(cooldowns)?
  Number(cooldowns[slot])||0:null;
 const result=useBefore.apply(this,arguments);
 if(result===false||!battle?.active)return result;
 let fx=(this.v359Attacks||[]).find(e=>!before.has(e)&&e.battle===battle&&
   norm(e.move?.name)===norm(move.name));
 if(!fx&&norm(move.name)==='roost'){
  // Status engine returns undefined even on SUCCESS. Guard cooldown/energy
  // to prevent creating a fake healing visual for a blocked cast.
  const afterCD=beforeCD!==null?Number(cooldowns[slot])||0:null;
  const succeeded=beforeCD===null?(result===true||battle.energy<beforeEnergy):
   afterCD>beforeCD;
  if(succeeded)fx=addStatusVisual(this,move,spec,battle);
 }
 if(fx){
  // Native original V359 hit at times[0], one event only. No heal/damage here.
  fx.duration=spec.ms;fx.end=fx.at+spec.ms;state.casts++;
  if(!mount(this,fx,spec))state.queued++;
 }
 return result;
};
})();