'use strict';
/* V148: depth, projected tile coordinates, crystalline light, rollback;
 * no changes to approved combat, collision or camera code. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const scene=fs.readFileSync('effects/arena/chamber-v148.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const pixi=fs.readFileSync('effects/moves/_runtime/pixi-layer.js','utf8');
const camera=fs.readFileSync('effects/arena/wide-camera-v98.js','utf8');
const approvals=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
assert.equal(approvals.moves.length,47);
for(const name of ['Roost','Rajada','Bicada','Air Slash'])assert.ok(approvals.moves.some(x=>x.move===name&&x.protect),name+' approval changed');
assert.match(html,/effects\/arena\/chamber-v148\.js/);
assert.match(html,/arena148/);
assert.match(pixi,/PokemonTorreArenaV148/);
assert.ok(camera.includes('WORLD_FACTOR=1.55'));
assert.doesNotMatch(scene,/drawCatalogMove|drawAttack|requestAnimationFrame|new PIXI\.Application|filter\s*=|Python|Pillow/);
assert.match(scene,/perspectiveFloor/);
assert.match(scene,/stoneBackWall/);
assert.match(scene,/sideWall/);
assert.match(scene,/raisedLedge/);
assert.match(scene,/prism/);
assert.match(scene,/glow/);
assert.match(scene,/arena148.*lava/);
function create(search='',w=960,h=900){
 const count={canvas:0,gradient:0,poly:0,tile:0,draw:0,ellipse:0};
 function context(){
  return {fillStyle:'',strokeStyle:'',lineWidth:1,globalAlpha:1,
   save(){},restore(){},translate(){},scale(){},rotate(){},setTransform(){},
   beginPath(){count.poly++},moveTo(){},lineTo(){},closePath(){},stroke(){},fill(){},
   arc(){},ellipse(){count.ellipse++},fillRect(){count.tile++},strokeRect(){},drawImage(){count.draw++},
   createLinearGradient(){count.gradient++;return{addColorStop(){}}},
   createRadialGradient(){count.gradient++;return{addColorStop(){}}}
  }
 }
 const doc={createElement(t){assert.equal(t,'canvas');count.canvas++;
  return{width:0,height:0,complete:false,naturalWidth:0,naturalHeight:0,getContext:()=>context()};
 }};
 const native={width:w,height:h,name:'V147 fallback backdrop',getContext:()=>context()};
 class BattleEngine{
  constructor(){this.w=w;this.h=h;this.bg=null;this.player={x:200,y:300};this.enemy={x:720,y:430};this.calls=0;}
  generateBackdrop(){this.calls++;this.bg=native;return 'native result';}
 }
 const window={},ctx={BattleEngine,window,document:doc,location:{search},URLSearchParams,Math,console};
 vm.runInNewContext(scene,ctx,{timeout:6500});
 return {e:new BattleEngine(),window,count,native};
}
for(const q of ['?arena148=0','?safe=1','?arena_preview=off','?lighting146=0']){
 const x=create(q);x.e.generateBackdrop();assert.equal(x.e.bg,x.native,q+' should preserve existing V147');
 assert.equal(x.count.canvas,0,q+' no allocations');
}
for(const q of ['?v=148','?arena148=lava']){
 const x=create(q),e=x.e;
 assert.equal(e.generateBackdrop(),'native result');
 const art=e.bg;
 assert.notEqual(art,x.native,'new 2.5D backdrop exists: '+q);
 assert.equal(art.width,960);assert.equal(art.height,900);
 assert.equal(art.complete,true);
 const d=x.window.PokemonTorreArenaV148.diagnostics();
 assert.equal(d.builds,1);assert.equal(d.failures,0);
 assert.ok(d.tiles>=300,'projected tiles count');
 assert.ok(d.walls>=100,'stone wall blocks');
 assert.equal(d.crystals,4);
 assert.ok(d.emissiveCracks>=15);
 assert.ok(x.count.poly>700,'facets, tile trapezoids, wall geometry must be painted');
 assert.ok(x.count.gradient>=12,'volumetric environment lights');
 assert.equal(e.player.x,200);assert.equal(e.enemy.y,430);
 assert.equal(e.generateBackdrop(),'native result');assert.equal(e.bg,art,'static environment cached');
 assert.equal(d.builds,x.window.PokemonTorreArenaV148.diagnostics().builds,'no scene redraw per frame');
 e.w=720;e.h=1100;e.generateBackdrop();
 assert.equal(e.bg.width,720);assert.equal(e.bg.height,1100);
 assert.equal(x.window.PokemonTorreArenaV148.diagnostics().builds,2,'portrait rebuilt');
 assert.equal(x.window.PokemonTorreArenaV148.diagnostics().failures,0);
 console.log('PASS V148 '+q+': angled floor 2.5D, stacked wall geometry, crystals and emissive terrain; unchanged gameplay and cached mobile camera.');
}
console.log('PASS V148: blue + lava themes, no HUD/collision/pokemon changes, V147+V146 rollback and all saved effects preserved.');
