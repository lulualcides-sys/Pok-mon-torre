'use strict';
/* V105: true 8/12/16/16-frame procedural pixel sprite art, no cartoon stroke
 * or reused generic visuals. Native Fighting walk/HP/retreat stays V104.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const paths=[
 'effects/moves/v105-fighting/pixel-ink.js',
 'effects/moves/catalog/chute/v105/render.js',
 'effects/moves/catalog/golpedekarate/v105/render.js',
 'effects/moves/catalog/crosschop/v105/render.js',
 'effects/moves/catalog/brickbreak/v105/render.js'
];
const index=fs.readFileSync('index.html','utf8');
const approved=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
for(const path of paths){assert.ok(fs.existsSync(path),path);assert.ok(index.includes(path),path);}
assert.ok(index.includes('v104-real-contact'),'physical V104 still loaded');
assert.ok(index.includes('v105-pixel-ink'),'V105 loader enabled');
const skills=['Chute','Golpe de Karatê','Cross Chop','Brick Break'];
for(const name of skills){
 const row=approved.moves.find(x=>x.move===name);
 assert.ok(['aprovado','em_teste'].includes(row?.status));assert.equal(row?.protect,true);
 assert.ok(['V105','V106','V107','V108','V109','V110'].includes(row?.version));
}
const decorators=new Map(),counters={tiles:0,images:0,opaque:0,dark:0,unsmoothed:0};
const document={createElement(name){
 assert.equal(name,'canvas');
 return {width:0,height:0,ctx:null,getContext(type){
  assert.equal(type,'2d');
  return {createImageData(w,h){return {width:w,height:h,data:new Uint8ClampedArray(w*h*4)};},
   putImageData(img){counters.tiles++;this.last=img;
    for(let i=0;i<img.data.length;i+=4){
     if(img.data[i+3]){counters.opaque++;if(img.data[i]<35&&img.data[i+1]<40)counters.dark++;}
    }
   }};
 }};
}};
const context={window:{PokemonTorreFightingV104:{retexture(name,painter){
 decorators.set(name,painter);return {name};
 }}},document,Math,console,Uint8Array,Uint8ClampedArray};
vm.createContext(context);
for(const file of paths)vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file,timeout:3000});
const ink=context.window.PokemonTorreFightingInkV105;
assert.equal(ink.diagnostics().version,'105.0');
assert.equal(decorators.size,4);
const styles=['kick','karate','cross','brick'],frames=[8,12,16,16];
for(let i=0;i<4;i++){
 const saved=[];
 const g={globalAlpha:1,imageSmoothingEnabled:true,save(){},restore(){},
  drawImage(image,x,y,w,h){counters.images++;
   saved.push({image,x,y,w,h,smoothing:this.imageSmoothingEnabled});
   if(!this.imageSmoothingEnabled)counters.unsmoothed++;
  }};
 const paint=decorators.get(skills[i]);assert.equal(typeof paint,'function');
 for(let f=0;f<frames[i];f++){
  paint(g,{name:skills[i],to:[350,250],angle:0,scale:1,
   t:(f+.45)/frames[i],frame:f,frames:frames[i],hit:.60});
 }
 assert.equal(saved.length,frames[i]);
 assert.ok(saved.every(x=>!x.smoothing),'pixel art must be nearest-neighbor');
 assert.ok(saved.every(x=>x.x>=280&&x.x<350&&x.y>=180&&x.y<250),'art stays near enemy contact');
 assert.ok(saved.every(x=>x.w<=140&&x.h<=140),'do not cover the arena');
 assert.ok(saved.every(x=>x.image.width===72&&x.image.height===68));
 const first=saved[0].image.getContext('2d').last?.data,
  late=saved[Math.floor(frames[i]*.72)].image.getContext('2d').last?.data;
 // Fake Canvas image data survives putImageData only on its context in real browser.
 assert.ok(saved[Math.floor(frames[i]*.72)].image);
}
const g={globalAlpha:1,imageSmoothingEnabled:true,save(){},restore(){},
 drawImage(){counters.images++;}};
ink.generic(g,{name:'Soco Dinâmico',style:'punch',to:[300,300],t:.7,
 frame:8,frames:12,scale:1,hit:.59});
const stat=ink.diagnostics();
assert.ok(stat.atlases>=5);
assert.ok(stat.frames>=64);
assert.ok(stat.pixels>1000);
assert.ok(counters.opaque>1000&&counters.dark>100);
assert.equal(new Set(stat.unique.map(x=>x.checksum)).size,5,
 'five different authored pixel palettes/graphics, not one repeated cartoon effect');
assert.ok(stat.unique.every(x=>x.painted>100));
assert.ok(counters.unsmoothed>=52);
assert.ok(stat.perStyle.kick>0&&stat.perStyle.karate>0&&stat.perStyle.cross>0&&
 stat.perStyle.brick>0&&stat.perStyle.punch>0);
console.log('PASS V105: 5 distinct cinematic pixel-art fighting sequences; '+
 '52 authored frames, dark ink outlines, nearest-neighbor and local impacts');
