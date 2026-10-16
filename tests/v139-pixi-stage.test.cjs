'use strict';
/* V139 tests REAL shared PIXI BRIDGE with a deterministic fake WebGL renderer.
 * Older tests mocked mountPixelFlying() and therefore never detected blank
 * sprites caused by GPU capability checks, hidden stage or stopped ticker.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('effects/moves/_runtime/pixi-layer.js','utf8');
assert.doesNotThrow(()=>new vm.Script(src));
const battle={active:true};
let now=1000,appInstance=null;
const canvas={isConnected:true,parentElement:null,
 getBoundingClientRect:()=>({left:12,top:48,right:912,bottom:608,width:900,height:560})};
const engine={canvas,w:900,h:560,player:{x:170,y:340},enemy:{x:680,y:270}};
const elements={
 modal:{classList:{contains:name=>name==='combatModal'}},
 backdrop:{classList:{contains:()=>false}},
 battleCanvas:canvas
};
const document={getElementById:key=>elements[key]||null,body:{appendChild(node){node.isConnected=true;}},
 createElement(name){return {name,style:{},addEventListener(){}}}};
class Sprite{
 constructor(texture){this.texture=texture;this.anchor={set(){}};
  this.scale={set(s){this.x=s;this.y=s;}};
  this.position={x:0,y:0,set(x,y){this.x=x;this.y=y;}};
  this.alpha=1;this.rotation=0;this.tint=0xffffff;}
 destroy(){}
}
class Container{
 constructor(){this.children=[];this.position={x:0,y:0,set(x,y){this.x=x;this.y=y;}};}
 addChild(x){this.children.push(x);return x;}
 destroy(){this.children=[];}
}
class Texture{
 constructor(base,rect){this.base=base;this.rect=rect;}
}
Texture.WHITE=new Texture({valid:true},null);
class Application{
 constructor(o){
  this.view={style:{},addEventListener(){},isConnected:false};
  this.screen={width:o.width,height:o.height};
  this.renderer={gl:{isContextLost:()=>false},resize:(w,h)=>{this.screen.width=w;this.screen.height=h;}};
  this.stage=new Container();
  this.ticker={started:true,deltaMS:16,add(fn){this.frame=fn;},start(){this.started=true;},
   stop(){this.started=false;}};
  appInstance=this;
 }
 destroy(){}
}
const PIXI={Application,Container,Sprite,Texture,Rectangle:class Rectangle{
 constructor(x,y,w,h){this.x=x;this.y=y;this.width=w;this.height=h;}
},BaseTexture:{from:img=>({valid:img.naturalWidth>0,scaleMode:0})},
 SCALE_MODES:{NEAREST:0},utils:{}};
// Deliberately OMIT utils.isWebGLSupported: this caused V138 to reject a
// perfectly functioning WebGL renderer on some browsers.
const window={PIXI};
const world={window,PIXI,battle,document,performance:{now:()=>now},
 TriAttackVFX:null,Math,console};
const bridge=vm.runInNewContext(src+'\npixiFX;',world,{timeout:5000});
assert.ok(bridge);
assert.equal(bridge.diagnostics().gpu,false,'legacy helper can be absent before the pixel renderer initializes');
const spec={name:'Air Slash',frames:16,ms:1510,scale:1.32,particles:false,
 image:{naturalWidth:512,naturalHeight:128}};
const fx={move:{name:'Air Slash'},battle,at:1000,end:2510,duration:1510,
 from:[170,270],to:[680,200]};
assert.equal(bridge.mountPixelFlying(engine,fx,spec),true,'must install real GPU sprite');
assert.equal(bridge.diagnostics().gpu,true,'the live WebGL renderer must be recognized after pixel mount');
assert.equal(bridge.diagnostics().pixelFlyingActive,1);
assert.equal(bridge.diagnostics().pixelFlyingStarts,1);
assert.equal(appInstance.view.style.display,'block');
assert.equal(appInstance.stage.children.length,1);
const root=appInstance.stage.children[0],sprite=root.children[0];
assert.ok(sprite.texture instanceof Texture);
now=1550;
appInstance.ticker.frame();
assert.ok(bridge.diagnostics().pixelFlyingFrames>0,'GPU ticker did not animate texture');
assert.ok(root.position.x>170&&root.position.x<680,'sprite not moving on arena');
assert.ok(sprite.alpha>.9,'sprite invisible due to alpha');
assert.equal(appInstance.view.style.display,'block');
now=2520;
appInstance.ticker.frame();
assert.equal(bridge.diagnostics().pixelFlyingActive,0,'resources must be freed after V359 event');
assert.equal(appInstance.ticker.started,false,'idle GPU ticker must stop on mobile');
console.log('PASS V139 WEBGL: actual Pixi bridge mounts a texture on stage, animates/moves, remains visible, then cleans up, even without legacy isWebGLSupported.');
