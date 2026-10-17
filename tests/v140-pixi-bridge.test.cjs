'use strict';
/* V140: regression reproducing the REAL lexical-scope boundary. The Pixi
 * renderer is installed inside the V35 modular IIFE; the four Flying moves
 * are appended outside that IIFE by index.html. No global pixiFX is allowed.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const pixi=fs.readFileSync('effects/moves/_runtime/pixi-layer.js','utf8');
const flying=fs.readFileSync('effects/moves/v136-flying-pixel/runtime.js','utf8');
const html=fs.readFileSync('index.html','utf8');
assert.doesNotThrow(()=>new vm.Script(pixi));
assert.doesNotThrow(()=>new vm.Script(flying));
assert.ok(html.indexOf('effects/moves/_runtime/pixi-layer.js')<html.indexOf("effects/moves/v136-flying-pixel/runtime.js"));
assert.match(html,/build=v142-hd-alpha/);
const window={PokemonTorreV360Paint:()=>false};
const stageScope={window,Map,WeakMap,console};
vm.runInNewContext('(function(){\n'+pixi+'\n})();',stageScope,{timeout:3000});
const exported=window.PokemonTorrePixelFlyingBridge;
assert.equal(typeof exported?.mountPixelFlying,'function','Pixi bridge is visible outside private V35 scope');
assert.equal(typeof exported?.diagnostics,'function');
assert.equal(stageScope.pixiFX,undefined,'private pixiFX must not leak as a global');
let calls=0;
window.PokemonTorrePixelFlyingBridge={
 mountPixelFlying:(engine,fx,spec)=>{calls++;assert.equal(spec.name,'Rajada');return true;},
 diagnostics:()=>({gpu:true,error:''})
};
function Image(){this.naturalWidth=0;this.naturalHeight=0;
 Object.defineProperty(this,'src',{set(v){this._src=v;
 this.naturalWidth=2048;this.naturalHeight=v.includes('/roost/')||v.includes('/peck/')?512:768;
 this.onload?.();}});}
const battle={active:true,energy:100},mon={hp:100};
const moves=['Roost','Rajada','Air Slash','Bicada'].map(name=>({name,cd:1200,cost:10}));
const cooldowns=[0,0,0,0];
class BattleEngine{
 constructor(){this.player={x:100,y:200};this.enemy={x:300,y:160};
 this.h=420;this.canvas={isConnected:true};this.v359Attacks=[];}
 useMove(slot){cooldowns[slot]=2000;const move=moves[slot];
 const fx={move,at:1000,end:2000,duration:1000,battle,
 from:[100,160],to:[300,140],times:[.65],hits:0};this.v359Attacks.push(fx);
 return true;}
}
const document={getElementById:()=>null};
const context={window,Image,BattleEngine,battle,document,performance:{now:()=>1000},
 location:{search:''},URLSearchParams,skillSet:()=>moves,current:()=>mon,foe:()=>mon,cooldowns,console};
vm.runInNewContext(flying,context,{timeout:3000}); // NO 'pixiFX' in context
const engine=new BattleEngine();
assert.equal(engine.useMove(1),true);
assert.equal(calls,1,'Rajada GPU mount must work without lexical access to pixiFX');
const fx=engine.v359Attacks[0];
assert.equal(window.PokemonTorreV360Paint({},fx,1100,engine),true);
assert.equal(calls,2,'Rajada GPU repaint must work across V35 scope boundary');
assert.equal(document.getElementById('pixelFlyingGpuNotice'),null);
assert.equal(window.PokemonTorreFlyingPixelV136.diagnostics().mounted,1);
console.log('PASS V140: exported PixiJS battle bridge resolves the previously invisible Flying attacks without a Canvas fallback.');
