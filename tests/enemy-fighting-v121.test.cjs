'use strict';
/* V121: simulate 40s of REAL enemy-fighting state transitions in a controlled
 * native-ish engine. Damage only AFTER close-range windup and only once.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync('effects/combat/enemy-fighting-contact-v121.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const moves=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
assert.ok(index.includes('effects/combat/enemy-fighting-contact-v121.js'));
assert.ok(moves.moves.filter(x=>x.protect&&x.version==='V114').length===4);
assert.ok(moves.moves.some(x=>x.move==='Rain Dance'&&x.protect));
assert.ok(!code.includes('BattleEngine.prototype.useMove='));
assert.ok(!code.includes('damage(')); // the original hitTarget owns damage
function scenario(id,opts={}){
 let hp=300,pre=0,remote=0,hitDistances=[];
 const mon={id,hp:600,maxHp:600};
 const player={hp:300,maxHp:300};
 const species={68:{type:'fighting'},67:{type:'fighting'},106:{type:'fighting'},107:{type:'fighting'},
  57:{type:'fighting'},62:{type:'water',type2:'fighting'},25:{type:'electric'},131:{type:'water'}};
 const battle={active:true,paused:false},save={gym:10};
 const ctx={};
 class Engine{
  constructor(){
   this.time=0;this.h=400;this.w=440;this.player={x:50,y:280,inv:0};
   this.enemy={x:365,y:90,spawn:0,focus:0};this.enemyAttackCD=.01;
   this.telegraph=null;this.projectiles=[];this.particles=[];this.attackActs={enemy:0};
   this.v25={stats:{enemy:{conditions:opts.sleep?['sleep']:[]}}};
  }
  update(dt){
   this.time+=dt;
   this.player.inv=Math.max(0,this.player.inv-dt);
   this.enemy.spawn=Math.max(0,this.enemy.spawn-dt);
   // The broken original AI wants 0.39h distance (for all types).
   let dx=this.player.x-this.enemy.x,dy=this.player.y-this.enemy.y;
   let d=Math.hypot(dx,dy)||1,wanted=this.h*.39;
   if(d<wanted-30){this.enemy.x-=dx/d*this.h*.23*dt;this.enemy.y-=dy/d*this.h*.23*dt;}
   else if(d>wanted+25){this.enemy.x+=dx/d*this.h*.23*dt;this.enemy.y+=dy/d*this.h*.23*dt;}
   this.enemyAttackCD-=dt;
   if(!this.telegraph&&this.enemyAttackCD<=0){
    this.enemyAttackCD=2;
    const type=species[id].type;
    this.telegraph={from:'enemy',type,remaining:.3};
    pre++;
   }
   if(this.telegraph){
    this.telegraph.remaining-=dt;
    if(this.telegraph.remaining<=0){
     this.projectiles.push({from:'enemy',type:this.telegraph.type});
     this.telegraph=null;remote++;
    }
   }
  }
  hitTarget(which,type,power){
   if(which==='player'&&this.player.inv<=0&&type==='fighting'){
    hitDistances.push(Math.hypot(this.enemy.x-this.player.x,this.enemy.y-this.player.y));
    hp-=Math.floor(power/2);player.hp=hp;
    this.player.inv=.29;
   }
  }
  collideRocks(){}
  bounds(){}
  clearPath(){return true}
  particlesAt(){this.particles.push('hit')}
 }
 const sandbox={BattleEngine:Engine,window:{},D:species,battle,save,foe:()=>mon,current:()=>player,
  TYPE_COLOR:{fighting:'#d96'},Math,Number,Set,String,console};
 vm.runInNewContext(code,vm.createContext(sandbox),{timeout:1000});
 const engine=new Engine(),api=sandbox.window.PokemonTorreEnemyFightingV121;
 function tick(n,step=.016){for(let i=0;i<n;i++)engine.update(step,i*step*1000)}
 return {engine,api,mon,player,battle,species,tick,get hp(){return hp},get pre(){return pre},get remote(){return remote},hitDistances};
}
for(const id of [68,67,106,107,57,62]){
 const a=scenario(id),before=a.hp;
 assert.equal(a.api.isFighter(a.mon),true);
 a.tick(30);assert.equal(a.hp,before,'No damaging at far distance before windup '+id);
 a.tick(1000);
 const stats=a.api.diagnostics();
 assert.ok(stats.approaches>0,id+' approached');
 assert.ok(stats.attempts>0,id+' swung');
 assert.ok(stats.hits>0,id+' connected');
 assert.ok(a.hp<before,id+' actually hurt the player');
 assert.ok(a.hitDistances.every(d=>d<=400*.198+.1),id+' must not damage outside melee range');
 assert.equal(a.remote,0,'Fighter must not fire legacy ranged projectile '+id);
 assert.equal(a.engine.projectiles.length,0,id+' no generic fighting bolts');
 assert.ok(stats.hits<=stats.attempts);
}
const sleeping=scenario(68,{sleep:true});sleeping.tick(1050);
assert.equal(sleeping.hp,300,'Sleeping fighter does not attack');
assert.equal(sleeping.api.diagnostics().attempts,0);
const ranged=scenario(25);ranged.tick(260);
assert.equal(ranged.api.diagnostics().attempts,0);
assert.ok(ranged.remote>0,'Non-fighting enemy retains ranged attacks');
const paused=scenario(68);paused.battle.paused=true;paused.tick(240);
assert.equal(paused.api.diagnostics().attempts,0,'Paused combat does not attack');
const protectedPlayer=scenario(68);protectedPlayer.engine.player.inv=15;protectedPlayer.tick(420);
assert.equal(protectedPlayer.hp,300,'Invulnerability preserved');
const gone=scenario(68);gone.mon.hp=0;gone.tick(200);
assert.equal(gone.api.diagnostics().attempts,0,'Defeated fighter cannot attack');
console.log('PASS V121 enemy melee AI: Machamp/Machoke/Hitmonlee/Hitmonchan/Primeape/Poliwrath walk+windup+contact+real damage; no ranged bolts, nonfighters/status/pause/invulnerability protected');
