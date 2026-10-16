'use strict';
/* V132: two approved Ground effects are the ONLY official new interceptors.
 * Preserve original V130+V131 revisions for comparing, and native damage timing.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const get=p=>fs.readFileSync(p,'utf8');
const o130='effects/moves/v130-ground-preview/',o131='effects/moves/v131-ground-refinement/';
const root='effects/moves/v132-ground-approved/';
const runtime=get(root+'runtime.js'),bone=get(root+'bone-club/index.js'),fiss=get(o131+'grande-fissura/index.js');
for(const [path,code] of Object.entries({runtime,bone,fiss}))
 assert.doesNotThrow(()=>new vm.Script(code,{filename:path}));
assert.match(bone,/s\*\.40/,'bone club must be 40% of the V130 scale');
assert.match(fiss,/#100f0f/,'approved geological fissure, not previous cartoon');
for(const s of [runtime,bone,fiss])assert.doesNotMatch(s,/drawImage\s*\(|new Image\s*\(|\.png\b|document\.createElement\s*\(/);
const blobSha=p=>{const b=fs.readFileSync(p);return crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex')};
assert.equal(blobSha(o131+'grande-fissura/index.js'),'509b7863ceac611e44796af1ba9d8d1dfa81e9c1','approved fissure must be unchanged from V131');
assert.equal(blobSha(o131+'bone-club/index.js'),'bd104176c242b13dd1c8baecf96df9cae14129ff','old 47% bone preview preserved');
for(const [filename,sha] of Object.entries({
 'mud-slap/index.js':'a36ec5b7f68bf3825a050addb61fbf01441c0c98',
 'mud-shot/index.js':'b045b1306e3bbe105a2fa44b242d44e798168670',
 'earth-power/index.js':'02375b5900927838b72a134497b03a0272a5185f'
}))assert.equal(blobSha(o130+filename),sha,'no unapproved Ground changes');
const index=get('index.html');
for(const file of [root+'runtime.js',root+'bone-club/index.js',o131+'grande-fissura/index.js'])
 assert.ok(index.includes(file),'missing official source '+file);
assert.match(index,/get\('ground132'\)!=='0'/,'must have rollback for official pair');
assert.match(index,/get\('ground130'\)!=='preview'/,'old V130 must not be overwritten');
assert.match(index,/get\('ground131'\)!=='preview'/,'old V131 must not be overwritten');
const registry=JSON.parse(get('effects/moves/STATUS_APROVADOS.json'));
for(const move of ['Osso','Grande Fissura']){
 const x=registry.moves.find(z=>z.move===move);
 assert.equal(x?.status,'aprovado');
 assert.equal(x?.protect,true);
}
const skills=['Osso','Grande Fissura','Tapa de Lama','Mud Shot','Poder Terrestre'].map((name,i)=>({name,type:'ground',power:16+i*4,cost:20,cd:1200}));
const battle={active:true,paused:false,energy:180},owner={hp:100},target={hp:180};
const ops={paths:0,scales:[],strokes:0};
const gfx=new Proxy({globalAlpha:1},{get(o,k){if(k in o)return o[k];if(k==='beginPath')return ()=>{ops.paths++;};if(k==='scale')return (...v)=>{ops.scales.push(v)};if(k==='stroke')return ()=>{ops.strokes++};return ()=>{};},set(o,k,v){o[k]=v;return true;}});
class BattleEngine{
 constructor(){this.player={x:105,y:240,r:33};this.enemy={x:338,y:222,r:35};this.h=420;this.v359Attacks=[];this.running=true;}
 useMove(slot){const m=skills[slot];battle.energy-=m.cost;
  const ev={move:m,at:1000,end:1680,duration:680,times:[.64],hits:0,battle,owner,target,from:[105,175],to:[338,165]};
  this.v359Attacks.push(ev);return true;}
 update(now){for(const ev of this.v359Attacks){
  if(!ev.hits&&now>=ev.at+ev.duration*ev.times[0]){
   ev.hits++;target.hp-=ev.move.power;
  }
 }}
}
function setup(query){
 const window={PokemonTorreV360Paint:()=>false};
 const world={window,location:{search:query},battle,BattleEngine,current:()=>owner,skillSet:()=>skills,URLSearchParams,performance:{now:()=>1000},console};
 for(const s of [runtime,bone,fiss])vm.runInNewContext(s,world,{timeout:2500});
 return {window,world};
}
for(const disabled of ['?ground132=0','?safe=1']){
 assert.equal(setup(disabled).window.PokemonTorreGroundV130,undefined,'rollback failed '+disabled);
}
const window=setup('').window,plugin=window.PokemonTorreGroundV130;
assert.equal(plugin?.installed,true);assert.equal(plugin?.official,true);assert.equal(plugin?.previewOnly,false);
assert.deepEqual(Array.from(plugin.diagnostics().registered),['osso','grandefissura']);
const engine=new BattleEngine();
let prevHp=target.hp,prevCost=battle.energy;
for(let i=0;i<5;i++){
 const before=new Set(engine.v359Attacks),power=skills[i].power;
 engine.useMove(i);
 const e=engine.v359Attacks.find(z=>!before.has(z));
 assert.equal(battle.energy,prevCost-20);prevCost=battle.energy;
 if(i<2){
  assert.equal(e.duration,i===0?1390:1670,'approved effect must synchronize hit clock');
  assert.equal(e.end,e.at+e.duration);
  const oldHp=target.hp,firstDraws=ops.paths,firstScale=ops.scales.length;
  for(const t of [.03,.15,.32,.53,.61,.64,.68,.78,.91,.98]){
   assert.equal(window.PokemonTorreV360Paint(gfx,e,e.at+e.duration*t,engine),true);
  }
  assert.ok(ops.paths>firstDraws,'approved effect must actually animate on battle canvas');
  if(i===0)assert.ok(ops.scales.slice(firstScale).some(a=>a.every(n=>n<=.48)),'bone scale exceeded official target');
  assert.equal(target.hp,oldHp,'painting must not apply damage');
 }else{
  assert.equal(e.duration,680,'unapproved Ground must use original clock');
  assert.equal(window.PokemonTorreV360Paint(gfx,e,e.at+350,engine),false,'unapproved Ground intercepted');
 }
 const initial=target.hp;
 engine.update(e.at+e.duration*.63);assert.equal(target.hp,initial,'damage before original impact');
 engine.update(e.at+e.duration*.66);engine.update(e.at+e.duration*.94);
 assert.equal(target.hp,initial-power,'exactly one native damage event');
 prevHp=target.hp;
}
assert.equal(plugin.diagnostics().hitChanges,2);
assert.equal(plugin.diagnostics().casts,2);
assert.equal(plugin.diagnostics().draws,20);
assert.equal(plugin.diagnostics().errors.length,0);
assert.ok(ops.strokes>20);
console.log('PASS V132: approved 40% Osso + unchanged deep fissure official, 2 names only, V130/V131 intact, hit timing + rollback.');
