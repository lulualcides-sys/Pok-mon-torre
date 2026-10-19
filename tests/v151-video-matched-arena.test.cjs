'use strict';
/* Archived video-based experiment V151, no longer the default,
 * blue and molten maps, video-like floor and safe preserved gameplay.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const scene=read('effects/arena/video-v151.js');
const html=read('index.html');
const pixi=read('effects/moves/_runtime/pixi-layer.js');
const camera=read('effects/arena/wide-camera-v98.js');
const approved=JSON.parse(read('effects/moves/STATUS_APROVADOS.json'));
assert.equal(approved.moves.length,48);
assert.ok(approved.moves.every(e=>e.protect),'protected approved attacks must remain untouched');
assert.match(html,/effects\/arena\/video-v151\.js/);
assert.match(html,/v151-1-video-textured-stone/);
assert.match(html,/get\('arena151'\)!=='1'/); // V150 default
assert.match(html,/get\('arena151'\)==='1'/); // archived V151 opt-in
assert.match(html,/effects\/arena\/chamber-v148\.js/);
assert.match(html,/effects\/arena\/stadium-arena-v97\.js/);
assert.match(pixi,/PokemonTorreArenaV151/);
assert.match(scene,/function footageMaterial\(g\)/);
assert.match(scene,/putImageData\(img,0,0\)/);
assert.match(scene,/g\.drawImage\(filmed/);
assert.match(pixi,/const chamber151=window\.PokemonTorreArenaV151/);
assert.match(camera,/WORLD_FACTOR=1\.55/);
assert.doesNotMatch(scene,/requestAnimationFrame|setInterval|new PIXI\.Application|drawAttack|drawMon|renderBattle/);
function env(search='',w=900,h=850){
 const seen={grad:0,draw:0,paths:0,canvas:0,frame:0};
 const g={save(){},restore(){},translate(){},scale(){},rotate(){},setTransform(){},
  beginPath(){seen.paths++},moveTo(){},lineTo(){},closePath(){},stroke(){seen.draw++},
  fill(){seen.draw++},ellipse(){},arc(){},fillRect(){seen.draw++},
  createLinearGradient(){seen.grad++;return{addColorStop(){}}},
  createRadialGradient(){seen.grad++;return{addColorStop(){}}}};
 const document={createElement(name){
  assert.equal(name,'canvas');seen.canvas++;
  return{getContext:()=>g,width:0,height:0,naturalWidth:0,naturalHeight:0,complete:false};
 }};
 const base={width:w,height:h,old:true};
 class BE {
  constructor(){this.w=w;this.h=h;this.bg=null;this.player={x:200,y:370};this.enemy={x:720,y:380};}
  generateBackdrop(){this.bg=base;return 'native';}
 }
 const window={};const ctx={window,document,BattleEngine:BE,location:{search},URLSearchParams,Math,console};
 vm.runInNewContext(scene,ctx,{timeout:6000});
 return {seen,BE,window,base};
}
for(const q of ['?arena151=0','?v=152','?safe=1','?arena148=0','?lighting146=0','?arena_preview=off']){
 const x=env(q);const b=new x.BE();b.generateBackdrop();
 assert.equal(b.bg,x.base);assert.equal(x.seen.canvas,0,'rollback no allocations');
}
for(const q of ['?arena151=1&v=151','?arena151=1&arena148=lava&v=151']){
 const x=env(q),b=new x.BE();b.generateBackdrop();const first=b.bg;
 const d=x.window.PokemonTorreArenaV151.diagnostics();
 assert.equal(x.window.PokemonTorreArenaV151.enabled,true);
 assert.equal(x.window.PokemonTorreArenaV151.version,'151.0');
 assert.equal(d.theme,q.includes('lava')?'lava':'blue');
 assert.equal(d.builds,1);assert.equal(d.failures,0);
 assert.equal(x.seen.canvas,1);assert.ok(x.seen.draw>1700,'video material drawn');
 assert.ok(d.tiles>=170);assert.ok(d.masonry>=100);
 assert.ok(d.props>=10);
 assert.equal(d.motes,q.includes('lava')?0:57);
 assert.equal(b.player.x,200);assert.equal(b.enemy.y,380);
 assert.equal(first.width,900);assert.equal(first.height,850);
 b.generateBackdrop();assert.equal(b.bg,first);assert.equal(x.seen.canvas,1);
 assert.equal(x.window.PokemonTorreArenaV151.diagnostics().hits,1);
 b.w=660;b.h=1060;b.generateBackdrop();
 assert.equal(b.bg.width,660);assert.equal(b.bg.height,1060);
 assert.equal(x.window.PokemonTorreArenaV151.diagnostics().builds,2);
 console.log('PASS V151',q,'video palette, orthographic floor, compact crystals/torches; unchanged battle, camera and cache');
}
console.log('PASS video-referenced arena V151 with blue and lava, V150 rollback and saved effects.');
