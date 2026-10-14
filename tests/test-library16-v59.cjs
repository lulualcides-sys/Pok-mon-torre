'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=where=>fs.readFileSync(path.join(__dirname,'..',where),'utf8');
const ids=['fire_attack','firewall','explosion','sun_strike','lightning',
'lightning_ball','tornado','water_attack','spikes','shield','black_hole',
'hypnosis','magic_arrow','midas_touch','cloud','time'];
const cases={
 fire_attack:'catalog_brasaviva',firewall:'catalog_firespin',explosion:'catalog_explosion',
 sun_strike:'catalog_sunnyday',lightning:'catalog_raio',
 lightning_ball:'catalog_choquemagnetico',tornado:'catalog_ventocortante',
 water_attack:'catalog_bolhas',spikes:'catalog_pedraafiada',
 shield:'catalog_protect',black_hole:'catalog_esferaescura',
 hypnosis:'catalog_hypnosis',magic_arrow:'catalog_raioencantado',
 midas_touch:'catalog_brilhomagico',cloud:'catalog_nevoatoxica',
 time:'catalog_futuresight'
};
class ImageMock{
 constructor(){this.naturalWidth=1280;this.naturalHeight=160;}
 set src(s){this._src=s;}get src(){return this._src;}
}
const sandbox=vm.createContext({Image:ImageMock,window:{}});
vm.runInContext(read('effects/moves/catalog/library16-v59.js'),sandbox);
const fx=vm.runInContext('library16V59',sandbox);
const manifest=fx.diagnostics();
assert.equal(manifest.version,'59.0');
assert.equal(manifest.registeredEffects.length,16);
assert.ok(manifest.assignedMoves>=16);
assert.equal(Object.keys(manifest.ready).length,16);
const bundle=read('effects/moves/catalog/bundle.js');
const protectedSet=['catalog_triataque','catalog_tempestadepsiquica','catalog_chicotedevinha',
 'catalog_confusion','catalog_psybeam','catalog_tsunami','catalog_hydropump',
 'catalog_faisca','catalog_discharge','catalog_trovao','catalog_tempestadederaio',
 'catalog_thunderbolt','catalog_choque','catalog_faiscadejolteon'];
for(const key of protectedSet)assert.ok(!fx.accepts(key), 'protected animation was overridden: '+key);
const g={calls:[],save(){},restore(){},translate(){},rotate(){},globalAlpha:1,
 drawImage(img,sx,sy,sw,sh,dx,dy,w,h){
  assert.ok(img.src.startsWith('effects/elements/v59/'));
  assert.ok(sx>=0&&sx<=7*160&&sy===0&&sw===160&&sh===160);
  assert.ok([dx,dy,w,h].every(Number.isFinite)&&w>0&&h>0);
  this.calls.push({src:img.src,sx,dx,dy,w,h});
 }};
for(const [id,key] of Object.entries(cases)){
 assert.ok(fx.accepts(key),id+': catalog move not mapped');
 assert.ok(bundle.includes('registerMove("'+key+'"'),id+': not a real catalog move');
 g.calls=[];
 for(let phase=0;phase<8;phase++){
  const ok=fx.paint(g,{from:[60,160],to:[240,140]},(phase+.05)/8,1000,1,false,key);
  assert.ok(ok,id+': frame '+phase+' failed');
 }
 assert.equal(g.calls.length,8,id+': not all eight frame draws');
 assert.equal(new Set(g.calls.map(q=>q.sx)).size,8,id+': repeated frames');
 assert.ok(g.calls.every(q=>q.src.includes('/'+id+'/')),id+': wrong sprite');
}
for(const id of ids){
 const png=fs.readFileSync(path.join(__dirname,'..','effects/elements/v59',id,'atlas.png'));
 assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a',id);
 assert.equal(png.readUInt32BE(16),1280,id);
 assert.equal(png.readUInt32BE(20),160,id);
}
const loader=read('index.html'),runtime=read('effects/moves/_runtime/end.js');
assert.ok(loader.includes('effects/moves/catalog/library16-v59.js'));
assert.ok(loader.includes("atlas.png?v=59.0"));
assert.ok(runtime.includes('library16V59.accepts(k)'));
assert.ok(runtime.indexOf('library16V59.accepts(k)')<runtime.indexOf('elementalEightV58.accepts(k)'));
console.log('PASS V59: 16 RGBA atlases, 128 unique frames, 16 real game mappings, no protected overrides');
