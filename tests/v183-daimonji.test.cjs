'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),zlib=require('node:zlib'),crypto=require('node:crypto');
const path='effects/moves/v183-daimonji/';
const image=fs.readFileSync(path+'sheet.png');
assert.equal(image.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
assert.deepEqual([image.readUInt32BE(16),image.readUInt32BE(20)],[768,512]);
assert.equal(image[25],6,'RGBA pixels');
let at=8,idat=[];
while(at<image.length){const sz=image.readUInt32BE(at),type=image.subarray(at+4,at+8).toString();if(type==='IDAT')idat.push(image.subarray(at+8,at+8+sz));at+=sz+12;}
const raw=zlib.inflateSync(Buffer.concat(idat)),stride=768*4+1;
assert.equal(raw.length,512*stride);
const px=(frame,x,y)=>{
 const x0=(frame%4)*192+x,y0=Math.floor(frame/4)*128+y;
 return [...raw.subarray(y0*stride+1+x0*4,y0*stride+5+x0*4)];
};
const hashes=[];
for(let frame=0;frame<16;frame++){
 const b=Buffer.alloc(192*128*4);let n=0,opaque=0;
 for(let y=0;y<128;y++)for(let x=0;x<192;x++){
 const p=px(frame,x,y);Buffer.from(p).copy(b,n);n+=4;if(p[3])opaque++;
 }
 assert.ok(opaque>100,'nonempty frame '+frame);
 hashes.push(crypto.createHash('sha1').update(b).digest('hex'));
}
assert.equal(new Set(hashes).size,16,'all frames different');
for(const xy of [[98,22],[56,54],[140,50],[48,108],[146,110],[100,66]])
 assert.ok(px(9,...xy)[3]>0,'kanji arm '+xy);
assert.equal(px(9,100,113)[3],0,'no sixth central leg');
const src=fs.readFileSync(path+'runtime.js','utf8');
new vm.Script(src);
assert.match(src,/SCALE_MODES\.NEAREST/);
assert.doesNotMatch(src,/createElement\(|getContext\(|requestAnimationFrame\(|\.tint\s*=/);
const html=fs.readFileSync('index.html','utf8');
assert.match(html,/get\('fire183'\)==='preview'/);
assert.match(html,/v183-daimonji\/runtime\.js/);
class ImageMock{naturalWidth=768;naturalHeight=512;set src(x){this._src=x;this.onload?.()}}
class Container{parent=null;children=[];addChild(x){x.parent=this;this.children.push(x);return x}destroy(){this.parent=null}}
class Sprite{constructor(tex){this.texture=tex;this.anchor={set(){}};this.position={set(){}};this.alpha=1}destroy(){}}
class Texture{constructor(base,r){this.base=base;this.rect=r}destroy(){}}
class BaseTexture{static from(){return {scaleMode:null}}}
class Rectangle{constructor(x,y,w,h){Object.assign(this,{x,y,w,h})}}
const PIXI={Container,Sprite,Texture,BaseTexture,Rectangle,SCALE_MODES:{NEAREST:0}};
function setup(search='',webgl=true){
 let ms=1000,native=0,old=0;
 const battle={active:true,energy:100},cooldowns={0:0,1:0},pkm={};
 const app={renderer:{gl:webgl?{isContextLost:()=>false}:null},stage:new Container()};
 class Engine{
  constructor(){this.canvas={isConnected:true};this.player={x:120,y:270};this.enemy={x:360,y:155,hp:120};this.h=420;this.w=900}
  useMove(slot){battle.energy-=10;cooldowns[slot]=ms+1500;return true}
  hitTarget(who,type,power){native++;if(who==='enemy')this.enemy.hp-=power;return true}
  draw(){return true}
  destroy(){return true}
 }
 const engine=new Engine();const window={PIXI,PokemonTorrePixelFlyingBridge:{labStage:()=>({app})},
 PokemonTorreV360Paint(){old++;return false}};
 const context={window,Image:ImageMock,URLSearchParams,location:{search},BattleEngine:Engine,
 performance:{now:()=>ms},battle,cooldowns,current:()=>pkm,
 skillSet:()=>[{name:'Fire Blast'},{name:'Flamethrower'}],foe:()=>engine.enemy,
 fireSpriteV41:{paint(){old++;return false}}};
 vm.runInNewContext(src,context,{timeout:1800});
 return {engine,battle,window,advance:n=>ms+=n,state:()=>window.PokemonTorreFireBlastV183?.diagnostics(),
 get native(){return native},get old(){return old}};
}
assert.equal(setup('').state(),undefined);
assert.equal(setup('?fire183=preview&safe=1').state(),undefined);
const p=setup('?fire183=preview');assert.equal(p.state().ready,true);
p.engine.useMove(0);assert.equal(p.state().casts,1);
p.advance(180);p.engine.draw();assert.ok(p.state().active.frame>=2);
p.engine.hitTarget('enemy','fire',21);p.engine.draw();
assert.equal(p.state().confirmedHits,1);assert.equal(p.state().active.frame,4);
p.advance(550);p.engine.draw();assert.ok(p.state().active.frame>=11);
p.advance(350);p.engine.draw();assert.equal(p.state().active,null);
assert.equal(p.engine.enemy.hp,99);assert.equal(p.battle.energy,90);assert.equal(p.native,1);
p.engine.useMove(1);assert.equal(p.state().casts,1,'Flamethrower unaffected');
assert.deepEqual([...p.state().errors],[]);
const fallback=setup('?fire183=preview',false);fallback.engine.useMove(0);
assert.equal(fallback.state().casts,0);
fallback.window.PokemonTorreV360Paint({}, {name:'Fire Blast'},0,fallback.engine);
assert.equal(fallback.old,1,'old effect remains visible without WebGL');
console.log('PASS V183: canonical 大 glyph, 16 unique transparent pixel frames, native damage, only Fire Blast, WebGL fallback');
