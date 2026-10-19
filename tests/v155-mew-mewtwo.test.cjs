'use strict';
/* V155 acceptance gate — 3 steps delivered together, no modification
 * of the existing campaign or saved approved attacks. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const names=['violet-stone-arena.png','psychic-ring.png','shadow-orb.png','psychic-impact.png'];
const expected=[[720,1280],[192,192],[128,128],[192,192]];
for(let i=0;i<names.length;i++){
 const bytes=fs.readFileSync('assets/battle-v155/'+names[i]);
 assert.equal(bytes.subarray(1,4).toString(),'PNG',names[i]);
 assert.equal(bytes.readUInt32BE(16),expected[i][0],names[i]+' width');
 assert.equal(bytes.readUInt32BE(20),expected[i][1],names[i]+' height');
 assert.ok(bytes.length>450,names[i]+' nonempty');
}
const page=fs.readFileSync('previews/v155-mew-mewtwo.html','utf8');
const game=fs.readFileSync('previews/v155-mew-mewtwo.js','utf8');
const main=fs.readFileSync('index.html','utf8');
const protectedMoves=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
assert.equal(protectedMoves.moves.length,48,'all approved moves remain registered');
assert.ok(protectedMoves.moves.every(x=>x.protect));
assert.match(page,/pixi\.js@7\.4\.3/);
assert.match(page,/v155-mew-mewtwo\.js\?build=155-1/);
assert.match(page,/CC BY-NC 4\.0/);
assert.match(page,/JFain/);
assert.match(page,/noncommercial|comercial/i);
assert.match(game,/PMDCollab\/SpriteCollab/);
assert.match(game,/0150/);assert.match(game,/0151/);
for(const action of ["Idle","Walk","Attack","Shoot","Hurt","Faint"])
 assert.match(game,new RegExp("'"+action+"'"));
assert.match(game,/new PIXI\.Application/);
assert.equal((game.match(/new PIXI\.Application/g)||[]).length,1,'one GPU scene, not three');
assert.match(game,/const v=Math\.round\(\(90-d\)\/45\)/,'true PMD S,SE,E,NE,N,NW,W,SW compass');
assert.match(game,/if\(u>=1&&!p\.hit\)/,'damage only on contact');
assert.match(game,/state\.hero\.x=361/);
assert.match(game,/if\(state\.seconds>state\.enemyNext/,'live sparring enemy');
assert.doesNotMatch(game,/new Image\(|getContext\('2d'\)|CanvasRenderingContext2D/);
assert.match(main,/effects\/arena\/chamber-v148\.js/,'normal V150 remains official');
assert.doesNotMatch(main,/previews\/v155-mew-mewtwo\.js/,'pilot never touches main battle');
console.log('V155 3-step pilot: Python arena, authentic PMD sprite directions/timing, psychic+shadow contact and saved-game isolation PASS.');
