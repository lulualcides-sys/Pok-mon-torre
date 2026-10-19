'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const data=JSON.parse(fs.readFileSync('effects/moves/v175-official/learnsets-usum-kanto.json','utf8'));
const runtime=fs.readFileSync('effects/moves/v175-official/runtime.js','utf8');
const loader=fs.readFileSync('index.html','utf8');
const approvals=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
new vm.Script(runtime);
assert.equal(data.version,'175.0');
assert.equal(Object.keys(data.types).length,18);
assert.equal(Object.keys(data.species).length,151);
assert(Object.values(data.types).every(x=>x.length===16));
assert.equal(Object.keys(data.moves).length,288,'no duplicate names/moves across types');
const findId=n=>Number(Object.entries(data.moves).find(([,x])=>x[0]===n)?.[0]);
const has=(species,name)=>data.species[species].some(x=>x[0]===findId(name));
for(const n of ['Surf','Rain Dance','Bubble','Water Gun'])assert(data.types.water.includes(n),'protected water move missing: '+n);
assert(has(7,'Water Gun')&&has(7,'Bubble')&&has(7,'Rain Dance')&&has(7,'Surf'));
assert(!has(4,'Surf'),'Charmander should not learn Surf in USUM');
assert(has(4,'Ember')&&has(4,'Flamethrower'));
assert(has(150,'Psychic'));
assert(has(132,'Transform'));
assert(has(11,'Harden')&&has(14,'Harden'));
assert(has(129,'Splash'));
const uniqueNames=new Set(Object.values(data.moves).map(x=>x[0]));
assert.equal(uniqueNames.size,288);
for(const [species,list] of Object.entries(data.species)){
 assert(list.length>0,'missing original learnset '+species);
 for(const [id,level,method] of list){
  assert(data.moves[id],'unknown move '+id+' on '+species);
  assert(method===1||method===4,'unsupported original learn method');
  assert(level>=0&&level<=100);
 }
}
for(const name of ['Surf','Rain Dance','Bolhas','Pistola d’Água']){
 assert(approvals.moves.some(x=>x.move===name&&x.protect),'approved visual missing: '+name);
}
assert(loader.includes('effects/moves/v175-official/runtime.js'));
assert(loader.includes("get('moves175')!=='0'"));
assert(loader.includes('effects/arena/v174-regional-pixel.js'));
assert(loader.includes('effects/moves/raindance-original-v118.js'));
assert(loader.includes('effects/moves/v128-water-preview/bubbles/index.js'));
assert(loader.includes('effects/moves/v128-water-preview/water-gun/index.js'));
const key=m=>m.name+'|'+m.type+'|'+m.kind;
const native=[{key:key({name:'Bolhas',type:'water',kind:'bolt'}),move:{name:'Bolhas',type:'water',kind:'bolt',power:21,cd:2500,cost:10}},
{key:key({name:'Pistola d’Água',type:'water',kind:'bolt'}),move:{name:'Pistola d’Água',type:'water',kind:'bolt',power:25,cd:2500,cost:13}},
{key:key({name:'Rain Dance',type:'water',kind:'status'}),move:{name:'Rain Dance',type:'water',kind:'status',power:0,cd:5000,cost:24}},
{key:key({name:'Surf',type:'water',kind:'area'}),move:{name:'Surf',type:'water',kind:'area',power:52,cd:5500,cost:36}}];
const context={window:{PokemonTorreV175Learnsets:data},save:{v32:{tms:['water']}},
 location:{search:''},URLSearchParams,console,queueMicrotask:()=>{},
 v32MoveKey:key,v32Catalogue:()=>native,skillSet:()=>native.map(x=>x.move),
 showTeam:()=>{},render:()=>{},renderBattle:()=>{},overlay:()=>{},
 document:{body:null},NodeFilter:{SHOW_TEXT:4}};
vm.runInNewContext(runtime,context);
const testMon={id:7,level:40,v32Slots:null};
const choices=context.v32Catalogue(testMon);
for(const move of ['Bubble','Water Gun','Rain Dance','Surf']){
 const entry=choices.find(x=>x.v175English===move);
 assert(entry,'missing Squirtle move '+move);
 assert(entry.available,'move should be available by Lv40/TM '+move);
}
assert.equal(choices.find(x=>x.v175English==='Bubble').move.name,'Bolhas','protected sprite dispatch name changed');
assert.equal(choices.find(x=>x.v175English==='Water Gun').move.name,'Pistola d’Água','protected V128 dispatch changed');
assert.equal(choices.find(x=>x.v175English==='Rain Dance').move.name,'Rain Dance');
assert.equal(choices.find(x=>x.v175English==='Surf').move.name,'Surf');
assert.equal(context.skillSet(testMon).length,4,'battle still requires four move buttons');
assert.equal(context.v32Catalogue({id:4,level:5,v32Slots:null}).some(x=>x.v175English==='Surf'),false);
assert.equal(context.window.PokemonTorreV175Diagnostics().speciesCount,151);
console.log('V175 PASS: 151 Kanto official legal pools, 18x16 English moves, approved FX dispatch, starter buttons');

