'use strict';
/* V133: real battle animation overlay, ONLY four user-selected Ground moves.
 * Check correct frames, normal gameplay isolation, preserved V132 overlays,
 * native timing, no PNG, and unchanged approved move registry.
 */
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm'),crypto=require('node:crypto');
const root='effects/moves/v133-ground-preview/';
const get=p=>fs.readFileSync(p,'utf8');
const filenames=['runtime.js','sand-claw/index.js','earth-punch/index.js',
 'sand-spear/index.js','shallow-fissure/index.js'];
const scripts=filenames.map(f=>get(root+f));
scripts.forEach((s,i)=>assert.doesNotThrow(()=>new vm.Script(s,{filename:filenames[i]})));
for(const code of scripts){
 assert.doesNotMatch(code,/\.png\b|new Image\s*\(|drawImage\s*\(|document\.createElement\s*\(|\.innerHTML\s*=|hitTarget\s*\(/,
  'no image-based art, DOM layer or extra HP hits');
}
const index=get('index.html');
for(const f of filenames)assert.ok(index.includes(root+f),'game does not load '+f);
assert.ok(index.includes("get('ground133')!=='0'"),'V134 must load approved V133 by default');
assert.ok(index.indexOf('v132-ground-approved/runtime.js')<index.indexOf(root+'runtime.js'),
 'approved V132 must be installed BEFORE V133 preview overlay');
const approved=JSON.parse(get('effects/moves/STATUS_APROVADOS.json')).moves;
for(const name of ['Osso','Grande Fissura','Withdraw','Bolhas','Mergulho','Cauda de Água','Pulso de Água']){
 const row=approved.find(x=>x.move===name);assert.equal(row?.protect,true,'lost protected move '+name);
}
const targets=['Garra de Areia','Soco de Terra','Lança de Areia','Fenda Rasa'];
targets.forEach(name=>{
 const row=approved.find(x=>x.move===name);
 assert.equal(row?.status,'aprovado','approved animation missing '+name);
 assert.equal(row?.protect,true,'approved art is not protected '+name);
});
assert.equal(approved.length,48,'preserve all 47 previous accepted moves plus approved V177 Absorb');

const actor={id:150,hp:100},victim={id:25,hp:500};
const battle={active:true,paused:false,energy:300};
const skills=[...targets,'Osso','Grande Fissura','Mud Shot'].map((name,i)=>
 ({name,type:'ground',power:22+i*3,cd:1000,cost:12,cat:'physical'}));
const gfxStats={paths:0,fills:0,strokes:0};
const gfx=new Proxy({globalAlpha:1},{
 get(o,k){if(k in o)return o[k];
  if(k==='beginPath')return ()=>{gfxStats.paths++;};
  if(k==='fill')return ()=>{gfxStats.fills++;};
  if(k==='stroke')return ()=>{gfxStats.strokes++;};
  return ()=>{};
 },set(o,k,v){o[k]=v;return true;}
});
class BattleEngine {
 constructor(){this.player={x:120,y:226,r:34};this.enemy={x:348,y:221,r:36};
  this.h=420;this.v359Attacks=[];}
 useMove(slot){
  const m=skills[slot];battle.energy-=m.cost;
  this.v359Attacks.push({move:m,at:1000,duration:700,end:1700,battle,
   owner:actor,target:victim,hits:0,times:[.64],from:[120,172],to:[348,166]});
  return true;
 }
 update(now){for(const fx of this.v359Attacks){
  if(!fx.hits&&now>=fx.at+fx.duration*fx.times[0]){
   victim.hp-=fx.move.power;fx.hits++;
  }
 }}
}
const root132='effects/moves/v132-ground-approved/';
const oldPair=[get(root132+'runtime.js'),get(root132+'bone-club/index.js'),
 get('effects/moves/v131-ground-refinement/grande-fissura/index.js')];
function create(query){
 const window={PokemonTorreV360Paint:()=>false},env={
  window,BattleEngine,battle,current:()=>actor,skillSet:()=>skills,location:{search:query},
  URLSearchParams,performance:{now:()=>1000},console
 };
 for(const s of [...oldPair,...scripts])vm.runInNewContext(s,env,{timeout:5000});
 return window;
}
assert.equal(create('').PokemonTorreGroundV133?.official,true,'normal route must install the approved V133 art');
assert.equal(create('?ground133=0').PokemonTorreGroundV133,undefined,'explicit rollback must disable the four effects');
assert.equal(create('?ground133=preview&safe=1').PokemonTorreGroundV133,undefined,'safe fallback must work');
const window=create('?ground133=preview');
const v133=window.PokemonTorreGroundV133;
assert.ok(v133?.installed&&v133.previewOnly,'preview not installed');
assert.deepEqual(Array.from(v133.diagnostics().registered),targets);
assert.deepEqual(Array.from(window.PokemonTorreGroundV130.diagnostics().registered),['osso','grandefissura']);
const e=new BattleEngine();let nativeHits=0;
for(let i=0;i<skills.length;i++){
 const beforeFx=new Set(e.v359Attacks),hp=victim.hp,energy=battle.energy;
 assert.equal(e.useMove(i),true);
 const fx=e.v359Attacks.find(f=>!beforeFx.has(f));
 assert.equal(battle.energy,energy-12,'energy changed');
 const isPreview=i<4,isOfficial=i===4||i===5;
 if(isPreview){
  assert.equal(fx.duration,[1420,1290,1630,1430][i],'incorrect visual timespan');
  assert.equal(fx.end,fx.at+fx.duration);
  const shapeBefore=gfxStats.paths;
  for(const q of [.035,.13,.25,.38,.53,.63,.64,.75,.85,.96]){
   assert.equal(window.PokemonTorreV360Paint(gfx,fx,fx.at+fx.duration*q,e),true);
  }
  assert.ok(gfxStats.paths-shapeBefore>5,'no dynamic art painted for '+skills[i].name);
 }else if(isOfficial){
  assert.equal(fx.duration,i===4?1390:1670,'approved V132 duration altered');
  assert.equal(window.PokemonTorreV360Paint(gfx,fx,fx.at+fx.duration*.71,e),true);
 }else{
  assert.equal(fx.duration,700,'other Ground move modified');
  assert.equal(window.PokemonTorreV360Paint(gfx,fx,fx.at+420,e),false,'unapproved Ground intercepted');
 }
 assert.equal(victim.hp,hp,'painting must never alter HP');
 e.update(fx.at+fx.duration*.625);assert.equal(victim.hp,hp,'damage before visual contact');
 e.update(fx.at+fx.duration*.655);
 e.update(fx.at+fx.duration*.99);
 assert.equal(victim.hp,hp-skills[i].power,'must apply exactly one native HP hit');
 nativeHits++;
}
assert.equal(v133.diagnostics().casts,4);
assert.equal(v133.diagnostics().frames,40);
assert.equal(v133.diagnostics().hitClockChanges,4);
assert.equal(v133.diagnostics().errors.length,0,'runtime draw errors');
assert.ok(gfxStats.fills>30&&gfxStats.strokes>30,'need multi-layer textured visual art');
console.log('PASS V134: 4 approved animated 12/16-frame Ground modules, official default and optional preview, V132 intact, native one-hit, no PNG.');
