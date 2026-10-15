'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const script=fs.readFileSync('effects/arena/stadium-arena-v97.js','utf8');
const html=fs.readFileSync('index.html','utf8');
assert.ok(html.includes("effects/arena/stadium-arena-v97.js"));
assert.ok(html.includes("get('arena_preview')==='cinematic'"));
assert.ok(!html.includes("const path='effects/arena/cinematic-arena-v96.js'"));
function simulate(query,size){
 const calls={canvas:0,arcs:0,lines:0,gradient:0,tiles:0};
 const gradient={addColorStop(){}};
 const ctx={
  fillStyle:'#000',strokeStyle:'#000',lineWidth:1,globalAlpha:1,
  beginPath(){},moveTo(){},lineTo(){calls.lines++},closePath(){},
  fill(){},stroke(){},save(){},restore(){},rect(){},clip(){},
  arc(){calls.arcs++},fillRect(x,y,w,h){if(w>20&&h<12)calls.tiles++},
  strokeRect(){},roundRect(){},translate(){},rotate(){},setTransform(){},
  createLinearGradient(){calls.gradient++;return gradient},
  createRadialGradient(){calls.gradient++;return gradient}
 };
 const document={createElement(t){assert.equal(t,'canvas');calls.canvas++;
  return{width:0,height:0,complete:false,naturalWidth:0,naturalHeight:0,
   getContext:()=>ctx};
 }};
 const oldBG={complete:true,naturalWidth:960,name:'gym original'};
 class BattleEngine{
  constructor(){this.w=size[0];this.h=size[1];this.bg=oldBG;this.draws=0;}
  generateBackdrop(){this.bg=oldBG;return true}
  draw(){this.draws++;return this.bg}
 }
 const window={},location={search:query};
 vm.runInNewContext(script,{BattleEngine,window,document,location,URLSearchParams,Math,console});
 const game=new BattleEngine();game.generateBackdrop();game.draw(0);
 return{window,game,calls,oldBG};
}
const original=simulate('?arena_preview=off',[720,1000]);
assert.equal(original.window.PokemonTorreArenaV97.enabled,false);
assert.equal(original.game.bg,original.oldBG);
assert.equal(original.calls.canvas,0);
const good=simulate('?arena_preview=cinematic',[720,1050]);
const {game,window,calls}=good;
assert.equal(window.PokemonTorreArenaV97.enabled,true);
assert.equal(game.bg.width,720);
assert.equal(game.bg.height,1050);
assert.equal(game.bg.naturalWidth,720);
const d=window.PokemonTorreArenaV97.diagnostics();
assert.equal(d.builds,1);
assert.equal(d.emblems,2);
assert.equal(d.treeShapes,0);
assert.ok(d.tiles>300,'Must render real cyan floor tiles');
assert.ok(calls.gradient>=5,'Must have contrasting metal, tiled floor, light');
assert.ok(calls.arcs>=8,'Must render golden technological floor emblems');
assert.equal(d.draws,1);
assert.equal(d.failures,0);
const before=game.bg;
game.generateBackdrop();
assert.equal(game.bg,before,'Backdrop must be cached, not repainted at 60FPS');
assert.ok(window.PokemonTorreArenaV97.diagnostics().cacheHits>=1);
game.w=620;game.h=900;game.generateBackdrop();
assert.notEqual(game.bg,before,'Orientation/viewport resize needs refreshed scene');
assert.equal(window.PokemonTorreArenaV97.diagnostics().builds,2);
assert.equal(game.bg.width,620);assert.equal(game.bg.height,900);
console.log('PASS V97: cyan squared tiled stadium, metal border, stairs, two gold seals, no trees/ring, cache, portrait geometry, original arena preserved');
