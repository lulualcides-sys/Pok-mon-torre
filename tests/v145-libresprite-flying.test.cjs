'use strict';
/* V145: LibreSprite actual editable ASE source; PixiJS only in combat.
 * No Python drawing, no old Canvas2D generic V144 overlay, V143 stays untouched.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm'),zlib=require('node:zlib');
const read=f=>fs.readFileSync(f,'utf8'),root='effects/moves/v145-flying-libresprite/';
const names=['Bico Broca','Vendaval','Aerocorte','Pique'],dirs=['bico-broca','vendaval','aerocorte','pique'];
const hashes=[
 '1d9a251a3962c5d39e28c5e7099c81af6204e7a41fe74791b6def57d0204808b',
 '06529928bd12b1f852a5342e5461a38572cdf3c5ee2e8db54c1fb5a0f46fbc8a',
 'e39423c04f14e3b6a7490e5ee4697e6e19618799384d1772c17d11c342ebfd6d',
 'd7cd2bf282814980fc52f4b3332d3190328a0b86ee12d0e354821b614317f667'
];
for(let i=0;i<dirs.length;i++){
 const name=dirs[i],ase=fs.readFileSync(root+name+'/animation.aseprite');
 assert.equal(ase.readUInt32LE(0),ase.length,'ASE filesize mismatch: '+name);
 assert.equal(ase.readUInt16LE(4),0xa5e0,'source must be a real Aseprite/LibreSprite file: '+name);
 assert.equal(ase.readUInt16LE(6),16,'expected sixteen user sprite frames: '+name);
 assert.equal(ase.readUInt16LE(8),128);assert.equal(ase.readUInt16LE(10),128);
 assert.equal(ase.readUInt16LE(12),32);
 assert.equal(crypto.createHash('sha256').update(ase).digest('hex'),hashes[i],
  "do not replace the saved sprites with procedural artwork: "+name);
 let offset=128,n=0,distinct=new Set();
 while(offset+16<=ase.length){
  const size=ase.readUInt32LE(offset),magic=ase.readUInt16LE(offset+4);
  assert.equal(magic,0xf1fa,'invalid animation frame '+n);
  assert.ok(size>=20&&offset+size<=ase.length);
  let chunkOffset=offset+16,chunkCount=ase.readUInt16LE(offset+6);
  for(let c=0;c<chunkCount;c++){
   const cs=ase.readUInt32LE(chunkOffset),type=ase.readUInt16LE(chunkOffset+4);
   if(type===0x2005){
    const raw=zlib.inflateSync(ase.subarray(chunkOffset+6+20,chunkOffset+cs));
    assert.equal(raw.length,128*128*4);
    assert.ok(raw.some(x=>x!==0));
    distinct.add(crypto.createHash('sha256').update(raw).digest('hex'));
   }
   chunkOffset+=cs;
  }
  assert.equal(chunkOffset,offset+size,'frame chunk lengths mismatched');
  offset+=size;n++;
 }
 assert.equal(n,16);assert.ok(distinct.size>=8,'not truly animated: '+name);
 const out=fs.readFileSync(root+name+'/sheet.png');
 assert.equal(out.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.deepEqual([out.readUInt32BE(16),out.readUInt32BE(20)],[1024,256],
  'LibreSprite must export 8 columns x 2 rows with no trims: '+name);
 assert.ok(out.length>1500&&out.length<1_000_000);
 const json=JSON.parse(read(root+name+'/sheet.json'));
 assert.equal(Array.isArray(json.frames)?json.frames.length:Object.keys(json.frames||{}).length,16);
 console.log('PASS V145 LibreSprite',name,': 16 source frames,',distinct.size,'unique; editable ASE; real PNG atlas');
}
const index=read('index.html'),pixi=read('effects/moves/_runtime/pixi-layer.js'),native=read('parts/p013.txt');
const rt=read(root+'runtime.js');
assert.doesNotThrow(()=>new vm.Script(rt));
assert.match(pixi,/spec\.flying145/);assert.match(pixi,/PIXI\.SCALE_MODES\.NEAREST/);
assert.match(native,/PokemonTorreFlyingLibreV145/);
assert.match(index,/get\('flying145'\)!=='0'/);
assert.match(index,/get\('flying145'\)==='0'/);
assert.match(index,/v145-flying-libresprite\/runtime\.js/);
assert.doesNotMatch(rt,/getContext\(|drawImage\(|requestAnimationFrame\(|drawCatalogMove\(/);
const approved=JSON.parse(read('effects/moves/STATUS_APROVADOS.json')).moves;
assert.equal(approved.length,48);
for(const name of ['Roost','Rajada','Bicada','Air Slash'])
 assert.ok(approved.find(x=>x.move===name)?.protect,'V143 saved sprites changed: '+name);
for(const name of names)assert.ok(!approved.some(x=>x.move===name),'preview cannot mark itself approved');
const battle={active:true};
class ImageMock{
 naturalWidth=1024;naturalHeight=256;
 set src(v){this._src=v;this.onload?.();}
 get src(){return this._src;}
}
let nMounted=0,previous=0;
class BattleEngine{
 constructor(){this.player={x:150,y:220},this.enemy={x:360,y:200};this.canvas={isConnected:true};this.v359Attacks=[];}
 useMove(slot){const move={name:names[slot]};this.v359Attacks.push({move,battle,at:100,end:900,duration:800,from:[150,220],to:[360,200],times:[.64]});return true;}
}
const skillSet=()=>names.map(name=>({name})),current=()=>({});
const window={PokemonTorrePixelFlyingBridge:{mountPixelFlying:(engine,fx,spec)=>{nMounted++;assert.equal(spec.frames,16);assert.equal(spec.frameSize,128);assert.ok(spec.image.src.includes(spec.dir+'/sheet.png'));return true;}},PokemonTorreV360Paint:()=>{previous++;return false;}};
const ctx={window,Image:ImageMock,BattleEngine,skillSet,current,battle,URLSearchParams,location:{search:''},console};
vm.runInNewContext(rt,ctx,{timeout:4000});
assert.equal(window.PokemonTorreFlyingLibreV145.diagnostics().ready,4);
const b=new BattleEngine();
for(let i=0;i<4;i++){assert.equal(b.useMove(i),true);const fx=b.v359Attacks.at(-1);
 assert.equal(window.PokemonTorreV360Paint({},fx,220,b),true);assert.equal(fx.times.length,1);
}
assert.equal(nMounted,8,'load and frame paint should reuse mounted Pixi stage without old 2D drawing');
assert.equal(window.PokemonTorreV360Paint({}, {move:{name:'Roost'}},220,b),false);
assert.equal(previous,1);
console.log('PASS V145: LibreSprite original assets, four battle GPU casts, V143 protected; no Python or Canvas2D art.');
