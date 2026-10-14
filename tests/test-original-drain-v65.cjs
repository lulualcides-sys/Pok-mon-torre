'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dir=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(dir,p),'utf8');
const runtime=read('effects/moves/_runtime/real-drain-v65.js'),seed=read('parts/p009.txt'),
 status=read('parts/p010.txt'),index=read('index.html');
assert.ok(index.includes('effects/moves/_runtime/real-drain-v65.js'));
assert.ok(index.indexOf('effects/moves/_runtime/real-drain-v65.js')>index.indexOf('effects/moves/_runtime/end.js'));
assert.ok(seed.includes('Math.floor(victim.maxHp/8)'),'Seed must use 1/8 enemy max HP');
assert.ok(seed.includes('Math.min(victim.hp,seedDamage)'),'Seed damage must cap at actual remaining HP');
assert.ok(seed.includes('Math.min(user.maxHp-user.hp,drained)'),'Seed heal must not exceed actual stolen HP');
assert.ok(seed.includes("if(before>0&&victim.hp<=0&&battle?.active)nextFoe()"),'Leech Seed should faint foe normally');
assert.ok(status.includes("(cond==='seed'&&types.includes('grass'))"),'Grass Pokémon immune to Leech Seed');
const graphics=read('effects/moves/v63-plant/APPROVED-ART-V64.json');
assert.ok(graphics.includes('APPROVED_VISUALS_AS_IS'));
let clock=1000;
let player={id:1,hp:70,maxHp:250},victim={id:2,hp:450,maxHp:900};
const battle={active:true,energy:100};
const cooldowns=[0,0,0,0];
const skillSets=[
 {name:'Absorver',type:'grass',cost:15,cd:600,kind:'bolt'},
 {name:'Draining Kiss',type:'fairy',cost:20,cd:650,kind:'bolt'},
 {name:'Leech Life',type:'bug',cost:17,cd:650,kind:'bolt'},
 {name:'Dream Eater',type:'psychic',cost:19,cd:650,kind:'bolt'}];
const engineState={};
class BattleEngine{
 constructor(){this.player={x:20,y:40};this.enemy={x:180,y:120};this.h=500;this.v25={stats:{enemy:{conditions:[]}}};this.notifications=[];this.hitCount=0;}
 v25Popup(x,y,msg){this.notifications.push(msg);}
 useMove(slot){
  const move=skillSets[slot];
  if(cooldowns[slot]>clock||battle.energy<move.cost)return false;
  battle.energy-=move.cost;cooldowns[slot]=clock+move.cd;
  return true;
 }
 hitTarget(who,type,power){
  this.hitCount++;
  if(who!=='enemy'||this.immune)return false;
  victim.hp=Math.max(0,victim.hp-power);
  return true;
 }
}
const sandbox=vm.createContext({
 BattleEngine, window:{},battle,cooldowns,
 skillSet:()=>skillSets, current:()=>player,foe:()=>victim,
 performance:{now:()=>clock},
 engine:engineState
});
vm.runInContext(runtime,sandbox);
const rules=sandbox.window.PokemonTorreDrainRulesV65;
assert.equal(rules.drainRate('Leech Seed'),0);
for(const n of ['Absorver','Absorb','Mega Dreno','Giga Drain','Leech Life',
 'Drain Punch','Dream Eater','Horn Leech','Parabolic Charge','Bitter Blade']){
 assert.equal(rules.drainRate(n),.5,n);
}
for(const n of ['Draining Kiss','Oblivion Wing'])assert.equal(rules.drainRate(n),.75,n);
assert.equal(rules.drainedHP(800,800),100);
assert.equal(rules.drainedHP(800,27),27);
assert.equal(rules.healFromDamage(100,.5,90),50);
assert.equal(rules.healFromDamage(100,.75,40),40);
assert.equal(rules.healFromDamage(0,.5,50),0);
const e=new BattleEngine();
assert.equal(e.useMove(0),true);
e.hitTarget('enemy','grass',100);
assert.equal(victim.hp,350);
assert.equal(player.hp,120);
assert.equal(e.v65LastDrain.healed,50);
assert.equal(e.v65LastDrain.damage,100);
e.hitTarget('enemy','grass',10);
assert.equal(player.hp,120,'No double heal on second hit from same cast');
clock+=1000;
assert.equal(e.useMove(1),true);
e.hitTarget('enemy','fairy',100);
assert.equal(player.hp,195,'Draining Kiss restores 75%');
clock+=1000;
player.hp=245;
assert.equal(e.useMove(2),true);
e.hitTarget('enemy','bug',100);
assert.equal(player.hp,250,'Do not exceed max HP');
clock+=1000;
player.hp=100;
e.immune=true;
assert.equal(e.useMove(0),true);
e.hitTarget('enemy','grass',100);
assert.equal(player.hp,100,'No heal if attack dodged or immune');
e.immune=false;
clock+=3000;
e.hitTarget('enemy','grass',100);
assert.equal(player.hp,100,'No heal after cast time window expires');
// Refresh only mock target HP for independent Dream Eater mechanics test.
victim.hp=450;
clock+=1000;
assert.equal(e.useMove(3),false,'Dream Eater requires sleeping foe');
e.v25.stats.enemy.conditions.push('sleep');
assert.equal(e.useMove(3),true);
e.hitTarget('enemy','psychic',100);
assert.equal(player.hp,150);
let metrics=sandbox.window.PokemonTorreDrainV65();
assert.equal(metrics.last.move,'Dream Eater');
assert.ok(metrics.metrics.healed>=180);
assert.ok(metrics.metrics.blockedDreamEater>=1);
console.log('PASS: Leech Seed = 1/8 max enemy HP; direct drains = 50/75% of real damage; no overheal, miss duplication, or unauthorized art changes');
