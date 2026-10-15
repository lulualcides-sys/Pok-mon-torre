'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const sync=read('effects/moves/_runtime/impact-sync-v80.js');
const render=read('effects/moves/v80-preview/render.js');
const fallback=read('effects/moves/v72-battle/render.js');
const index=read('index.html');
assert.ok(index.includes("get('battle_preview')==='v80'"));
assert.ok(index.includes('fxFiles[i]="effects/moves/v80-preview/render.js"'));
assert.ok(index.includes("impact-sync-v80.js"));
assert.ok(index.indexOf("combat-hit-reliability-v47.js")<index.indexOf("impact-sync-v80.js"),
  'Hit synchronization must wrap V47 recovery AFTER its installation');
assert.ok(!fallback.includes('v80Synced'),'The normal game must be unaffected');
assert.ok(!sync.includes('setTimeout('),'No separate fake/timer-based damage allowed');
assert.ok(!sync.includes('prototype.hitTarget='),'Hit calculation must remain unchanged');
class BattleEngine {
 constructor(){this.v359Attacks=[];this.v47MissingCollisions=[];this.v47ContactToLand=[];this.hits=0;this.running=true;this.enemy={inv:0}}
 useMove(slot){
  if(slot<0)return false;
  const selected=battleObj.actor.moves[slot];
  const fx={move:selected,kind:'beam',battle:battleObj,
   owner:battleObj.actor,target:battleObj.enemy,at:100,duration:1000,end:1100,
   times:[.64],hits:0};
  this.v359Attacks.push(fx);
  // Simulate V47 adding its early missing-collision fallback and a separate,
  // unrelated cast which may NOT be removed by the sync module.
  this.v47MissingCollisions.push({
   name:'Old Spell',owner:battleObj.actor,victim:battleObj.enemy,at:900
  },{
   name:selected.name,owner:battleObj.actor,victim:battleObj.enemy,at:870
  });
  return true;
 }
 update(now){
  this.v359Attacks=this.v359Attacks.filter(f=>f.battle===battleObj&&f.end>now);
  for(const f of this.v359Attacks){
    while(f.hits<f.times.length&&now>=f.at+f.duration*f.times[f.hits]){
      if(f.target!==battleObj.enemy||f.owner!==battleObj.actor)break;
      this.hitTarget('enemy',f.move.type,f.move.power);
      f.hits++;
    }
  }
  // Reflect the V47 backup system: any remaining fallback may deal extra HP
  // damage at ~770ms unless the after-V47 wrapper suppressed its new entry.
  for(const f of this.v47MissingCollisions){
   if(now>=f.at&&f.name!=='Old Spell'){
    this.hitTarget('enemy','test',10);f.at=Infinity;
   }
  }
 }
 hitTarget(who,type,power){if(who==='enemy'){battleObj.enemy.hp-=power;this.hits++}}
}
const battleObj={active:true,paused:false,
 actor:{moves:[{name:'Dragon Pulse',power:20,type:'dragon'},{name:'Aura Sphere',power:25,type:'fighting'},{name:'Thunder',power:40,type:'electric'}]},
 enemy:{hp:500}};
const PIXI={Assets:{load:async()=>({baseTexture:{valid:true,width:3840,height:240}})}};
const window={PIXI};const context=vm.createContext({window,PIXI,console,BattleEngine,
 performance:{now:()=>100},battle:battleObj,
 current:()=>battleObj.actor,foe:()=>battleObj.enemy});
vm.runInContext(render,context);
vm.runInContext(sync,context);
assert.equal(window.PokemonTorreBattlePreviewV80.version,'80.0');
assert.equal(window.PokemonTorreBattlePreviewV80.synchronization.impactFraction,5/8);
const engine=new BattleEngine();
for(let i=0;i<2;i++){
 const before=battleObj.enemy.hp;
 assert.equal(engine.useMove(i),true);
 const fx=engine.v359Attacks[engine.v359Attacks.length-1];
 const contactAt=100+1000*3.4*5/8;
 assert.equal(fx.v80ImpactAt,contactAt);
 assert.equal(fx.v80VisualUntil,3500);
 assert.equal(fx.duration,1000,'Do not change the mechanical cast length');
 assert.equal(fx.times.length,1,'No duplicate damage hits');
 assert.equal(fx.end,3740,'Visual and damage queue should stay alive');
 assert.equal(engine.v47MissingCollisions.filter(x=>x.name===fx.move.name).length,0,
  'V47 should not land an early fallback hit');
 assert.ok(engine.v47MissingCollisions.some(x=>x.name==='Old Spell'),
  'Other hits and recoveries must be preserved');
 engine.update(1700);
 assert.equal(battleObj.enemy.hp,before,'Enemy took HP loss before visual impact');
 engine.update(contactAt-1);
 assert.equal(battleObj.enemy.hp,before,'Enemy was hit one tick early');
 engine.update(contactAt);
 assert.equal(battleObj.enemy.hp,before-fx.move.power,'Visual contact frame must apply native damage once');
 const hits=engine.hits;
 engine.update(contactAt+220);
 assert.equal(engine.hits,hits,'Same cast damaged enemy more than once');
 // Clean up previous cast for next simulation.
 engine.v359Attacks=[];
 engine.v47MissingCollisions=engine.v47MissingCollisions.filter(x=>x.name==='Old Spell');
 battleObj.enemy.hp=before;
}
const c=engine.useMove(2),th=engine.v359Attacks.at(-1);
assert.equal(c,true);
assert.equal(th.v80Synced,undefined,'Thunder must not be modified');
assert.deepEqual(Array.from(th.times),[.64]);
const diag=window.PokemonTorreHitSyncV80();
assert.equal(diag.scheduled,2);
assert.equal(diag.recoverySuppressed,2);
assert.ok(diag.last.impactAt>diag.last.castAt);
console.log('PASS V80: native HP changes on the exact PIXI contact frame, once; protected moves and older collision recovery unchanged');
