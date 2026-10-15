'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync('effects/arena/cinematic-arena-v96.js','utf8');
const idx=fs.readFileSync('index.html','utf8');
assert.ok(idx.includes("get('arena_preview')==='cinematic'"));
assert.ok(idx.includes('effects/arena/stadium-arena-v97.js'), 'Video-style stadium must replace V96 forest preview');
function makeScene(preview){
 let made=0,polygons=0,trees=0,brushes=0,gradients=0;
 const context={
  globalAlpha:1,
  save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},
  closePath(){polygons++},fill(){brushes++},stroke(){},
  fillRect(){},clip(){},ellipse(){},translate(){},rotate(){},
  setTransform(){},
  createLinearGradient(){gradients++;return{addColorStop(){}}},
  createRadialGradient(){gradients++;return{addColorStop(){}}}
 };
 const document={createElement(type){
  assert.equal(type,'canvas');made++;
  return {width:0,height:0,getContext:()=>context};
 }};
 const window={};
 const oldBG={complete:true,naturalWidth:640,kind:'original'};
 class BattleEngine {
  constructor(){this.w=640;this.h=400;this.bg=oldBG;this.canvas={};this.count=0;}
  generateBackdrop(){this.bg=oldBG}
  draw(){this.count++;assert.ok(this.bg?.complete);
   assert.ok(this.bg?.naturalWidth);return this.bg}
 }
 const location={search:preview?'?arena_preview=cinematic':'?build=normal'};
 vm.runInNewContext(src,{window,location,document,BattleEngine,console,Math,URLSearchParams});
 const e=new BattleEngine();e.generateBackdrop();e.draw(100);
 return{module:window.PokemonTorreArenaV96,engine:e,
  canvasCount:made,polygons,brushes,gradients};
}
const old=makeScene(false);
assert.equal(old.module.enabled,false);
assert.equal(old.engine.bg.kind,'original');
assert.equal(old.canvasCount,0,'No canvas work in normal game');
const preview=makeScene(true);
assert.equal(preview.module.enabled,true);
assert.equal(preview.engine.bg.complete,true);
assert.equal(preview.engine.bg.naturalWidth,640);
assert.equal(preview.engine.bg.naturalHeight,400);
assert.equal(preview.module.diagnostics().builds,1);
assert.ok(preview.brushes>200&&preview.polygons>60&&preview.gradients>=2,
 'Arena should have detailed ground, vegetation and cinematographic lighting');
const earlier=preview.engine.bg;
preview.engine.generateBackdrop();
assert.equal(preview.engine.bg,earlier,'Scene should be cached between battle instances');
assert.ok(preview.module.diagnostics().cacheHits>=1);
preview.engine.w=520;preview.engine.h=330;preview.engine.generateBackdrop();
assert.notEqual(preview.engine.bg,earlier,'Scene adapts to mobile viewports');
assert.equal(preview.module.diagnostics().builds,2);
assert.equal(preview.module.diagnostics().failures,0);
console.log('PASS V96: Forest arena 2D cinema in live battle background path, cached, viewport aware, normal arena preserved');
