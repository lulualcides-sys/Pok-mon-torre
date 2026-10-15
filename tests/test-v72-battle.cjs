'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ROOT=path.join(__dirname,'..'),file=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const source=file('effects/moves/v72-battle/render.js');
const index=file('index.html'),end=file('effects/moves/_runtime/end.js'),pixi=file('effects/moves/_runtime/pixi-layer.js');
const required={
  catalog_dragonpulse:'dragon-pulse',catalog_aurasphere:'aura-sphere',
  catalog_cortex:'x-scissor',catalog_xscissor:'x-scissor',catalog_dragonclaw:'dragon-claw'
};
const protectedMoves=['catalog_thunder','catalog_discharge','catalog_thunderwave','catalog_trovao',
  'catalog_descarga','catalog_volttackle','catalog_nevasca','catalog_stunspore','catalog_leechseed','catalog_esporos'];
class Container {
 constructor(){this.children=[];this.destroyed=false}
 addChild(c){this.children.push(c);return c}
}
class Sprite {
 constructor(texture){this.texture=texture;this.visible=true;this.alpha=1;
   this.anchor={set:(a)=>this.anchorValue=a};this.position={set:(x,y)=>{this.x=x;this.y=y}}}
}
class Texture {
 constructor(base,rectangle){this.baseTexture=base;this.frame=rectangle}
}
Texture.EMPTY={};
class Rectangle{constructor(x,y,w,h){this.x=x;this.y=y;this.width=w;this.height=h}}
let calls=0;
const PIXI={Container,Sprite,Texture,Rectangle,
 Assets:{load:async(src)=>{calls++;return {baseTexture:{valid:true,width:3840,height:240},src}}}};
const context=vm.createContext({window:{PIXI},PIXI,console,performance:{now:()=>1000}});
vm.runInContext(source,context);
const fx=vm.runInContext('battleFourV72',context);
assert.ok(fx,'Renderer is not registered');
for(const [k,v] of Object.entries(required)){assert.equal(fx.accepts(k),true);assert.equal(fx.specs[k].asset,v)}
for(const k of protectedMoves)assert.equal(fx.accepts(k),false,'protected move intercepted: '+k);
assert.equal(Object.keys(fx.specs).length,5);
assert.ok(!source.includes('getContext('),'No Canvas 2D procedural attack painting');
for(const p of ['dragon-pulse','aura-sphere','x-scissor','dragon-claw']){
  const target=path.join(ROOT,'effects/moves/v72-battle/sprites',p+'.webp');
  assert.ok(fs.existsSync(target),'Missing V72 battle atlas '+p);
  const bytes=fs.readFileSync(target);
  assert.equal(bytes.subarray(0,4).toString('ascii'),'RIFF','Invalid WebP');
  assert.equal(bytes.subarray(8,12).toString('ascii'),'WEBP','Invalid WebP type');
  assert.ok(bytes.length>22000,'Empty/invalid atlas: '+p);
}
assert.ok(index.includes('"effects/moves/v72-battle/render.js","effects/moves/_runtime/pixi-layer.js"'),'V72 must load before PixiFX');
assert.ok(index.includes("effects/moves/v72-battle/sprites/"),'The game must preload battle atlases');
assert.ok(pixi.includes('battleFourV72.install(app,f,kind)')&&pixi.includes('battleFourV72.animate(item,now)'),
  'V72 renderer must use the game existing PIXI overlay');
assert.ok(end.includes("battleFourV72.accepts(k)")&&end.indexOf("battleFourV72.accepts(k)")<end.indexOf("heritage37V66.accepts(k)"),
  'V72 must intercept exactly four before legacy V66');
assert.ok(end.includes("n==='xscissor'")&&end.includes("n==='dragonclaw'"),'Physical moves must approach target during battle draw');
assert.ok(!source.includes('BattleEngine.prototype.useMove')&&!/\.hp\s*=|\.energy\s*=|\.damage\s*=|\.cooldown\s*=/.test(source),
  'V72 must not modify hit, energy, damage or cooldown mechanics');
(async()=>{
 const app={stage:new Container(),screen:{width:620,height:330}};
 for(const [key,asset] of Object.entries(required)){
  const attack={from:[72,128],to:[497,156],at:100,duration:1000,move:{name:asset}};
  const scene=fx.install(app,attack,key);
  assert.ok(scene?.v72, 'No scene for '+key);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(scene.ready,true,'Images did not decode '+key);
  assert.equal(scene.frames.length,8,'Not eight frames: '+key);
  fx.animate(scene,650);
  assert.equal(scene.sprite.visible,true,'Move hidden in battle '+key);
  assert.equal(scene.sprite.texture.frame.x,480*4,'Wrong attack animation timing '+key);
  assert.ok(scene.sprite.width>100&&scene.sprite.height>50,'Tiny/no sprite '+key);
  // V73: the same approved artwork must be smaller, for both contact/ranged effects.
  if(fx.specs[key].mode==='contact'){
    assert.ok(scene.sprite.width<250,'Contact animation too wide for compact V73: '+key);
    assert.ok(scene.sprite.width<=app.screen.width*.45,'Contact effect exceeds arena compact cap: '+key);
    const dx=attack.to[0]-attack.from[0],dy=attack.to[1]-attack.from[1],length=Math.hypot(dx,dy);
    const expectedX=attack.to[0]-dx/length*.15*scene.sprite.width;
    assert.ok(Math.abs(scene.sprite.x-expectedX)<.001,'Contact displacement no longer compact: '+key);
  }else{
    assert.ok(scene.sprite.width<475,'Ranged animation too wide for compact V73: '+key);
    assert.ok(scene.sprite.width<=app.screen.width*.72,'Ranged effect exceeds arena cap: '+key);
  }
  assert.equal(scene.sprite.height,scene.sprite.width*.5,'V73 must preserve frame aspect ratio: '+key);
  fx.dispose(scene);
  assert.equal(scene.disposed,true,'Scene was not cleaned up: '+key);
 }
 assert.equal(calls,Object.keys(required).length,'Unexpected atlas requests');
 console.log('PASS V73: compact four real-battle FX, contact alignment, 8 atlas frames, approved artwork unchanged');
})().catch(e=>{console.error(e);process.exitCode=1});
