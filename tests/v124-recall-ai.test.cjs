'use strict';
/* V124: exercise both real attack-side rosters and trainer ball recall/send
 * in the VM without overriding HP, damage, V95-V123 renderer or save.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const path='effects/v124/recall-ai.js',code=fs.readFileSync(path,'utf8');
const html=fs.readFileSync('index.html','utf8');
const approvals=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
assert.ok(html.includes(path),'V124 must load in the official game');
for(const k of ["get('swap124')!=='0'","effects/v124/recall-ai.js"])
 assert.ok(html.includes(k),'diagnostics rollback missing '+k);
assert.ok(approvals.moves.filter(x=>x.version==='V122'&&x.protect).length===4);
assert.ok(approvals.moves.find(x=>x.move==='Rain Dance'&&x.protect));
assert.doesNotMatch(code,/hitTarget\(|damage\(|save\.team\.push\(/,'cannot modify native damage or saved teams');
let ms=1000,logMessages=[],nativeNew=0,nativeManual=0;
const party=[{id:7,hp:100,maxHp:100,level:40},{id:1,hp:78,maxHp:90,level:38}];
const old={id:4,hp:26,maxHp:100,level:40,shiny:true,poisoned:true};
const good={id:25,hp:100,maxHp:100,level:41,shiny:false};
const other={id:16,hp:80,maxHp:90,level:37};
const D={1:{name:'Bulbasaur',type:'grass'},7:{name:'Squirtle',type:'water'},
  4:{name:'Charmander',type:'fire'},25:{name:'Pikachu',type:'electric'},16:{name:'Pidgey',type:'flying'}};
function advantage(type,def){
 if(type==='water'&&def.type==='fire')return 2;
 if(type==='electric'&&def.type==='water')return 2;
 if(type==='fire'&&def.type==='water')return .5;
 if(type==='grass'&&def.type==='water')return 2;
 return 1;
}
const dummy=()=>{};
function el(tag='div'){
 const e={tag,style:{},dataset:{},className:'',textContent:'',children:[],removed:false,
  classList:{add(){},remove(){}},append(...args){this.children.push(...args)},
  appendChild(x){this.children.push(x);return x},remove(){this.removed=true},
  setAttribute(){},querySelector(){return null},querySelectorAll(){return []}};
 return e;
}
const arena=el('arena'),sheet=el('swap'),head=el('head');
const buttons=[0,1].map(i=>{const e=el('button');e.dataset.swap=String(i);return e});
sheet.querySelectorAll=q=>q==='[data-swap]'?buttons:[];
const document={head,createElement:el,getElementById:id=>id==='swapSheet'?sheet:id==='arenaPro'?arena:null};
const gradient={addColorStop:dummy};
const ctx={
 save:dummy,restore:dummy,translate:dummy,scale:dummy,createLinearGradient:()=>gradient,
 beginPath:dummy,moveTo:dummy,lineTo:dummy,stroke:dummy,ellipse:dummy,arc:dummy,fill:dummy,globalAlpha:1
};
const sandbox={
 window:{},URLSearchParams,location:{search:''},document,console,performance:{now:()=>ms},
 GYMS:Array.from({length:13},(_,i)=>({leader:i===0?'Brock':'Blue'})),D,
 V27_HERO_THROW_SHEET:'data:image/png;base64,AAAA',V27_TRAINER_GIFS:{Brock:'https://test/trainer.png'},
 save:{team:party,gym:0,stage:0},battle:null,engine:null,cooldowns:[1,2,3,4],advantage,
 current(){return sandbox.save.team[sandbox.battle.pIndex]},
 foe(){return sandbox.battle?.foe},
 log(msg){logMessages.push(msg)},
 showSwap(){sandbox.battle.paused=true},
 startBattle(enemies,label,wild){
  sandbox.battle={active:true,paused:false,pIndex:0,foe:enemies[0],enemies:enemies.slice(1),
   label,wild,energy:100};
  sandbox.engine=new Engine();
 },
 finishBattle(){sandbox.battle.active=false},Math,Number,Set,Map,Object,Date
};
class Engine{
 constructor(){
  this.player={x:100,y:260,r:30,inv:0};this.enemy={x:420,y:170,r:30,inv:0};
  this.h=400;this.w=600;this.time=0;this.ctx=ctx;
 }
 update(dt){this.time+=dt}
 draw(){
  this.drawMon(this.player,sandbox.current()?.id,false,ms);
  this.drawMon(this.enemy,sandbox.foe()?.id,true,ms);
 }
 drawMon(actor,id,enemy){this.lastPaint={id,enemy,actor}}
 switchMon(){nativeManual++}
 newEnemy(){nativeNew++}
}
sandbox.BattleEngine=Engine;
vm.runInNewContext(code,sandbox,{filename:path,timeout:2500});
assert.equal(sandbox.window.PokemonTorreRecallV124.installed,true);
sandbox.startBattle([old,good,other],'👑 LÍDER Brock',false);
assert.equal(sandbox.battle.foe,old);
sandbox.engine.time=6;
sandbox.engine.update(.9);
assert.equal(sandbox.battle.paused,true,'AI pauses combat during red recall');
assert.equal(sandbox.battle.foe,old,'opponent must stay on field until red recall completes');
assert.equal(sandbox.battle.enemies.length,2);
sandbox.engine.draw();
ms+=560;
sandbox.engine.draw();
assert.equal(sandbox.battle.foe,good,'AI brings the favorable attacker');
assert.equal(sandbox.battle.enemies.length,2,'roster count cannot change during switch');
assert.ok(sandbox.battle.enemies.includes(old),'recalled enemy retained');
assert.equal(old.hp,26,'recalled Pokémon keeps original HP');
assert.equal(old.shiny,true,'recalled Pokémon keeps shiny status');
assert.equal(old.poisoned,true,'recalled Pokémon keeps conditions');
assert.equal(nativeNew,1,'one native enemy switch, no knockout phase');
assert.equal(sandbox.save.gym,0,'no fictitious trainer victory');
ms+=1100;sandbox.engine.draw();
assert.equal(sandbox.battle.paused,false,'combat resumes after red send');
assert.equal(sandbox.window.PokemonTorreRecallV124.diagnostics().completed,1);
const prev=sandbox.window.PokemonTorreRecallV124.diagnostics().enemy;
sandbox.engine.update(.5);
assert.equal(sandbox.window.PokemonTorreRecallV124.diagnostics().enemy,prev,'AI must not switch in loop');
sandbox.showSwap();
buttons[1].onclick();
assert.equal(sandbox.battle.paused,true,'player begins recollection while paused');
assert.equal(sandbox.battle.pIndex,0);
ms+=560;sandbox.engine.draw();
assert.equal(sandbox.battle.pIndex,1,'selected teammate is sent only after recall');
assert.equal(sandbox.battle.energy,88,'manual switch retains existing energy tax');
assert.equal(nativeManual,1,'existing native player switch preserved');
ms+=950;sandbox.engine.draw();
assert.equal(sandbox.battle.paused,false,'manual switch unpauses');
assert.ok(sandbox.window.PokemonTorreRecallV124.diagnostics().manual===1);
assert.ok(sandbox.window.PokemonTorreRecallV124.diagnostics().coachSprites>=2,'trainer sprite used');
sandbox.finishBattle();
sandbox.startBattle([old],'🌾 WILD',true);
sandbox.engine.time=7;sandbox.engine.update(.8);
assert.equal(sandbox.window.PokemonTorreRecallV124.diagnostics().enemy,1,'wild encounter never tactical-switches');
console.log('PASS V124: real trainer sprite, red recall/send player + enemy, delayed roster changes, native HP/shiny/status/energy, controlled tactical switching and wild safeguard');
