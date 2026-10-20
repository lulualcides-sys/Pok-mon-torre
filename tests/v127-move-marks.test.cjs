'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('effects/v127/approval-marks.js','utf8');
const manifest=JSON.parse(fs.readFileSync('effects/v127/edited-moves.json','utf8'));
const index=fs.readFileSync('index.html','utf8');
const part=fs.readFileSync('parts/p008.txt','utf8');
const old=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
assert.equal(old.moves.length,48,'V177 Absorb approved alongside 47 previously accepted');
assert.equal(manifest.records.length,79,'every edited legacy/official move must have its own status record');
assert.equal(manifest.records.filter(x=>x.source==='STATUS_APROVADOS.json').length,48);
assert.equal(manifest.records.filter(x=>x.status==='editado_legado').length,31);
assert.equal(old.moves.filter(x=>x.status==='em_teste').length,0,'approved fighting moves must not revert to test status');
const fighting=['Chute','Golpe de Karatê','Cross Chop','Brick Break'];
const poison=['Venoshock','Toxina Pesada','Rajada Ácida','Golpe de Veneno'];
const fissure=['Grande Fissura','Osso','Garra de Areia','Soco de Terra','Lança de Areia','Fenda Rasa'];
for(const name of [...fighting,...poison,...fissure]){
 const reg=old.moves.find(x=>x.move===name);
 const listed=manifest.records.find(x=>x.name===name);
 assert.ok(reg&&listed,'approved move missing from one registry: '+name);
 assert.equal(reg.status,'aprovado',name+' must be approved in source registry');
 assert.equal(listed.status,'aprovado',name+' must be approved in V127 list');
 assert.equal(reg.protect,true,name+' must remain visually protected');
}

assert.ok(index.includes('effects/v127/approval-marks.js'),'new marker script loaded in game');
assert.ok(index.includes("get('marks127')!=='0'"),'isolated rollback exists');
assert.ok(part.includes("window.PokemonTorreMoveMarksV127?.badge?.(x?.move.name)"),'equipped slots marked');
assert.ok(part.includes("window.PokemonTorreMoveMarksV127?.badge?.(x.move.name)"),'the full moves catalogue marked');
assert.ok(!src.includes('localStorage.setItem'),'V127 must not modify saves');
assert.doesNotMatch(src,/hitTarget\s*=|BattleEngine\.prototype|v32Catalogue\s*=|damage\s*=/,'V127 must not change gameplay, damage or attack sprites');
const html=[];
const document={head:{appendChild(x){html.push(x)}},createElement(){return {id:'',textContent:''}}};
const sandbox={window:{},document,URLSearchParams,location:{search:''},console,
 skillMarkup:(s,i)=>'<button data-skill="'+i+'"><span class="skillName"><b>'+s.name+'</b><i class="v122ApprovedMark" title="salvo">+</i></span></button>'};
vm.runInNewContext(src,sandbox,{filename:'effects/v127/approval-marks.js',timeout:2500});
const mark=sandbox.window.PokemonTorreMoveMarksV127;
assert.ok(mark?.installed,'module loaded');
assert.equal(mark.diagnostics().official,48);
assert.equal(mark.diagnostics().legacy,31);
assert.ok(mark.badge('Absorb').includes('✓'),'user approved V177 Absorb');
for(const name of ['Roost','Rajada','Air Slash','Bicada']){
 const entry=old.moves.find(m=>m.move===name);
 assert.ok(entry&&entry.status==='salvo'&&entry.protect===true);
 assert.equal(entry.visual_scale_factor,.2);
 assert.equal(mark.status(name)?.status,'salvo');
 assert.ok(mark.badge(name).includes('✓'),'saved Flying move must show checkmark');
}
assert.equal(mark.status('Gust')?.status,'salvo','Rajada alias overrides older legacy Gust mark');
for(const m of old.moves){
 const names=[m.move,...m.aliases||[]];
 for(const name of names){
  assert.ok(mark.status(name),'unmarked official move or alias: '+name);
  const shown=mark.badge(name);
  if(m.status==='em_teste')assert.ok(shown.includes('TESTE')&&!shown.includes('✓'),'test-only move must not show approval check');
  else assert.ok(shown.includes('✓'),'accepted move lacks check: '+name);
 }
}
for(const item of manifest.records){
 const slug=item.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const path='effects/v127/by-move/'+slug+'/status.json';
 assert.ok(fs.existsSync(path),'separate status missing for '+item.name);
 const stored=JSON.parse(fs.readFileSync(path,'utf8'));
 assert.equal(stored.approval_state,item.status,'per-move status mismatch');
 assert.equal(stored.move,item.name);
 // Historical Gust remains recorded as edited; its alias now resolves to saved Rajada.
 if(item.name==='Gust'&&item.status==='editado_legado')
  assert.equal(mark.status(item.name)?.status,'salvo');
 else assert.equal(mark.status(item.name)?.status,item.status);
}
const accepted=sandbox.skillMarkup({name:'Raio de Gelo'},0);
assert.ok(accepted.includes('v127MoveCheck')&&accepted.includes('✓'),'approved beam check must render in battle');
assert.ok(!accepted.includes('v122ApprovedMark'),'old + must not double with new badge');
assert.ok(mark.badge('Ice Beam').includes('✓'),'English/Portuguese aliases must share approval');
assert.ok(mark.badge('Lança-Chamas').includes('✓'),'approved V172 Flamethrower must show accepted checkmark');
assert.ok(mark.badge('Fire Blast').includes('✓'),'user-approved V183 must show checkmark');
assert.ok(mark.badge('Shadow Ball').includes('EDITADO'));
assert.ok(mark.badge('Chamas de Moltres').includes('EDITADO'),'missing legacy approved animation marker');
assert.ok(mark.badge('Solar Beam').includes('EDITADO'));
assert.ok(mark.badge('Thunder').includes('EDITADO'));
for(const name of [...fighting,...poison]){
 assert.ok(mark.badge(name).includes('✓'),name+' must show approval checkmark');
 assert.ok(!mark.badge(name).includes('TESTE'),name+' must not show testing badge');
}
assert.ok(mark.badge('Soco Cruzado').includes('✓'),'V107 Cross Chop alias keeps approval');
assert.ok(mark.badge('Karate Chop').includes('✓'),'Karate Chop English alias approved');
assert.ok(mark.badge('Quebra-Tijolo').includes('✓'),'Brick Break Portuguese alias approved');
assert.equal(mark.badge('Inventado Fantasma'),'', 'unregistered move must not receive fake approval');
assert.ok(mark.badge('Dança da Chuva').includes('✓'),'accent aliases matched');
const css=html.find(e=>e.id==='v127-approved-move-checks')?.textContent||'';
assert.ok(css.includes('.v127MoveCheck'),'small non-emoji badge styled');
console.log('PASS V177.1: 79 per-move records, 48 accepted including Absorb, 31 historical edited; protected moves preserved.');
