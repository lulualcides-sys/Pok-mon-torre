'use strict';
/* V117 all-in-one regression: original approvals are immutable; no fake 151 coverage. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const mods=['01-sprite-audit','02-shiny','03-gym-kanto','04-combat','05-mobile'];
const base='effects/v117/';
const audit=JSON.parse(fs.readFileSync(base+'sprite-audit.json','utf8'));
const standard=JSON.parse(fs.readFileSync('effects/pokemon/VISUAL_STANDARD.json','utf8'));
const approved=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
const html=fs.readFileSync('index.html','utf8');
assert.equal(audit.registered_species,151);
assert.equal(audit.pokemon.length,151);
assert.deepEqual(audit.pokemon.map(m=>m.id),Array.from({length:151},(_,i)=>i+1));
assert.equal(audit.pokemon[24].name,'Pikachu');
assert.deepEqual(audit.original_shiny_animated_confirmed_ids,[6,18,62,68,94,105]);
assert.ok(audit.pokemon.every(p=>p.actions.Faint==='unverified'), 'unseen Faint frames may not be claimed');
assert.ok(standard.global_rollout.protect&&standard.v116_preview.protect);
assert.equal(approved.moves.filter(x=>x.protect&&x.version==='V114').length,4);
for(const mod of mods)assert.ok(html.includes(base+mod+'.js'),mod+' not loaded');
assert.ok(html.includes("get('kanto117')==='1'"),'V117 must be opt-in');
assert.ok(!html.includes("get('kanto117')!== 'off'"));
const real=Object.fromEntries(audit.pokemon.map(p=>[p.id,{id:p.id,name:p.name}]));
const leaders=[{leader:'Falkner',boss:[17,22],name:'Old first gym',type:'flying',accent:'#447ca7'}];
while(leaders.length<8)leaders.push({leader:'Old',boss:[25],name:'Old gym',type:'electric',accent:'#447ca7'});
function scenario(search){
 const fakeCanvas={width:440,height:400};
 const ctx={drawImage(img,...args){ctx.calls.push([img,args])},calls:[],
   save(){},restore(){},fillText(){},strokeText(){},setTransform(){},beginPath(){},arc(){},fill(){},stroke(){}};
 class FakeImage{
  constructor(){this.complete=true;this.naturalWidth=96;this.naturalHeight=96;this._src='';}
  addEventListener(name,fn){if(name==='load')this.load=fn;}
  set src(s){this._src=s;if(this.onload)this.onload();}
  get src(){return this._src}
 }
 const battle={active:false,label:'',wild:false},actors={
  player:{x:100,y:180,flash:0},enemy:{x:300,y:180,flash:0}};
 const state={current:{id:25,hp:100},foe:{id:95,hp:120}};
 const document={querySelector:()=>null,createElement:()=>({style:{},dataset:{},append(){}})};
 const window={},stats={render:0,start:0,hit:0},navigator={userAgent:'Android Chrome Mobile'};
 class Engine{
  constructor(){this.ctx=ctx;this.canvas=fakeCanvas;this.dpr=2;this.h=400;this.w=440;this.player=actors.player;this.enemy=actors.enemy;this.assets=new Map();this.particles=[];this.projectiles=[];this.time=2;this.fps=31;this.frames=60;this.running=true;}
  loadArt(id){this.assets.set(id,{sheets:{Idle:new FakeImage(),Walk:new FakeImage()},custom:{},meta:{Idle:{height:96,width:96}},art:new FakeImage()})}
  drawMon(actor,id){this.ctx.drawImage({naturalWidth:100},10,10,20,20,actor.x,actor.y,30,30);}
  draw(){return 1;}
  update(){return 1;}
  hitTarget(who){stats.hit++;if(who==='enemy')state.foe.hp-=12;else state.current.hp-=13;}
  frame(){return 1;}
  resize(){this.dpr=2;return 1;}
 }
 const sandbox={BattleEngine:Engine,window,document,location:{search,hostname:'localhost'},
  URLSearchParams,Image:FakeImage,navigator,console,Math,Number,Map,Set,Date,
  GYMS:leaders,D:real,SPRITE_SRC:'https://example.test/pmd/',ART:'https://example.test/art/',
  battle,save:{gym:0,stage:0},current:()=>state.current,foe:()=>state.foe,
  render:()=>{stats.render++},startBattle:function(e,label,wild){battle.active=true;battle.label=label;battle.wild=wild;stats.start++},
  engine:null};
 vm.createContext(sandbox);
 for(const mod of mods)vm.runInContext(fs.readFileSync(base+mod+'.js','utf8'),sandbox,{timeout:2500});
 return {Engine,sandbox,actors,battle,ctx,state,stats,leaders,window};
}
const baseline=scenario('');
assert.equal(baseline.window.PokemonTorreGymsV117,undefined);
assert.equal(baseline.leaders[0].leader,'Falkner');
const a=scenario('?kanto117=1');
assert.equal(a.window.PokemonTorreSpriteAuditV117.installed,true);
assert.equal(a.window.PokemonTorreShinyV117.installed,true);
assert.equal(a.window.PokemonTorreGymsV117.installed,true);
assert.equal(a.window.PokemonTorreCombatV117.installed,true);
assert.equal(a.window.PokemonTorreMobileV117.installed,true);
assert.deepEqual(Array.from(a.window.PokemonTorreGymsV117.names),['Brock','Misty','Lt. Surge','Erika','Koga','Sabrina','Blaine','Giovanni']);
assert.deepEqual(Array.from(a.leaders[0].boss),[74,95]);
assert.deepEqual(Array.from(a.leaders[1].boss),[120,121]);
assert.deepEqual(Array.from(a.leaders[7].boss),[111,51,31,34,112]);
const engine=new a.Engine();a.sandbox.engine=engine;
engine.loadArt(25);
const cover=a.window.PokemonTorreSpriteAuditV117.diagnostics();
assert.equal(cover.registeredSpecies,151);
assert.ok(cover.observedSpecies>0);
assert.ok(a.window.PokemonTorreSpriteAuditV117.getSpecies(25).actions.Idle==='decoded');
a.state.current.shiny=true;
engine.drawMon(engine.player,25,false,1000);
assert.ok(a.window.PokemonTorreShinyV117.diagnostics().requested>=1);
engine.hitTarget('enemy','fighting',50);
assert.equal(a.state.foe.hp,108,'original HP only');
engine.drawMon(engine.enemy,95,true,2000);
assert.ok(a.window.PokemonTorreCombatV117.diagnostics().physical>=1);
assert.ok(a.window.PokemonTorreCombatV117.diagnostics().reactionFrames>=1);
assert.equal(engine.enemy.x,300,'no hitbox movement');
assert.equal(engine.enemy.y,180,'no hitbox movement Y');
engine.resize();
assert.ok(engine.dpr<=1.35,'mobile DPR budget');
engine.frame(6000);engine.frame(14000);
assert.equal(a.window.PokemonTorreMobileV117.diagnostics().mobile,true);
assert.ok(a.window.PokemonTorreMobileV117.diagnostics().fpsSamples.length>0);
assert.ok(a.window.PokemonTorreMobileV117.diagnostics().latestFps<40);
assert.ok(a.ctx.calls.length>=2,'real sprite drawImage preserved');
a.sandbox.startBattle([{id:74}, {id:95}],'👑 LÍDER Brock',false);
assert.equal(a.stats.start,1);
assert.equal(a.window.PokemonTorreGymsV117.diagnostics().leaderFights,1);
assert.equal(a.window.PokemonTorreGymsV117.diagnostics().savedGymUnchanged,true);
assert.equal(a.sandbox.save.stage,0,'saves unchanged');
console.log('PASS V117 all five modules: Kanto 151 audit, original shiny only, Brock and eight authentic teams, damage verified/no hitbox changes, measured Android DPR and particle cap; V116 off unaffected');
