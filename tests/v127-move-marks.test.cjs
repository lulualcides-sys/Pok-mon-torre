'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('effects/v127/approval-marks.js','utf8');
const manifest=JSON.parse(fs.readFileSync('effects/v127/edited-moves.json','utf8'));
const index=fs.readFileSync('index.html','utf8');
const part=fs.readFileSync('parts/p008.txt','utf8');
const old=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
assert.equal(old.moves.length,30,'the original registry must remain unchanged');
assert.equal(manifest.records.length,62,'every edited legacy/official move must have its own status record');
assert.equal(manifest.records.filter(x=>x.source==='STATUS_APROVADOS.json').length,30);
assert.equal(manifest.records.filter(x=>x.status==='editado_legado').length,32);
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
assert.equal(mark.diagnostics().official,30);
assert.equal(mark.diagnostics().legacy,32);
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
 assert.equal(mark.status(item.name)?.status,item.status);
}
const accepted=sandbox.skillMarkup({name:'Raio de Gelo'},0);
assert.ok(accepted.includes('v127MoveCheck')&&accepted.includes('✓'),'approved beam check must render in battle');
assert.ok(!accepted.includes('v122ApprovedMark'),'old + must not double with new badge');
assert.ok(mark.badge('Ice Beam').includes('✓'),'English/Portuguese aliases must share approval');
assert.ok(mark.badge('Lança-Chamas').includes('EDITADO'),'legacy edited attack displayed with qualified status');
assert.ok(mark.badge('Shadow Ball').includes('EDITADO'));
assert.ok(mark.badge('Chamas de Moltres').includes('EDITADO'),'missing legacy approved animation marker');
assert.ok(mark.badge('Solar Beam').includes('EDITADO'));
assert.ok(mark.badge('Thunder').includes('EDITADO'));
assert.ok(mark.badge('Cross Chop').includes('TESTE'),'test-only move not falsely labeled approved');
assert.equal(mark.badge('Inventado Fantasma'),'', 'unregistered move must not receive fake approval');
assert.ok(mark.badge('Dança da Chuva').includes('✓'),'accent aliases matched');
const css=html.find(e=>e.id==='v127-approved-move-checks')?.textContent||'';
assert.ok(css.includes('.v127MoveCheck'),'small non-emoji badge styled');
console.log('PASS V127: 62 per-move status files, 30 authoritative official, 32 historical edited; battle, equipped slots, catalogue, aliases, tests vs approved, no attack/saving changes.');
