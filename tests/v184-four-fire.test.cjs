'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),zlib=require('node:zlib'),crypto=require('node:crypto');
const dir='effects/moves/v184-fire-four/',specs={'ember':8,'flame-wheel':12,'inferno':16,'eruption':16};
const source=fs.readFileSync(dir+'runtime.js','utf8');
new vm.Script(source);
assert.match(source,/SCALE_MODES\.NEAREST/);
assert.doesNotMatch(source,/getContext\(|createElement\s*\(\s*['"]canvas|requestAnimationFrame\(|generateTexture\(/);
const page=fs.readFileSync('index.html','utf8');
assert.match(page,/get\('fire184'\)==='preview'/);
assert.match(page,/v184-fire-four\/runtime\.js/);
const protectedJson=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
assert.ok(protectedJson.v175_extra_protected.some(m=>m.move==='Fire Blast'&&m.status==='aprovado'&&m.protect===true&&m.version==='V183'));
for(const [name,count] of Object.entries(specs)){
 const ase=fs.readFileSync(dir+name+'/animation.aseprite');
 assert.equal(ase.readUInt16LE(4),0xa5e0,name+' true animated LibreSprite');
 assert.equal(ase.readUInt16LE(6),count,name+' frame count');
 assert.equal(ase.readUInt16LE(8),192);
 assert.equal(ase.readUInt16LE(10),128);
 assert.equal(ase.readUInt16LE(12),32);
 let cursor=128,frames=0;const unique=new Set();
 while(cursor<ase.length){
  const size=ase.readUInt32LE(cursor);
  assert.equal(ase.readUInt16LE(cursor+4),0xf1fa,name+' frame header');
  const chunks=ase.readUInt16LE(cursor+6);let off=cursor+16;
  for(let c=0;c<chunks;c++){
   const sz=ase.readUInt32LE(off),type=ase.readUInt16LE(off+4);
   if(type===0x2005){
    const image=zlib.inflateSync(ase.subarray(off+6+20,off+sz));
    assert.equal(image.length,192*128*4,'RGBA frame');
    assert.ok(image.some((v,i)=>i%4===3&&v===255),'visible flame');
    assert.ok(image.some((v,i)=>i%4===3&&v===0),'transparent background');
    unique.add(crypto.createHash('sha256').update(image).digest('hex'));
   }
   off+=sz;
  }
  assert.equal(off,cursor+size);cursor+=size;frames++;
 }
 assert.equal(frames,count);assert.equal(unique.size,count,'distinct motion');
 const png=fs.readFileSync(dir+name+'/sheet.png');
 assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.deepEqual([png.readUInt32BE(16),png.readUInt32BE(20)],[768,128*Math.ceil(count/4)]);
 console.log('PASS V184 individual fire art:',name,count,'unique frames');
}
class ImageMock {
 naturalWidth=768;naturalHeight=0;
 set src(value){const name=/v184-fire-four\/([^/]+)\/sheet.png/.exec(value)?.[1];
  this.naturalHeight=128*Math.ceil(specs[name]/4);this.onload?.()}
}
class Container {parent=null;children=[];addChild(x){x.parent=this;this.children.push(x);return x}destroy(){this.parent=null}}
class Sprite {constructor(t){this.texture=t;this.anchor={set(){}};this.position={set:(x,y)=>{this.x=x;this.y=y}};this.alpha=1}destroy(){}}
class Texture {constructor(base,r){this.base=base;this.rect=r}destroy(){}}
class BaseTexture {static from(){return {scaleMode:5}}}
class Rectangle {constructor(x,y,w,h){Object.assign(this,{x,y,w,h})}}
const PIXI={Container,Sprite,Texture,BaseTexture,Rectangle,SCALE_MODES:{NEAREST:0}};
function setup(query='',gl=true){
 let time=1000,hits=0,oldVisuals=0;
 const battle={active:true,energy:100},cooldowns={0:0,1:0,2:0,3:0},mon={};
 const app={stage:new Container(),renderer:{gl:gl?{isContextLost:()=>false}:null}};
 class Engine {
  constructor(){this.canvas={isConnected:true};this.player={x:125,y:250};this.enemy={x:425,y:160,hp:160};this.h=430;this.w=950}
  useMove(slot){battle.energy-=1;cooldowns[slot]=time+600;return true}
  hitTarget(who,type,power){hits++;if(who==='enemy')this.enemy.hp-=power;return true}
  draw(){return true}
  destroy(){return true}
 }
 const engine=new Engine();
 const win={PIXI,PokemonTorrePixelFlyingBridge:{labStage:()=>({app})},
  PokemonTorreV360Paint(){oldVisuals++;return false}};
 const ctx={window:win,Image:ImageMock,URLSearchParams,location:{search:query},
  BattleEngine:Engine,battle,cooldowns,current:()=>mon,foe:()=>engine.enemy,
  skillSet:()=>[{name:'Flame Wheel'},{name:'Inferno'},{name:'Ember'},{name:'Eruption'}],
  performance:{now:()=>time},fireSpriteV41:{paint(){oldVisuals++;return false}}};
 vm.runInNewContext(source,ctx,{timeout:2000});
 return {engine,battle,app,ctx,advance:n=>{time+=n},win,state:()=>win.PokemonTorreFireFourV184?.diagnostics(),
  get hits(){return hits},get oldVisuals(){return oldVisuals}};
}
assert.equal(setup().state(),undefined,'normal game untouched');
assert.equal(setup('?fire184=preview&safe=1').state(),undefined,'safe mode');
const sim=setup('?fire184=preview');
for(const [slot,name] of ['flame-wheel','inferno','ember','eruption'].entries()){
 const before=sim.engine.enemy.hp;
 sim.engine.useMove(slot);sim.advance(100);sim.engine.draw();
 assert.equal(sim.state().starts[name],1,'move wired '+name);
 sim.engine.hitTarget('enemy','fire',4);sim.advance(130);sim.engine.draw();
 assert.equal(sim.engine.enemy.hp,before-4,'damage left native');
 assert.equal(sim.state().confirmedImpacts,slot+1,'native hit only '+name);
}
sim.advance(2400);sim.engine.draw();assert.equal(sim.state().activeSprites,0);
assert.equal(sim.hits,4);assert.equal(sim.battle.energy,96);
assert.deepEqual([...sim.state().errors],[]);
const fallback=setup('?fire184=preview',false);fallback.engine.useMove(0);
assert.equal(fallback.state().starts['flame-wheel'],undefined);
fallback.win.PokemonTorreV360Paint({}, {name:'Flame Wheel'},0,fallback.engine);
assert.equal(fallback.oldVisuals,1,'fallback keeps legacy visuals');
console.log('PASS V184: 4 distinct editable pixel animations, battle wiring, no duplicated HP/cost, WebGL fallback');

const volley=setup('?fire184=preview');volley.engine.useMove(2);
volley.advance(280);volley.engine.draw();
assert.equal(volley.app.stage.children[0].children.length,3,'three real projectile sprites');
assert.ok(volley.state().active[0].frame<4,'no impact frames before damage');
volley.engine.hitTarget('enemy','fire',1);volley.engine.draw();
assert.equal(volley.state().active[0].frame,4);
volley.advance(66);volley.engine.draw();assert.equal(volley.state().active[0].frame,5,'impact advances immediately');
volley.advance(66);volley.engine.draw();assert.equal(volley.state().active[0].frame,6);
volley.advance(132);volley.engine.draw();assert.equal(volley.state().activeSprites,0,'tail completes');
const wheel=setup('?fire184=preview');wheel.engine.useMove(0);wheel.advance(200);wheel.engine.draw();
let ring=wheel.app.stage.children[0].children[0];assert.equal(ring.x,125,'mantle attached to actor');
wheel.engine.player.x=230;wheel.advance(100);wheel.engine.draw();assert.equal(ring.x,230,'follows actual actor displacement');
wheel.ctx.current=()=>({});wheel.engine.draw();assert.equal(wheel.state().activeSprites,0,'actor switch cleanup');
const miss=setup('?fire184=preview');miss.engine.useMove(2);miss.advance(580);miss.engine.draw();
assert.equal(miss.state().activeSprites,0);assert.equal(miss.state().confirmedImpacts,0,'miss cannot fabricate damage');
const overlap=setup('?fire184=preview');overlap.engine.useMove(1);overlap.engine.useMove(2);
assert.equal(overlap.state().activeSprites,2,'different casts may coexist');
overlap.battle.active=false;overlap.engine.draw();assert.equal(overlap.state().activeSprites,0,'menu cleanup');
const native=setup('?fire184=preview');
native.engine.v359Attacks=[{move:{name:'Ember'},battle:native.battle,at:1000,duration:500,times:[.5],hits:0,end:1600}];
native.engine.useMove(2);native.engine.hitTarget('enemy','fire',1);
assert.equal(native.state().confirmedImpacts,0,'unrelated early fire damage does not confirm');
native.advance(250);native.engine.hitTarget('enemy','fire',1);assert.equal(native.state().confirmedImpacts,1);
console.log('PASS V184.1: volley phases, immediate impact progression, actor attachment, miss/switch/menu cleanup and native timing');
