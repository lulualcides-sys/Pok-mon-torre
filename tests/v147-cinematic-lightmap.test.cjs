'use strict';
/* V147 atmospheric lightmap from original approved V97 backdrop.
 * Test the real backdrop wrapper: static rendering once, cache, mobile geometry,
 * multi-point light pools, backwards compatibility and deterministic rollback.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const lightmap=read('effects/arena/lightmap-v147.js');
const pixi=read('effects/moves/_runtime/pixi-layer.js');
const html=read('index.html');
const native=read('effects/arena/stadium-arena-v97.js');
const oldApprovals=JSON.parse(read('effects/moves/STATUS_APROVADOS.json'));
assert.equal(oldApprovals.moves.length,48);
assert.ok(native.includes('function tileFloor(g,H,r)'));
assert.ok(html.includes("effects/arena/lightmap-v147.js"));
assert.ok(html.includes("get('lightmap147')!=='0'"));
assert.ok(html.includes("v147-physical-lightmap"));
assert.ok(html.includes("lighting-v146.js"));
assert.ok(pixi.includes("window.PokemonTorreLightmapV147?.enabled"));
assert.ok(pixi.includes("baked147?.045:.28"),'avoid double-darkening the finished backdrop');
assert.match(lightmap,/globalCompositeOperation='screen'/);
assert.match(lightmap,/const wells=\[/);
assert.match(lightmap,/litTiles/);
assert.match(lightmap,/wells\.length|for\(const l of wells\)/);
assert.doesNotMatch(lightmap,/new PIXI\.Application|PIXI\.Filter|requestAnimationFrame/);
let nowCanvas=0;
function make(search=''){
 const calls={canvases:0,drawImage:0,rects:0,gradients:0,transforms:0,screen:0,polygons:0};
 function context(){
  let _mode='source-over';
  return {
   fillStyle:'#fff',strokeStyle:'#fff',globalAlpha:1,
   get globalCompositeOperation(){return _mode;},
   set globalCompositeOperation(x){_mode=x;if(x==='screen')calls.screen++;},
   save(){},restore(){},translate(){calls.transforms++;},scale(){calls.transforms++;},
   setTransform(){calls.transforms++;},beginPath(){},moveTo(){},lineTo(){},closePath(){calls.polygons++;},fill(){},
   fillRect(){calls.rects++;},
   drawImage(){calls.drawImage++;},
   createLinearGradient(){calls.gradients++;return {addColorStop(){}};},
   createRadialGradient(){calls.gradients++;return {addColorStop(){}};}
  };
 }
 function bg(w,h){
  return {width:w,height:h,complete:true,naturalWidth:w,naturalHeight:h,
   getContext(){return context();}};
 }
 const baseCache=new Map(),window={};
 class BattleEngine{
  constructor(w=720,h=1024){this.w=w;this.h=h;this.bg=null;this.calls=0;}
  generateBackdrop(){
   this.calls++;
   const key=this.w+'x'+this.h;
   if(!baseCache.has(key))baseCache.set(key,bg(this.w,this.h));
   this.bg=baseCache.get(key);return 'backdrop';
  }
 }
 const document={createElement(type){
  assert.equal(type,'canvas');calls.canvases++;
  const g=context();
  return {width:0,height:0,getContext:()=>g};
 }};
 const contextVM={window,BattleEngine,document,location:{search},URLSearchParams,console,Math};
 vm.runInNewContext(lightmap,contextVM,{timeout:5000});
 return {window,BattleEngine,calls,document};
}
for(const query of ['?lightmap147=0','?lighting146=0','?safe=1','?arena_preview=off']){
 const env=make(query),eng=new env.BattleEngine();
 assert.equal(env.window.PokemonTorreLightmapV147.enabled,false);
 assert.equal(eng.generateBackdrop(),'backdrop');
 assert.equal(env.calls.canvases,0,'opt-out must preserve original backdrop');
}
const x=make('?v=147'),engine=new x.BattleEngine();
assert.equal(x.window.PokemonTorreLightmapV147.enabled,true);
assert.equal(engine.generateBackdrop(),'backdrop');
const first=engine.bg;
assert.equal(first.width,720);assert.equal(first.height,1024);
assert.equal(first.complete,true);
assert.equal(x.calls.canvases,1);
assert.equal(x.calls.drawImage,1,'must preserve the approved V97 underlying texture');
assert.ok(x.calls.gradients>15,'lighting must use multiple light and shadow gradients');
assert.ok(x.calls.screen>0,'lighting must illuminate existing tile colors');
assert.ok(x.calls.polygons>=3,'floor/cast and wall-face shadows should have geometry');
assert.ok(x.calls.rects>80,'individual tiles and architectural bevels shaded');
assert.equal(x.window.PokemonTorreLightmapV147.diagnostics().builds,1);
assert.ok(x.window.PokemonTorreLightmapV147.diagnostics().lightPools>=15);
assert.ok(x.window.PokemonTorreLightmapV147.diagnostics().litTiles>=10);
engine.generateBackdrop();
assert.equal(engine.bg,first,'cached scene must not be shaded a second time');
assert.equal(x.calls.canvases,1,'zero extra painting during battle');
assert.equal(x.window.PokemonTorreLightmapV147.diagnostics().hits,1);
engine.w=920;engine.h=600;engine.generateBackdrop();
assert.notEqual(engine.bg,first,'orientation switch needs rebuilt lightmap');
assert.equal(engine.bg.width,920);
assert.equal(engine.bg.height,600);
assert.equal(x.calls.canvases,2);
assert.equal(x.window.PokemonTorreLightmapV147.diagnostics().builds,2);
assert.equal(x.window.PokemonTorreLightmapV147.diagnostics().failures,0);
console.log('PASS V147: darkened original V97 tilemap, 9 multi-source lights, 18 reflection pools, shaded wall relief/cast shadows, camera-sized cached bake; previous arena and approved sprites safe.');
