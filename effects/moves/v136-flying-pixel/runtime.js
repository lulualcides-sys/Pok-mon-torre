/* V137 PIXEL-ART FLYING MOVES — WebGL-only PixiJS + Particle Emitter.
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
const state={installed:true,previewOnly,officialLoad:!previewOnly,renderer:'PixiJS WebGL',particleSystem:'@pixi/particle-emitter',
 ready:0,failures:[],casts:0,queued:0,mounted:0,suppressed2D:0,frames:0,
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
 spec.image.onerror=()=>{state.failures.push(spec.name+': spritesheet not served');};
 spec.image.src=base+spec.dir+'/spritesheet.png?v=138-black-pixel';
}
window.PokemonTorreFlyingPixelV136=Object.freeze({
 installed:true,previewOnly,officialLoad:!previewOnly,moves:specs.map(s=>s.name),
 hasMove:(name)=>lookup.has(norm(name)),
 diagnostics:()=>({...state,loaded:specs.filter(s=>s.loaded).map(s=>s.name),
  protected:['Osso','Grande Fissura','Garra de Areia','Soco de Terra','Lança de Areia','Fenda Rasa']})
});
if(typeof BattleEngine!=='function')return;
function mount(engine,fx,spec){
 if(!spec.loaded||typeof pixiFX==='undefined'||
    typeof pixiFX.mountPixelFlying!=='function')return false;
 const ok=pixiFX.mountPixelFlying(engine,fx,spec);
 if(ok&&!cast.get(fx)){cast.set(fx,true);state.mounted++;}
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
const useBefore=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(slot){
 const move=battle?.active&&Number.isInteger(slot)?skillSet(current())?.[slot]:null,
       spec=lookup.get(norm(move?.name));
 if(!spec)return useBefore.apply(this,arguments);
 const before=new Set(this.v359Attacks||[]);
 const result=useBefore.apply(this,arguments);
 if(result===false||!battle?.active)return result;
 const fx=(this.v359Attacks||[]).find(e=>!before.has(e)&&e.battle===battle&&
   norm(e.move?.name)===norm(move.name));
 if(fx){
  // Native original V359 hit at times[0], one event only. No heal/damage here.
  fx.duration=spec.ms;fx.end=fx.at+spec.ms;state.casts++;
  if(!mount(this,fx,spec))state.queued++;
 }
 return result;
};
})();