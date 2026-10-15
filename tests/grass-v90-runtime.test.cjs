// Deterministic no-dependency regression test for the real V90 Pixi modules.
// Reproduces the V89 crash in pixiFX.diagnostics() when Grass lacks source().
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const Graphics=class{
 lineStyle(){return this}beginFill(){return this}drawPolygon(){return this}
 endFill(){return this}moveTo(){return this}lineTo(){return this}
 drawEllipse(){return this}destroy(){}
};
const Container=class{
 constructor(){this.children=[]}
 addChild(...items){for(const c of items){c.parent=this;this.children.push(c)}return items[0]}
 removeChild(item){this.children=this.children.filter(c=>c!==item);item.parent=null}
 destroy(){this.destroyed=true;for(const child of this.children)child.destroy?.()}
};
const Sprite=class{
 constructor(texture){this.texture=texture;this.anchor={set:()=>{}};
 this.position={set:(x,y)=>{this.x=x;this.y=y}};this.visible=true;this.alpha=1}
 destroy(){this.destroyed=true}
};
let generated=0,rendered=0;
const Application=class{
 constructor({width,height}){
  this.stage=new Container();this.screen={width,height};
  this.view={style:{},isConnected:false};
  this.ticker={started:true,deltaMS:16,add:()=>{},
   start:()=>{this.ticker.started=true},stop:()=>{this.ticker.started=false}};
  this.renderer={
   generateTexture:()=>({id:generated++,destroy:()=>{}}),
   resize:(w,h)=>{this.screen.width=w;this.screen.height=h},
   render:()=>{rendered++}
  };
 }
 destroy(){this.view.isConnected=false}
};
const PIXI={Graphics,Container,Sprite,Application,
 Rectangle:class{constructor(...args){this.args=args}},
 Texture:{EMPTY:{}},utils:{isWebGLSupported:()=>true}};
const canvas={isConnected:true,getBoundingClientRect:()=>({left:0,top:0,width:640,height:320})};
const document={body:{appendChild(view){view.isConnected=true}},getElementById(id){
 if(id==='battleCanvas')return canvas;
 if(id==='modal')return {classList:{contains:s=>s==='combatModal'}};
 if(id==='backdrop')return {classList:{contains:()=>false}};
 return null;
}};
const battle={active:true},window={PIXI};
const grass=fs.readFileSync('effects/moves/v89-four/render.js','utf8');
const pixi=fs.readFileSync('effects/moves/_runtime/pixi-layer.js','utf8');
const ctx={window,document,PIXI,battle,performance:{now:()=>1000},
 TriAttackVFX:{preload(){}},registry:new Map(),norm:s=>s,
 console,spriteAtlas3511:undefined,spriteFrames3511:undefined};
const {pixiFX,grassFourV84}=vm.runInNewContext(
 grass+'\n'+pixi+'\n;({pixiFX,grassFourV84})',ctx);
const engine={canvas,w:640,h:320,player:{x:100,y:180},enemy:{x:430,y:150}};
for(const [name,expected] of [['Chicote de Vinha',12],['Folha Navalha',12],
 ['Chicotes em Área',16],['Vine Whip',12]]){
 const f={name,move:{name},from:[100,180],to:[430,150],
  at:1000,duration:900,battle};
 const key=grassFourV84.resolve(name);
 assert.ok(key,name+' must resolve');
 assert.equal(pixiFX.beginV84(engine,f,key),true,name+' cast');
 const d=pixiFX.diagnostics();
 assert.equal(d.activePreview.key,key,name+' debug lookup must not throw');
 assert.match(d.activePreview.source,/^pixi-generated-v90:/);
 assert.equal(pixiFX.frameV84(1350,engine),true,name+' visible Pixi frame');
 assert.equal(grassFourV84.diagnostics().frames[name],expected);
}
assert.equal(generated,52,'12+12+16+12 generated GPU sprite frames');
assert.equal(rendered,4,'each attack must draw on Pixi renderer');
pixiFX.clearAll();assert.equal(pixiFX.diagnostics().ready,false);
console.log('PASS: 4 battle sprites, 52 frames, diagnostics, GPU drawing and cleanup');
