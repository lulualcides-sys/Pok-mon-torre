'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),zlib=require('node:zlib'),crypto=require('node:crypto');
const index=fs.readFileSync('index.html','utf8');
const src=fs.readFileSync('effects/moves/v181-hand-drawn-fire/runtime.js','utf8');
const generator=fs.readFileSync('tools/build-v181-fire-art.cjs','utf8');
new vm.Script(src);new vm.Script(generator);
assert.match(index,/get\('fire181'\)==='preview'/);
assert.match(index,/get\('fire181'\)!=='preview'/);
assert.match(index,/get\('fire180'\)!=='preview'/);
assert.match(index,/v181-hand-drawn-fire\/runtime\.js/);
assert.match(src,/P\.SCALE_MODES\.NEAREST/);
assert.doesNotMatch(src,/getContext\(|createElement\s*\(\s*['"]canvas|requestAnimationFrame\(|renderer\.generateTexture/);
assert.doesNotMatch(generator,/getContext\(|canvas|Math\.sin\(/);
const base='effects/moves/v181-hand-drawn-fire/';
for(const [name,w,h] of [['flamethrower',144,48],['fireblast',48,40],['impact',112,112]]){
 const ase=fs.readFileSync(base+name+'/animation.aseprite');
 assert.equal(ase.readUInt32LE(0),ase.length,'header file size: '+name);
 assert.equal(ase.readUInt16LE(4),0xa5e0,'LibreSprite magic: '+name);
 assert.equal(ase.readUInt16LE(6),16);
 assert.equal(ase.readUInt16LE(8),w);assert.equal(ase.readUInt16LE(10),h);
 assert.equal(ase.readUInt16LE(12),32);
 let off=128,frames=0,art=new Set();
 while(off<ase.length){
  const size=ase.readUInt32LE(off),magic=ase.readUInt16LE(off+4);
  assert.equal(magic,0xf1fa,'ASE frame magic: '+name);
  assert.ok(size>30&&off+size<=ase.length,'frame boundaries');
  const count=ase.readUInt16LE(off+6);
  let cursor=off+16;
  for(let k=0;k<count;k++){
   const cs=ase.readUInt32LE(cursor),ct=ase.readUInt16LE(cursor+4);
   if(ct===0x2005){
    const raw=zlib.inflateSync(ase.subarray(cursor+6+20,cursor+cs));
    assert.equal(raw.length,w*h*4,'RGBA pixel dimensions');
    assert.ok(raw.some(c=>c>0),'not blank');
    art.add(crypto.createHash('sha256').update(raw).digest('hex'));
   }
   cursor+=cs;
  }
  assert.equal(cursor,off+size);off+=size;frames++;
 }
 assert.equal(frames,16);assert.equal(art.size,16,'not identical reused stills: '+name);
 const png=fs.readFileSync(base+name+'/sheet.png');
 assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.deepEqual([png.readUInt32BE(16),png.readUInt32BE(20)],[w*8,h*2],'LibreSprite sheet geometry');
 assert.ok(png.length>600);
 console.log('PASS V181',name,'16 distinct editable .aseprite frames, real LibreSprite PNG sheet');
}
class ImageMock {
 naturalWidth=0;naturalHeight=0;
 set src(x){this._src=x;const name=/v181-hand-drawn-fire\/([^/]+)\/sheet/.exec(x)?.[1];
  const s={flamethrower:[1152,96],fireblast:[384,80],impact:[896,224]}[name];
  if(s){this.naturalWidth=s[0];this.naturalHeight=s[1];this.onload?.();}
  else this.onerror?.();
 }get src(){return this._src;}
}
class BaseTexture{constructor(){this.scaleMode=null}static from(img){assert.ok(img.naturalWidth>0);return new BaseTexture}}
class Texture{constructor(base,rect){this.baseTexture=base;this.rect=rect}destroy(){}}
class Rectangle{constructor(x,y,w,h){this.x=x;this.y=y;this.width=w;this.height=h}}
class Sprite{constructor(tex){this.texture=tex;this.anchor={set(){}};this.position={set(){}}}destroy(){}}
class Container{constructor(){this.parent=null;this.children=[]}
 addChild(x){this.children.push(x);x.parent=this;return x}destroy(){this.parent=null}}
const PIXI={BaseTexture,Texture,Rectangle,Sprite,Container,SCALE_MODES:{NEAREST:0}};
function setup(search,gl=true){
 let ms=1000,native=0,legacy=0;
 const battle={active:true,energy:100},cooldowns={0:0,1:0},pokemon={};
 const app={renderer:{gl:gl?{isContextLost:()=>false}:null},stage:new Container()};
 class Engine{
  constructor(){this.canvas={isConnected:true};this.h=430;this.w=900;this.player={x:120,y:260};this.enemy={x:380,y:150,hp:120}}
  useMove(slot){battle.energy-=10;cooldowns[slot]=ms+1000;return true}
  hitTarget(who,type,power){native++;if(who==='enemy')this.enemy.hp-=power;return true}
  draw(){return true}destroy(){return true}
 }
 const engine=new Engine(),kit={paint(){legacy++;return true}},
 win={PIXI,PokemonTorrePixelFlyingBridge:{labStage:()=>gl?{app}:null},PokemonTorreV360Paint:()=>false};
 const ctx={window:win,Image:ImageMock,location:{search},URLSearchParams,
  BattleEngine:Engine,battle,cooldowns,current:()=>pokemon,
  skillSet:()=>[{name:'Flamethrower'},{name:'Fire Blast'}],foe:()=>engine.enemy,
  performance:{now:()=>ms},fireSpriteV41:kit};
 vm.runInNewContext(src,ctx,{timeout:2000});
 return{engine,win,battle,kit,advance:n=>{ms+=n},state:()=>win.PokemonTorreFireV181?.diagnostics(),
  get native(){return native},get legacy(){return legacy}};
}
const normal=setup('');
assert.equal(normal.win.PokemonTorreFireV181,undefined);
const safe=setup('?fire181=preview&safe=1');assert.equal(safe.win.PokemonTorreFireV181,undefined);
const x=setup('?fire181=preview');
assert.equal(x.state().ready,3);
x.engine.useMove(0);x.advance(200);x.engine.draw();
assert.equal(x.state().starts.flamethrower,1);
x.engine.hitTarget('enemy','fire',20);x.advance(100);x.engine.draw();
assert.equal(x.state().confirmedImpacts,1);
x.engine.useMove(1);x.advance(200);x.engine.draw();
assert.equal(x.state().starts.fireblast,1);
x.kit.paint({}, {name:'Fire Blast'},100,x.engine);
assert.ok(x.state().suppressedLegacy>0);
x.engine.hitTarget('enemy','fire',25);x.advance(90);x.engine.draw();
assert.equal(x.state().confirmedImpacts,2);
x.engine.hitTarget('enemy','fire',1);
assert.equal(x.state().confirmedImpacts,2,'star must not double');
assert.equal(x.native,3,'native damage not duplicated');
assert.equal(x.engine.enemy.hp,74);
assert.equal(x.battle.energy,80,'no additional costs');
x.advance(1600);x.engine.draw();
assert.equal(x.state().active.length,0,'all effects cleaned');
assert.equal(x.state().textureFrames,48,'3 individual sequences');
assert.deepEqual([...x.state().errors],[]);
const fallback=setup('?fire181=preview',false);
fallback.engine.useMove(1);
assert.equal(fallback.state().starts.fireblast,0);
fallback.kit.paint({}, {name:'Fire Blast'},100,fallback.engine);
assert.equal(fallback.legacy,1,'GPU missing preserves legacy Fire Blast');
console.log('PASS V181 integrated battle, native energy and HP, one WebGL, old versions untouched');
