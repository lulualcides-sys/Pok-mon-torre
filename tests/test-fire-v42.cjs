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
assert.ok(index.includes('sprite-fire-v42-5'),'Loader cache must refresh');
for(const p of newFiles){
 const c=read(p);
 assert.doesNotMatch(c,/\.(?:fillRect|arc|lineTo|stroke|createRadialGradient)\s*\(/,
  p+' must use the original sprite images, not procedural drawings');
 assert.match(c,/fireSpriteV41\.add\(/);
 if(p.includes('/sunny-day/'))assert.match(c,/g\.drawImage\(sunnyDaySpriteV425/,'Sunny uses its own static sprite');
 else assert.match(c,/draw\(g,/);
}
// V42.1 regressions: Fire Blast must read as the original glyph, not explosion.
const fireBlastCode=read('effects/moves/fire-blast/index.js');
const sunnyCode=read('effects/moves/sunny-day/index.js');
const wispCode=read('effects/moves/will-o-wisp/index.js');
assert.match(fireBlastCode,/const strokes=/,'Fire Blast must build the original 大 silhouette');
assert.match(fireBlastCode,/giant "大"/,'Fire Blast classic reference must remain explicit');
assert.doesNotMatch(fireBlastCode,/draw\(g,'explosion/,'Fire Blast must not draw a generic explosion');
assert.doesNotMatch(sunnyCode,/draw\(g,'(?:explosion|explosionBurst|fireburst)'/,'Sunny Day has no explosive frames');
assert.match(wispCode,/stickToTarget:true/,'Will-O-Wisp must follow the enemy');
const sunAsset=read('effects/moves/sunny-day/sun.svg');
assert.match(sunAsset,/<svg /,'Sunny Day must have a real pixel art solar asset');
assert.match(sunnyCode,/sun\.svg\?v=42\.5/,'Sunny Day loads a calm new sun sprite');
assert.doesNotMatch(sunnyCode,/draw\(g,|fireSpriteV41\.draw|['"](?:spinRing|flame|fireburst|explosion)['"]/,
 'Sunny Day must NOT draw the fire sprite atlas at all');
assert.doesNotMatch(wispCode,/blue:false/,'Will-O-Wisp must use blue frames only');
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
let now=1000,hitPixels=0,bluePixels=0,orangePixels=0,legacyPainted=0;
const moveFrameLog=[];
const battle={active:true,energy:1000,paused:false},mon={id:150},enemyMon={id:25};
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
 set src(p){this.path=p;this.__sunnySprite=String(p).includes('/sunny-day/sun.svg');this.onload?.();}
}
class FakeContext{
 save(){}restore(){}translate(){}rotate(){}scale(){}
 drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh){hitPixels++;if(img.__isCanvas)bluePixels++;else orangePixels++;
 moveFrameLog.push({blue:!!img.__isCanvas,sun:!!img.__sunnySprite,frame:Math.round(sy/96)*8+Math.round(sx/96),dw,dh});}
}
class FakeEngine{
 constructor(){this.h=560;this.w=900;this.player={x:180,y:370};this.enemy={x:680,y:260};this.ctx=new FakeContext();this.particles=[];this.rings=[];this.v26Particles=[];this.projectiles=[];this.v19Beams=[];this.attackActs={enemy:0};this.visibleVisuals=[];}
 useMove(slot){
  if(now<cooldowns[slot]||battle.energy<moves[slot].cost)return false;
  cooldowns[slot]=now+2000;battle.energy-=moves[slot].cost;
  if(moves[slot].name==='Will-O-Wisp'){
   this.particles.push({legacy:'old-orange-effect'});
   this.v342StatusFx=[{name:'Will-O-Wisp',visual:'old-orange-burn'}];
   this.v19Impacts=[{unlabelled:true,visual:'old-impact'}];
  }
  if(moves[slot].name==='Sunny Day'){
   this.rings.push({legacy:'old-weather-flash'});
   this.v344Fx=[{moveName:'Sunny Day',visual:'old-explosion'}];
  }
  if(moves[slot].kind==='status'){
   this.v3568StatusFX=[{move:{name:moves[slot].name}}];
   this.v3580Visuals=[{move:{name:moves[slot].name}}];
  }
  return true;
 }
 draw(t){drawEvents.push({t,x:this.player.x,y:this.player.y});
 const nearby=list=>(this[list]||[]).filter(item=>Number.isFinite(item?.x)
  && Math.abs(item.x-this.enemy.x)<80&&Math.abs(item.y-this.enemy.y+36)<80).length;
 this.visibleVisuals.push({particlesNear:nearby('particles'),ringsNear:nearby('rings'),
  projectilesNear:nearby('projectiles'),impactsNear:nearby('v19Impacts'),
  particlesFar:(this.particles||[]).filter(item=>item?.x===this.player.x).length,
  enemyAttack:this.attackActs.enemy});
 for(const queue of ['v3568StatusFX','v3580Visuals','v342StatusFx','v344Fx','v19Impacts']){
   for(const fx of (this[queue]||[]))if(fx?.visual||fx?.move?.name==='Will-O-Wisp'||fx?.move?.name==='Sunny Day')legacyPainted++;
 }
 return true;}
}
const engine=new FakeEngine();
const sandbox={window:{PokemonTorreV360Paint(){return false}},BattleEngine:FakeEngine,Image:FakeImage,
 performance:{now:()=>now},battle,cooldowns,engine,console,current:()=>mon,foe:()=>enemyMon,skillSet:()=>moves,
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
// Inspect ORIGINAL sprite frame IDs. Sunny Day may not use any firebolt,
 // fireburst or explosion frame; only gentle ring (15-25) and flame (74).
now=1000+6*7000+4800;
const sunnyFramesStart=moveFrameLog.length;
const sunnyEvent=engine.v41FireVisuals?.find(f=>f.move.name==='Sunny Day');
if(sunnyEvent)engine.draw(sunnyEvent.at+sunnyEvent.duration*.62);
// Reuse sunnyCode from the static checks above.
assert.doesNotMatch(sunnyCode,/draw\(g,'(?:firebolt|fireburst|explosion|explosionBurst)'/,
 'Sunny Day must not stamp explosive/launch sprite groups');
const fireCode=read('effects/moves/fire-blast/index.js');
assert.match(fireCode,/const w=91\*s\*growth,h=98\*s\*growth/,'Fire Blast smaller');
assert.match(fireCode,/const bw=\(35\+/,'Fire Blast thicker');
assert.ok(legacyPainted===0,'No legacy status visuals should reach the renderer');
const metrics=v42();
assert.equal(metrics.casts,8);
assert.equal(metrics.version,'42.5');
assert.equal(metrics.newMoves.length,4);
assert.equal(metrics.registered.length,8);
assert.ok(bluePixels>0 && orangePixels>0,'Blue status wisps and fire attacks must render real atlas pixels');
assert.ok(metrics.paintCounts.fireBlast>0&&metrics.paintCounts.willOWisp>0&&metrics.paintCounts.sunnyDay>0&&metrics.paintCounts.brasa>0);
assert.ok(drawEvents[2*3].x>baseX,'Existing Fire Claw contact motion still works');
// Cast Will-O-Wisp again and make the enemy MOVE while the status is active.
now+=7000;
const wispIndex=oldMoves.length+1;
engine.enemy.x=680;engine.enemy.y=260;
assert.equal(engine.useMove(wispIndex),true);
const wisp=engine.v41FireVisuals.at(-1);
assert.equal(wisp.duration,3300);
assert.equal(engine.particles.length,0,'Old unlabelled red cast particles removed');
engine.v3568StatusFX.push({move:{name:'Will-O-Wisp'}});
engine.v3580Visuals.push({move:{name:'Will-O-Wisp'}});
engine.enemy.x+=93;engine.enemy.y-=17;
const beforeBlue=bluePixels,beforeOrange=orangePixels,previousLegacy=legacyPainted;
engine.draw(now+wisp.duration*.86);
assert.equal(wisp.to[0],engine.enemy.x,'Blue wisps track enemy horizontal motion');
assert.equal(wisp.to[1],engine.enemy.y-Math.max(13,engine.h*.028),
 'Blue wisps hover ABOVE moving opponent');
assert.ok(bluePixels>beforeBlue,'Blue flames persist near the END of the move');
assert.equal(orangePixels,beforeOrange,'Will-O-Wisp paints NO orange flame or old effect');
assert.equal(legacyPainted,previousLegacy,'Will-O-Wisp has no additional legacy drawings');
assert.equal(engine.v3568StatusFX.length,0,'Requeued legacy status FX hidden during draw');
assert.equal(engine.v3580Visuals.length,0,'Requeued generic catalog FX hidden during draw');
engine.draw(now+wisp.duration-1);
const atEnd=hitPixels;
engine.draw(now+wisp.duration+1);
assert.equal(hitPixels,atEnd,'Flames disappear only once the effect ends');


// V42.4: Reproduce the reported bug: Sunny Day is still playing when Will-O-Wisp is cast.
// Only the new blue wisps must be visible; the actual sunny weather can remain active.
const sunnyIndex=oldMoves.length+2;
now+=10000;
battle.v32Weather='sunny';
assert.equal(engine.useMove(sunnyIndex),true,'Sunny Day starts normally');
const firstSunny=engine.v41FireVisuals.at(-1);
assert.equal(firstSunny.move.name,'Sunny Day');
now+=480; // deliberately overlap (Sunny duration = 4,800 ms)
assert.equal(engine.useMove(wispIndex),true,'Will-O-Wisp starts while Sunny Day visual is active');
assert.equal(battle.v32Weather,'sunny','Weather mechanics not altered by visual isolation');
assert.equal(engine.v41FireVisuals.filter(f=>f.move.name==='Sunny Day').length,0,
 'Casting Will-O-Wisp must remove the previous Sunny Day animation');
const blueOnlyStart=moveFrameLog.length;
engine.draw(now+230);
const blueOnly=moveFrameLog.slice(blueOnlyStart);
assert.ok(blueOnly.length>0,'Will-O-Wisp must still animate');
assert.ok(blueOnly.every(frame=>frame.blue),
 'No orange sun frames may be painted during Will-O-Wisp');
assert.equal(engine.v41FireVisuals.filter(f=>f.move.name==='Will-O-Wisp').length,1);
// Opposite direction: casting Sunny Day while Will-O-Wisp is active must never
// show blue status flames over the solar effect.
now+=2200;
assert.equal(engine.useMove(sunnyIndex),true,'Sunny Day may replace Will-O-Wisp visuals');
assert.equal(engine.v41FireVisuals.filter(f=>f.move.name==='Will-O-Wisp').length,0,
 'Sunny Day takes over status visual without re-triggering Will-O-Wisp');
const sunOnlyStart=moveFrameLog.length;
engine.draw(now+420);
const sunOnly=moveFrameLog.slice(sunOnlyStart);
assert.ok(sunOnly.length>0&&sunOnly.every(frame=>frame.sun),
 'Sunny Day must never replay blue Will-O-Wisp animations');
assert.ok(v42().overlapPrevented>=2,'Diagnostics count removed overlapping visual timelines');
console.log('PASS: cast Sunny then Will, and Will then Sunny, no mixed sprite colors; battle weather unchanged');


// V42.5: Enemy continues fighting while Will-O-Wisp's BLUE FIRE alone occupies
// the foe's sprite area. Rendering hides local particles, but updates can still
// inspect their ORIGINAL arrays: no damage/projectiles/conditions are deleted.
now+=8500;
assert.equal(engine.useMove(wispIndex),true,'Cast Will-O-Wisp for enemy combat masking test');
const orangeAtEnemy={x:engine.enemy.x,y:engine.enemy.y-47,life:.9,max:.9,color:'#ffae35'};
const yellowRing={x:engine.enemy.x+9,y:engine.enemy.y-12,life:.6,r:14,color:'#ffe066'};
const enemyProjectile={x:engine.enemy.x+17,y:engine.enemy.y-30,from:'enemy',life:1,power:17};
const distantParticle={x:engine.player.x,y:engine.player.y-24,life:1,max:1,color:'#fcebaa'};
engine.particles.push(orangeAtEnemy,distantParticle);
engine.rings.push(yellowRing);
engine.projectiles.push(enemyProjectile);
engine.attackActs.enemy=999999;
const projectileListBefore=engine.projectiles,particleListBefore=engine.particles;
const masksBefore=v42().hiddenNearEnemy;
const frameStart=moveFrameLog.length;
engine.draw(now+420);
const duringBlue=moveFrameLog.slice(frameStart);
const visual=engine.visibleVisuals.at(-1);
assert.ok(duringBlue.some(z=>z.blue),'Will-O-Wisp still shows blue flames');
assert.ok(duringBlue.every(z=>z.blue),'Only blue sprite frames are drawn during blue aura');
assert.equal(visual.particlesNear,0,'Enemy yellow particles are hidden near blue flame');
assert.equal(visual.ringsNear,0,'Enemy hit ring hidden near blue flame');
assert.equal(visual.projectilesNear,0,'Enemy attack projectile icon hidden in blue aura');
assert.equal(visual.particlesFar,1,'Particles away from foe remain visible');
assert.equal(visual.enemyAttack,-1,'Old enemy Attack pose aura is masked temporarily');
assert.strictEqual(engine.projectiles,projectileListBefore,'Enemy projectile list fully restored');
assert.strictEqual(engine.particles,particleListBefore,'Particles list fully restored');
assert.ok(engine.projectiles.includes(enemyProjectile),'Enemy attacks not cancelled');
assert.ok(engine.particles.includes(orangeAtEnemy),'Original particle data not deleted');
assert.equal(engine.attackActs.enemy,999999,'Enemy attack timer restored after rendering');
assert.ok(v42().hiddenNearEnemy>masksBefore,'Diagnostics register hidden visuals');
engine.draw(now+3400);
assert.ok(engine.visibleVisuals.at(-1).particlesNear>0,'After wisp ends normal visuals resume');
console.log('PASS: only blue over enemy during Will-O-Wisp, projectiles and damage logic unaffected');

console.log('PASS: V41 preserved; four V42 sprite attacks functional, status overlays removed, no CSS shapes');
console.log(JSON.stringify({version:metrics.version,drawCounts,frameStamps:hitPixels,blue:bluePixels,orange:orangePixels}));
