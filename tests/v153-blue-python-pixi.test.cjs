'use strict';
/* Independent PHP? No: Python-generated PNG tiles + native battle PixiJS, V153.
 * Keep the main game V150 unchanged; guard all 46 approved moves.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const path=require('node:path'),crypto=require('node:crypto');
const home='assets/arena-blue-v153/';
const assets={ 'floor-atlas':[384,384], 'back-wall':[960,256],
 'crystal-a':[128,185], 'crystal-b':[128,185], 'rock':[85,68],
 'chest':[96,84], 'glow':[128,128], 'magic-ring':[128,128] };
for(const [name,[w,h]] of Object.entries(assets)){
 const f=fs.readFileSync(home+name+'.png');
 assert.equal(f.slice(1,4).toString(),'PNG',name);
 assert.equal(f.readUInt32BE(16),w,name);
 assert.equal(f.readUInt32BE(20),h,name);
 assert.ok(f.byteLength>350,name+' texture empty');
}
assert.equal(new Set(Object.keys(assets).map(n=>crypto.createHash('sha256')
 .update(fs.readFileSync(home+n+'.png')).digest('hex'))).size,8);
const approved=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
assert.equal(approved.moves.length,46);
assert.ok(approved.moves.every(x=>x.protect));
const html=fs.readFileSync('index.html','utf8');
const src=fs.readFileSync('effects/arena/blue-v153-pixi.js','utf8');
assert.match(html,/get\('arena_lab'\)==='blue153'/);
assert.match(html,/effects\/arena\/blue-v153-pixi\.js\?build=v153-pillow-authored-materials/);
assert.match(html,/canvas\.getContext\('2d',\{alpha:true\}\)/);
assert.match(html,/get\('arena_lab'\)!=='blue153'/);
assert.match(html,/effects\/arena\/chamber-v148\.js/);
assert.match(src,/PIXI\.Texture\.from\(images\.get\(name\)\)/);
assert.match(src,/PIXI\.BLEND_MODES\.ADD/);
assert.match(src,/transparent\.naturalWidth=w/);
assert.equal((src.match(/new PIXI\.Application/g)||[]).length,1,'one optional GPU environment');
assert.doesNotMatch(src,/drawAttack|useMove\(|setInterval|requestAnimationFrame/);
function run(query){
 const m={images:0,app:0,render:0,clear:0,destroy:0};
 class Img{constructor(){this.naturalWidth=96;this.naturalHeight=96;this.onload=null;this.onerror=null;}
  set src(uri){this._src=uri;m.images++;Promise.resolve().then(()=>this.onload?.());}}
 class Spr{constructor(tex){this.texture=tex;this.alpha=1;this.x=0;this.y=0;this.position={};}}
 class Cont{constructor(){this.children=[];this.scale={set(n){this.value=n;}};}addChild(x){this.children.push(x);}}
 class Txt{constructor(base,rect){this.baseTexture=base;this.rect=rect;}
  static from(img){return{baseTexture:{scaleMode:0},image:img};}}
 const host={children:[],insertBefore(a,b){this.children.unshift(a);a.isConnected=true;}};
 const canvas={isConnected:true,style:{width:'155%',height:'100%',
  transform:'translate3d(-19px,0,0)',left:'0px',top:'0px'},parentElement:host};
 host.children.push(canvas);
 class App{constructor(){m.app++;this.stage=new Cont();
  this.view={style:{},dataset:{},remove(){this.isConnected=false;}};
  this.renderer={gl:{},render(){m.render++}};}
  destroy(){m.destroy++;}}
 const PIXI={Application:App,Texture:Txt,Container:Cont,Sprite:Spr,
  Rectangle:class{constructor(x,y,w,h){Object.assign(this,{x,y,w,h});}},
  BLEND_MODES:{ADD:1},SCALE_MODES:{NEAREST:0},
  utils:{isWebGLSupported:()=>true}};
 const doc={createElement(tag){assert.equal(tag,'canvas');return{width:0,height:0};}};
 class BE{constructor(){this.w=960;this.h=570;this.canvas=canvas;this.ctx={clearRect(){m.clear++}};
  this.bg={original:true};this.player={x:210,y:370};this.enemy={x:730,y:290};}
  generateBackdrop(){this.bg={original:true};return'ok';}
  draw(){this.canvas.style.transform='translate3d(-44px,0,0)';return'game';}
  destroy(){return'gone';}}
 const context={BattleEngine:BE,window:{PIXI},document:doc,battle:{active:true},
  Image:Img,location:{search:query},URLSearchParams,Math,performance:{now:()=>500},
  console,Promise,Map,Set,WeakMap,Error,Uint8Array};
 vm.runInNewContext(src,context,{timeout:7500});
 return{BE,m,host,canvas,window:context.window};
}
(async()=>{
 const off=run('?v=153'),b=new off.BE();
 assert.equal(off.window.PokemonTorreBlue153.enabled,false);
 b.generateBackdrop();b.draw(100);
 assert.equal(off.m.app,0);assert.equal(off.m.images,0);
 const on=run('?arena_lab=blue153&v=153'),e=new on.BE();
 assert.equal(on.window.PokemonTorreBlue153.enabled,true);
 e.generateBackdrop();assert.equal(on.m.app,0,'original backdrop shown while images load');
 await new Promise(resolve=>setImmediate(resolve));
 e.draw(1000);
 const d=on.window.PokemonTorreBlue153.diagnostics();
 assert.equal(d.ready,true,'all material images decoded before mounting');
 assert.equal(on.m.images,8,'every material requested');
 assert.equal(on.m.app,1,'single background renderer');
 assert.equal(on.host.children[0].dataset.arena,'blue153');
 assert.equal(on.host.children[1],on.canvas,'actors ahead of world layer');
 assert.equal(on.host.children[0].style.transform,on.canvas.style.transform);
 assert.equal(e.bg.naturalWidth,960,'native game backdrop transparent');
 assert.ok(d.objects>20&&d.lightPoints===8,'multi-layer environment assets and lights');
 e.draw(1100);assert.ok(on.m.render>=1);
 assert.ok(on.m.clear>=1);
 assert.equal(e.destroy(),'gone');assert.equal(on.m.destroy,1);
 assert.equal(on.window.PokemonTorreBlue153.diagnostics().active,0);
 console.log('PASS V153: 8 Python-authored PNG materials in live PixiJS WebGL stage; camera/actors/moves unchanged, rollback/default safe.');
})().catch(e=>{console.error(e);process.exitCode=1;});
