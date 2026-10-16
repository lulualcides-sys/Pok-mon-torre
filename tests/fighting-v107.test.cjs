'use strict';
/* V107: all FOUR real illustrated multi-frame WebP sheets.
 * Test no CSS/vector drawing, no projectile and same impact-clock V104.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const root='effects/moves/v107-fighting/',spec={chute:8,karate:12,cross:16,brick:16};
const index=fs.readFileSync('index.html','utf8');
const approved=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
assert.ok(index.includes('v107-illustrated-sprites'));
assert.ok(index.includes('v104-real-contact'));
for(const [name,n] of Object.entries(spec)){
 const row=approved.moves.find(x=>x.move.toLowerCase()==={
  chute:'chute',karate:'golpe de karatê',cross:'cross chop',brick:'brick break'}[name]);
 assert.ok(['V107','V108','V109','V110'].includes(row?.version));assert.equal(row?.status,'em_teste');
 const webp=root+'sheets/'+name+'.webp';
 assert.ok(fs.existsSync(webp),'missing REAL generated illustrated spritesheet '+webp);
 const raw=fs.readFileSync(webp);
 assert.equal(raw.toString('ascii',0,4),'RIFF','WebP file header');
 assert.equal(raw.toString('ascii',8,12),'WEBP','WebP anim atlas');
 assert.ok(raw.length>1600,'sheet must not be tiny placeholder '+webp);
}
const names=['Chute','Golpe de Karatê','Cross Chop','Brick Break'];
const calls=new Map(),canvasImages=[],framesByStyle=new Map();
class ImageFake{
 constructor(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0;}
 set src(value){
  const x=/sheets\/(chute|karate|cross|brick)\.webp/.exec(value);
  assert.ok(x,'unexpected sprite '+value);
  const style=x[1];this.complete=true;this.naturalWidth=spec[style]*256;this.naturalHeight=192;
  this._src=value;
 }
 get src(){return this._src;}
 addEventListener(kind,cb){if(kind==='load')cb();}
}
const window={PokemonTorreFightingV104:{retexture(name,cb){calls.set(name,cb)}}};
const context=vm.createContext({window,Image:ImageFake,console,Math});
vm.runInContext(fs.readFileSync(root+'real-sprites.js','utf8'),context,{filename:'real-sprites.js'});
assert.equal(calls.size,4);
const g={globalAlpha:1,imageSmoothingEnabled:false,save(){},restore(){},
 drawImage(...args){canvasImages.push(args)},
 beginPath(){throw Error('CSS-like geometry was used')},
 lineTo(){throw Error('CSS-like line was used')},
 arc(){throw Error('CSS-like circle was used')},
 fill(){throw Error('CSS-like fill was used')},
 stroke(){throw Error('CSS-like stroke was used')}};
const namesToStyles={Chute:'chute','Golpe de Karatê':'karate','Cross Chop':'cross','Brick Break':'brick'};
for(const [name,style] of Object.entries(namesToStyles)){
 const painted=[];
 for(let frame=0;frame<spec[style];frame++){
  const t=(frame+.4)/spec[style];
  const paintedBefore=canvasImages.length;
  calls.get(name)(g,{name,to:[330,190],frame,frames:spec[style],t,
   scale:1,hit:style==='cross'?.62:.59});
  assert.equal(canvasImages.length,paintedBefore+1,'one real sprite frame / clock');
  const a=canvasImages.at(-1);
  assert.equal(a[1],frame*256,'correct actual atlas frame');
  assert.equal(a[2],0);assert.equal(a[3],256);assert.equal(a[4],192);
  painted.push(a[1]);
 }
 assert.equal(new Set(painted).size,spec[style]);
 framesByStyle.set(style,painted.length);
}
const d=window.PokemonTorreFightingSpritesV107.diagnostics();
assert.equal(d.version,'107.0');
assert.equal(d.canvasFrames,52);
assert.equal(d.ready.length,4);
assert.ok(!d.errors.length);
assert.equal(d.pixiFrames,0,'fake unit environment has no WebGL');
assert.deepEqual(Object.keys(d.rendered).sort(),['brick','chute','cross','karate']);
console.log('PASS V107: real illustrated WebP atlas animation (8/12/16/16), no CSS/Canvas geometry, no projectile');
