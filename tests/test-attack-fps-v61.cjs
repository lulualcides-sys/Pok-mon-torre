'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const renderer=read('effects/moves/v60-four/render.js');
const runtime=read('effects/moves/_runtime/end.js');
const pixi=read('effects/moves/_runtime/pixi-layer.js');
// A separate WebGL surface must NEVER be created for these four 2D sprites.
assert.ok(!runtime.includes(' pixiFX.ensure(this);'), 'Eager Pixi init during every battle draw');
assert.ok(pixi.includes("if(!effects.size&&!combatSheet&&!activeV84&&!activeV86&&!hazeActiveV85){app.ticker.stop();app.view.style.display='none';}"), 'Idle GPU ticker not suspended');
assert.ok(pixi.includes('if(!app.ticker.started)app.ticker.start();'), 'GPU ticker cannot resume');
assert.ok(pixi.includes('if(!ensure(engine))return false;'), 'GPU effects lost their lazy initializer');
const images=[];
class FakeImage {
 constructor(){this.naturalWidth=2048;this.naturalHeight=256;this.onload=null;images.push(this);}
 set src(s){this._src=s;}
 get src(){return this._src;}
}
const bitmapRequests=[];
const ctx=vm.createContext({
 Image:FakeImage,
 createImageBitmap:(img,x,y,w,h)=>{
  assert.equal(y,0);assert.equal(w,256);assert.equal(h,256);
  const imgId=String(img.src).split('/').at(-2);
  const obj={imgId,src:img.src,x,y,w,h};
  bitmapRequests.push(obj);
  return Promise.resolve(obj);
 },
 window:{}
});
vm.runInContext(renderer,ctx);
const fx=vm.runInContext('cinematicFourV60',ctx);
async function main(){
 assert.equal(images.length,4);
 for(const im of images)im.onload();
 await new Promise(resolve=>setImmediate(resolve));
 const diagnostic=fx.diagnostic();
 assert.deepEqual(Object.values(diagnostic.prerendered),[8,8,8,8],
  'All 32 frames must be decoded before the first attack');
 assert.equal(bitmapRequests.length,32);
 const calls=[];
 const g={save(){},restore(){},
  drawImage(...args){calls.push(args);},
  set globalAlpha(x){},set imageSmoothingEnabled(x){}
 };
 const f={from:[48,150],to:[224,130],at:0,duration:950,move:{name:'Nevasca'}};
 for(const key of ['catalog_nevasca','catalog_faiscadopikachu','catalog_volttackle']){
  for(let i=0;i<8;i++)assert.ok(fx.paint(g,f,(i+.2)/8,500,1,false,key));
 }
 for(let i=0;i<8;i++)assert.ok(fx.paintNamed(g,{...f,name:'Tempestade de Neve',move:null},(i+.2)*950/8,{h:430}));
 assert.equal(calls.length,32);
 assert.ok(calls.every(x=>x.length===5), 'Sprite animation failed to use pre-decoded frames');
 assert.ok(calls.every(x=>x[0].w===256), 'Wrong prerendered source dimensions');
 assert.equal(Object.keys(fx.diagnostic().frames).length,4);
 console.log('PASS: All 4 approved attacks use predecoded frames, without a second GPU ticker on attack');
}
main().catch(e=>{console.error(e);process.exitCode=1});
