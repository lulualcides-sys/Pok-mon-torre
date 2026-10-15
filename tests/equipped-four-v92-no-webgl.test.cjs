'use strict';
// Regression for the FOUR ACTUAL EQUIPPED moves visible in the Lab screenshot.
// Works without PIXI, WebGL, external textures, CSS or generated binary files.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const names=[['Raízes Violentas',16],['Geada Persistente',16],
 ['Sopro Congelante',12],['Chicote Duplo',12]];
let shapes=0,lines=0,saves=0,restores=0;
const canvas={
 save(){saves++},restore(){restores++},translate(){},rotate(){},
 beginPath(){},moveTo(){},lineTo(){lines++},quadraticCurveTo(){lines++},
 closePath(){},fill(){shapes++},stroke(){lines++},ellipse(){shapes++}
};
let now=1000;const battle={active:true};
const engine={player:{x:75,y:150},enemy:{x:420,y:115,hp:100},
 canvas:{isConnected:true},h:280,ctx:canvas};
const window={};
const source=fs.readFileSync('effects/moves/v92-four/canvas-fallback.js','utf8');
const fallback=vm.runInNewContext(source+'\n;equippedFourV92',
 {window,battle,console,performance:{now:()=>now},Math});
const results=[];
for(const [name,frames] of names){
 assert.equal(fallback.keyOf(name).length>0,true);
 assert.equal(fallback.begin(engine,name,now),true);
 const before=shapes+lines;
 for(let i=0;i<frames;i++){
  assert.equal(fallback.draw(engine,now+(i+.5)*fallback.active(engine).spec.ms/frames),true);
 }
 assert.ok(shapes+lines>before,'Move has no rendered geometry: '+name);
 assert.equal(fallback.hideLegacy(engine,name,now+150),true);
 results.push({name,frames});
 fallback.clear(engine);now+=2300;
}
assert.equal(fallback.diagnostics().draws,56);
assert.equal(saves,restores,'Canvas save/restore leak');
assert.equal(fallback.keyOf('Thunder'),'','Do not interfere with approved Thunder');
const idx=fs.readFileSync('index.html','utf8');
const end=fs.readFileSync('effects/moves/_runtime/end.js','utf8');
assert.ok(idx.includes('previewModeV88===null||previewModeV88===\'v86\''),
 'Normal game must load four REAL V86 GPU sprites');
assert.ok(idx.includes('effects/moves/v92-four/canvas-fallback.js'));
assert.ok(idx.includes('effects/moves/v92-four/safe-mode.js'));
assert.ok(end.includes('previousEquippedV92Draw'));
assert.ok(end.includes('__v92Covered'));
engine.enemy.hp=0;
assert.equal(fallback.active(engine),null,'No lingering animation after 0 HP');
assert.equal(fallback.begin(engine,'Chicote Duplo',now),false,'Do not restart effect on fainted enemy');

// V93 anti-cartoon regression: target-side area VFX must stay within a small
// multiple of the actual enemy.radius (not a 200-pixel full-screen tangle).
const pathBounds=()=>{
 const marks=[],stack=[];let tr={tx:0,ty:0,angle:0};
 const add=(x,y)=>{const a=tr.angle;
  marks.push([tr.tx+x*Math.cos(a)-y*Math.sin(a),
   tr.ty+x*Math.sin(a)+y*Math.cos(a)])};
 const c={
  save(){stack.push({...tr})},restore(){tr=stack.pop()||tr},
  translate(x,y){add(x,y);tr.tx=marks.pop()[0];tr.ty=tr.ty; /* overwritten below */},
  rotate(a){tr.angle+=a},beginPath(){},moveTo:add,lineTo:add,
  quadraticCurveTo(x,y,bx,by){add(x,y);add(bx,by)},closePath(){},
  fill(){},stroke(){},ellipse(x,y,rx,ry){add(x-rx,y-ry);add(x+rx,y+ry)}
 };
 // Correctly track nested crystal transform origins without CSS or DOM.
 c.translate=(x,y)=>{const a=tr.angle;
  tr={...tr,tx:tr.tx+x*Math.cos(a)-y*Math.sin(a),
   ty:tr.ty+x*Math.sin(a)+y*Math.cos(a)}};
 return {c,extent(){const xs=marks.map(p=>p[0]),ys=marks.map(p=>p[1]);
  return {width:Math.max(...xs)-Math.min(...xs),
   height:Math.max(...ys)-Math.min(...ys)};}};
};
for(const name of ['Raízes Violentas','Geada Persistente']){
 const tracked=pathBounds(),enemy={...engine.enemy,hp:100,r:28};
 const game={...engine,enemy,ctx:tracked.c};
 const began=now+100;
 assert.ok(fallback.begin(game,name,began));
 const dur=fallback.active(game).spec.ms;
 assert.equal(fallback.draw(game,began+dur*.68),true);
 const bb=tracked.extent();
 assert.ok(bb.width<=enemy.r*3.0,
   name+' too wide: '+JSON.stringify(bb));
 assert.ok(bb.height<=enemy.r*2.8,
   name+' too tall: '+JSON.stringify(bb));
 fallback.clear(game);
}

console.log('PASS V93: FOUR EQUIPPED MOVES, 56 black outlined native frames, distinct shapes, 0HP cleanup, WebGL optional',JSON.stringify(results));
