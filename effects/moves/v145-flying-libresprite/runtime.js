/* V145 — editable LibreSprite animations of original Flying sprites; PixiJS/WebGL only.
 * Independent preview of Bico Broca, Vendaval, Aerocorte, Pique.
 * No Canvas2D drawing, no Python generator, no CSS art. Preserve V143 saved FX.
 * Source: editable 16-frame .aseprite files; PNG exported by LibreSprite 1.3.
 */
(()=>{
'use strict';
const query=new URLSearchParams(location.search);
if(query.get('safe')==='1'||query.get('flying145')==='0'||window.PokemonTorreFlyingLibreV145?.installed)return;
const specs=[
 {name:'Bico Broca',aliases:[],dir:'bico-broca',frameStart:0,frames:16,frameSize:128,ms:1270,scale:.84,effectKind:'contact',flying145:true,particles:false},
 {name:'Vendaval',aliases:[],dir:'vendaval',frameStart:0,frames:16,frameSize:128,ms:1610,scale:.86,effectKind:'area',flying145:true,particles:false},
 {name:'Aerocorte',aliases:[],dir:'aerocorte',frameStart:0,frames:16,frameSize:128,ms:1270,scale:.82,effectKind:'projectile',flying145:true,particles:false},
 {name:'Pique',aliases:[],dir:'pique',frameStart:0,frames:16,frameSize:128,ms:1070,scale:.78,effectKind:'contact',flying145:true,particles:false}
];
const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const byName=new Map(),state={installed:true,ready:0,mounted:0,casts:0,retries:0,errors:[],preview:true};
for(const spec of specs){
 for(const alias of [spec.name,...spec.aliases])byName.set(norm(alias),spec);
 spec.loaded=false;
 spec.image=new Image();
 spec.image.decoding='async';
 spec.image.onload=()=>{spec.loaded=spec.image.naturalWidth===1024&&spec.image.naturalHeight===256;
  if(spec.loaded)state.ready++;else state.errors.push(spec.name+': invalid atlas dimensions');};
 spec.image.onerror=()=>state.errors.push(spec.name+': LibreSprite export unavailable');
 spec.image.src='effects/moves/v145-flying-libresprite/'+spec.dir+'/sheet.png?v=145-libresprite-originals';
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
window.PokemonTorreFlyingLibreV145=Object.freeze({
 installed:true,preview:true,source:'16 original-pixel frames per move, editable .aseprite and LibreSprite batch export',
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
