'use strict';
/* V103 regression: 4 separate 8/12/16/16 frame drawings, one native HP hit,
 * no generic fallthrough, original skills/cooldowns, safe=1 compatible.
 */
const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs');
const paths=[
 'effects/moves/v103-fighting/runtime.js',
 'effects/moves/catalog/chute/v103/render.js',
 'effects/moves/catalog/golpedekarate/v103/render.js',
 'effects/moves/catalog/crosschop/v103/render.js',
 'effects/moves/catalog/brickbreak/v103/render.js'
];
const input=paths.map(p=>fs.readFileSync(p,'utf8'));
const index=fs.readFileSync('index.html','utf8');
const registry=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
assert.ok(index.includes('v103-fighting-approved'));
for(const path of paths)assert.ok(index.includes(path),'production file '+path);
for(const name of ['Chute','Golpe de Karatê','Cross Chop','Brick Break']){
 assert.ok(registry.moves.some(m=>m.move===name&&m.protect&&m.status==='aprovado'),
  'approved visual protected '+name);
}
function sandboxFor(safe=false){
 let at=1000,nativeHits=0,painted=0;
 const actor={id:150,hp:200},victim={id:143,hp:900},battle={active:true,
  energy:100,paused:false},cooldowns=[0,0,0,0];
 const names=['Chute','Golpe de Karatê','Cross Chop','Brick Break'];
 const skills=names.map((name)=>({name,type:'fighting',kind:'dash',cat:'physical',
  power:31,cost:2,cd:1300,level:1}));
 const window={};
 const ctx={globalAlpha:1,save(){},restore(){},beginPath(){},
  moveTo(){painted++},lineTo(){painted++},stroke(){painted++},fill(){painted++},
  closePath(){},translate(){},rotate(){}};
 class BattleEngine{
  constructor(){this.running=true;this.ctx=ctx;this.canvas={isConnected:true};
   this.player={x:190,y:310,r:31},this.enemy={x:240,y:310,r:28};
   this.h=540;this.w=650;this.v359Attacks=[];this.v47ContactToLand=[];}
  useMove(slot){
   const move=skills[slot];
   if(battle.energy<move.cost||cooldowns[slot]>at)return false;
   battle.energy-=move.cost;cooldowns[slot]=at+move.cd;
   this.v359Attacks.push({move,at,duration:540,end:at+540,
    times:[.64],hits:0,battle,owner:actor,target:victim,kind:'contact'});
   this.v47ContactToLand.push({name:move.name,at:at+380,until:at+2750,
    owner:actor,victim,hpBefore:victim.hp,settled:false});
   return true;
  }
  draw(now){for(const fx of this.v359Attacks){
   if(fx.end>now&&window.PokemonTorreV360Paint)
    window.PokemonTorreV360Paint(ctx,fx,now,this);
  }}
  update(now){for(const fx of this.v359Attacks){
   if(!fx.hits&&now>=fx.at+fx.duration*fx.times[0]){
    victim.hp-=31;fx.hits++;nativeHits++;
   }
  }}
 }
 const globals={window,BattleEngine,battle,cooldowns,
  current:()=>actor,foe:()=>victim,skillSet:()=>skills,
  performance:{now:()=>at},URLSearchParams,location:{
   search:safe?'?safe=1':'?build=v103',hostname:'test.example'},Math,console};
 vm.createContext(globals);
 for(const s of input)vm.runInContext(s,globals,{timeout:1500});
 return {globals,window,actor,victim,battle,cooldowns,BattleEngine,
  time:n=>{at=n},hits:()=>nativeHits,painted:()=>painted};
}
for(const safe of [false,true]){
 const sim=sandboxFor(safe);
 const specs=sim.window.PokemonTorreFightingV103.diagnostics().registered;
 assert.equal(specs.length,4);
 assert.deepEqual(specs.map(s=>s.frames),[8,12,16,16]);
 for(let slot=0;slot<4;slot++){
  const e=new sim.BattleEngine(),before=sim.victim.hp;
  const time=1000+slot*3000;sim.time(time);
  const ok=e.useMove(slot);assert.equal(ok,true);
  assert.equal(sim.battle.energy,100-2*(slot+1));
  assert.equal(sim.cooldowns[slot],time+1300,'unchanged cooldown');
  assert.equal(e.v359Attacks.length,1,'existing single native hit event');
  const ev=e.v359Attacks[0],spec=specs[slot];
  const contact=time+spec.impactMs;
  assert.ok(Math.abs(ev.at+ev.duration*ev.times[0]-contact)<1);
  assert.equal(e.v47ContactToLand[0].at,contact,'V47 fallback at visual impact');
  sim.time(contact-10);e.draw(contact-10);e.update(contact-10);
  assert.equal(sim.victim.hp,before,'no early damage');
  sim.time(contact);e.update(contact);e.draw(contact);
  assert.equal(sim.victim.hp,before-31,'one damage at visual contact');
  assert.equal(ev.hits,1);assert.ok(sim.painted()>0,'actual animated Canvas shapes');
  sim.time(time+spec.impactMs+65);e.update(time+spec.impactMs+65);
  assert.equal(sim.victim.hp,before-31,'no double hit');
  sim.time(time+ev.duration-5);e.draw(time+ev.duration-5);
  const last=sim.window.PokemonTorreFightingV103.diagnostics().last;
  assert.equal(last.frames,spec.frames);
  assert.equal(last.frame,spec.frames,'animated final fade frame');
  sim.time(time+ev.duration+150);e.draw(time+ev.duration+150);
 }
 const diag=sim.window.PokemonTorreFightingV103.diagnostics();
 assert.equal(diag.casts,4);
 assert.equal(sim.hits(),4,'HP update used native event only');
 assert.ok(diag.draws>=12);
 assert.equal(diag.hitSyncs,4);
 assert.ok(Object.values(diag.perMove).every(v=>v>0));
 sim.battle.active=false;
 const last=diag.draws,engine=new sim.BattleEngine();engine.draw(99999);
 assert.equal(sim.window.PokemonTorreFightingV103.diagnostics().draws,last);
 console.log('PASS V103 '+(safe?'safe mobile fallback':'normal')+
  ': unique frames, real impact clock, single native HP hit, protected moves');
}
