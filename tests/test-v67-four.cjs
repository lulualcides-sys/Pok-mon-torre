'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');
const files=['core.js','x-scissor/index.js','aura-sphere/index.js','dragon-pulse/index.js','dragon-claw/index.js'];
const context={window:{},console};vm.createContext(context);
for(const file of files)vm.runInContext(fs.readFileSync(path.join(root,'effects/moves/v67-four',file),'utf8'),context,{filename:file,timeout:2000});
const v=context.window.PokemonTorreFidelityFourV67;
assert.ok(v);
const keys=[...v.inspect().keys];
assert.deepEqual([...keys].sort(),['catalog_cortex','catalog_xscissor','catalog_aurasphere','catalog_dragonpulse','catalog_dragonclaw'].sort());
for(const key of ['catalog_thunder','catalog_discharge','catalog_thunderwave','catalog_trovao','catalog_descarga','catalog_descargaeletrica','catalog_stunspore','catalog_leechseed','catalog_volttackle'])assert.equal(v.accepts(key),false,key);
let draws=0;
const g={globalAlpha:1,save(){draws++},restore(){draws++},beginPath(){draws++},lineTo(){draws++},moveTo(){draws++},fill(){draws++},stroke(){draws++},closePath(){draws++},ellipse(){draws++},translate(){draws++},rotate(){draws++}};
for(const key of keys){
 const frames=[];
 for(let i=0;i<8;i++){
  let before=draws;assert.equal(v.paint(g,{from:[52,135],to:[226,135]},(i+.55)/8,(i+.55)*125,1,false,key),true);
  frames.push(draws-before);assert.ok(draws>before,key+' frame '+i);
 }
 assert.ok(new Set(frames).size>1,'All 8 frame draw paths identical for '+key);
}
const preview=fs.readFileSync(path.join(root,'previews/v67-quatro-8-quadros.html'),'utf8');
for(const p of files)assert.ok(preview.includes('/v67-four/'+p),'preview lacks '+p);
assert.equal(v.paint(g,{from:[1,2],to:[3,4]},.5,0,1,false,'catalog_thunder'),false);
console.log('PASS: 4 isolated move modules, both X-Scissor aliases, 40 frame samples, all protected moves excluded');
