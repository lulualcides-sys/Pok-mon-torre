'use strict';
// Acceptance: Four native Canvas sprites must render with NO PIXI / WebGL.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('effects/moves/v91-four/canvas-fallback.js','utf8');
let strokes=0,leaves=0,saveCount=0,restoreCount=0;
const ctx={
 save(){saveCount++},restore(){restoreCount++},translate(){},rotate(){},
 beginPath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},
 closePath(){},stroke(){strokes++},fill(){leaves++},
};
let now=1000;const battle={active:true};
const engine={ctx,canvas:{isConnected:true},
 player:{x:85,y:160},enemy:{x:410,y:145},h:320};
const w={};
const sandbox={window:w,battle,performance:{now:()=>now},console};
const mod=vm.runInNewContext(source+'\n;grassFallbackV91',sandbox);
const report=[];
for(const [name,frames] of [['Chicote de Vinha',12],['Folha Navalha',12],
 ['Chicotes em Área',16],['Vine Whip',12]]){
 assert.ok(mod.start(engine,name,now),name+' must cast');
 const prior=strokes+leaves;
 for(let i=1;i<=frames;i++){
  assert.equal(mod.draw(engine,now+i*25),true,name+' visible frame');
 }
 assert.ok(strokes+leaves>prior,name+' must draw geometric plant shapes');
 assert.equal(mod.suppressLegacy(engine,name,now+200),true,
  name+' old green circle must be suppressed');
 report.push({name,frames,marks:strokes+leaves-prior});
 mod.clear(engine);now+=2200;
}
assert.equal(mod.diagnostics().draws,52);
assert.equal(saveCount,restoreCount,'Canvas state must not leak across battle frames');
assert.equal(mod.keyOf('Thunder'),'','Unrelated approved Electric attacks are untouched');
battle.active=false;assert.equal(mod.active(engine),null);
const index=fs.readFileSync('index.html','utf8');
const end=fs.readFileSync('effects/moves/_runtime/end.js','utf8');
assert.ok(index.includes('effects/moves/v91-four/canvas-fallback.js'));
assert.ok(index.indexOf('effects/moves/v91-four/canvas-fallback.js')<
 index.indexOf('effects/moves/_runtime/end.js'));
assert.ok(end.includes('previousGrassProjectilePainterV91'));
assert.ok(end.includes('previousCatalogPainterV91'));
assert.ok(end.includes('grassFallbackV91.draw(this,now)'));
console.log('PASS V91 no WebGL: black-outlined foliage,',JSON.stringify(report));
