'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync('effects/ui/move-dedup-v100.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const approvals=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
assert.ok(index.includes("effects/ui/move-dedup-v100.js"));
assert.ok(index.includes("Iniciando Pokémon Torre V100"));
assert.ok(src.includes("row.remove()")&&src.includes("data-v331-pick"));
const noop=()=>{};
class MutationObserver{observe(){}disconnect(){}}
const document={
 body:{},
 querySelector(){return null;},
 addEventListener:noop
};
const window={};
vm.runInNewContext(src,{window,document,MutationObserver,
 requestAnimationFrame:noop,console},{filename:'move-dedup-v100.js'});
const m=window.PokemonTorreMoveDedupV100;
assert.equal(m.installed,true);
const equal=[
 ['Chicote de Vinha','Vine Whip'],
 ['Folha Navalha','Razor Leaf'],
 ['Ice Beam','Raio de Gelo'],
 ['Aurora Beam','Raio da Aurora'],
 ['Bola Sombria','Shadow Ball'],
 ['Trovão','Thunder'],
 ['Recuperar','Recover'],
 ['Pulso d’Água','Water Pulse'],
 ['Pistola d’Água','Jato de Água'],
 ['Transformar','Transformação']
];
for(const [a,b] of equal)assert.equal(m.groupOf(a),m.groupOf(b),a+' / '+b);
const different=[
 ['Chicote Duplo','Chicote de Vinha'],
 ['Impacto Glacial','Ice Beam'],
 ['Faísca do Pikachu','Thunderbolt'],
 ['Geada Persistente','Blizzard'],
 ['Tempestade de Neve','Nevasca'],
 ['Razor Leaf','Raízes Violentas'],
 ['Aurora Beam','Ice Beam'],
 ['Golpe Duplo','Chicote Duplo']
];
for(const [a,b] of different)assert.notEqual(m.groupOf(a),m.groupOf(b),a+' should remain distinct from '+b);
for(const move of ['Chicote de Vinha','Folha Navalha','Vine Whip','Raízes Violentas','Geada Persistente','Sopro Congelante','Chicote Duplo']){
 assert.ok(approvals.moves.find(x=>x.move===move)?.protect,'approved artwork must remain protected: '+move);
}
assert.equal(m.diagnostics().savedSlotsPreserved,true);
assert.equal(m.diagnostics().approvedFxPreserved,true);
assert.ok(m.diagnostics().aliasGroups>40);
console.log('PASS V100: bilingual aliases, original unique moves, saved loadouts and approved FX all protected');
