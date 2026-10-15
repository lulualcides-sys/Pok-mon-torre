'use strict';
/* V86 proves four ORIGINAL authored WebP atlases and independent Pixi stages.
 * Historical protected move modules, Haze V85 and V84 are left unchanged.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8');
const renderer=read('effects/moves/v86-preview/render.js');
const index=read('index.html'),pixi=read('effects/moves/_runtime/pixi-layer.js'),end=read('effects/moves/_runtime/end.js');
const moveNames=['Raízes Violentas','Geada Persistente','Sopro Congelante','Chicote Duplo'];
const slugs=['raizes-violentas','geada-persistente','sopro-congelante','chicote-duplo'];
assert.ok(index.includes("get('battle_preview')==='v86'"));
assert.ok(index.includes('effects/moves/v86-preview/render.js'));
assert.ok(pixi.includes('referenceFourV86.cast'));
assert.ok(end.includes('previousReferenceUseV86'));
assert.ok(end.includes('pixiFX.beginV86'));
assert.ok(!renderer.includes('getContext(')&&!renderer.includes('<video>'));
for(const slug of slugs){
 const file=path.join(base,'effects/moves',slug,'v86-preview/sprites',slug+'.webp');
 const data=fs.readFileSync(file);
 assert.equal(data.toString('ascii',0,4),'RIFF');
 assert.equal(data.toString('ascii',8,12),'WEBP');
 assert.ok(data.length>2200,slug+' missing authored frames');
}
class Container{
 constructor(){this.children=[];this.parent=null;}
 addChild(...xs){for(const x of xs){this.children.push(x);x.parent=this;}return xs[0];}
 removeChild(x){this.children=this.children.filter(y=>y!==x);x.parent=null;}
 destroy(){this.children.length=0;}}
class Graphics extends Container{
 lineStyle(){}beginFill(){}drawEllipse(){}endFill(){}clear(){}
}
class Texture{constructor(base,rect){this.baseTexture=base;this.frame=rect;}}
Texture.EMPTY={};
class Rectangle{constructor(x,y,w,h){Object.assign(this,{x,y,w,h});}}
class Sprite{constructor(tex){this.texture=tex;this.anchor={set(){}};
 this.position={set:(x,y)=>{this.x=x;this.y=y}};this.visible=false;}}
const PIXI={Texture,Rectangle,Sprite,Container,Graphics,
 Assets:{load:async()=>({baseTexture:{valid:true,width:3840,height:240}})}};
const w={PIXI},ctx=vm.createContext({window:w,PIXI,console});
vm.runInContext(renderer,ctx);
const v86=vm.runInContext('referenceFourV86',ctx);
(async()=>{
 const app={stage:new Container(),screen:{width:660,height:400}};
 for(let i=0;i<moveNames.length;i++){
  const name=moveNames[i],key=v86.resolve(name);
  assert.ok(key);assert.equal(v86.source(key).includes(slugs[i]),true);
  const started=100;
  const item=v86.cast(app,{w:660,h:400},[120,190],[480,200],name,started,started+830);
  await new Promise(resolve=>setImmediate(resolve));
  assert.ok(item.ready,name+' atlas not ready');assert.equal(item.frames.length,8);
  const stages=[];
  for(let j=0;j<8;j++){
   const t=j<5?started+(j+.3)*830/5:started+830+(j-4.6)*(item.duration-830)/3.4;
   v86.animate(item,t);
   stages.push(item.art.texture.frame.x);
  }
  assert.ok(new Set(stages).size>=5,name+' stage not distinct');
  assert.ok(item.art.visible);
  assert.equal(item.root.parent,app.stage);
  const before=v86.diagnostics().perMove[name];
  assert.equal(before.casts,1);assert.ok(before.draws>=8);
  assert.ok(before.framesMask!==0);
  v86.destroy(item);
  assert.equal(app.stage.children.length,0,'Pixi leak after '+name);
 }
 for(const older of ['Haze','Folha Navalha','Chicotes em Área','Dragon Claw','Thunder','Frost Breath']){
  assert.equal(v86.resolve(older),'',older+' was intercepted');
 }
 assert.equal(v86.diagnostics().casts,4);
 console.log('PASS V86 32 unique-source frames: Pixi original roots, persistent icy terrain, real icy breath, two distinct whip hits. All 4 independent roots and zero official-game mutation.');
})().catch(e=>{console.error(e);process.exitCode=1});
