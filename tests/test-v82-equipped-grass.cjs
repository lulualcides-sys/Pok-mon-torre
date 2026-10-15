'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const index=read('index.html'),overlay=read('effects/moves/_runtime/pixi-layer.js'),
  painter=read('effects/moves/_runtime/end.js'),
  renderer=read('effects/moves/v82-preview/render.js'),
  sync=read('effects/moves/v82-preview/impact-sync.js');
const names=['Chicote de Vinha','Folha Navalha','Chicotes em Área','Vine Whip'];
const assets=['chicote-de-vinha','folha-navalha','chicotes-em-area','vine-whip'];
assert.ok(index.includes("get('battle_preview')==='v82'"),'Missing preview flag');
assert.ok(index.includes('fxFiles.splice(i+1,0,"effects/moves/v82-preview/render.js")'),
 'Opt-in FX file not loaded');
assert.ok(index.includes('fxFiles[i]="effects/moves/v81-approved/render.js"'),
 'Approved game missing');
assert.ok(index.includes('effects/moves/v82-preview/impact-sync.js'),'V82 sync missing');
assert.ok(overlay.includes('equippedGrassV82.animate(item,now)'),'Pixi existing layer not extended');
assert.ok(painter.includes('equippedGrassV82.resolve(f?.move?.name||f?.name)'),
 'Named path for protected Folha Navalha was not routed');
assert.ok(!renderer.includes('getContext('),'No Canvas drawing for previews');
for(let i=0;i<4;i++){
 const p=path.join(root,'effects/moves/v82-preview/sprites',assets[i]+'.webp');
 const bytes=fs.readFileSync(p);
 assert.equal(bytes.toString('ascii',0,4),'RIFF','Missing V82 WebP '+assets[i]);
 assert.equal(bytes.toString('ascii',8,12),'WEBP','Corrupt V82 atlas '+assets[i]);
 assert.ok(bytes.length>15000,'Too small/blank V82 sprite '+assets[i]);
}
class Container{constructor(){this.children=[];this.destroyed=false}addChild(x){this.children.push(x);return x}}
class Sprite{constructor(tex){this.texture=tex;this.anchor={set:()=>{}};this.position={set:(x,y)=>{this.x=x;this.y=y}};this.visible=false;this.alpha=1}}
class Texture{constructor(base,rect){this.baseTexture=base;this.frame=rect}}Texture.EMPTY={};
class Rectangle{constructor(x,y,w,h){Object.assign(this,{x,y,w,h})}}
const PIXI={Container,Sprite,Texture,Rectangle,Assets:{load:async()=>({baseTexture:{valid:true,width:3840,height:240}})}};
const window={PIXI};
const ctx=vm.createContext({PIXI,window,console});
vm.runInContext(renderer,ctx);
const fx=vm.runInContext('equippedGrassV82',ctx);
assert.equal(window.PokemonTorreEquippedFourPreviewV82.version,'82.0');
assert.equal(fx.resolve('Folha Navalha'),'preview_folhanavalha');
assert.equal(fx.resolve('Chicote de Vinha'),'preview_chicotedevinha');
for(const key of ['catalog_thunder','catalog_thunderwave','catalog_discharge',
 'catalog_leechseed','catalog_esporos','catalog_dragonpulse','catalog_dragonclaw'])
 assert.equal(fx.accepts(key),false,'Protected move intercepted '+key);
(async()=>{
 const app={stage:new Container(),screen:{width:640,height:380}};
 for(let i=0;i<4;i++){
  const key=fx.resolve(names[i]),move={name:names[i],type:'grass',power:38},
   f={move,from:[110,168],to:[490,190],duration:1000,at:100};
  const item=fx.install(app,f,key);
  assert.ok(item?.v82,key);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(item.frames.length,8,key+' missing raster frames');
  assert.equal(item.visualDuration,2800,key+' wrong preview duration');
  const expected=[];
  for(let n=0;n<8;n++){
   fx.animate(item,100+(n+.5)/8*item.visualDuration);
   expected.push(item.sprite.texture.frame.x);
   assert.ok(item.sprite.visible);
   assert.ok(item.sprite.width>250,'No directional range in sprite '+key);
  }
  assert.deepEqual(expected,[0,480,960,1440,1920,2400,2880,3360],
   key+' must show each unique sprite in order');
  assert.ok(fx.source(assets[i]).includes(assets[i]+'.webp'));
  fx.dispose(item);assert.equal(item.disposed,true);
 }
 console.log('PASS V82: exact 4 equipped moves, 32 authored sprite frames, stage-ready Pixi overlay, all protected moves intact');
})().catch(e=>{console.error(e);process.exitCode=1});
