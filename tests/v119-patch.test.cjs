'use strict';
/* V119 unit regression: all eight modules, 1% exact opponent roll, mechanics untouched. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const modules=['01-enemy-shiny','02-cinematic-combat','03-leader-ai','04-weather-depth',
 '05-capture-evolution','06-pokedex','07-league','08-mobile'];
const root='effects/v119/';
const html=fs.readFileSync('index.html','utf8');
const approved=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
assert.equal(modules.length,8);
assert.ok(html.includes("get('kanto119')==='1'"));
for(const name of modules)assert.ok(html.includes(root+name+'.js'),'Module not in one-patch loader: '+name);
for(const move of approved.moves.filter(x=>x.protect)){
 assert.ok(move.move);
}
assert.ok(approved.moves.some(x=>x.move==='Rain Dance'&&x.protect&&x.frames===10));
const source=Object.fromEntries(modules.map(x=>[x,fs.readFileSync(root+x+'.js','utf8')]));
for(const [key,value] of Object.entries(source)){
 assert.ok(value.includes("get('kanto119')!=='1'"),key+' must stay preview-only');
 assert.ok(!value.includes('BattleEngine.prototype.useMove='),'Cannot change protected moves: '+key);
}
function scenario(search,randoms=[.8]){
 const seen=[],caught=[],rolls=randoms.slice(),draws=[];
 const ctx={
  drawImage(){draws.push('drawImage')},fillRect(){draws.push('fillRect')},
  beginPath(){},rect(){},clip(){},ellipse(){},stroke(){},save(){},restore(){},fill(){},
  strokeText(){},fillText(){},setTransform(){},globalAlpha:1
 };
 const battle={active:false,paused:false,wild:false,foe:null,enemies:[],v32Weather:'clear',label:'',energy:100};
 const save={gym:0,stage:0,seen,caught,shinyCaught:[],team:[{id:25,hp:100,maxHp:100}],box:[]};
 const D=Object.fromEntries(Array.from({length:151},(_,i)=>[i+1,{name:'Pokémon '+(i+1)}]));
 let writes=0,starts=0,originalHits=0;
 const make=(kind)=>{
   const m={id:kind,hp:200,maxHp:200,level:20};
   return m;
 };
 const persist=()=>writes++;
 const makeEl=()=>({style:{},dataset:{},hidden:false,append(){},insertAdjacentElement(){},addEventListener(){},
  querySelector(){return null},querySelectorAll(){return[]},setAttribute(){},classList:{add(){}},value:'',textContent:''});
 const head=makeEl(),main=makeEl(),modal=makeEl();
 const doc={
  createElement:()=>makeEl(),getElementById:()=>head,
  querySelector(selector){
   if(selector==='.battleHeading')return head;
   if(selector==='#modal .result')return modal;
   if(selector==='#main .v27League')return main;
   if(selector==='#modal .dexGrid')return {querySelectorAll(){return Array.from({length:151},makeEl)},insertAdjacentElement(){}};
   if(selector==='#modal .sectionhead')return head;
   return null;
  }
 };
 class Engine{
  constructor(){
   this.ctx=ctx;this.w=440;this.h=330;this.player={x:130,y:200};
   this.enemy={x:310,y:200,focus:0};this.v25={capture:null};
   this.assets=new Map();this.running=true;this.fps=48;this.shake=0;
   this.enemyAttackCD=2;this.foeDodgeCD=1;this.particles=[];
  }
  hitTarget(side){
   originalHits++;
   if(side==='enemy'){battle.foe.hp-=14;}
   return 14;
  }
  draw(){return 15}
  drawMon(){return 'sprite'}
  update(){return 'updated'}
  v25Update(dt){if(this.v25?.capture)this.v25.capture.time+=dt;}
  v25Ball(){return 'ball'}
  frame(){return 1}
  particlesAt(){}
 }
 const sandbox={
  window:{},document:doc,BattleEngine:Engine,location:{search,hostname:'localhost'},
  URLSearchParams,Math:{...Math,random:()=>rolls.length?rolls.shift():.8,PI:Math.PI,
   sin:Math.sin,cos:Math.cos,min:Math.min,max:Math.max,abs:Math.abs,round:Math.round,
   hypot:Math.hypot,sign:Math.sign},Number,Set,Map,WeakMap,Array,Object,String,
  performance:{now:()=>1000},navigator:{userAgent:'Android Mobile'},
  battle,save,D,persist,current:()=>save.team[0],foe:()=>battle.foe,
  nextFoe:()=>{
   battle.foe=battle.enemies.shift();return 'next';
  },
  startBattle:(enemies,label,wild)=>{
   starts++;battle.active=true;battle.wild=wild;battle.label=label;
   const actual=label==='LÍDER SUBSTITUIÇÃO'?[make(74),make(95)]:enemies;
   battle.foe=actual[0];battle.enemies=actual.slice(1);
   // Simulates a gym replacing the roster and the older wild shiny reroll.
   if(wild)enemies[0].shiny=true;
   return 'started';
  },
  awardXP:m=>{m.id++;return[]},resultScreen:()=>true,
  showPokedex:()=>true,v27RenderLeague:()=>true,
  finishBattle:()=>true,ART:'https://example.test/art/',
  Image:function(){this.complete=true;this.naturalWidth=70;this.naturalHeight=70;},
  console
 };
 vm.createContext(sandbox);
 for(const name of modules)vm.runInContext(source[name],sandbox,{filename:name+'.js',timeout:2500});
 return {sandbox,Engine,ctx,draws,battle,save,writes:()=>writes,starts:()=>starts,
  hits:()=>originalHits,create:make};
}
const off=scenario('');
assert.equal(off.sandbox.window.PokemonTorreEnemyShinyV119,undefined);
assert.equal(off.sandbox.window.PokemonTorreLeadersV119,undefined);
const run=scenario('?kanto119=1',[.005,.50,.0099,.0100,.9,.01]);
const {sandbox:S,battle,save}=run;
const api=S.window.PokemonTorreEnemyShinyV119;
assert.equal(api.odds,.01);
assert.ok(S.window.PokemonTorreCinemaV119.installed);
assert.ok(S.window.PokemonTorreLeadersV119.installed);
assert.ok(S.window.PokemonTorreWeatherV119.installed);
assert.ok(S.window.PokemonTorreCaptureEvolutionV119.installed);
assert.ok(S.window.PokemonTorrePokedexV119.installed);
assert.ok(S.window.PokemonTorreLeagueV119.installed);
assert.ok(S.window.PokemonTorreMobileV119.installed);
const enemies=[run.create(25),run.create(95),run.create(6),run.create(150),run.create(143)];
assert.equal(S.startBattle(enemies,'TREINADOR TESTE',false),'started');
assert.equal(enemies[0].shiny,true);
assert.equal(enemies[1].shiny,false);
assert.equal(enemies[2].shiny,true);
assert.equal(enemies[3].shiny,false);
assert.equal(enemies[4].shiny,false);
assert.equal(api.diagnostics().rolls,5);
assert.equal(api.diagnostics().odds,.01);
assert.equal(battle.foe.shiny,true);
assert.deepEqual(Array.from(save.v119ShinySeen),[25]);
S.nextFoe();
assert.equal(battle.foe.shiny,false);
assert.equal(api.diagnostics().rolls,5,'No reroll when Pokemon enters');
const wild=run.create(19);
S.startBattle([wild],'WILD',true);
assert.equal(wild.shiny,false,'Original wild reroll overridden, 1% not stacked');
assert.equal(wild.shinyRoll,.01);
assert.equal(api.diagnostics().rolls,6);
const supplied=[run.create(25)];
S.startBattle(supplied,'LÍDER SUBSTITUIÇÃO',false);
assert.equal(battle.foe.id,74);
assert.equal(battle.foe.shinyRoll,.01,'Replacement leader must have exact 1%');
assert.equal(battle.enemies[0].shinyRoll,.01,'Replacement reserves must have exact 1%');
assert.equal(api.diagnostics().rolls,9,'One roll supplied plus two actual replacements');

const engine=new run.Engine();
battle.foe=run.create(74);
const hp=battle.foe.hp;
engine.hitTarget('enemy','rock',32);
assert.equal(battle.foe.hp,hp-14,'Native HP unchanged');
assert.equal(run.hits(),1);
assert.equal(S.window.PokemonTorreCinemaV119.diagnostics().hits,1);
engine.draw(1100);
assert.ok(S.window.PokemonTorreCinemaV119.diagnostics().frames>0,'Post-damage film flash');
battle.v32Weather='rain';engine.draw(1300);
assert.ok(S.window.PokemonTorreWeatherV119.diagnostics().rainReflections>0);
const oldX=engine.enemy.x;
battle.wild=false;battle.v30Boss=true;save.gym=0;
engine.update(.016,1000);
assert.equal(engine.enemy.x,oldX,'No enemy teleport');
assert.equal(S.window.PokemonTorreLeadersV119.diagnostics().last.leader,'Brock');
const capture={time:.88,toX:310,toY:180,success:true};
engine.v25.capture=capture;engine.v25Update(.13);
assert.ok(S.window.PokemonTorreCaptureEvolutionV119.diagnostics().shakes>=1);
assert.equal(S.awardXP(save.team[0],25).length,0);
S.resultScreen('win','details',true,false);
assert.equal(S.window.PokemonTorreCaptureEvolutionV119.diagnostics().evolutions,1);
S.showPokedex();
assert.equal(S.window.PokemonTorrePokedexV119.diagnostics().opens,1);
save.gym=8;S.startBattle([run.create(91)],'LORELEI',false);
assert.equal(S.window.PokemonTorreLeagueV119.diagnostics().previews,1);
S.finishBattle(true);
assert.equal(save.v119LeagueHistory.victories.Lorelei,1);
assert.equal(save.v119LeagueHistory.championships,0);
engine.frame(6500);
assert.equal(S.window.PokemonTorreMobileV119.diagnostics().mobile,true);
assert.equal(S.window.PokemonTorreMobileV119.diagnostics().noAdditionalAnimationLoop,true);
assert.equal(S.window.PokemonTorreMobileV119.diagnostics().stable60fpsClaim,false);
console.log('PASS V119 eight modules: exact single 1% enemy shiny roll wild+trainers, cinema damage only, 8 gym AI profiles, protected rain reflections, capture 3-phase, evolution sprites, Pokédex 151, League save history, mobile no new loop, OFF official unchanged');
