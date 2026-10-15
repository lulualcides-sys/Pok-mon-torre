'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync('effects/pokemon/visual-polish-v95.js','utf8');
const standard=JSON.parse(fs.readFileSync('effects/pokemon/VISUAL_STANDARD.json','utf8'));
let generatedCanvas=0,capturedPixels=null,drawCalls=[];
class MockCanvas {
 constructor(){this.width=0;this.height=0;}
 getContext(){
  const canvas=this;
  return {
   imageSmoothingEnabled:true,
   drawImage(image){this.image=image;},
   getImageData(){
    if(this.image?.tainted)throw Error('Tainted canvas');
    const data=new Uint8ClampedArray(canvas.width*canvas.height*4);
    for(let y=2;y<canvas.height-2;y++)for(let x=2;x<canvas.width-2;x++){
     const i=(y*canvas.width+x)*4;
     data[i]=170;data[i+1]=146;data[i+2]=185;data[i+3]=255;
    }
    return {data};
   },
   createImageData(w,h){return {width:w,height:h,data:new Uint8ClampedArray(w*h*4)};},
   putImageData(data){capturedPixels=data;}
  };
 }
}
let source={naturalWidth:8,naturalHeight:8,src:'local-mewtwo.png'};
const drawOnMain=(...args)=>{drawCalls.push(args);};
const ctx={drawImage:drawOnMain,imageSmoothingEnabled:true};
class BattleEngine {
 constructor(){this.ctx=ctx;}
 drawMon(e,id){
  this.ctx.drawImage(e.img,0,0,8,8,100,80,40,40);
  return id;
 }
}
const doc={createElement(type){
 assert.equal(type,'canvas');generatedCanvas++;return new MockCanvas;
}};
const win={};
vm.runInNewContext(src,{BattleEngine,document:doc,window:win,console}, {filename:'visual-polish-v95.js'});
assert.equal(win.PokemonTorrePokemonPolishV95?.installed,true);
assert.equal(win.PokemonTorrePokemonPolishV95?.config.scope,'mewtwo-pilot');
const engine=new BattleEngine();
engine.drawMon({img:source},25,false,0);
assert.equal(drawCalls.at(-1)[0],source,'Pikachu/other Pokemon must not be altered');
const unchanged=drawCalls.length;
engine.drawMon({img:source},150,false,0);
assert.equal(drawCalls.length,unchanged+1,'Mewtwo must draw normally');
const first=drawCalls.at(-1);
assert.notEqual(first[0],source,'Mewtwo must render processed frame canvas');
assert.ok(first[3]>40&&first[4]>40,'Outline must not shrink existing sprite');
assert.ok(capturedPixels,'Visible processed pixel buffer is required');
const p=capturedPixels.data,W=capturedPixels.width;
assert.equal(p[((4*W)+4)*4+3],255,'Sprite interior opacity preserved');
assert.ok(p[((3*W)+3)*4+3]>0,'Black outline must border the artwork');
assert.equal(p[((3*W)+3)*4],14,'Outline stays dark');
engine.drawMon({img:source},150,false,0);
assert.ok(win.PokemonTorrePokemonPolishV95.diagnostics().cacheHits>0,
 'Repeated animations must use cached processed frame');
assert.equal(ctx.drawImage,drawOnMain,'Context must be restored after Pokemon render');
// Sprite unavailable/CORS-tainted means original image draws, never a crash.
const bad={naturalWidth:8,naturalHeight:8,tainted:true,src:'remote'};
engine.drawMon({img:bad},150,false,0);
assert.equal(drawCalls.at(-1)[0],bad,'Tainted image must stay playable');
const d=win.PokemonTorrePokemonPolishV95.diagnostics();
assert.equal(d.lastPokemonId,'150');
assert.ok(d.polished>=2&&d.framesGenerated===1&&d.failed===1);
assert.deepEqual([...standard.pilot.id.toString()],[...'150']);
assert.equal(standard.rules.no_attack_effect_changes,true);
console.log('PASS V95: Mewtwo silhouette outline/shading, cached draws, no unrelated Pokemon, safe sprite CORS fallback');
