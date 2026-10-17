'use strict';
// Actual V152 opt-in GPU pixel texture pilot. Real app/test doubles, not a
// screenshot-only change. Native game and approved moves remain untouched.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('effects/arena/blue-v152-pixi.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const approved=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
assert.equal(approved.moves.length,46);
assert.equal(approved.moves.filter(x=>x.protect).length,46);
assert.match(html,/effects\/arena\/blue-v152-pixi\.js\?build=v152-original-tileset-webgl/);
assert.match(html,/canvas\.getContext\('2d',\{alpha:true\}\)/);
assert.match(html,/get\('arena_lab'\)==='blue152'/);
assert.match(html,/get\('arena_lab'\)!=='blue152'/);
assert.match(html,/effects\/arena\/chamber-v148\.js/); // official V150 unchanged
assert.match(src,/Texture\.fromBuffer\(mem,AT,AT/);
assert.match(src,/Pixi\.BLEND_MODES\.ADD/);
assert.match(src,/stage\.dataset\.pokemonArena='blue152'/);
assert.doesNotMatch(src,/getContext\('2d'|CSSStyleSheet|new Image\(|drawImage\(|new PIXI\.Application/);
function setup(search){
 const metrics={apps:0,tex:0,draws:0,clears:0,destroys:0,created:0};
 let app;
 const host={children:[],insertBefore(el,to){this.children.unshift(el);el.isConnected=true;el.parentElement=this;}};
 const canvas={isConnected:true,parentElement:host,
  style:{width:'155%',height:'100%',left:'0px',top:'0px',transform:'translate3d(-20px,0px,0px)'}};
 host.children.push(canvas);
 const ctx={clearRect(){metrics.clears++;}};
 class Sprite{
  constructor(t){this.texture=t;this.position={x:0,y:0,set(x,y){this.x=x;this.y=y}};
   this.width=64;this.height=64;this.alpha=1;this.y=0;this.x=0;}
 }
 class Container{
  constructor(){this.children=[];this.scale={set(n){this.value=n}};this.sortableChildren=false;}
  addChild(child){this.children.push(child);return child;}
 }
 class Texture{
  constructor(base,rect){this.base=base;this.rect=rect;}
  static fromBuffer(buffer,w,h){metrics.tex++;assert.equal(buffer.length,512*512*4);
   assert.equal(w,512);assert.equal(h,512);return{baseTexture:{gpu:true}};}
 }
 class App{
  constructor(opts){metrics.apps++;app=this;this.stage=new Container();
   this.renderer={gl:{}};this.view={style:{},dataset:{},isConnected:false,remove(){this.isConnected=false;}};
   this.ticker={lastTime:0,started:true,add(fn){this.frame=fn},stop(){this.started=false},start(){this.started=true}};}
  destroy(){metrics.destroys++;}
 }
 const P={Application:App,Texture,Container,Sprite,Rectangle:class{constructor(x,y,w,h){Object.assign(this,{x,y,w,h})}},
  BLEND_MODES:{ADD:1,NORMAL:0},SCALE_MODES:{NEAREST:0}};
 function BE(){this.w=930;this.h=660;this.canvas=canvas;this.ctx=ctx;this.running=true;
  this.player={x:120,y:390};this.enemy={x:710,y:310};this.bg={old:true};}
 BE.prototype.generateBackdrop=function(){return 'original';};
 BE.prototype.draw=function(){metrics.draws++;this.canvas.style.transform='translate3d(-37px,0px,0px)';return 'game';};
 BE.prototype.destroy=function(){return'destroyed';};
 const window={PIXI:P},document={createElement(tag){metrics.created++;
  assert.equal(tag,'canvas');return{width:0,height:0};}};
 const battle={active:true};
 const ctxVM={BattleEngine:BE,battle,window,document,location:{search},URLSearchParams,
  Math,Uint8Array,console};vm.runInNewContext(src,ctxVM,{timeout:10000});
 return {window,BE,metrics,host,canvas,app:()=>app,battle};
}
const off=setup('');
assert.equal(off.window.PokemonTorreBlue152.enabled,false);
const b=new off.BE();assert.equal(b.generateBackdrop(),'original');
assert.equal(off.metrics.apps,0);assert.equal(off.metrics.created,0);
const on=setup('?arena_lab=blue152');
assert.equal(on.window.PokemonTorreBlue152.enabled,true);
const e=new on.BE();assert.equal(e.generateBackdrop(),'original');
assert.equal(on.metrics.apps,1,'single Pixi renderer for backdrop');
assert.equal(on.metrics.tex,1,'single 512x512 authored pixel atlas');
assert.equal(on.metrics.created,1,'only a transparent native background placeholder');
assert.equal(e.bg.naturalWidth,930);
assert.ok(on.host.children[0].dataset.pokemonArena==='blue152','mounted BEHIND native actor canvas');
assert.equal(on.host.children[1],on.canvas);
assert.equal(on.canvas.style.background,'transparent');
const d=on.window.PokemonTorreBlue152.diagnostics();
assert.equal(d.starts,1);assert.ok(d.tiles>=144);assert.ok(d.props>=10);
e.draw(100);assert.equal(on.metrics.clears,1);
assert.equal(on.host.children[0].style.transform,on.canvas.style.transform,'camera synced');
on.app().ticker.stop();e.draw(200);assert.equal(on.app().ticker.started,true,'resume GPU ticker in active battle');
assert.equal(on.metrics.tex,1,'no new textures every frame');
assert.equal(e.destroy(),'destroyed');
assert.equal(on.metrics.destroys,1);
assert.equal(on.window.PokemonTorreBlue152.diagnostics().active,0);
console.log('PASS V152: real in-battle blue Pixi GPU sprites and light, aligned wide-camera, alpha-native game, one atlas, isolated pilot and protected moves.');
