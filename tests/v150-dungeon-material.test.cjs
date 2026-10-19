'use strict';
// V150 in-game dungeon surface: cached blue/lava terrain; V149/V147 rollback.
// Run in GitHub Pages CI without adding a browser or second renderer.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const scene=fs.readFileSync('effects/arena/chamber-v148.js','utf8');
const pixi=fs.readFileSync('effects/moves/_runtime/pixi-layer.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const approved=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
assert.equal(approved.moves.length,48,'approved attacks are untouchable');
assert.match(html,/v150-material-stone-crystal-flame/);
assert.match(html,/v151-video-arena-pixi/); // shared Pixi bridge remains loaded; V150 fallback preserved
assert.match(scene,/v150Material/);assert.match(scene,/v150Architecture/);
assert.match(scene,/v150Crystalline/);assert.match(scene,/arena150/);
assert.match(pixi,/const chamber150=window.PokemonTorreArenaV148\?\.version==='150\.0'/);
assert.match(pixi,/a\.lamps\[0\]\.alpha=.*hot/);
assert.doesNotMatch(scene,/requestAnimationFrame|new PIXI\.Application|drawAttack\(/);
const run=(search='',w=940,h=1040)=>{
 const metrics={canvas:0,paint:0,gradients:0,particles:0,polygons:0,fill:0};
 const g={fillStyle:'',strokeStyle:'',lineWidth:1,globalAlpha:1,
  save(){},restore(){},translate(){},scale(){},rotate(){},setTransform(){},
  beginPath(){metrics.polygons++},moveTo(){},lineTo(){},closePath(){},stroke(){metrics.paint++},
  fill(){metrics.paint++},arc(){},ellipse(){},fillRect(){metrics.fill++},
  createLinearGradient(){metrics.gradients++;return{addColorStop(){}}},
  createRadialGradient(){metrics.gradients++;return{addColorStop(){}}}
 };
 const document={createElement(tag){assert.equal(tag,'canvas');metrics.canvas++;
  return{getContext(){return g},width:0,height:0,complete:false,naturalWidth:0,naturalHeight:0};}};
 const native={width:w,height:h,original:true};
 class BattleEngine{
  constructor(){this.w=w;this.h=h;this.bg=null;this.player={x:220,y:540};this.enemy={x:740,y:480};this.calls=0;}
  generateBackdrop(){this.calls++;this.bg=native;return 'native';}
 }
 const window={};
 vm.runInNewContext(scene,{BattleEngine,window,document,location:{search},URLSearchParams,Math,console},{timeout:8000});
 const engine=new BattleEngine();
 return {engine,metrics,window,native};
};
for(const query of ['?arena148=0','?safe=1','?lighting146=0','?arena_preview=off']){
 const x=run(query);x.engine.generateBackdrop();assert.equal(x.engine.bg,x.native);
 assert.equal(x.metrics.canvas,0,'disabled backdrop must not allocate');
}
for(const query of ['?v=150','?arena148=lava&v=150','?arena150=0&v=150','?arena148=lava&arena150=0&v=150']){
 const x=run(query);x.engine.generateBackdrop();const d=x.window.PokemonTorreArenaV148.diagnostics();
 const enhanced=!query.includes('arena150=0');
 const fire=query.includes('arena148=lava');
 assert.equal(d.failures,0,query+' generated without exceptions');
 assert.equal(x.window.PokemonTorreArenaV148.theme,fire?'lava':'ice');
 assert.equal(x.window.PokemonTorreArenaV148.version,enhanced?'150.0':'149.0');
 assert.equal(d.materialChips>2100,enhanced,'material texture count');
 assert.equal(d.columns,enhanced?4:0,'architecture rollback');
 assert.equal(d.braziers,enhanced&&fire?4:0,'volcanic braziers only');
 assert.equal(d.reflectionRays,enhanced?96:0,'stone floor reflections');
 assert.ok(d.tiles>300&&d.walls>=100&&d.crystals===4);
 assert.equal(x.engine.player.x,220,'native player coordinate');
 assert.equal(x.engine.enemy.y,480,'native opponent coordinate');
 assert.equal(x.engine.bg.width,940);assert.equal(x.engine.bg.height,1040);
 assert.equal(x.metrics.canvas,1,'one cached backdrop canvas');
 const art=x.engine.bg,draws=x.metrics.paint,rects=x.metrics.fill;
 x.engine.generateBackdrop();assert.equal(x.engine.bg,art,'one identical cached background');
 assert.equal(x.metrics.paint,draws,'never repaint on next battle frame');
 assert.equal(x.metrics.fill,rects,'no repeated rasterization');
 assert.equal(x.window.PokemonTorreArenaV148.diagnostics().hits,1);
 x.engine.w=720;x.engine.h=1180;x.engine.generateBackdrop();
 assert.equal(x.engine.bg.width,720);assert.equal(x.engine.bg.height,1180);
 assert.equal(x.window.PokemonTorreArenaV148.diagnostics().failures,0);
 console.log('PASS V150',query,'textures:',d.materialChips,'lights:',d.reflectionRays,'static and rollback safe');
}
console.log('PASS V150: dungeon terrain and real-world coordinates preserved; GPU lights reuse Pixi layer.');
