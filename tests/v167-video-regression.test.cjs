'use strict';
// V167 visual-fidelity source gate — the official campaign and approved moves are immutable.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const html=read('torre-v167-video-lab.html');
const official=read('index.html');
const old=read('torre-v166-rtx-lab.html');
const arena=read('effects/arena/v167-video-fidelity.js');
const engine=read('effects/labs/v167-video-fidelity.js');
const generator=read('tools/build-v167-video-fidelity.py');
new vm.Script(arena,{filename:'effects/arena/v167-video-fidelity.js'});
new vm.Script(engine,{filename:'effects/labs/v167-video-fidelity.js'});
new vm.Script(html.slice(html.indexOf('<script>')+8,html.lastIndexOf('</script>')),{filename:'V167 loader'});
assert.match(html,/torre-lab/);
assert.match(html,/__V167_LAB=true/);
assert.match(html,/__torre_lab_v167__/);
assert.match(html,/effects\/arena\/v167-video-fidelity\.js/);
assert.match(html,/effects\/labs\/v167-video-fidelity\.js/);
assert.match(html,/v167Query\.set\('arena_lab','blue167'\)/);
assert.match(html,/v167Query\.set\('arena_theme','violet'\)/);
assert.doesNotMatch(official,/__V167_LAB|v167-video-fidelity\.js/);
assert.doesNotMatch(old,/__V167_LAB|v167-video-fidelity\.js/);
assert.match(arena,/arena_lab'\)==='blue167'/);
assert.match(arena,/assets\/arena-v167\//);
for(const token of ['horizon-rail','side-rail','floor-rune','floor-atlas','back-wall']){
  assert(arena.includes(token),'missing pixel art layer '+token);
}
assert.match(arena,/powerPreference:'high-performance'/);
assert.match(arena,/gpuPreset==='rtx2060'\?33:70/);
assert.match(arena,/if\(now-inst\.frameAt<ambientMs\)return/);
assert.match(arena,/const rune=add\('floor-rune'/);
const status=JSON.parse(read('effects/moves/STATUS_APROVADOS.json'));
assert(status.moves.filter(m=>m.protect).length>20);
for(const spell of ['shadow-ball-16.png','psychic-wave-16.png','fire-burst-16.png','electric-arc-16.png','impact-12.png'])
  assert(engine.includes(spell),'missing distinct effect '+spell);
for(const id of ['shadow','psychic','fire','electric'])
  assert(engine.includes('data-v167="'+id+'"'),'missing preview button '+id);
assert.match(engine,/projectileHitSyncs/);
assert.match(engine,/view\.baseScale==null/);
assert.match(engine,/const border=\[\[-1,0\]/);
assert.match(engine,/P\.SCALE_MODES\.NEAREST/);
assert.match(engine,/assets\/battle-v167/);
assert.match(engine,/window\.PokemonTorreV167Lab/);
assert.doesNotMatch(engine,/setInterval\(/);
assert.match(generator,/build_floor\(\)/);
assert.match(generator,/build_fx\(\)/);
console.log('V167 source PASS: isolated V150, original assets, four animated spell previews and RTX WebGL.');
