'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const index=read('index.html'),preview=read('effects/moves/v76-preview/render.js');
const stable=read('effects/moves/v72-battle/render.js');
assert.ok(index.includes("get('battle_preview')==='v78'"),'Preview flag missing');
assert.ok(index.includes('fxFiles[i]="effects/moves/v78-preview/render.js"'),'Flag must select alternate VFX without replacing main renderer');
assert.ok(index.includes('"effects/moves/v72-battle/render.js"'),'Official V75 renderer must stay loaded by default');
assert.ok(!index.includes("effects/atelier-v70/entry.js"),'Atelier button must not be loaded inside game');
assert.ok(!preview.includes('getContext('),'No Canvas 2D procedural art allowed');
assert.ok(!preview.includes('BattleEngine.prototype'),'Preview must not modify attack mechanics');
for(const electric of ['catalog_thunder','catalog_discharge','catalog_thunderwave'])
 assert.ok(!preview.includes(electric+':{asset:'),'Electric move explicitly preserved: '+electric);

class Container{constructor(){this.children=[];this.destroyed=false;this.scale={set:x=>this.scaleValue=x};this.position={set:(x,y)=>{this.x=x;this.y=y}}}
 addChild(...xs){this.children.push(...xs);return xs[xs.length-1]}}
class Sprite{constructor(texture){this.texture=texture;this.anchor={set:x=>this.anchorValue=x};this.position={set:(x,y)=>{this.x=x;this.y=y}};this.visible=true}}
class Texture{constructor(base,rect){this.baseTexture=base;this.frame=rect}}
Texture.EMPTY={};
class Rectangle{constructor(x,y,width,height){Object.assign(this,{x,y,width,height})}}
class Graphics{constructor(){this.position={set:(x,y)=>{this.x=x;this.y=y}};this.draws=[]}
 clear(){this.draws=[];return this}beginFill(){return this}
 drawCircle(...args){this.draws.push(['circle',...args]);return this}
 drawRect(...args){this.draws.push(['rect',...args]);return this}
 endFill(){return this}}
const PIXI={Container,Sprite,Texture,Rectangle,Graphics,Assets:{
 load:async()=>({baseTexture:{valid:true,width:3840,height:240}})}};
const ctx=vm.createContext({window:{PIXI},PIXI,console});
vm.runInContext(preview,ctx,{timeout:2000});
const fx=vm.runInContext('battleFourV72',ctx);
const moves={catalog_dragonclaw:'claws',catalog_dragonpulse:'beam',
 catalog_aurasphere:'sphere',catalog_cortex:'cross',catalog_xscissor:'cross'};
for(const key of Object.keys(moves))assert.equal(fx.accepts(key),true,key);
for(const key of ['catalog_thunder','catalog_discharge','catalog_thunderwave',
 'catalog_volttackle','catalog_leechseed'])assert.equal(fx.accepts(key),false,key);
assert.equal(fx.phaseAt('catalog_dragonclaw',.17)[1],'impacto');
assert.equal(fx.phaseAt('catalog_dragonclaw',.35)[1],'garra-1');
assert.equal(fx.phaseAt('catalog_dragonclaw',.54)[1],'garra-2');
assert.equal(fx.phaseAt('catalog_dragonclaw',.75)[1],'garra-3');
assert.equal(fx.phaseAt('catalog_cortex',.38)[1],'corte-1');
assert.equal(fx.phaseAt('catalog_cortex',.46)[1],'pausa');
assert.equal(fx.phaseAt('catalog_cortex',.59)[1],'corte-2');
assert.equal(fx.phaseAt('catalog_aurasphere',.83)[1],'explosao');
assert.equal(fx.phaseAt('catalog_dragonpulse',.80)[1],'explosao');
(async()=>{
 const app={stage:new Container(),screen:{width:620,height:330}};
 for(const key of Object.keys(moves)){
  const f={at:100,duration:1000,from:[75,160],to:[440,170]};
  const item=fx.install(app,f,key);
  assert.ok(item?.v72);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(item.ready,true,key);
  assert.equal(item.frames.length,8,key);
  assert.equal(item.visualDuration,1800,'Timing should not alter damage duration');
  for(const t of [.18,.36,.56,.76,.84,.97]){
   fx.animate(item,100+1800*t);
   assert.equal(item.phase,fx.phaseAt(key,t)[1],'Incorrect animation stage '+key);
   assert.ok(item.mask.draws.length>0,'Sprite stencil not rendered '+key);
  }
  if(key==='catalog_dragonclaw'){
   fx.animate(item,100+1800*.17);
   assert.equal(item.mask.draws[0][0],'circle','Impact MUST appear before nails');
   for(const [t,y] of [[.36,0],[.55,1],[.76,2]]){
    fx.animate(item,100+1800*t);
    assert.equal(item.mask.draws[0][0],'rect');
    assert.ok(Math.abs(item.mask.draws[0][2]-(-item.sprite.height*.5+y*item.sprite.height/3))<.001,
      'Claw bands must appear one after the other');
   }
  }
  assert.equal(f.duration,1000,'Preview mutated actual attack duration');
  fx.dispose(item);assert.ok(item.disposed);
 }
 assert.ok(stable.includes('const VISUAL_SLOWDOWN=1.8'),'Original V75 was modified');
 console.log('PASS V76: opt-in live battle preview, sequential Dragon Claw hit + 3 cuts, X-Scissor pause + 2 cuts, original attacks preserved');
})().catch(e=>{console.error(e);process.exitCode=1});