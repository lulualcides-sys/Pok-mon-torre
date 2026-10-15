'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('effects/moves/_runtime/dedupe-bilingual-v100.js','utf8');
const base=[
 ['Acid','poison','bolt'],['Ácido','poison','bolt'],
 ['Vine Whip','grass','bolt'],['Chicote de Vinha','grass','bolt'],
 ['Razor Leaf','grass','pierce'],['Folha Navalha','grass','pierce'],
 ['Confusion','psychic','bolt'],['Confusão','psychic','bolt'],
 ['Ice Beam','ice','beam'],['Raio de Gelo','ice','beam'],
 ['Sopro Congelante','ice','beam'],
 ['Slam','normal','dash'],['Golpe de Corpo','normal','dash'],
 ['Acid','water','bolt']
].map(([name,type,kind],i)=>({
 key:name+'|'+type+'|'+kind,move:{name,type,kind,cost:12+i,power:23+i},
 level:10,tm:false,available:true
}));
const SAVE={id:150,v32Slots:[
 'Vine Whip|grass|bolt','Raio de Gelo|ice|beam',
 'Confusion|psychic|bolt','Slam|normal|dash'
]};
const context={window:{},console};
const harness=[
 'const original='+JSON.stringify(base)+';',
 'function v32Catalogue(){return original.map(x=>({...x,move:{...x.move}}));}',
 'function skillSet(m){const catalog=v32Catalogue(m);return (m.v32Slots||[]).map(k=>{',
 'const choice=catalog.find(x=>x.key===k);return choice?choice.move:null;});}',
 source,'window.testApi={catalog:v32Catalogue,skills:skillSet};'
].join('\n');
vm.runInNewContext(harness,context);
const api=context.window.testApi,fx=context.window.PokemonTorreMoveCatalogV100;
assert.equal(fx.installed,true);
const all=api.catalog(SAVE),chosen=api.skills(SAVE);
assert.equal(all.length,9,'14 moves -> 9 semantic and type-distinct menu choices');
assert.deepEqual(Array.from(chosen,x=>x?.name),['Vine Whip','Raio de Gelo','Confusion','Slam'],
 'Saved English/Pt keys and existing visual move implementations preserved');
assert.equal(SAVE.v32Slots[0],'Vine Whip|grass|bolt');
assert.ok(all.some(x=>x.move.name==='Vine Whip'));
assert.ok(!all.some(x=>x.move.name==='Chicote de Vinha'));
assert.ok(!all.some(x=>x.move.name==='Ice Beam'));
assert.ok(all.some(x=>x.move.name==='Acid'&&x.move.type==='water'),
 'Different move type cannot be conflated');
assert.ok(all.some(x=>x.move.name==='Sopro Congelante'));
assert.ok(all.some(x=>x.move.name==='Golpe de Corpo')&&all.some(x=>x.move.name==='Slam'),
 'Similar-sounding but different moves must NOT be merged');
const picker=api.catalog({id:25});
assert.ok(picker.some(x=>x.move.name==='Ácido')&&!picker.some(x=>x.move.name==='Acid'&&x.move.type==='poison'));
const fromSave=fx.findSaved(SAVE,SAVE.v32Slots[0]);
assert.equal(fromSave.move.name,'Vine Whip');
assert.equal(fx.isEquivalent(fromSave,base.find(x=>x.move.name==='Chicote de Vinha')),true);
assert.equal(fx.isEquivalent(fromSave,base.find(x=>x.move.name==='Slam')),false);
assert.ok(fx.diagnostics().removedChoices>=10);
console.log('PASS V100: semantic bilingual alias consolidation; original combat choices/keys/saves and approved animations untouched');
