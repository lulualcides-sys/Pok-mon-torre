'use strict';
/** V156 safeguards for phases 1–5 together: original arena, sprites,
 * animated FX, ONE Pixi renderer, mobile adaptive quality and expansion path.
 */
const fs=require('node:fs'),assert=require('node:assert/strict');
const path=require('node:path');
const names=[
 ['shadow-ball-16.png',512,512],
 ['psychic-glyph-16.png',640,640],
 ['impact-12.png',512,384]
];
for(const [file,w,h] of names){
 const data=fs.readFileSync(path.join('assets/battle-v156',file));
 assert.equal(data.subarray(1,4).toString(),'PNG',file);
 assert.equal(data.readUInt32BE(16),w,file+' width');
 assert.equal(data.readUInt32BE(20),h,file+' height');
 assert.ok(data.byteLength>600,file+' should include authored frames');
}
const h=fs.readFileSync('previews/v156-mew-mewtwo.html','utf8');
const j=fs.readFileSync('previews/v156-mew-mewtwo.js','utf8');
const official=fs.readFileSync('index.html','utf8');
const moves=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
assert.equal(moves.moves.length,46);
assert.ok(moves.moves.every(x=>x.protect));
assert.match(h,/v156-mew-mewtwo\.js\?build=156-1/);
assert.match(h,/id="quality"/);assert.match(h,/CC BY-NC 4\.0/);
assert.match(j,/new PIXI\.Application/);
assert.equal((j.match(/new PIXI\.Application/g)||[]).length,1,
 'one PixiJS/WebGL application for every visual layer');
assert.match(j,/view\.addChild\(scenery,actorsLayer,fxLayer\)/);
assert.match(j,/metadataXml/);assert.match(j,/AnimData\.xml/);
assert.match(j,/assets\/pmd-spritecollab/);
assert.match(j,/async function pmdTexture/);
assert.match(j,/animatedAtlas\('shadow-ball-16\.png',128,128,16\)/);
assert.match(j,/animatedAtlas\('psychic-glyph-16\.png',160,160,16\)/);
assert.match(j,/animatedAtlas\('impact-12\.png',128,128,12\)/);
assert.match(j,/new PIXI\.AnimatedSprite/);
assert.match(j,/if\(u>=1&&!p\.hit\)/,'HP changes only at graphical contact');
assert.match(j,/function monitorPerformance/);
assert.match(j,/perf\.level===['"]low['"]\?28/,'true particle caps');
assert.match(j,/qualityMode\(\)/);
assert.match(j,/slowFrames:/);
assert.match(j,/renderers:document\.querySelectorAll/);
assert.doesNotMatch(j,/getContext\('2d'|new Image\(|setInterval\(/);
assert.doesNotMatch(official,/previews\/v156-mew-mewtwo/,'game stays untouched');
console.log('V156 static checks passed: stage 1-5, 3 effect sprite sheets, PMD metadata, single PixiJS and performance quality controls.');
