'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const path='effects/moves/v182-flamethrower/';
const png=fs.readFileSync(path+'sheet.png');
const code=fs.readFileSync(path+'runtime.js','utf8');
assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
assert.deepEqual([png.readUInt32BE(16),png.readUInt32BE(20)],[768,384]);
assert.match(code,/new P\.Rectangle\(\(i%4\)\*W,Math\.floor\(i\/4\)\*H,W,H\)/);
assert.match(code,/SCALE_MODES\.NEAREST/);
assert.match(code,/COUNT=12/);
assert.doesNotMatch(code,/getContext\(|createElement\(['"]canvas|requestAnimationFrame\(/);
new vm.Script(code);
const index=fs.readFileSync('index.html','utf8');
assert.match(index,/fire182'\)==='preview'/);
assert.match(index,/v182-flamethrower\/runtime\.js/);
class ImageMock {
 naturalWidth=768;naturalHeight=384;
 set src(v){this._src=v;this.onload?.()}
 get src(){return this._src}
}
class Container {
 constructor(){this.parent=null;this.children=[]}
 addChild(v){this.children.push(v);v.parent=this;return v}
 destroy(){this.parent=null}
}
class Sprite {
 constructor(t){this.texture=t;this.anchor={set(){}};this.position={set(){}};this.alpha=1}
 destroy(){}
}
class Texture {constructor(base,rectangle){this.base=base;this.rectangle=rectangle}destroy(){}}
class BaseTexture {static from(){return {scaleMode:0}}}
class Rectangle {constructor(x,y,w,h){Object.assign(this,{x,y,w,h})}}
const PIXI={Container,Sprite,Texture,BaseTexture,Rectangle,SCALE_MODES:{NEAREST:0}};
function harness(search='',webgl=true){
 let clock=1000,paints=0,originalHits=0;
 const battle={active:true,energy:100},cooldowns={0:0,1:0},pokemon={};
 const app={renderer:{gl:webgl?{isContextLost(){return false}}:null},stage:new Container()};
 class Engine {
  constructor(){this.canvas={isConnected:true};this.player={x:110,y:270};this.enemy={x:400,y:155,hp:100};this.w=900;this.h=430}
  useMove(slot){battle.energy-=10;cooldowns[slot]=clock+900;return true}
  hitTarget(who,type,power){originalHits++;if(who==='enemy')this.enemy.hp-=power;return true}
  draw(){return true}
  destroy(){return true}
 }
 const engine=new Engine();
 const win={PIXI,PokemonTorrePixelFlyingBridge:{labStage:()=>({app})},
  PokemonTorreV360Paint(){paints++;return false}};
 const context={window:win,Image:ImageMock,location:{search},URLSearchParams,
  BattleEngine:Engine,battle,cooldowns,current:()=>pokemon,
  skillSet:()=>[{name:'Flamethrower'},{name:'Fire Blast'}],foe:()=>engine.enemy,
  performance:{now:()=>clock},fireSpriteV41:{paint(){paints++;return false}}};
 vm.runInNewContext(code,context,{timeout:1800});
 return {engine,win,battle,advance(ms){clock+=ms},get paints(){return paints},get hits(){return originalHits},
  diagnostics(){return win.PokemonTorreFireV182?.diagnostics()}};
}
assert.equal(harness('').diagnostics(),undefined);
assert.equal(harness('?fire182=preview&safe=1').diagnostics(),undefined);
const h=harness('?fire182=preview');
assert.equal(h.diagnostics().imageReady,true);
h.engine.useMove(0);
assert.equal(h.diagnostics().casts,1);
h.advance(95);h.engine.draw();assert.equal(h.diagnostics().active.frame,1);
h.advance(320);h.engine.draw();assert.ok(h.diagnostics().active.frame>=4);
h.engine.hitTarget('enemy','fire',21);h.engine.hitTarget('enemy','fire',0);
assert.equal(h.diagnostics().confirmedImpacts,1);
h.advance(600);h.engine.draw();assert.equal(h.diagnostics().active.frame,8);
h.advance(360);h.engine.draw();assert.equal(h.diagnostics().active,null);
assert.equal(h.hits,2);assert.equal(h.engine.enemy.hp,79);assert.equal(h.battle.energy,90);
h.engine.useMove(1);assert.equal(h.diagnostics().casts,1,'Fire Blast unchanged');
assert.deepEqual([...h.diagnostics().errors],[]);
const fallback=harness('?fire182=preview',false);
fallback.engine.useMove(0);
assert.equal(fallback.diagnostics().casts,0);
fallback.win.PokemonTorreV360Paint({}, {name:'Flamethrower'},0,fallback.engine);
assert.equal(fallback.paints,1,'legacy fallback remains visible');
console.log('PASS V182 PNG 4x3, 12f Pixi timeline, confirmed native impact, no extra HP/cost, fallback, isolation');
