'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ids=['stun-spore','po-do-sono','leech-seed','esporos'];
const keys=['catalog_stunspore','catalog_podosono','catalog_leechseed','catalog_esporos'];
const catalog=read('effects/moves/catalog/bundle.js');
for(const k of keys)
 assert.ok(catalog.includes('registerMove("'+k+'"'),'Missing actual selectable move '+k);
const runtime=read('effects/moves/_runtime/end.js');
const loader=read('index.html');
assert.ok(loader.includes('effects/moves/v63-plant/render.js'));
assert.ok(loader.includes('atlas.png?v=63.0'));
assert.ok(loader.includes('plantFourV63'));
assert.ok(runtime.includes('plantFourV63.paint(g,f,t,now,s,low,k)'));
assert.ok(runtime.indexOf('plantFourV63.accepts(k)')<runtime.indexOf('cinematicFourV60.accepts(k)'));
assert.ok(!runtime.includes('plantFourV63.paint(g,f,t,now,s,low,k)||entry.draw'));
const oldApproved=JSON.parse(read('effects/moves/v60-four/APPROVED-ART-V61.2.json'));
for(const [file,sha] of Object.entries(oldApproved.frozenFiles)){
 const buf=fs.readFileSync(path.join(root,file));
 const got=crypto.createHash('sha1').update('blob '+buf.length+'\0').update(buf).digest('hex');
 assert.equal(got,sha,'Changed approved electric/ice atlas: '+file);
}
const allImages=[];
class ImageMock{
 constructor(){this.naturalWidth=1536;this.naturalHeight=192;allImages.push(this);}
 set src(v){this._src=v;} get src(){return this._src;}
}
const bitmaps=[];
const ctx=vm.createContext({Image:ImageMock,
 createImageBitmap:(im,sx,sy,w,h)=>{
  assert.ok(Number.isInteger(sx)&&sx>=0&&sx<=1344);
  assert.equal(sy,0);assert.equal(w,192);assert.equal(h,192);
  const bmp={isBitmap:true,sx,w,h,id:im.src};
  bitmaps.push(bmp);return Promise.resolve(bmp);
 },window:{}});
vm.runInContext(read('effects/moves/v63-plant/render.js'),ctx);
const fx=vm.runInContext('plantFourV63',ctx);
async function main(){
 assert.equal(allImages.length,4);
 for(const img of allImages)img.onload();
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(bitmaps.length,32);
 assert.ok(Object.values(fx.diagnostics().predecoded).every(n=>n===8));
 const g={calls:[],save(){},restore(){},
  drawImage(...args){this.calls.push(args);},
  set imageSmoothingEnabled(v){},set globalAlpha(v){}};
 for(let index=0;index<keys.length;index++){
  const key=keys[index],id=ids[index];
  assert.ok(fx.accepts(key),'Unrecognized move '+key);
  for(let frame=0;frame<8;frame++){
   const result=fx.paint(g,{from:[42,155],to:[213,130]},(frame+.12)/8,1000,1,false,key);
   assert.equal(result,true,'Visual route must consume and replace original status FX');
  }
  const batch=g.calls.slice(index*8,index*8+8);
  assert.equal(batch.length,8,id);
  assert.equal(new Set(batch.map(x=>x[0].sx)).size,8,id+' repeated frame');
  assert.ok(batch.every(x=>x[0].id.includes('/'+id+'/')),id+' rendered wrong sprite');
 }
 for(const k of ['catalog_nevasca','catalog_volttackle','catalog_faiscadopikachu',
 'catalog_thunderbolt','catalog_confusion','catalog_psybeam','catalog_firespin',
 'catalog_bombadesementes','catalog_sleeppowder'])
  assert.ok(!fx.accepts(k),'Unrequested/approved move overridden '+k);
 assert.equal(fx.diagnostics().moves.length,4);
 for(const id of ids){
  const file=path.join(root,'effects/moves/v63-plant',id,'atlas.png');
  const png=fs.readFileSync(file);
  assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a',id);
  assert.equal(png.readUInt32BE(16),1536,id);
  assert.equal(png.readUInt32BE(20),192,id);
 }
 console.log('PASS V63: four real statuses, 32 predecoded sprite frames, old visuals suppressed; approved art unchanged');
}
main().catch(err=>{console.error(err);process.exitCode=1});
