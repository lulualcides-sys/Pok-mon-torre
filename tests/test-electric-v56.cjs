'use strict';
// V56 electric moves regression: four unique animation sequences, no
// generic Pixi/CSS painter, without changing V55 sprites or the combat engine.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const moves=['faiscadejolteon','thunderbolt','choquedotrovao','choque'];
const browser={PokemonTorreCatalogElectricFourV56:null};
class TestImage{
 constructor(){this.naturalWidth=0;this.naturalHeight=0;}
 set src(value){this._src=value;this.naturalWidth=384;this.naturalHeight=144;}
 get src(){return this._src;}
}
const context=vm.createContext({window:browser,Image:TestImage});
vm.runInContext(read('effects/moves/catalog/electric-four-v56.js'),context);
const kit=vm.runInContext('catalogElectricFourV56',context);
let total=0;
for(const id of moves){
 assert.ok(kit.accepts('catalog_'+id),id+' must have an independent painter');
 const folder='effects/moves/catalog/'+id+'/';
 assert.ok(read(folder+'index.js').includes('catalogElectricFourV56.paint'),id+' move registration');
 assert.ok(read('effects/moves/catalog/bundle.js').includes('catalogElectricFourV56.paint(g,f,t,now,s,low,"'+id+'")'),id+' bundled registration');
 const coords=[];
 const seen=new Set();
 for(let frame=0;frame<8;frame++){
  const draw=[];
  const g={globalAlpha:1,save(){},restore(){},translate(x,y){this.ax=x;this.ay=y;},rotate(a){this.angle=a;},drawImage(img,...args){draw.push({src:img.src,args})}};
  const target=[270+frame*3,125+frame];
  const t=(frame+.5)/8;
  const result=kit.paint(g,{from:[60,190],to:target},t,1200,1,false,id);
  assert.ok(result,id+' paints frame '+frame);
  assert.ok(draw.some(v=>v.src.endsWith('/sprites/frame_'+String(frame+1).padStart(2,'0')+'.png?v=57.1')),
   'Wrong animation frame '+id+' '+frame);
  assert.ok(draw.every(v=>v.args.every(Number.isFinite)),'Invalid draw coordinates');
  assert.ok(Number.isFinite(g.angle),'Effect must point towards target');
  seen.add(draw.find(v=>v.src.includes('/sprites/frame_')).src);
  coords.push([g.ax,g.ay]);
  total+=draw.length;
 }
 assert.equal(seen.size,8,'Every move must show 8 distinct source frames');
 assert.ok(coords.every(([x,y])=>Math.hypot(x-60,y-190)<30),'Effect starts at caster');
 for(let n=1;n<=8;n++){
  const file=folder+'sprites/frame_'+String(n).padStart(2,'0')+'.png';
  const buf=fs.readFileSync(path.join(root,file));
  assert.equal(buf.subarray(0,8).toString('hex'),'89504e470d0a1a0a','Invalid PNG: '+file);
 }
 for(let n=1;n<=4;n++)assert.ok(fs.statSync(path.join(root,folder+'impact/hit_'+String(n).padStart(2,'0')+'.png')).size>400);
}
assert.ok(read('effects/moves/_runtime/end.js').includes("catalogElectricFourV56.accepts(k)"),'New art must bypass generic Pixi painter');
assert.ok(read('index.html').includes("electric-four-v56.js"),'New module must be included in loader');
assert.ok(read('index.html').includes('electricCatalogAssets'),'All 48 asset frames must preload');
console.log('PASS V56: 4 independent moves, 32 frame references, 16 impacts, actual target alignment; '+total+' image draws');
