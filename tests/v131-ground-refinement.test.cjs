'use strict';
/* V131: independent staged preview, half-size Osso + geological Grande Fissura.
 * No cartoon sprite and no new game mechanics. V130 originals remain byte-identical.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const read=p=>fs.readFileSync(p,'utf8');
const root130='effects/moves/v130-ground-preview/';
const root131='effects/moves/v131-ground-refinement/';
const originals=['mud-slap/index.js','mud-shot/index.js','earth-power/index.js'];
const originalBlobShas={
 'mud-slap/index.js':'a36ec5b7f68bf3825a050addb61fbf01441c0c98',
 'mud-shot/index.js':'b045b1306e3bbe105a2fa44b242d44e798168670',
 'earth-power/index.js':'02375b5900927838b72a134497b03a0272a5185f'
};
const shaBlob=p=>{const buf=fs.readFileSync(p);return crypto.createHash('sha1').update('blob '+buf.length+'\0').update(buf).digest('hex');};
for(const p of originals)assert.equal(shaBlob(root130+p),originalBlobShas[p],'approved existing Ground art must remain unchanged: '+p);
const newBone=read(root131+'bone-club/index.js');
const fissure=read(root131+'grande-fissura/index.js');
for(const [path,code] of Object.entries({'bone-club/index.js':newBone,'grande-fissura/index.js':fissure}))
 assert.doesNotThrow(()=>new vm.Script(code,{filename:path}));
for(const code of [newBone,fissure])assert.doesNotMatch(code,/\.png\b|new Image\s*\(|drawImage\s*\(|document\.createElement\s*\(|\.innerHTML\s*=/);
assert.match(newBone,/s\*\.47/,'bone silhouette must be reduced by 53%');
assert.match(fissure,/#100f0f/,'geological fissure must have a dark inner cavity');
assert.match(fissure,/innerUpper|innerLower/,'ground strata must be separate from its cavity');
const index=read('index.html');
for(const path of [root131+'bone-club/index.js',root131+'grande-fissura/index.js'])
 assert.ok(index.includes(path),'loader must include '+path);
assert.match(index,/get\('ground131'\)==='preview'/);
assert.match(index,/files\[2\]=/);
assert.match(index,/files\.push\(/);
const registry=JSON.parse(read('effects/moves/STATUS_APROVADOS.json'));
assert.equal(registry.moves.find(x=>x.move==='Grande Fissura')?.status,'aprovado','old visual is still protected');
const skills=['Tapa de Lama','Osso','Mud Shot','Poder Terrestre','Grande Fissura'].map((name,i)=>
 ({name,type:'ground',power:[16,28,28,31,68][i],cost:0,cd:1300,kind:'area'}));
const battle={active:true,paused:false,energy:100},owner={hp:100},target={hp:300};
const stats={paths:0,scales:[],strokes:0};
const g=new Proxy({globalAlpha:1},{
 get(o,k){if(k in o)return o[k];
  if(k==='beginPath')return ()=>{stats.paths++;};
  if(k==='scale')return (...arg)=>{stats.scales.push(arg)};
  if(k==='stroke')return ()=>{stats.strokes++};
  return ()=>{};
 },set(o,k,v){o[k]=v;return true;}
});
class BattleEngine{
 constructor(){this.player={x:120,y:234,r:35};this.enemy={x:340,y:224,r:35};this.h=420;this.v359Attacks=[];}
 useMove(slot){
  this.v359Attacks.push({move:skills[slot],at:1000,duration:680,end:1680,
   times:[.64],hits:0,from:[120,179],to:[340,169],battle,owner,target});
  return true;
 }
 update(now){
  for(const e of this.v359Attacks){
   if(!e.hits&&now>=e.at+e.duration*e.times[0]){
    e.hits++;target.hp-=e.move.power;
   }
  }
 }
}
const makeCtx=search=>{
 const window={PokemonTorreV360Paint:()=>false};
 const env={window,BattleEngine,battle,current:()=>owner,skillSet:()=>skills,URLSearchParams,
  location:{search},performance:{now:()=>1000},console};
 const run=s=>vm.runInNewContext(s,env,{timeout:2000});
 run(read(root130+'runtime.js'));
 if(window.PokemonTorreGroundV130){
  run(read(root130+'mud-slap/index.js'));
  run(search.includes('ground131')?newBone:read(root130+'bone-club/index.js'));
  run(read(root130+'mud-shot/index.js'));
  run(read(root130+'earth-power/index.js'));
  if(search.includes('ground131'))run(fissure);
 }
 return {window,env};
};
assert.equal(makeCtx('').window.PokemonTorreGroundV130,undefined);
assert.equal(makeCtx('?ground131=preview&safe=1').window.PokemonTorreGroundV130,undefined);
const old=makeCtx('?ground130=preview').window.PokemonTorreGroundV130;
assert.deepEqual(Array.from(old.diagnostics().registered),['mudslap','osso','mudshot','earthpower']);
const now=makeCtx('?ground131=preview').window;
const api=now.PokemonTorreGroundV130;
assert.deepEqual(Array.from(api.diagnostics().registered),['mudslap','osso','mudshot','earthpower','grandefissura']);
const engine=new BattleEngine();
const alts=[];
for(let slot=0;slot<5;slot++){
 assert.equal(engine.useMove(slot),true);
 const event=engine.v359Attacks.at(-1),hp=target.hp;
 assert.ok(event.duration>=1100&&event.duration<=1800,'visual timeframe bounded');
 assert.equal(event.end,event.at+event.duration);
 const origin=stats.scales.length,shapes=stats.paths;
 for(const t of [.035,.10,.20,.40,.57,.63,.64,.75,.87,.96])
  assert.equal(now.PokemonTorreV360Paint(g,event,event.at+event.duration*t,engine),true,'frame '+slot+'/'+t);
 assert.ok(stats.paths>shapes,'visual animation must draw nonempty geometry');
 if(slot===1){
  const used=stats.scales.slice(origin);
  assert.ok(used.some(v=>v.every(n=>n<=.56)),'bone club did not shrink to roughly half size');
 }
 if(slot===4)assert.ok(stats.paths-shapes>85,'Grande Fissura must draw detailed terrain geometry');
 engine.update(event.at+event.duration*.625);assert.equal(target.hp,hp,'damage must wait until impact');
 engine.update(event.at+event.duration*.66);engine.update(event.at+event.duration*.96);
 assert.equal(target.hp,hp-skills[slot].power,'exactly one native hit');
}
assert.equal(api.diagnostics().errors.length,0,'Canvas preview frame errors');
assert.equal(api.diagnostics().hitChanges,5,'native timing tracked');
assert.equal(api.diagnostics().draws,50);
assert.ok(stats.strokes>30);
console.log('PASS V131: 47%-sized Bone Club, detailed rock chasm, old Ground art byte-identical, isolated previews, native impact + safe rollback.');
