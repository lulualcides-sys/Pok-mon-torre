'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const html=read('torre-v168-flametower-lab.html');
const js=read('effects/labs/v168-flametower.js');
const art=read('tools/build-v168-flametower.py');
const prev=read('torre-v167-video-lab.html');
const original=read('index.html');
new vm.Script(js,{filename:'effects/labs/v168-flametower.js'});
new vm.Script(html.slice(html.indexOf('<script>')+8,html.lastIndexOf('</script>')),{filename:'V168 bootstrap'});
assert.match(html,/window\.__V168_LAB=true/);
assert.match(html,/window\.__V167_LAB=true/);
assert.match(html,/__torre_lab_v168__/);
assert.match(html,/effects\/labs\/v168-flametower\.js/);
assert.match(html,/effects\/labs\/v167-video-fidelity\.js/);
assert.match(html,/arena_lab','blue167/);
assert(!prev.includes('effects/labs/v168-flametower.js'),'V167 unchanged');
assert(!original.includes('effects/labs/v168-flametower.js'),'official game unchanged');
assert.match(js,/const nativeDrawMon=BattleEngine\.prototype\.drawMon;/);
assert.match(js,/data\.dashOffsets\+\+/);
assert.match(js,/const shown=\{\.\.\.actor/);
assert.match(js,/const nativeDraw=BattleEngine\.prototype\.draw;/);
assert.match(js,/savedMovesUntouched:true/);
for(const [kind,count] of [['tower',32],['flamethrower',32],['blast',32],['punch',24]]){
 assert(js.includes(kind+':{name:'),'missing type '+kind);
 assert(js.includes('count:'+count),'missing frame count '+count);
 assert(js.includes("data-flame168"),'missing button data marker');
}
assert.match(js,/P\.SCALE_MODES\.NEAREST/);
assert.match(js,/const bt=P\.BaseTexture\.from\(img\)/);
assert.match(js,/window\.PokemonTorreFlameTowerV168/);
assert.match(js,/this===owner&&actor===this\.player/);
assert.match(js,/nativeDrawMon\.call\(this,shown,id,enemy,clock\)/);
assert.doesNotMatch(js,/hitTarget\s*=|this\.player\.x\s*=|this\.enemy\.hp\s*=|setInterval\(|requestAnimationFrame\(/);
assert.match(art,/MOVES=\[/);
for(const name of ['flame-tower-32','flamethrower-32','fire-blast-32','fire-punch-24'])
 assert(art.includes(name),'missing atlas generator: '+name);
assert.equal(read('effects/moves/STATUS_APROVADOS.json').includes('aprov'),true,'approved registry exists');
console.log('V168 SOURCE PASS: four 32/24-frame Pixi previews, contact-only visual dash, saves and official moves isolated.');
