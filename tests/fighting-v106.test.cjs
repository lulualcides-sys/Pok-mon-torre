'use strict';
/* V106: FILLED VOLUMETRIC in-battle attacks, not lines.
 * This validates all 4 distinct styles, red X, 8/12/16/16 distinct frames,
 * no projectile, and the existing V104 damage/movement stays independent.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const art='effects/moves/v106-fighting/kinetic-impact.js';
const paths=[
 'effects/moves/catalog/chute/v106/render.js',
 'effects/moves/catalog/golpedekarate/v106/render.js',
 'effects/moves/catalog/crosschop/v106/render.js',
 'effects/moves/catalog/brickbreak/v106/render.js'
];
const idx=fs.readFileSync('index.html','utf8');
const registry=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
for(const p of [art,...paths]){assert.ok(fs.existsSync(p));assert.ok(idx.includes(p),p);}
assert.ok(idx.includes("v104-real-contact"),'old native movement preserved');
assert.ok(idx.includes("v106-heavy-contact"),'official art overlay installed');
const register=new Map();
const window={PokemonTorreFightingV104:{retexture(name,fn){register.set(name,fn);}}};
const ctx=vm.createContext({window,console,Math});
for(const p of [art,...paths])vm.runInContext(fs.readFileSync(p,'utf8'),ctx,{filename:p,timeout:3000});
const names=['Chute','Golpe de Karatê','Cross Chop','Brick Break'],
 styles=['chute','karate','cross','brick'],count=[8,12,16,16],contact=[.59,.59,.62,.63];
assert.equal(register.size,4);
for(let i=0;i<4;i++){
 const row=registry.moves.find(x=>x.move===names[i]);
 assert.ok(['V106','V107','V108','V109'].includes(row.version));assert.equal(row.protect,true);assert.equal(row.frames,count[i]);
}
function mock(){
 const op={fills:0,strokes:0,polygons:0,points:[],palette:new Set(),radial:0,
  drawImage:0,strokeWidths:[]};
 const g={
  globalAlpha:1,lineWidth:1,fillStyle:'#ffffff',strokeStyle:'#000',
  save(){},restore(){},translate(){},scale(){},
  beginPath(){op.polygons++},moveTo(x,y){op.points.push([x,y])},
  lineTo(x,y){op.points.push([x,y])},closePath(){},
  ellipse(x,y,rx,ry){op.points.push([x-rx,y-ry],[x+rx,y+ry]);},
  arc(x,y,r){op.points.push([x-r,y-r],[x+r,y+r]);},
  fill(){op.fills++;if(typeof this.fillStyle==='string')op.palette.add(this.fillStyle);},
  stroke(){op.strokes++;op.strokeWidths.push(this.lineWidth);},
  createRadialGradient(){op.radial++;return {addColorStop(){}}},
  drawImage(){op.drawImage++}
 };
 return {g,op};
}
const snapshots=[];
for(let i=0;i<4;i++){
 let prev=0,last=0,chunk=[];
 const fn=register.get(names[i]);
 for(let f=0;f<count[i];f++){
  const {g,op}=mock();
  fn(g,{name:names[i],style:styles[i],to:[420,310],angle:0,scale:1,
   t:(f+.5)/count[i],hit:contact[i],frames:count[i],frame:f});
  assert.equal(op.drawImage,0,'no fixed PNG or JPG instead of animation');
  assert.ok(op.fills>=0);
  if((f+.5)/count[i]>=contact[i]&&f<=Math.floor(count[i]*.79)){
   assert.ok(op.fills>=8,'not just a thin stroke '+names[i]+' frame '+f);
   assert.ok(op.points.length>=15,'filled silhouettes need vertices');
  }
  if(f===0)prev=op.fills;
  if(f===count[i]-1)last=op.fills;
  chunk.push({frames:f+1,fills:op.fills,polygons:op.polygons,palette:[...op.palette]});
 }
 const active=chunk.filter(x=>x.fills>8);
 assert.ok(active.length>=2,'animation must have several visible chunky contact frames');
 snapshots.push({name:names[i],active:active.length,maxFills:Math.max(...chunk.map(x=>x.fills))});
}
const cross=mock();
register.get('Cross Chop')(cross.g,{name:'Cross Chop',style:'cross',
 to:[420,310],scale:1,t:.65,hit:.62,frames:16,frame:10});
assert.ok(cross.op.palette.has('#dc1441'),'scarlet X must have bold red body');
assert.ok(cross.op.palette.has('#250713'),'X must have dark outline');
assert.ok(cross.op.palette.has('#ff4b71'),'X must have brighter red bevel');
assert.ok(cross.op.fills>14,'two separately filled curved X blades and central shock');
assert.ok(cross.op.radial>=1,'light after contact');
const stats=window.PokemonTorreFightingKineticV106.diagnostics();
assert.equal(stats.version,'106.0');
assert.ok(stats.filled>200&&stats.contactFrames>12);
assert.deepEqual(Object.keys(stats.draws).sort(),['brick','chute','cross','karate']);
console.log('PASS V106 heavy 4 fighting moves: '+JSON.stringify(snapshots));
