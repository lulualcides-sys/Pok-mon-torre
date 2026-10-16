'use strict';
/* V115: SAME V95 pixel finish for every existing Pokemon; Mewtwo preserved.
 * No new poses, changed directions/sizes, move visuals, engine state or physics.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const baseline=fs.readFileSync('effects/pokemon/visual-polish-v95.js','utf8');
const latest=fs.readFileSync('effects/pokemon/visual-polish-v115.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const standard=JSON.parse(fs.readFileSync('effects/pokemon/VISUAL_STANDARD.json','utf8'));
const approved=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
assert.ok(index.includes('effects/pokemon/visual-polish-v95.js'));
assert.ok(index.includes('effects/pokemon/visual-polish-v115.js'));
assert.ok(index.indexOf("const file='effects/pokemon/visual-polish-v95.js'")<
 index.indexOf("const path='effects/pokemon/visual-polish-v115.js'"),'Mewtwo baseline must load first');
assert.equal(standard.global_rollout.version,'V115');
assert.ok(standard.pilot.baseline_version==='V95');
assert.ok(standard.rules.preserve_approved_mewtwo_appearance);
assert.ok(approved.moves.filter(x=>x.protect===true&&x.version==='V114').length>=4);
assert.ok(!latest.includes('BattleEngine.prototype.useMove')&&!latest.includes('.hp='));
let draws=[],putData=[],lastImage,seenArgs=[],ctx;
class MockCanvas{
 constructor(){this.width=0;this.height=0;}
 getContext(){
  const canvas=this;
  return {imageSmoothingEnabled:true,
   drawImage(img){lastImage=img;},
   getImageData(){if(lastImage?.tainted)throw Error('Blocked by CORS');
    const data=new Uint8ClampedArray(canvas.width*canvas.height*4);
    for(let y=1;y<canvas.height-1;y++)for(let x=1;x<canvas.width-1;x++){
     const i=(y*canvas.width+x)*4;
     data[i]=140+x;data[i+1]=80+y;data[i+2]=190;data[i+3]=255;
    }
    return {data};
   },
   createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4),width:w,height:h}},
   putImageData(im){putData.push(im)}
  };
 }
}
const natural=(image,...args)=>{draws.push({image,args})};
ctx={drawImage:natural,imageSmoothingEnabled:true,globalAlpha:1};
class BattleEngine{
 constructor(){this.ctx=ctx;this.x=80;this.y=100;}
 drawMon(entity,id,enemy,now){
  seenArgs.push([id,enemy,now,entity.anim,entity.direction]);
  this.ctx.drawImage(entity.img,entity.frame*8,0,8,8,
   entity.x,entity.y,entity.width,entity.height);
  return entity.x+id+now;
 }
}
const document={createElement(type){
 assert.equal(type,'canvas');return new MockCanvas;
}};
const window={};
const sandbox={window,BattleEngine,document,console,Number,Set,Map,WeakMap,Math};
vm.runInNewContext(baseline,sandbox,{filename:'visual-polish-v95.js'});
vm.runInNewContext(latest,sandbox,{filename:'visual-polish-v115.js'});
assert.equal(window.PokemonTorrePokemonPolishV95.config.scope,'mewtwo-pilot');
const global=window.PokemonTorrePokemonPolishV115;
assert.ok(global.installed);assert.equal(global.config.scope,'all-existing-except-mewtwo-150');
assert.equal(global.config.cacheBudgetBytes,24*1024*1024);
const engine=new BattleEngine(),image={naturalWidth:24,naturalHeight:8,src:'pokemon-original-atlas.png'};
const mon=(frame=0)=>({img:image,frame,x:77,y:91,width:28,height:31,anim:'attack',direction:'right'});
for(const id of [1,6,25,143,151,386,1025]){
 const orig=mon(id%3);
 const retval=engine.drawMon(orig,id,false,1234);
 assert.equal(retval,77+id+1234,'original drawMon return and mechanics');
 const item=draws.at(-1);
 assert.notEqual(item.image,image,'Pokemon '+id+' should be polished');
 assert.equal(item.args[0],orig.x-28*2/8,'x stays aligned including pixel outline');
 assert.equal(item.args[1],orig.y-31*2/8,'y stays aligned including pixel outline');
 assert.equal(orig.width,28);assert.equal(orig.height,31);
 assert.equal(orig.anim,'attack');assert.equal(orig.direction,'right');
 assert.equal(ctx.drawImage,natural,'draw method restored after '+id);
}
assert.ok(putData.some(im=>im.data.some(v=>v===14)),'1px black outline');
const cache0=global.diagnostics().cacheHits;
engine.drawMon(mon(1),25,false,1500);
assert.ok(global.diagnostics().cacheHits>cache0,'reuse processed frames');
const before=global.diagnostics().draws;
const m95before=window.PokemonTorrePokemonPolishV95.diagnostics().polished;
engine.drawMon(mon(0),150,true,1501);
assert.equal(global.diagnostics().draws,before,'Mewtwo must skip V115');
assert.ok(window.PokemonTorrePokemonPolishV95.diagnostics().polished>m95before,'V95 Mewtwo appearance preserved exactly');
const errorSource={naturalWidth:24,naturalHeight:8,src:'external-cors.png',tainted:true};
engine.drawMon({...mon(0),img:errorSource},78,false,2000);
assert.equal(draws.at(-1).image,errorSource,'CORS failure uses original sprite');
assert.equal(ctx.drawImage,natural);
const beforeOther=global.diagnostics().draws;
engine.drawMon(mon(0),0,false,100);
engine.drawMon(mon(0),-1,false,100);
assert.equal(global.diagnostics().draws,beforeOther,'invalid IDs bypass V115');
const status=global.diagnostics();
assert.ok(status.speciesSeen>=7);
assert.equal(status.failed,1);
assert.ok(status.polished>=8);
assert.ok(status.cacheBytes<=global.config.cacheBudgetBytes,'global memory cache stays bounded');
assert.equal(ctx.imageSmoothingEnabled,true,'nearest-neighbor applied only inside sprite draws');
assert.ok(seenArgs.some(a=>a[0]===150&&a[1]===true));
console.log('PASS V115: multiple species, animation/direction/geometry unchanged, V95 Mewtwo untouched, 24 MiB cache bound, black pixel outline, original CORS fallback');
