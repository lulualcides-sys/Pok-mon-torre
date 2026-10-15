'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('effects/moves/catalog/unify-duplicates-v100.js','utf8');
const html=fs.readFileSync('index.html','utf8');
assert.ok(html.includes('effects/moves/catalog/unify-duplicates-v100.js'));
const moves=[
 ['Acid','poison','bolt',18,true,1],['Ácido','poison','bolt',19,false,13],
 ['Vine Whip','grass','bolt',31,true,1],['Chicote de Vinha','grass','bolt',31,true,1],
 ['Chicote Duplo','grass','bolt',45,true,1],
 ['Folha Navalha','grass','bolt',34,true,1],['Razor Leaf','grass','bolt',35,true,1],
 ['Fire Spin','fire','area',33,true,1],['Giro de Fogo','fire','area',31,true,1],
 ['Ice Beam','ice','beam',55,true,1],['Raio de Gelo','ice','beam',44,true,1],
 ['Tri Attack','normal','bolt',42,true,1],['Tri Ataque','normal','bolt',42,true,1],
 ['Transformar','normal','status',0,true,1],['Transformação','normal','status',0,true,1],['Transform','normal','status',0,true,1],
 ['Haze','ice','status',0,true,1],['Geada Persistente','ice','hazard',12,true,1],
 ['Sopro Congelante','ice','beam',36,true,1],
 ['Golpe Duplo','normal','dash',20,true,1],
 ['Thunder','electric','homing',58,true,1],['Trovão','electric','homing',59,true,1]
].map(([name,type,kind,power,available,level])=>({
 key:name+'|'+type+'|'+kind,move:{name,type,kind,power,cd:2000,cost:20},
 level,tm:false,available
}));
const originalNames=moves.map(x=>x.move.name);
const globalPersist={count:0},microtasks=[];
const window={};
const sandbox={window,console,Math,queueMicrotask:fn=>microtasks.push(fn),
 v32MoveKey:m=>[m.name,m.type,m.kind].join('|'),
 v32Catalogue:m=>moves.map(x=>({...x,move:{...x.move}})),
 v32DefaultSlots:m=>['Acid|poison|bolt','Vine Whip|grass|bolt','Raio de Gelo|ice|beam','Haze|ice|status'],
 mon:(id,level)=>({id,level}),persist:()=>{globalPersist.count++;},
 skillSet:m=>m.id===25?[
  {name:'Faísca',type:'electric',kind:'bolt',power:18},
  {name:'Faísca do Pikachu',type:'electric',kind:'bolt',power:32},
  {name:'Thunder',type:'electric',kind:'homing',power:58},
  {name:'Investida',type:'normal',kind:'dash',power:19}
 ]:[]};
vm.runInNewContext(source,sandbox,{filename:'unify-duplicates-v100.js'});
const api=window.PokemonTorreMoveDedupV100;
assert.equal(api.installed,true);
const team={id:150,level:55,v32Slots:[
 'Acid|poison|bolt','Vine Whip|grass|bolt',
 'Raio de Gelo|ice|beam','Haze|ice|status']};
const newList=sandbox.v32Catalogue(team);
const actualNames=newList.map(x=>x.move.name);
assert.ok(actualNames.includes('Ácido'));
assert.ok(!actualNames.includes('Acid'));
assert.ok(actualNames.includes('Chicote de Vinha'));
assert.ok(!actualNames.includes('Vine Whip'));
assert.ok(actualNames.includes('Ice Beam'));
assert.ok(!actualNames.includes('Raio de Gelo'));
assert.ok(actualNames.includes('Tri Attack'));
assert.ok(!actualNames.includes('Tri Ataque'));
assert.ok(actualNames.includes('Transformação'));
assert.ok(!actualNames.includes('Transformar'));
assert.ok(actualNames.includes('Chicote Duplo'),'Custom double vine is different');
assert.ok(actualNames.includes('Sopro Congelante'),'Other Ice move is different');
assert.ok(actualNames.includes('Geada Persistente'),'Hazard remains');
assert.ok(actualNames.includes('Haze'),'Haze is NOT Blizzard or an ice beam');
assert.ok(actualNames.includes('Golpe Duplo'),'Double Hit is not Double Team');
assert.deepEqual(team.v32Slots,[
 'Ácido|poison|bolt','Chicote de Vinha|grass|bolt',
 'Ice Beam|ice|beam','Haze|ice|status']);
const keys=newList.map(x=>x.key);
assert.equal(keys.length,new Set(keys).size);
const defaults=sandbox.v32DefaultSlots(team);
assert.deepEqual(defaults,team.v32Slots);
const before=moves.length,after=newList.length;
assert.ok(after<=before-8,'Expected at least 8 translated duplicate copies removed');
assert.deepEqual(moves.map(x=>x.move.name),originalNames,'Original move objects unchanged');
for(const fn of microtasks)fn();
assert.ok(globalPersist.count>0,'Legacy saved slots must be persisted');
const report=api.report(150,55);
assert.equal(report.before,before);assert.equal(report.after,after);
assert.equal(report.afterStillDuplicated,false);
const pikachu={id:25,level:76,v32Slots:null};
const pikachuDefaults=sandbox.v32DefaultSlots(pikachu);
assert.equal(pikachuDefaults[2],'Trovão|electric|homing',
 'Must preserve offensive Thunder; never replace it with Thunder Wave status');
assert.equal(api.canonicalOf('Vine Whip'),api.canonicalOf('Chicote de Vinha'));
assert.notEqual(api.canonicalOf('Chicote Duplo'),api.canonicalOf('Vine Whip'));
console.log('PASS V100: verified PT/EN aliases deduplicated, saved slots migrate, unlocked move retained, approved and distinct move names untouched',JSON.stringify({before,after,removed:before-after}));
