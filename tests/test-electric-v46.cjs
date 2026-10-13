'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const html=read('index.html');
const realCombatScript=read('effects/moves/_runtime/combat-hit-reliability-v47.js');
new vm.Script(realCombatScript,{filename:'V47.5RealHitEngine'});
assert.match(realCombatScript,/version:'47\.5'/,'Current hit engine version');
assert.match(html,/combat-hit-reliability-v47\.js/,'Real hit module must load');
assert.equal((realCombatScript.match(/const savedDraw=/g)||[]).length,0,
 'Physical movement code must avoid duplicate draw declarations');
const mustGet=(label,re)=>{const m=html.match(re);assert.ok(m,label);return JSON.parse(m[1])};
const oldfx=mustGet('Existing original V35 FX',/const fxFiles=(\[[^;]+?\]);let plugin=/);
const fire=mustGet('Approved fire V41',/const fireSpriteFiles=(\[[\s\S]*?\]);\s*const fireSpriteSections=/);
const moreFire=mustGet('Approved fire V42',/const nextFourFireMoves=(\[[\s\S]*?\]);\s*const extraFireSections=/);
const water=mustGet('Approved water V45',/const waterSpriteFiles=(\[[\s\S]*?\]);\s*const waterSpriteSections=/);
const electric=mustGet('New electric V46',/const electricV46Files=(\[[\s\S]*?\]);\s*const enableElectricPreview=[^;]*;\s*const electricV46Parts=/);
assert.deepEqual(electric,[
 'effects/moves/_runtime/electric-sprite-kit.js',
 'effects/moves/faisca/index.js',
 'effects/moves/discharge/index.js',
 'effects/moves/tempestade-de-raios/index.js',
 'effects/moves/trovao/index.js',
 'effects/moves/_runtime/electric-sprite-integrate.js',
 'effects/moves/_runtime/move-type-canon-v46.js'
]);
assert.equal(water.length,10,'Existing eight water animations must be preserved');
assert.match(html,/const enableElectricPreview=new URLSearchParams\(location\.search\)\.get\('safe'\)!=='1'/,
 'Fixed V46 should boot by default and allow explicit safe=1 fallback');
assert.match(html,/if\(enableElectricPreview\)game=game\.replace/,
 'Safe-mode must not inject V46 scripts into the approved V45 game');
