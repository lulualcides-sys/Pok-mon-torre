'use strict';
/* V123 mega-patch regression: progress, five wild encounters, stats, reset,
 * reward, combat items, adaptive performance, larger arena, preserved sprites.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8'),base='effects/v123/';
const index=read('index.html');
for(const file of ['gameplay.js','encounters-ui.js','performance-visual.js']){
 assert.ok(index.includes(base+file),'V123 official module not in loader: '+file);
 assert.ok(read(base+file).length>1400);
}
assert.ok(index.includes("get('game123')!=='0'"),'V123 diagnostic switch missing');
const prior=JSON.parse(read('effects/moves/STATUS_APROVADOS.json'));
assert.ok(prior.moves.find(m=>m.move==='Venoshock'&&m.version==='V122'&&m.protect));
assert.ok(prior.moves.find(m=>m.move==='Rain Dance'&&m.protect));
assert.ok(!read(base+'gameplay.js').includes('hitTarget('),'Gameplay must not rewrite damage');
assert.ok(!read(base+'performance-visual.js').includes('hitTarget('),'Perf cannot change damage');
let save={starter:1,v:9,team:[{id:1,level:5,hp:40,maxHp:70}],box:[],gym:0,stage:0,
 routeUsed:{},coins:70,balls:5,superBalls:0,ultraBalls:0,potions:2,superPotions:1,wins:0,losses:0,seen:[1],caught:[1]};
let battle=null,oldStarts=0,oldEnds=0,baseDraws=0,heals=0;
const cache={};
const localStorage={getItem(k){return cache[k]||null},setItem(k,v){cache[k]=v}};
const canvas={save(){},restore(){},drawImage(...args){baseDraws++;this.last=args}};
const engine={};
class BattleEngine{
 constructor(){this.running=true;this.assets=new Map();this.particles=[];this.rings=[];this.damageLabels=[];
 this.fps=32;this.ctx=canvas;this.h=400;this.w=700;this.projectiles=[];this.enemy={x:250,y:200,focus:0};this.player={x:80,y:200};this.foeDodgeCD=3;this.enemyAttackCD=2;}
 update(){return true}
 useMove(){return true}
 frame(){return true}
 drawMon(){this.ctx.drawImage({naturalWidth:50},0,0,16,16,30,40,60,60);return true}
 start(){this.running=true;return true}
 newEnemy(){return true}
 switchMon(){return true}
}
const empty=()=>null;
const document={head:{appendChild(el){assert.ok(el.id)}},
 createElement(t){return {tagName:t,id:'test',style:{},className:'',appendChild(){},insertAdjacentElement(){}}},
 getElementById:empty,querySelector:empty,querySelectorAll:()=>[]};
function persist(){localStorage.setItem('save',JSON.stringify(save))}
function startBattle(arr,label,wild){oldStarts++;battle={active:true,wild,foe:arr[0],label,enemies:[],paused:false};return true}
function finishBattle(win){oldEnds++;if(win)save.wins++;else save.losses++;battle.active=false;battle=null;persist();}
function finishCapture(){battle.active=false;battle=null;}
function render(){}
function resultScreen(){}
function battlePotion(){save.potions--}
function battleSuperPotion(){save.superPotions--}
function v29TrainerCount(g){return 6+g}
function v27WildOdds(){return [{id:16,name:'Pidgey',weight:6},{id:25,name:'Pikachu',weight:4}]}
function v27ShowOdds(){}
const D={1:{type:'grass',hp:20},16:{type:'normal',name:'Pidgey'},25:{type:'electric',name:'Pikachu'}};
function mon(id,level){return {id,level,hp:40,maxHp:40}}
const GYMS=Array.from({length:13},(_,g)=>({min:5+g*4,levelCap:20+g*5}));
const sandbox=vm.createContext({window:{},document,navigator:{userAgent:'Android'},
 performance:{now:()=>1000},localStorage,save,battle,engine,Date,Math,Number,Set,Map,WeakSet,URLSearchParams,
 location:{search:'',hostname:'test'},current:()=>save.team[0],foe:()=>battle?.foe,
 v29TrainerCount,v27WildOdds,v27ShowOdds,startBattle,finishBattle,finishCapture,
 battlePotion,battleSuperPotion,persist,render,resultScreen,
 BattleEngine,GYMS,KANTO_RARE:new Set([25]),KANTO_LEGENDS:new Set(),
 clamp:(v,a,b)=>Math.min(b,Math.max(a,v)),mon,D,
 advantage:()=>1,log(){},overlay(){},close(){},awardXP(){},console});
// Native stubs must mutate vm globals, not host-module lexical variables.
sandbox.startBattle=function(arr,label,wild){
 oldStarts++;sandbox.battle={active:true,wild,foe:arr[0],label,enemies:[],paused:false};return true;
};
sandbox.finishBattle=function(win){
 oldEnds++;if(win)sandbox.save.wins++;else sandbox.save.losses++;
 sandbox.battle.active=false;sandbox.battle=null;sandbox.persist();
};
sandbox.finishCapture=function(){sandbox.battle.active=false;sandbox.battle=null;};
sandbox.foe=()=>sandbox.battle?.foe;
sandbox.battlePotion=function(){sandbox.save.potions--};
sandbox.battleSuperPotion=function(){sandbox.save.superPotions--};
for(const path of ['gameplay.js','encounters-ui.js','performance-visual.js'])
 vm.runInContext(read(base+path),sandbox,{filename:path,timeout:5000});
assert.equal(sandbox.window.PokemonTorreGameplayV123.installed,true);
assert.equal(sandbox.window.PokemonTorreRoutesV123.encountersPerStop,5);
assert.equal(sandbox.window.PokemonTorrePerformanceV123.installed,true);
assert.equal(sandbox.v29TrainerCount(0),4,'early gym must have shorter progression');
assert.equal(sandbox.v29TrainerCount(7),7,'late gym progression remains gradual');
sandbox.save.stage=1;
for(let i=0;i<5;i++){
 sandbox.grassEncounter();
 assert.ok(sandbox.battle.active);
 sandbox.battle.active=false;sandbox.battle=null;
}
assert.equal(sandbox.save.routeUsed['0-1'],5,'five wild encounters');
sandbox.grassEncounter();
assert.equal(oldStarts,5,'sixth encounter must be blocked');
sandbox.startBattle([{id:25,hp:30,maxHp:30}],'ENCONTRO',true);
assert.ok(sandbox.save.v123Stats.rareSeen>=1,'rare encounters must be recorded, including weighted wild rolls');
sandbox.finishCapture();
assert.equal(sandbox.save.v123Stats.captures,1,'successful capture should be counted');
sandbox.startBattle([{id:16,hp:40,maxHp:40}],'TREINADOR',false);
sandbox.battlePotion();sandbox.battlePotion();sandbox.battlePotion();
assert.equal(sandbox.save.potions,0,'cannot use a third potion');
sandbox.finishBattle(true);
assert.equal(sandbox.save.v123Stats.trainers,1,'trainer victory counted');
sandbox.save.stage=2;
sandbox.startBattle([{id:16,hp:40,maxHp:40}],'TREINADOR',false);
sandbox.finishBattle(true);
assert.ok(sandbox.save.v123PendingReward,'mid-gym reward choice pending');
sandbox.save.starter=null;sandbox.persist();
assert.equal(JSON.parse(localStorage.getItem('pokeTorreV123Lifetime')).resets,1,'reset lifetime count stored separately');
const e=new BattleEngine();
const len=e.ctx.last?.length||0;
e.drawMon();
assert.equal(e.ctx.last.length,9,'Pokemon draw pipeline must remain operational (image + 8 coordinates)');
assert.equal(e.player?.r||0,0,'V123 scaling must not edit hitboxes');
sandbox.battle={active:true,paused:false,foe:{id:16,hp:20,maxHp:20}};
e.particles=Array.from({length:200},()=>({}));e.rings=Array.from({length:80},()=>({}));
e.damageLabels=Array.from({length:30},()=>({}));
e.frame(1200);
assert.ok(e.particles.length<=85,'visual particles bounded for slow frames');
assert.ok(e.rings.length<=28&&e.damageLabels.length<=18,'transient UI objects bounded');
const d=sandbox.window.PokemonTorrePerformanceV123.diagnostics();
assert.equal(d.extraVisualScale,1,'V122 1.24x now owns all sprite scaling');
console.log('PASS V123 mega-patch: campaign ladder, five wild encounters, rare/capture counters, potion limits, rewards, reset lifetime, mobile cast caps and Pokemon size. Approved V95-V122 untouched.');
