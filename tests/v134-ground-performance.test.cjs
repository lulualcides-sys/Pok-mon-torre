'use strict';
/* V134: approved Ground quartet + adaptive particle load on slow frames.
 * Synthetic slow-frame regression, not a promise of measured Android FPS.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const read=x=>fs.readFileSync(x,'utf8'),root='effects/moves/v133-ground-preview/';
const files=['runtime.js','sand-claw/index.js','earth-punch/index.js','sand-spear/index.js','shallow-fissure/index.js'];
const scripts=files.map(f=>read(root+f)),targets=['Garra de Areia','Soco de Terra','Lança de Areia','Fenda Rasa'];
for(const s of scripts){
 assert.doesNotThrow(()=>new vm.Script(s));
 assert.doesNotMatch(s,/\.png\b|drawImage\s*\(|new Image\s*\(|document\.createElement\s*\(|requestAnimationFrame\s*\(|setInterval\s*\(/);
}
assert.match(scripts[0],/WeakMap/);
assert.match(scripts[0],/detailStep/);
const registry=JSON.parse(read('effects/moves/STATUS_APROVADOS.json')).moves;
const manifest=JSON.parse(read('effects/v127/edited-moves.json')).records;
assert.equal(registry.length,48);assert.equal(manifest.length,79);
for(const name of [...targets,'Osso','Grande Fissura','Withdraw','Pistola d’Água','Bolhas','Mergulho']){
 assert.equal(registry.find(x=>x.move===name)?.protect,true);
 if(targets.includes(name))assert.equal(manifest.find(x=>x.name===name)?.status,'aprovado');
}
const index=read('index.html');
assert.ok(index.includes("get('ground133')!=='0'")&&index.includes("get('ground130')!=='preview'")&&index.includes("get('ground131')!=='preview'"));
assert.ok(index.indexOf('v132-ground-approved/runtime.js')<index.indexOf(root+'runtime.js'));
const sha=f=>{const b=fs.readFileSync(f);return crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');};
assert.equal(sha('effects/moves/v132-ground-approved/bone-club/index.js'),'ce88054e89e7fc05abc8e5f085aa2b408639ebc8');
assert.equal(sha('effects/moves/v131-ground-refinement/grande-fissura/index.js'),'509b7863ceac611e44796af1ba9d8d1dfa81e9c1');
const battle={active:true,energy:200},owner={hp:100},foe={hp:500};
const skills=[...targets,'Osso','Grande Fissura'].map((name,i)=>({name,power:20+i*3,cost:10,cd:1000}));
const ops={paths:0,fill:0,stroke:0};
const ctx=new Proxy({globalAlpha:1},{
 get(o,k){if(k in o)return o[k];if(k==='beginPath')return ()=>{ops.paths++};
  if(k==='fill')return ()=>{ops.fill++};if(k==='stroke')return ()=>{ops.stroke++};return ()=>{};},
 set(o,k,v){o[k]=v;return true;}
});
class BattleEngine {
 constructor(){this.player={x:120,y:240,r:34};this.enemy={x:342,y:238,r:35};this.h=440;this.v359Attacks=[];}
 useMove(slot){
  const m=skills[slot];battle.energy-=m.cost;
  this.v359Attacks.push({move:m,at:1000,duration:700,end:1700,times:[.64],hits:0,battle,
   from:[120,181],to:[342,180]});return true;
 }
 update(now){for(const fx of this.v359Attacks)if(!fx.hits&&now>=fx.at+fx.duration*fx.times[0]){
  fx.hits++;foe.hp-=fx.move.power;
 }}
}
function setup(search){
 const window={PokemonTorreV360Paint:()=>false};
 const env={window,location:{search},URLSearchParams,performance:{now:()=>1000},
  BattleEngine,battle,current:()=>owner,skillSet:()=>skills,console};
 for(const s of scripts)vm.runInNewContext(s,env,{timeout:2500});
 return window;
}
for(const query of ['?ground133=0','?safe=1','?ground130=preview','?ground131=preview'])
 assert.equal(setup(query).PokemonTorreGroundV133,undefined);
const official=setup('');
assert.equal(official.PokemonTorreGroundV133.official,true);
assert.equal(official.PokemonTorreGroundV133.previewOnly,false);
assert.deepEqual([...official.PokemonTorreGroundV133.diagnostics().registered],targets);
assert.equal(setup('?ground133=preview').PokemonTorreGroundV133.previewOnly,true);
const engine=new BattleEngine();
for(let i=0;i<4;i++){
 const oldEvents=new Set(engine.v359Attacks),hp=foe.hp,oldEnergy=battle.energy;
 engine.useMove(i);
 const fx=engine.v359Attacks.find(x=>!oldEvents.has(x));
 assert.equal(fx.duration,[1420,1290,1630,1430][i]);
 assert.equal(fx.end,fx.at+fx.duration);
 assert.equal(battle.energy,oldEnergy-10);
 const previous=ops.paths;
 for(const t of [.08,.21,.36,.53,.64,.75,.93])
  assert.equal(official.PokemonTorreV360Paint(ctx,fx,fx.at+fx.duration*t,engine),true);
 assert.ok(ops.paths>previous,'missing procedural effect '+targets[i]);
 assert.equal(foe.hp,hp,'paint changed HP');
 engine.update(fx.at+fx.duration*.63);assert.equal(foe.hp,hp,'hit before visible impact');
 engine.update(fx.at+fx.duration*.66);engine.update(fx.at+fx.duration*.98);
 assert.equal(foe.hp,hp-skills[i].power,'not exactly one native hit');
}
assert.equal(official.PokemonTorreGroundV133.diagnostics().errors.length,0);
assert.equal(official.PokemonTorreGroundV133.diagnostics().casts,4);
assert.equal(official.PokemonTorreGroundV133.diagnostics().hitClockChanges,4);
// Draw the same moment following either healthy 16-ms pacing or slow 50-ms pacing.
// Count actual Canvas path calls; it is a deterministic workload proxy.
function workload(dt){
 const window=setup(''),engine=new BattleEngine();
 engine.useMove(0);const fx=engine.v359Attacks[0];
 for(let i=0;i<14;i++)window.PokemonTorreV360Paint(ctx,fx,1000+i*dt,engine);
 const before=ops.paths;
 window.PokemonTorreV360Paint(ctx,fx,fx.at+fx.duration*.75,engine);
 return {paths:ops.paths-before,stats:window.PokemonTorreGroundV133.diagnostics()};
}
const full=workload(16),slow=workload(50);
assert.equal(full.stats.qualityStep,1,'healthy frames should retain entire approved effect');
assert.ok(slow.stats.qualityStep>=2,'slow frames must trigger adaptive reduction');
assert.ok(slow.paths<full.paths*.82,'slow-mode secondary particle work did not drop meaningfully: '+JSON.stringify({slow:slow.paths,full:full.paths}));
assert.ok(slow.stats.secondaryDetailSkipped>0,'adaptive detail was never used');
console.log('PASS V134: four approved effects, load-adaptive secondary particles, reduced path work under synthetic lag, untouched primary shapes/native one-hit and previous approved art.');
