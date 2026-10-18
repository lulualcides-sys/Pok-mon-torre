'use strict';
/* V146: actual shared Pixi lighting state, mobile camera and opt-out regression.
 * Creates no extra Pixi.Application and changes no approved Pokémon visuals.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const pixiSrc=read('effects/moves/_runtime/pixi-layer.js'),rtSrc=read('effects/arena/lighting-v146.js');
const arenaSrc=read('effects/arena/stadium-arena-v97.js'),cameraSrc=read('effects/arena/wide-camera-v98.js');
const html=read('index.html');
assert.ok(html.includes('effects/arena/lighting-v146.js'));
assert.ok(html.includes("get('lighting146')!=='0'"));
assert.ok(html.includes("v146-cinematic-lighting"));
assert.match(pixiSrc,/frameLighting146:pixiFX\.frameLighting146/);
assert.match(pixiSrc,/lighting146Active:!!lighting146/);
assert.match(pixiSrc,/const N=64,rgba=new Uint8Array\(N\*N\*4\)/);
assert.match(pixiSrc,/app\.stage\.addChildAt\(root,0\)/);
assert.match(pixiSrc,/if\(now-a\.last<33\)return/);
assert.match(pixiSrc,/destroyLighting146\(\)/);
assert.doesNotMatch(rtSrc,/getContext\s*\(|drawImage\s*\(|createElement\s*\(|PIXI\.Application\s*\(/);
assert.equal(arenaSrc.includes('function tileFloor(g,H,r)'),true);
assert.equal(cameraSrc.includes('WORLD_FACTOR=1.55'),true);
assert.equal(JSON.parse(read('effects/moves/STATUS_APROVADOS.json')).moves.length,47);
function setup(search=''){
 const counter={nativeDraws:0,apps:0,texture:0};
 class Point {set(x,y){this.x=x;this.y=y;}}
 class Container{
  constructor(){this.children=[];this.position=new Point();this.anchor=new Point();this.scale=new Point();}
  addChild(...x){this.children.push(...x);return x[0];}
  addChildAt(x,i){this.children.splice(i,0,x);return x;}
  destroy(){this.destroyed=true;this.children=[];}
 }
 class Graphics extends Container{
  beginFill(){return this;}endFill(){return this;}drawRect(){return this;}
  lineStyle(){return this;}moveTo(){return this;}lineTo(){return this;}
 }
 class Sprite extends Container{
  constructor(texture){super();this.texture=texture;this.visible=true;this.alpha=1;}
 }
 class App{
  constructor(opts){
   counter.apps++;this.stage=new Container();
   this.view={style:{},addEventListener(){}};
   this.screen={width:opts.width,height:opts.height};
   this.renderer={gl:{isContextLost:()=>false},resize:(w,h)=>{
    this.screen.width=w;this.screen.height=h;
   }};
   this.ticker={started:false,deltaMS:16,add:fn=>{this.onTick=fn;},start:()=>{this.ticker.started=true;},
    stop:()=>{this.ticker.started=false;}};
  }
  destroy(){this.destroyed=true;}
 }
 const PIXI={Application:App,Container,Graphics,Sprite,
  BLEND_MODES:{NORMAL:0,ADD:1},SCALE_MODES:{LINEAR:1},
  Texture:{fromBuffer:(buffer,w,h)=>{counter.texture++;assert.equal(w,64);assert.equal(h,64);assert.equal(buffer.length,64*64*4);return {lightTexture:true};}},
  utils:{isWebGLSupported:()=>true}
 };
 const battle={active:true};
 const rect={left:10,top:60,width:960,height:630,right:970,bottom:690};
 const canvas={isConnected:true,getBoundingClientRect:()=>rect,parentElement:{getBoundingClientRect:()=>rect}};
 const document={body:{appendChild(){}},getElementById:id=>
  id==='battleCanvas'?canvas:id==='modal'?{classList:{contains:s=>s==='combatModal'}}:
  id==='backdrop'?{classList:{contains:()=>false}}:null};
 class BattleEngine{
  constructor(){this.canvas=canvas;this.w=960;this.h=630;
   this.player={x:250,y:370};this.enemy={x:600,y:380};this.v359Attacks=[];
   this._stadiumV98=true;
  }
  draw(){counter.nativeDraws++;return 'native';}
 }
 let ms=200;
 const window={PIXI};
 const context={window,document,BattleEngine,battle,PIXI,console,URLSearchParams,
  location:{search},performance:{now:()=>ms},TriAttackVFX:{preload(){}},Math,Uint8Array};
 vm.createContext(context);
 vm.runInContext(pixiSrc,context,{timeout:4000});
 vm.runInContext(rtSrc,context,{timeout:4000});
 return {counter,context,engine:new BattleEngine(),getApp:()=>undefined,now:v=>{ms=v;},canvas};
}
const off=setup('?lighting146=0');
assert.equal(off.context.window.PokemonTorreLightingV146.enabled,false);
assert.equal(off.engine.draw(200),'native');assert.equal(off.counter.apps,0);
const safe=setup('?safe=1');safe.engine.draw(200);
assert.equal(safe.counter.apps,0);
const on=setup('?lighting146=1');
assert.equal(on.context.window.PokemonTorreLightingV146.enabled,true);
assert.equal(on.engine.draw(200),'native');
assert.equal(on.counter.nativeDraws,1);
assert.equal(on.counter.apps,1,'reuse the existing Pixi renderer only');
assert.equal(on.counter.texture,1,'single shared 64x64 GPU light cookie');
assert.equal(on.context.window.PokemonTorrePixelFlyingBridge.diagnostics().lighting146Active,true);
assert.equal(on.context.window.PokemonTorreLightingV146.diagnostics().success,1);
for(let i=0;i<8;i++)on.engine.draw(250+i*140);
assert.equal(on.counter.apps,1,'no new WebGL context after frame refresh');
assert.equal(on.counter.texture,1,'no extra light texture after frame refresh');
on.engine.v359Attacks.push({at:1400,duration:1000,to:[600,375],move:{type:'fire'}});
on.now(1750);on.engine.draw(1750);
assert.equal(on.counter.apps,1,'attacks must not create a second WebGL canvas');
// Engine acts as light origin; keep both player and opponent positions untouched.
assert.deepEqual([on.engine.player.x,on.engine.player.y],[250,370]);
assert.deepEqual([on.engine.enemy.x,on.engine.enemy.y],[600,380]);
console.log('PASS V146: shared WebGL atmosphere, 5 arena lights, actor contact shadows, reactive attack light, 1 GPU light texture, stable mobile camera; rollback works.');
