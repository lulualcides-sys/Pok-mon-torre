/* V144 — authentic user-provided Flying sprites; PixiJS/WebGL only.
 * Independent preview of Bico Broca, Vendaval, Aerocorte, Pique.
 * No Canvas2D drawing, no Python generator, no CSS art. Preserve V143 saved FX.
 * User source: pixel_fx_sheet_blue_background.png (Library).
 */
(()=>{
'use strict';
const query=new URLSearchParams(location.search);
if(query.get('safe')==='1'||query.get('flying144')==='0'||window.PokemonTorreFlyingOriginalV144?.installed)return;
const specs=[
 {name:'Bico Broca',aliases:[],frameStart:0,frames:8,frameSize:96,ms:1270,scale:1.08,effectKind:'contact',flying144:true,particles:false},
 {name:'Vendaval',aliases:[],frameStart:8,frames:8,frameSize:96,ms:1610,scale:1.02,effectKind:'area',flying144:true,particles:false},
 {name:'Aerocorte',aliases:[],frameStart:16,frames:8,frameSize:96,ms:1270,scale:1.16,effectKind:'projectile',flying144:true,particles:false},
 {name:'Pique',aliases:[],frameStart:24,frames:8,frameSize:96,ms:1070,scale:1.03,effectKind:'contact',flying144:true,particles:false}
];
const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const byName=new Map(),state={installed:true,ready:0,mounted:0,casts:0,retries:0,errors:[],preview:true};
for(const spec of specs){
 for(const alias of [spec.name,...spec.aliases])byName.set(norm(alias),spec);
 spec.loaded=false;
 spec.image=new Image();
 spec.image.decoding='async';
 spec.image.onload=()=>{spec.loaded=spec.image.naturalWidth===768&&spec.image.naturalHeight===384;
  if(spec.loaded)state.ready++;else state.errors.push(spec.name+': invalid atlas dimensions');};
 spec.image.onerror=()=>state.errors.push(spec.name+': user-supplied atlas unavailable');
 spec.image.src='effects/moves/v144-flying-original/atlas.png?v=144-user-sprites';
}
const canvasBefore=window.PokemonTorreV360Paint;
const fxStarted=new WeakSet();
function mount(engine,fx,spec){
 if(!spec.loaded){state.retries++;return false;}
 const bridge=window.PokemonTorrePixelFlyingBridge;
 if(!bridge||typeof bridge.mountPixelFlying!=='function'){state.errors.push('Pixi bridge missing');return false;}
 const result=bridge.mountPixelFlying(engine,fx,spec);
 if(result&&!fxStarted.has(fx)){fxStarted.add(fx);state.mounted++;}
 return result;
}
window.PokemonTorreFlyingOriginalV144=Object.freeze({
 installed:true,preview:true,source:'user-provided sprite pixels — no generated shapes',
 moves:specs.map(x=>x.name),
 hasMove:name=>byName.has(norm(name)),
 diagnostics:()=>({...state,loaded:specs.filter(x=>x.loaded).map(x=>x.name)})
});
if(typeof BattleEngine!=='function')return;
window.PokemonTorreV360Paint=function(ctx,fx,now,engine){
 const spec=byName.get(norm(fx?.move?.name));
 if(!spec||!fx||!engine||fx.battle!==battle)return typeof canvasBefore==='function'?canvasBefore.apply(this,arguments):false;
 if(battle?.active&&now<fx.end&&engine.canvas?.isConnected!==false)mount(engine,fx,spec);
 return true; // real WebGL sprites replace legacy generic 2D paint ONLY here
};
const beforeUse=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(slot){
 const move=battle?.active&&Number.isInteger(slot)?skillSet(current())?.[slot]:null;
 const spec=byName.get(norm(move?.name));
 if(!spec)return beforeUse.apply(this,arguments);
 const known=new Set(this.v359Attacks||[]);
 const result=beforeUse.apply(this,arguments);
 if(result===false||!battle?.active)return result;
 const fx=(this.v359Attacks||[]).find(e=>!known.has(e)&&e.battle===battle&&norm(e.move?.name)===norm(move.name));
 if(fx){fx.duration=spec.ms;fx.end=fx.at+spec.ms;state.casts++;mount(this,fx,spec);}
 return result;
};
})();
