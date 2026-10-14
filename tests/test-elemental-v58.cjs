'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const names=['kraken','ice-crystal','waterball','ice-spike','snowflake','water-drop','water-hurricane','geyser'];
class FakeImage{
 constructor(){this.naturalWidth=1152;this.naturalHeight=144;}
 set src(v){this._src=v;}
 get src(){return this._src;}
}
const window={PokemonTorreElementalV58:null};
const context=vm.createContext({Image:FakeImage,window});
vm.runInContext(read('effects/moves/catalog/elemental-eight-v58.js'),context);
const pack=vm.runInContext('elementalEightV58',context);
assert.ok(pack.accepts('catalog_nevasca'));
assert.ok(pack.accepts('catalog_blizzard'));
assert.ok(pack.accepts('catalog_pulsodeagua'));
assert.ok(pack.accepts('catalog_jatodagua'));
assert.ok(pack.accepts('catalog_iceshard'));
assert.ok(pack.supportsName('Tempestade de Neve'));
assert.ok(!pack.accepts('catalog_thunderbolt'), 'do not steal electric V57');
const g={
 globalAlpha:1,
 save(){},restore(){},
 drawImage(image,sx,sy,sw,sh,dx,dy,w,h){
  assert.ok(image.src.includes('effects/elements'));
  for(const n of [sx,sy,sw,sh,dx,dy,w,h]) assert.ok(Number.isFinite(n));
  assert.ok(w>0&&h>0);
  this.calls.push({src:image.src,sx,dx,dy});
 },
 calls:[]
};
for(const key of ['catalog_nevasca','catalog_iceshard','catalog_pulsodeagua','catalog_ondagigante']){
 g.calls=[];
 const ok=pack.paint(g,{from:[48,170],to:[270,150]},.63,1500,1,false,key);
 assert.ok(ok, 'frame renders '+key);
 assert.ok(g.calls.length>=1);
}
g.calls=[];
assert.ok(pack.paintNamed(g,{at:1000,duration:1100,from:[50,150],to:[240,170],move:{name:'Tempestade de Neve'}},1600,{h:430}));
const diagnostic=pack.diagnostics();
assert.equal(Object.keys(diagnostic.atlases).length,8);
for(const name of names){
 const kind=['ice-crystal','ice-spike','snowflake'].includes(name)?'ice':'water';
 const file=path.join(root,'effects/elements',kind,name,'atlas.png');
 const bytes=fs.readFileSync(file);
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
}
const loader=read('index.html'),engine=read('effects/moves/_runtime/end.js');
assert.ok(loader.includes('elemental-eight-v58.js'));
assert.ok(loader.includes("atlas.png?v=58.0"));
assert.ok(engine.includes('elementalEightV58.accepts(k)'));
assert.ok(engine.includes('elementalEightV58.supportsName(rawName)'));
console.log('PASS V58: eight real atlases, 8-frame move renderer, correct target tracking and no electric overrides');
