'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const index=read('index.html'),baseSource=read('effects/moves/v72-battle/render.js');
const previewSource=read('effects/moves/v78-preview/render.js'),ui=read('effects/ui/move-library-v61.js');
const approvedRenderer=read('effects/moves/v77-preview/render.js');
const files=['dragon-pulse','aura-sphere'];
assert.ok(index.includes("get('battle_preview')==='v78'"),'V78 not routed to game');
assert.ok(index.includes('fxFiles[i]="effects/moves/v78-preview/render.js"'),'wrong renderer');
assert.ok(!index.includes('effects/atelier-v70/entry.js'),'No in-game Atelier');
for(const k of ['const MODIFIED_MOVES=new Set(','className=\\'pt78Edited\\'','markEdited(b,label)','markEdited(skillLabel,skillName)']){
 assert.ok(ui.includes(k), 'Missing vector '+'+' marker in move editor: '+k);
}
assert.ok(ui.includes('Golpe com efeito visual alterado'),'Accessible marker label missing');
assert.ok(!ui.includes('✅'),'Marker must be vector, not emoji');
assert.ok(baseSource.includes("effects/moves/v77-preview/sprites/"),'Approved claws & X-Scissor not saved into official combat');
assert.ok(approvedRenderer.includes("v77-preview/sprites/"),'Frozen contact previews were altered');
assert.ok(previewSource.includes("v78-preview/sprites/"),'Preview not loading new ranged stage art');
for(const name of files){
 const f=path.join(ROOT,'effects/moves/v78-preview/sprites',name+'.webp');
 const b=fs.readFileSync(f);
 assert.equal(b.toString('ascii',0,4),'RIFF','Invalid generated staged sprites '+name);
 assert.equal(b.toString('ascii',8,12),'WEBP','Invalid generated staged sprites '+name);
 assert.ok(b.length>25000,'Generated sprites are blank: '+name);
}
class Container{constructor(){this.children=[]}addChild(v){this.children.push(v);return v}}
class Sprite{constructor(tex){this.texture=tex;this.anchor={set:()=>{}};this.position={set:(x,y)=>{this.x=x;this.y=y}};this.visible=true}}
class Texture{constructor(base,rect){this.baseTexture=base;this.frame=rect}}Texture.EMPTY={};
class Rectangle{constructor(x,y,w,h){Object.assign(this,{x,y,w,h})}}
const PIXI={Container,Sprite,Texture,Rectangle,Assets:{load:async()=>({baseTexture:{valid:true,width:3840,height:240}})}};
const make=(source)=>{const c=vm.createContext({window:{PIXI},PIXI,console});
 vm.runInContext(source,c);
 return {c,fx:vm.runInContext('battleFourV72',c)};};
(async()=>{
 const old=make(baseSource),fresh=make(previewSource);
 assert.equal(fresh.c.window.PokemonTorreBattlePreviewV78?.version,'78.0');
 const app={stage:new Container(),screen:{width:620,height:330}};
 const fixtures=[
 ['catalog_dragonclaw','v77-preview/sprites/dragon-claw.webp'],
 ['catalog_cortex','v77-preview/sprites/x-scissor.webp'],
 ['catalog_dragonpulse','v78-preview/sprites/dragon-pulse.webp'],
 ['catalog_aurasphere','v78-preview/sprites/aura-sphere.webp']
 ];
 for(const [name,url] of fixtures){
  assert.ok(fresh.fx.source(fresh.fx.specs[name].asset).includes(url),'Incorrect preview asset '+name);
  const f={from:[80,120],to:[470,120],at:100,duration:1000};
  const effect=fresh.fx.install(app,f,name);
  await new Promise(r=>setImmediate(r));
  assert.ok(effect.ready&&effect.frames.length===8,name+' frame decode failed');
  const frames=[];
  for(let i=0;i<8;i++){
   fresh.fx.animate(effect,100+effect.visualDuration*(i+.5)/8);
   frames.push(effect.sprite.texture.frame.x);
  }
  assert.deepEqual(frames,[0,480,960,1440,1920,2400,2880,3360],name+' missing distinct stages');
  assert.equal(f.duration,1000,'preview mutated real cast timing');
  fresh.fx.dispose(effect);
 }
 for(const id of ['catalog_dragonpulse','catalog_aurasphere']){
  assert.ok(old.fx.source(old.fx.specs[id].asset).includes('v72-battle/sprites'),'Unapproved move changed in normal game');
 }
 for(const id of ['catalog_thunder','catalog_discharge','catalog_thunderwave']){
  assert.equal(fresh.fx.accepts(id),false,'Protected '+id+' hijacked');
 }
 console.log('PASS V78: four approved/missing moves routed independently; SVG + markers; 8 staged animations; protected electric unchanged');
})().catch(e=>{console.error(e);process.exitCode=1});