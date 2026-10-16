'use strict';
/* V108 real user gallery pixel sprites, keeping X Cross Chop V107 proportionally small.
 * Three separate pre-baked frame-by-frame clips, no CSS/procedural Canvas art.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const root='effects/moves/v108-fighting/';
const index=fs.readFileSync('index.html','utf8'),dep=fs.readFileSync('.github/workflows/deploy.yml','utf8');
assert.ok(index.includes('v108-gba-pixels'));assert.ok(index.includes('v104-real-contact'));
assert.ok(dep.includes('tools/build-v108-fighting.py'));
const src=fs.readFileSync(root+'source-gallery-pixels.png');
assert.equal(src.toString('ascii',1,4),'PNG');assert.ok(src.length>400);
const reg=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
for(const name of ['Chute','Golpe de Karatê','Cross Chop','Brick Break']){
 const r=reg.moves.find(m=>m.move===name);
 assert.ok(['V108','V109','V110'].includes(r.version));assert.equal(r.status,'aprovado');assert.equal(r.protect,true);
}
const v107=fs.readFileSync('effects/moves/v107-fighting/real-sprites.js','utf8');
assert.ok(v107.includes("name==='cross'?.30:1"),'Cross only scale adjusted, same authored V107 red X');
const specs={chute:8,karate:12,brick:16};
for(const [name,n] of Object.entries(specs)){
 const file=root+'sheets/'+name+'.webp';
 assert.ok(fs.existsSync(file),'not baked '+file);
 const bytes=fs.readFileSync(file);
 assert.equal(bytes.toString('ascii',0,4),'RIFF');
 assert.equal(bytes.toString('ascii',8,12),'WEBP');
 assert.ok(bytes.length>500,'no empty frame atlas '+name);
}
const callbacks=new Map(),events=[],imags=[];
class MockImage {
 constructor(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0;}
 addEventListener(){}
 set src(u){const m=/sheets\/(chute|karate|brick)\.webp/.exec(u);assert.ok(m,u);
  this.complete=true;this.naturalWidth=specs[m[1]]*96;this.naturalHeight=96;imags.push(u);}
}
const w={PokemonTorreFightingV104:{retexture(n,fn){callbacks.set(n,fn)}}};
const vmctx=vm.createContext({window:w,Image:MockImage,Math,console});
vm.runInContext(fs.readFileSync(root+'real-pixel-sprites.js','utf8'),vmctx);
assert.equal(callbacks.size,3);
assert.equal(w.PokemonTorreFightingPixelsV108.diagnostics().ready.length,3);
const g={globalAlpha:1,imageSmoothingEnabled:true,save(){},restore(){},
 drawImage(...args){events.push([...args.slice(1)]);},
 beginPath(){throw Error('No CSS-like drawn shapes allowed')},
 stroke(){throw Error('No Canvas strokes allowed')},
 fill(){throw Error('No Canvas shapes allowed')}};
for(const [n,k] of [['Chute','chute'],['Golpe de Karatê','karate'],['Brick Break','brick']]){
 const current=events.length;
 for(let f=0;f<specs[k];f++){
  callbacks.get(n)(g,{to:[310,230],t:(f+.45)/specs[k],scale:1,hit:.59,frames:specs[k],frame:f});
  const a=events.at(-1);
  assert.equal(a[0],f*96,'unique sprite source frame');
  assert.equal(a[2],96);assert.equal(a[3],96);
  assert.ok(a[6]<=105&&a[7]<=105,'size proportional to Pokemon');
  assert.equal(g.imageSmoothingEnabled,false);
 }
 assert.equal(events.length-current,specs[k]);
}
const d=w.PokemonTorreFightingPixelsV108.diagnostics();
assert.equal(d.version,'108.0');assert.equal(d.canvasFrames,36);
assert.deepEqual(Object.keys(d.draws).sort(),['brick','chute','karate']);
console.log('PASS V108 pixel sprites 8/12/16 from GBA gallery, V107 red X preserved smaller; no CSS/lines');
