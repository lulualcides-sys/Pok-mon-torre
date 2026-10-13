'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const index=read('index.html');
const oldMoves=['Chamas de Moltres','Rajada Flamejante','Chama Circular','Garra de Fogo'];
const newMoves=['Fire Blast','Will-O-Wisp','Sunny Day','Brasa'];
const oldFiles=[
 'effects/moves/_runtime/fire-sprite-kit.js',
 'effects/moves/chamas-de-moltres/index.js',
 'effects/moves/rajada-flamejante/index.js',
 'effects/moves/chama-circular/index.js',
 'effects/moves/garra-de-fogo/index.js',
 'effects/moves/_runtime/fire-sprite-integrate.js'
];
const newFiles=[
 'effects/moves/fire-blast/index.js',
 'effects/moves/will-o-wisp/index.js',
 'effects/moves/sunny-day/index.js',
 'effects/moves/brasa/index.js'
];
const loadedOld=index.match(/const fireSpriteFiles=(\[[\s\S]*?\]);\s*const fireSpriteSections=/);
const loadedNew=index.match(/const nextFourFireMoves=(\[[\s\S]*?\]);\s*const extraFireSections=/);
assert.ok(loadedOld&&loadedNew,'Both V41 and V42 source lists must load');
assert.deepEqual(JSON.parse(loadedOld[1]),oldFiles);
assert.deepEqual(JSON.parse(loadedNew[1]),newFiles);
assert.match(index,/fireSpriteSections\.slice\(0,-1\)/,'Additional moves must register ahead of combat bridge');
const fullPaths=[...oldFiles.slice(0,-1),...newFiles,oldFiles.at(-1)];
const source=fullPaths.map(read).join('\n');
assert.equal((source.match(/fireSpriteV41\.add\(/g)||[]).length,8,'All eight moves registered independently');
assert.ok(index.includes('sprite-fire-v42-1'),'Loader cache must refresh');
for(const p of newFiles){
 const c=read(p);
 assert.doesNotMatch(c,/\.(?:fillRect|arc|lineTo|stroke|createRadialGradient)\s*\(/,
  p+' must use the original sprite images, not procedural drawings');
 assert.match(c,/fireSpriteV41\.add\(/);
 assert.match(c,/draw\(g,/);
}
const png=fs.readFileSync(path.join(root,'effects/moves/fire-original/fire-original-4-atlas.png'));
assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');
const pngW=png.readUInt32BE(16),pngH=png.readUInt32BE(20);
assert.ok(pngW%96===0&&pngH%96===0&&pngW>=768&&pngH>=960);
const oldMatch=index.match(/const fxFiles=(\[[^;]+?\]);let plugin=/);
assert.ok(oldMatch,'Original sprite engine must remain');
const modules=JSON.parse(oldMatch[1]).map(read).join('\n');
const original=Array.from({length:25},(_,i)=>read('parts/p'+String(i).padStart(3,'0')+'.txt')).join('');
const anchor='\nrender();\n})();\n</script>';
assert.ok(original.includes(anchor));
const assembled=original.replace(anchor,'\n'+modules+'\n'+source+'\n'+anchor);
const start=assembled.indexOf('<script>'),end=assembled.indexOf('</script>',start+8);
assert.ok(start>=0&&end>start);
new vm.Script(assembled.slice(start+8,end),{filename:'assembled-pokemon-v42.js'});
const loader=index.slice(index.indexOf('<script>')+8,index.indexOf('</script>'));
new vm.Script(loader,{filename:'loader-v42.js'});
console.log('PASS: all 25 game parts + old sprite modules + new V42 moves compile');
let now=1000,hitPixels=0,bluePixels=0,orangePixels=0;
const battle={active:true,energy:1000,paused:false},mon={id:150};
const cooldowns=Array(8).fill(0);
const moves=[...oldMoves,...newMoves].map(name=>({name,type:'fire',cost:10,cd:2000,kind:/^(Sunny Day|Will-O-Wisp)$/.test(name)?'status':'bolt'}));
const drawEvents=[];
class FakeCanvas{
 constructor(){this.width=0;this.height=0;this.__isCanvas=true;this.id='';this.style={};}
 getContext(){const canvas=this;return {
  drawImage(){},getImageData(){return {data:new Uint8ClampedArray(canvas.width*canvas.height*4)};},
  putImageData(){}
 };}
}
class FakeImage{
 constructor(){this.width=pngW;this.height=pngH;this.naturalWidth=pngW;this.naturalHeight=pngH;}
 set src(p){this.path=p;this.onload?.();}
}
class FakeContext{
 save(){}restore(){}translate(){}rotate(){}scale(){}
 drawImage(img){hitPixels++;if(img.__isCanvas)bluePixels++;else orangePixels++;}
}
class FakeEngine{
 constructor(){this.h=560;this.w=900;this.player={x:180,y:370};this.enemy={x:680,y:260};this.ctx=new FakeContext();}
 useMove(slot){
  if(now<cooldowns[slot]||battle.energy<moves[slot].cost)return false;
  cooldowns[slot]=now+2000;battle.energy-=moves[slot].cost;
  if(moves[slot].kind==='status'){
   this.v3568StatusFX=[{move:{name:moves[slot].name}}];
   this.v3580Visuals=[{move:{name:moves[slot].name}}];
  }
  return true;
 }
 draw(t){drawEvents.push({t,x:this.player.x,y:this.player.y});return true;}
}
const engine=new FakeEngine();
const sandbox={window:{PokemonTorreV360Paint(){return false}},BattleEngine:FakeEngine,Image:FakeImage,
 performance:{now:()=>now},battle,cooldowns,engine,console,current:()=>mon,skillSet:()=>moves,
 document:{createElement:()=>new FakeCanvas(),getElementById:()=>null,body:{appendChild(){}}}};
vm.runInNewContext(source,sandbox,{filename:'fire-sprite-v42.js'});
const v42=sandbox.window.PokemonTorreFireSpriteV42;
assert.equal(typeof v42,'function');
assert.equal(v42().originalAtlasReady,true);
assert.equal(v42().blueAtlasReady,true);
const baseX=engine.player.x;
const drawCounts={};
[...oldMoves,...newMoves].forEach((name,i)=>{
 now=1000+i*7000;
 const before=hitPixels;
 assert.equal(engine.useMove(i),true,name+' accepted');
 assert.equal(sandbox.window.PokemonTorreV360Paint(engine.ctx,{move:{name}},now,engine),true,
  name+' generic VFX must not override original frames');
 const duration=engine.v41FireVisuals.at(-1).duration;
 engine.draw(now+duration*.53);
 engine.draw(now+duration*.72);
 assert.equal(engine.player.x,baseX,'Position restored after '+name);
 assert.ok(hitPixels>before,'Original sprites rendered for '+name);
 drawCounts[name]=hitPixels-before;
 if(moves[i].kind==='status'){
  assert.equal(engine.v3568StatusFX.length,0,'Duplicate V35.68 status overlay suppressed');
  assert.equal(engine.v3580Visuals.length,0,'Duplicate catalog overlay suppressed');
 }
});
const metrics=v42();
assert.equal(metrics.casts,8);
assert.equal(metrics.version,'42.0');
assert.equal(metrics.newMoves.length,4);
assert.equal(metrics.registered.length,8);
assert.ok(bluePixels>0 && orangePixels>0,'Blue status wisps and fire attacks must render real atlas pixels');
assert.ok(metrics.paintCounts.fireBlast>0&&metrics.paintCounts.willOWisp>0&&metrics.paintCounts.sunnyDay>0&&metrics.paintCounts.brasa>0);
assert.ok(drawEvents[2*3].x>baseX,'Existing Fire Claw contact motion still works');
console.log('PASS: V41 preserved; four V42 sprite attacks functional, status overlays removed, no CSS shapes');
console.log(JSON.stringify({version:metrics.version,drawCounts,frameStamps:hitPixels,blue:bluePixels,orange:orangePixels}));