assert.equal(fire.length+moreFire.length-2,8,'Existing eight fire animations must be preserved');
const original=Array.from({length:25},(_,i)=>read('parts/p'+String(i).padStart(3,'0')+'.txt')).join('');
const v32Closing='\n})();\n/* FIM POKEMON TORRE V32 */';
const typeBridge='effects/moves/_runtime/move-type-hook-v46.js';
assert.ok(original.includes(v32Closing),'Original private V32 catalogue closing anchor exists');
assert.match(html,/move-type-hook-v46\.js/,'Loader must inject private-scope V32 typing bridge');
const privateBridgeGame=original.replace(v32Closing,'\n'+read(typeBridge)+v32Closing);
const anchor='\nrender();\n})();\n</script>';
const built=privateBridgeGame.replace(anchor,'\n'+[
 ...oldfx,...fire.slice(0,-1),...moreFire,fire.at(-1),...water,...electric
].map(read).join('\n')+'\n'+anchor);
assert.notEqual(built,original,'Game assembly must contain all new source modules');
new vm.Script(built.slice(built.indexOf('<script>')+8,built.indexOf('</script>')),{filename:'PokemonTorreAllV46'});
new vm.Script(html.slice(html.indexOf('<script>')+8,html.indexOf('</script>')),{filename:'PokemonTorreLoaderV46'});
console.log('PASS: 25 original parts + preserved fire/water + electric V46 + move-type canonical compile');
const electricSource=electric.map(read).join('\n');
for(const f of electric.slice(1,5)){
 const src=read(f);
 assert.match(src,/electricSpriteV46\.add\(/,'Every electric move has own isolated registration');
 assert.doesNotMatch(src,/\.(?:fillRect|arc|lineTo|stroke|createLinearGradient|createRadialGradient)\s*\(/,
  'No generic procedural Canvas effects in '+f);
}
for(const n of ['bolt-a','bolt-b','bolt-c','bolt-fork','bolt-shatter','arc','impact','spark','storm-cloud']){
 const svg=read('effects/moves/electric-original/'+n+'.svg');
 assert.match(svg,/<svg[^>]+shape-rendering="crispEdges"/,'Sprite '+n+' must remain pixel-crisp');
}
assert.match(html,/id="pt-progress"/,'Loading progress bar required');
assert.match(html,/id="pt-bar-fill"/,'Loading bar must have filling indicator');
assert.match(html,/id="pt-percent"/,'Loading percent required');
assert.doesNotMatch(html,/Carregando arquivos:.*completed\+'\/'\+total/,
 'No raw 0/25 counter can be shown');
const electricKit=read('effects/moves/_runtime/electric-sprite-kit.js');
assert.match(electricKit,/function burst\(/,'Electric impacts must use authored plasma sprite frames');
const thunderSource=read('effects/moves/trovao/index.js');
assert.match(thunderSource,/bolt-fork/,'Thunder has animation variation');
assert.match(thunderSource,/Math\.floor\(ms\/70\)/,'Thunder changes frames every 70ms');
const catalog=read('effects/moves/catalog/bundle.js');
for(const [id,type] of [['drillpeck','flying'],['quickattack','normal'],['skullbash','normal'],
 ['arranhao','normal'],['avalanche','ice'],['rapidspin','normal'],['dreameater','psychic'],
 ['vozencantadora','fairy'],['laminaprateada','bug']]){
 const re=new RegExp('registerMove\\("catalog_'+id+'",[\\s\\S]*?\\{"id":"'+id+'","type":"'+type+'"');
 assert.match(catalog,re,'Correct actual type in catalog source for '+id);
 const isolated=read('effects/moves/catalog/'+id+'/index.js');
 assert.match(isolated,new RegExp('"type":"'+type+'"'),'Correct type in individual '+id+' file');
}
let now=2000,spent=0,draws=[],sawPlayerPositions=[],persisted=0;
const mon={id:150,level:50},enemy={id:25},battle={active:true,energy:200,paused:false};
const moves=['Faísca','Discharge','Tempestade de Raios','Trovão'].map((name,i)=>({
 name,type:'electric',cat:i===0?'physical':'special',power:[16,38,66,62][i],
 cost:[0,28.2,38,36][i],cd:[1100,2900,4600,10000][i],kind:'bolt'
}));
const cooldowns=[0,0,0,0];
class FakeImage{
 constructor(){this.naturalWidth=0;this.naturalHeight=0;this.path='';}
 set src(p){this.path=p;this.naturalWidth=128;this.naturalHeight=260;this.onload?.();}
}
class G{
 save(){}restore(){}translate(){}rotate(){}scale(){}
 drawImage(img,...args){draws.push({src:img.path,args});}
}
class Engine{
 constructor(){this.h=560;this.w=940;this.player={x:180,y:350};this.enemy={x:665,y:265};
  this.ctx=new G();this.v342Lightning=[];this.v359Attacks=[];this.particles=[];}
 useMove(i){
  if(now<cooldowns[i]||battle.energy<moves[i].cost)return false;
  const move=moves[i];cooldowns[i]=now+move.cd;battle.energy-=move.cost;
  this.v342Lightning.push({old:true,name:move.name});
  this.v359Attacks.push({move:{name:move.name},at:now});
  this.particles.push({x:27,y:33,kind:'other-attack'});
  spent++;return true;
 }
 draw(){sawPlayerPositions.push(this.player.x);return true;}
}
const testRecords=[
 {name:'Drill Peck',type:'electric',cat:'special',kind:'bolt'},
 {name:'Drill Peck',type:'flying',cat:'physical',kind:'bolt'},
 {name:'Quick Attack',type:'electric',cat:'special',kind:'bolt'},
 {name:'Skull Bash',type:'water',cat:'special',kind:'bolt'},
 {name:'Amnesia',type:'water',cat:'special',kind:'status'},
 {name:'Aqua Jet',type:'water',cat:'special',kind:'dash'},
 {name:'Faísca',type:'electric',cat:'special',kind:'bolt'},
 {name:'Discharge',type:'electric',cat:'special',kind:'bolt'},
 {name:'Unknown custom spell',type:'ghost',cat:'special',kind:'bolt'}
];
const initialCatalogue=()=>testRecords.map(m=>({key:m.name+'|'+m.type+'|'+m.kind,move:{...m},level:1,available:true,tm:false}));
const engine=new Engine();
const env={
 Image:FakeImage,BattleEngine:Engine,performance:{now:()=>now},console,engine,battle,cooldowns,
 current:()=>mon,foe:()=>enemy,skillSet:()=>moves,
 v32Catalogue:initialCatalogue,v32MoveKey:m=>m.name+'|'+m.type+'|'+m.kind,
 persist:()=>{persisted++},
 document:{getElementById:()=>null},
 window:{PokemonTorreV360Paint:()=>false}
};
vm.runInNewContext(read(typeBridge),env,{filename:'MoveTypesLexicalBridgeV46'});
vm.runInNewContext(electricSource,env,{filename:'ElectricSpriteV46'});
const dex=env.window.PokemonTorreMoveTypesV46;
const ele=env.window.PokemonTorreElectricV46;
assert.equal(typeof dex,'function');
assert.equal(typeof ele,'function');
assert.ok(dex().referenceNames>=300,'Canonical map covers actual full 311 original catalog names');
assert.ok(dex().curatedCorrections>=75,'Official move type and status category audit must be comprehensive');
for(const [move,type] of [['Growth','normal'],['Calm Mind','psychic'],['Protect','normal'],['Thunder Wave','electric'],['Roost','flying'],['Bulk Up','fighting']]){
 const row=dex().lookup(move);
 assert.equal(row?.type,type,'Audited official move type: '+move);
 assert.equal(row?.category,'status','Non-damaging official move category: '+move);
}
const expected={
 'Drill Peck':'flying','Quick Attack':'normal','Skull Bash':'normal','Amnesia':'psychic',
 'Arranhão':'normal','Rapid Spin':'normal','Explosion':'normal',
 'Dream Eater':'psychic','Voz Encantadora':'fairy','Lâmina Prateada':'bug',
 'Discharge':'electric','Trovão':'electric','Tempestade de Raios':'electric',
 'Cauda de Água':'water','Aqua Jet':'water','Will-O-Wisp':'fire'
};
for(const [name,type] of Object.entries(expected))
 assert.equal(dex().lookup(name)?.type,type,'Canonical game move type for '+name);
const tester={id:150,level:50,v3566MewtwoTest:true,v32Slots:[
 'Drill Peck|electric|bolt','Quick Attack|electric|bolt',
 'Skull Bash|water|bolt','Amnesia|water|status'
]};
const corrected=env.v32Catalogue(tester);
assert.equal(corrected.length,8,'Mewtwo test editor collapses wrong-type duplicate Drill Peck');
assert.equal(new Set(corrected.map(x=>x.move.name)).size,8,'One canonical type per move name');
assert.equal(JSON.stringify(tester.v32Slots),JSON.stringify([
 'Drill Peck|flying|bolt','Quick Attack|normal|bolt',
 'Skull Bash|normal|bolt','Amnesia|psychic|status'
]),'All four existing equipped slots migrated instead of being lost');
assert.equal(persisted,1,'Migration persists once');
const drill=corrected.find(x=>x.move.name==='Drill Peck');
assert.equal(drill.move.cat,'physical');
assert.equal(corrected.find(x=>x.move.name==='Aqua Jet').move.cat,'physical');
assert.equal(corrected.find(x=>x.move.name==='Unknown custom spell').move.type,'ghost',
 'Unrecognized custom move preserves its authored type');
const ordinary=env.v32Catalogue({id:25,level:50});
assert.equal(ordinary.find(x=>x.move.name==='Skull Bash').move.type,'normal');
assert.equal(env.skillSet(mon)[0].cat,'physical','Spark is correctly physical');
assert.equal(ele().registered.length,4);
for(const key of ['bolt-a','bolt-b','bolt-c','bolt-fork','bolt-shatter','arc','spark','impact','storm-cloud'])
 assert.equal(ele().ready[key],true,'Asset loaded '+key);
const effectsByMove={};
for(let i=0;i<4;i++){
 now=2000+i*18000;
 const before=draws.length,beforeSpent=spent;
 assert.equal(engine.useMove(i),true,'Accepted cast of '+moves[i].name);
 assert.equal(spent,beforeSpent+1,'Game mechanics executed exactly once for '+moves[i].name);
 assert.equal(engine.v342Lightning.length,0,'Old electric lightning overlay suppressed');
 assert.equal(engine.v359Attacks.length,0,'Original generic attack overlay suppressed');
 assert.equal(env.window.PokemonTorreV360Paint(engine.ctx,{move:{name:moves[i].name}},now,engine),true,
  'Generic painter blocked for '+moves[i].name);
 const duration=engine.v46ElectricFX.at(-1).duration;
 const beforeX=engine.player.x;
 for(const frac of [.36,.52,.72])engine.draw(now+duration*frac);
 assert.equal(engine.player.x,beforeX,'Real contact must always restore player coordinates');
 const parts=draws.slice(before);
 assert.ok(parts.length>=8,moves[i].name+' must draw a rich sequence of electric sprites');
 effectsByMove[moves[i].name]={count:parts.length,assets:[...new Set(parts.map(x=>x.src.split('/').at(-1)))].sort()};
 if(i===0){
  assert.ok(sawPlayerPositions.some(x=>x>beforeX+65),'Spark Pokémon advances physically');
  assert.ok(parts.some(x=>x.src.includes('spark.svg')),'Spark uses jagged sparks');
 }
 if(i===1)assert.ok(parts.filter(x=>x.src.includes('arc.svg')).length>18,
  'Discharge creates many expanding electric arcs');
 if(i===2)assert.ok(parts.some(x=>x.src.includes('storm-cloud.svg'))&&
  parts.some(x=>x.src.includes('bolt-')),'Thunderstorm has cloud AND falling bolts');
 if(i===3)assert.ok(parts.some(x=>/bolt-(?:a|b|c|fork|shatter)\.svg/.test(x.src))&&
  parts.some(x=>x.src.includes('impact.svg')),'Thunder giant bolt and hit burst are visible');
}
assert.equal(spent,4,'Accepted combat attacks occur exactly four times');
assert.equal(ele().accepted,4);
assert.ok(ele().contactFrames>0);
assert.ok(ele().legacySuppressed>=4,'Only the replaced generic electric VFX removed');
assert.equal(engine.particles.length,4,'Other particles and non-electric mechanics stay intact');
console.log('PASS: global canonical move types, duplicate-free tester and saved-slot migration');
console.log('PASS: four independent cinematic electric sprite attacks, no old overlays or damaged approved FX');
console.log(JSON.stringify({version:ele().version,types:dex().referenceNames,corrections:dex().curatedCorrections,
 samples:dex().samples.slice(0,9),animations:effectsByMove}));
