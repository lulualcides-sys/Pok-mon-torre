'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
class FakeImage {constructor(){this.naturalWidth=2048;this.naturalHeight=256;}
 set src(x){this._src=x;}get src(){return this._src;}}
const ctx=vm.createContext({Image:FakeImage,window:{}});
vm.runInContext(read('effects/moves/v60-four/render.js'),ctx);
const renderer=vm.runInContext('cinematicFourV60',ctx);
const variants=[
 ['catalog_nevasca','nevasca','ice'],
 ['catalog_faiscadopikachu','faisca-do-pikachu','contact'],
 ['catalog_volttackle','volt-tackle','contact']
];
const known=read('effects/moves/catalog/bundle.js');
for(const [key] of variants){
 assert.ok(known.includes('registerMove("'+key+'"'),'not registered in game: '+key);
 assert.ok(renderer.accepts(key),'V60 does not handle '+key);
}
assert.ok(renderer.supportsName('Tempestade de Neve'));
assert.ok(renderer.supportsName('TEMPESTADE DE NEVE'));
assert.ok(!renderer.supportsName('Tempestade Psíquica'));
const protectedMoves=['catalog_thunderbolt','catalog_trovao','catalog_faisca','catalog_faiscadejolteon',
 'catalog_triattack','catalog_confusion','catalog_psybeam','catalog_pulsodagua',
 'catalog_iceshard','catalog_raio','catalog_descarga','catalog_firespin'];
for(const old of protectedMoves)assert.ok(!renderer.accepts(old),'approved/unrelated renderer override '+old);
const c={frames:[],save(){},restore(){},
 drawImage(img,sx,sy,sw,sh,x,y,w,h){
  assert.equal(sw,256);assert.equal(sh,256);
  assert.ok([sx,sy,x,y,w,h].every(Number.isFinite));
  assert.ok(w>0&&h>0);
  this.frames.push({id:img.src,sx,x,y,w,h});
 }};
const fx={at:1000,duration:950,from:[55,168],to:[247,152],name:'Faísca do Pikachu'};
for(const [key,id,kind] of variants){
 c.frames=[];
 for(let i=0;i<8;i++)assert.ok(renderer.paint(c,fx,(i+.15)/8,1100,1,false,key));
 assert.equal(c.frames.length,8,id);
 assert.equal(new Set(c.frames.map(a=>a.sx)).size,8,id+' sequence not animated');
 assert.ok(c.frames.every(a=>a.id.includes('/'+id+'/')),id+' wrong asset');
 if(kind==='contact')assert.ok(c.frames[0].x<c.frames[5].x,'no forward travel '+id);
}
c.frames=[];
for(let i=0;i<8;i++)
 assert.ok(renderer.paintNamed(c,{...fx,name:'Tempestade de Neve'},1000+(i+.2)*950/8,{h:430}));
assert.equal(new Set(c.frames.map(a=>a.sx)).size,8,'missing eight snowstorm frames');
assert.equal(renderer.diagnostic().catalogMoves.length,3);
for(const id of ['tempestade-de-neve','nevasca','faisca-do-pikachu','volt-tackle']){
 const f=path.join(root,'effects/moves/v60-four',id,'atlas.png');
 const buf=fs.readFileSync(f);
 assert.equal(buf.subarray(0,8).toString('hex'),'89504e470d0a1a0a',id);
 assert.equal(buf.readUInt32BE(16),2048);assert.equal(buf.readUInt32BE(20),256);
}
// Four approved sprite atlases are frozen at V61.2. Never overwrite them
// during a performance-only fix or an unrelated generator workflow.
const crypto=require('node:crypto');
const approved=JSON.parse(read('effects/moves/v60-four/APPROVED-ART-V61.2.json'));
assert.equal(Object.keys(approved.frozenFiles).length,4);
for(const [filename,blobSha] of Object.entries(approved.frozenFiles)){
 const source=fs.readFileSync(path.join(root,filename));
 const digest=crypto.createHash('sha1').update('blob '+source.length+'\\0').update(source).digest('hex');
 assert.equal(digest,blobSha,'Approved art modified without permission: '+filename);
}
const loader=read('index.html'),runtime=read('effects/moves/_runtime/end.js');
assert.ok(loader.includes('effects/moves/v60-four/render.js'));
assert.ok(loader.includes("atlas.png?v=61.2"));
assert.ok(runtime.includes('cinematicFourV60.accepts(k)'));
assert.ok(runtime.indexOf('cinematicFourV60.accepts(k)')<runtime.indexOf('elementalEightV58.accepts(k)'));
assert.ok(runtime.includes('cinematicFourV60.supportsName('));
console.log('PASS: 4 real attacks; 32 separate frames; movement to enemy; legacy attacks protected.');
