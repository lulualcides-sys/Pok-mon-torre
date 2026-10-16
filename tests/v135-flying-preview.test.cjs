'use strict';
/* V135: animated Flying previews inside the existing battle Canvas.
 * Validate four exact moves, native single hit/heal, status and safe fallback.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root='effects/moves/v135-flying-preview/';
const sourceFiles=['runtime.js','roost/index.js','gust/index.js','air-slash/index.js','peck/index.js'];
const sources=sourceFiles.map(x=>fs.readFileSync(root+x,'utf8'));
for(let i=0;i<sources.length;i++){
 assert.doesNotThrow(()=>new vm.Script(sources[i],{filename:sourceFiles[i]}));
 assert.doesNotMatch(sources[i],/drawImage\s*\(|new Image\s*\(|\.png\b|document\.createElement\s*\(|requestAnimationFrame\s*\(|setInterval\s*\(/,'no PNG or extra animation loop');
}
const index=fs.readFileSync('index.html','utf8');
for(const file of sourceFiles)assert.ok(index.includes(root+file),'missing embedded preview '+file);
assert.ok(index.includes("get('flying135')==='preview'"));
assert.ok(index.indexOf('v133-ground-preview/runtime.js')<index.indexOf(root+'runtime.js'),'V135 must come after the official V134');
const registry=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
assert.equal(registry.moves.length,42,'V135 preview cannot approve untested Flying animation');
const names=['Roost','Rajada','Air Slash','Bicada'];
for(const name of names)assert.ok(!registry.moves.some(x=>x.move===name),'preview wrongly marked official: '+name);
for(const n of ['Garra de Areia','Soco de Terra','Lança de Areia','Fenda Rasa','Osso','Grande Fissura']){
 assert.equal(registry.moves.find(x=>x.move===n)?.protect,true,'lost previous approval '+n);
}
const skill=names.map((name,i)=>({name,power:[0,24,35,28][i],cost:[35,14,28.2,1][i],cd:[9200,2300,2900,1400][i]}));
const owner={hp:100},foe={hp:600},battle={active:true,energy:200};
const ops={shapes:0,strokes:0,fills:0,saves:0,restores:0};
const g=new Proxy({globalAlpha:1},{
 get(o,k){if(k in o)return o[k];if(k==='beginPath')return ()=>{ops.shapes++;};
 if(k==='stroke')return ()=>{ops.strokes++};if(k==='fill')return ()=>{ops.fills++};
 if(k==='save')return ()=>{ops.saves++};if(k==='restore')return ()=>{ops.restores++};return ()=>{};},
 set(o,k,v){o[k]=v;return true;}
});
class BattleEngine{
 constructor(){this.player={x:105,y:222,r:34};this.enemy={x:342,y:215,r:34};
  this.h=420;this.v359Attacks=[];this.canvas={isConnected:true};}
 useMove(i){
  const m=skill[i];battle.energy-=m.cost;
  this.v359Attacks.push({move:m,battle,owner,target:foe,at:1000,duration:720,end:1720,
   times:[.64],hits:0,from:[105,166],to:[342,159]});return true;
 }
 update(now){
  for(const f of this.v359Attacks)if(!f.hits&&now>=f.at+f.duration*f.times[0]){
   f.hits++;
   if(f.move.name==='Roost')owner.hp+=30;
   else foe.hp-=f.move.power;
  }
 }
}
let fallbackCalls=0;
function build(search){
 const window={PokemonTorreV360Paint:()=>{fallbackCalls++;return false}};
 const env={window,location:{search},URLSearchParams,performance:{now:()=>1000},BattleEngine,
   battle,current:()=>owner,skillSet:()=>skill,console};
 sources.forEach((s,i)=>vm.runInNewContext(s,env,{timeout:2000,filename:sourceFiles[i]}));
 return window;
}
for(const query of ['', '?flying135=0','?flying135=preview&safe=1'])
 assert.equal(build(query).PokemonTorreFlyingV135,undefined,'preview must not appear '+query);
const window=build('?flying135=preview');
const plugin=window.PokemonTorreFlyingV135;
assert.ok(plugin?.installed&&plugin.previewOnly);
assert.deepEqual(Array.from(plugin.diagnostics().moves),names);
assert.equal(plugin.diagnostics().registered,4);
const engine=new BattleEngine();
for(let i=0;i<4;i++){
 const prev=new Set(engine.v359Attacks),startHp=foe.hp,startOwn=owner.hp,startEnergy=battle.energy;
 assert.equal(engine.useMove(i),true);
 const fx=engine.v359Attacks.find(z=>!prev.has(z));
 assert.ok(fx);
 assert.equal(battle.energy,startEnergy-skill[i].cost);
 assert.equal(fx.duration,[1580,1390,1510,1150][i]);
 assert.equal(fx.end,fx.at+fx.duration);
 const before=ops.shapes;
 for(const t of [.05,.13,.25,.38,.52,.62,.64,.78,.89,.97]){
  assert.equal(window.PokemonTorreV360Paint(g,fx,fx.at+fx.duration*t,engine),true,'did not paint '+names[i]+' at '+t);
 }
 assert.ok(ops.shapes-before>10,'insufficient animation drawing '+names[i]);
 assert.equal(foe.hp,startHp);
 assert.equal(owner.hp,startOwn);
 engine.update(fx.at+fx.duration*.63);
 assert.equal(foe.hp,startHp,'premature attack');
 assert.equal(owner.hp,startOwn,'premature heal');
 engine.update(fx.at+fx.duration*.66);
 engine.update(fx.at+fx.duration*.97);
 assert.equal(foe.hp,i===0?startHp:startHp-skill[i].power,'native damage only once');
 assert.equal(owner.hp,i===0?startOwn+30:startOwn,'Roost healed twice');
}
assert.equal(plugin.diagnostics().casts,4);
assert.equal(plugin.diagnostics().frames,40);
assert.equal(plugin.diagnostics().errors.length,0,'animation frame exceptions');
assert.equal(ops.saves,ops.restores,'unbalanced drawing state');
const fakeFx={move:{name:'Osso'},battle,at:1000,duration:800,end:1800,times:[.64]};
assert.equal(window.PokemonTorreV360Paint(g,fakeFx,1400,engine),false,'other approved effects must delegate');
assert.ok(fallbackCalls>0);
battle.active=false;
const shapes=ops.shapes;
assert.equal(window.PokemonTorreV360Paint(g,engine.v359Attacks[1],1500,engine),true);
assert.equal(ops.shapes,shapes,'no drawing after battle ends');
battle.active=true;
console.log('PASS V135: 4 unique Flying animations, balanced Canvas state, native single heal/hit, no PNG, opt-in preview, preserves 42 approved effects.');
