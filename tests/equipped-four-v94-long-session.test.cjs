'use strict';
// 4-minute simulated Android battle: repeated attacks must never revert to
// generic visual orbs, even after WebGL stalls/recovers or time advances.
const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync('effects/moves/v92-four/canvas-fallback.js','utf8');
const safe=fs.readFileSync('effects/moves/v92-four/safe-mode.js','utf8');
const moves=[
 {name:'Raízes Violentas',type:'grass'},
 {name:'Geada Persistente',type:'ice'},
 {name:'Sopro Congelante',type:'ice'},
 {name:'Chicote Duplo',type:'grass'}
];
const ctx={
 save(){},restore(){},translate(){},rotate(){},beginPath(){},
 moveTo(){},lineTo(){},quadraticCurveTo(){},closePath(){},
 stroke(){},fill(){},ellipse(){}
};
let now=1000,ballDraws=0,gameDraws=0;
let currentSlot=0,battle={active:true,paused:false,energy:100};
const cooldowns=[0,0,0,0];
let gpuRecent=false;
class BattleEngine {
 constructor(){
  this.ctx=ctx;this.h=320;this.canvas={isConnected:true};
  this.player={x:100,y:220,r:25};
  this.enemy={x:430,y:125,r:29,hp:100};
  this.projectiles=[];this.particles=[];
 }
 useMove(slot){
  if(cooldowns[slot]>now||battle.energy<10)return false;
  const mv=moves[slot];cooldowns[slot]=now+1200;battle.energy-=10;
  // Change type every other cast: visual coverage must follow the accepted
  // move, not depend on hard-coded type='grass'/'ice'.
  this.projectiles.push({from:'player',type:Math.floor(now/7000)%2?'normal':mv.type,life:1.5});
  this.particles.push({color:'legacy'});
 }
 drawProjectile(){ballDraws++;return 'round-generic-projectile';}
 draw(t){gameDraws++;for(const shot of this.projectiles)this.drawProjectile(shot);}
}
const fakePixi={
 diagnostics(){return {v86Active:true,v86Ready:true,v86Name:moves[currentSlot].name,
  v86Recent:gpuRecent,v86ContextLost:!gpuRecent};}
};
const window={};
const sandbox={window,BattleEngine,battle,cooldowns,console,Math,
 pixiFX:fakePixi,performance:{now:()=>now},
 current:()=>({name:'Mewtwo'}),skillSet:()=>moves,stopTimers:()=>{}};
const mod=vm.runInNewContext(source+'\n;equippedFourV92',sandbox);
vm.runInNewContext(safe,sandbox);
assert.equal(window.PokemonTorreEquippedSafetyV92,true);
const e=new BattleEngine(),records=[];
for(let k=0;k<36;k++){
 currentSlot=k%4;
 now=1000+k*7000; // 245 seconds after the first cast (>4 minutes)
 battle.energy=100;
 const before=ballDraws;
 e.projectiles.length=0;
 e.useMove(currentSlot);
 const bullet=e.projectiles[0];
 assert.ok(bullet,'physical hit queue must remain');
 assert.equal(bullet.__v92Covered,true,'tag missing for '+moves[currentSlot].name);
 assert.ok(bullet.__v94NamedEffect,'named projectile guard must persist');
 // Pixi is ready-but-stale for most casts, works briefly in a few others.
 gpuRecent=k%7===0;
 const initial=mod.diagnostics().draws;
 now+=170;e.draw(now);
 if(!gpuRecent){
  assert.ok(mod.diagnostics().draws>initial,
   'Canvas renderer must recover after stalled WebGL');
 }
 assert.equal(ballDraws,before,'legacy generic orb leaked at cast '+k);
 // After the FX has ended, the same old projectile must remain visually hidden
 // even if it persists in the hit queue.
 now+=2300;e.draw(now);
 assert.equal(ballDraws,before,'round bullet returned when effect expired '+k);
 records.push({k,at:now,move:moves[currentSlot].name});
}
assert.ok(now>240000,'simulation must cover more than 3 minutes');
assert.equal(mod.diagnostics().casts,36);
assert.ok(mod.diagnostics().draws>=30,'missed too many native frames');
assert.equal(gameDraws,72);
assert.equal(ballDraws,0);
e.enemy.hp=0;assert.equal(mod.active(e),null);
console.log('PASS V94: '+records.length+' accepted casts over '+Math.round(now/1000)+
 's, no generic orbs, retained damage projectiles, GPU stale recovery, 0HP cleanup');
