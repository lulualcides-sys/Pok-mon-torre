'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ids=['dragon-pulse','aura-sphere','x-scissor','dragon-claw'];
const page=read('previews/atelier-v70.html');
const bridge=read('effects/atelier-v70/entry.js');
const index=read('index.html');
const deploy=read('.github/workflows/deploy.yml');
assert.ok(index.includes("effects/atelier-v70/entry.js"),'The game does not load the Atelier launcher');
assert.ok(bridge.includes("previews/atelier-v70.html?embedded=1"),'The Atelier is not inside the game modal');
assert.ok(bridge.includes('Escape')&&bridge.includes('modal.hidden'),'In-game preview cannot be closed');
assert.ok(page.includes("effects/atelier-v71/atlases/") || page.includes("const base='../effects/atelier-v71/atlases/';"), 'Approved atlases not wired');
assert.ok(page.includes('PIXI.AnimatedSprite')&&page.includes('PIXI.Assets.load'),
  'AnimatedSprite GPU playback missing');
assert.ok(page.includes('PIXI.particles.Emitter'),'Optional Pixi particle emitter missing');
assert.ok(page.includes('8 quadros reais')&&!page.includes('getContext('),
  'Preview needs raster artwork rather than Canvas 2D procedural effects');
assert.ok(deploy.includes('python tools/build-atelier-v70.py'),'Deploy does not build sprite assets');
assert.ok(!read('effects/atelier-v70/entry.js').includes('BattleEngine.prototype'),
  'Preview cannot intercept gameplay moves');
for(const id of ids){
 assert.ok(page.includes("id:'"+id+"'"),'Missing '+id+' selector');
 const png=path.join(root,'effects/atelier-v71/atlases',id+'.webp');
 assert.ok(fs.existsSync(png),'Missing V70 generated atlas '+png);
 const bytes=fs.readFileSync(png);
 assert.equal(bytes.toString('ascii',0,4),'RIFF','Invalid RIFF '+png);
 assert.equal(bytes.toString('ascii',8,12),'WEBP','Invalid WebP '+png);
 assert.ok(bytes.length>100000,'Atlas not detailed enough '+id);
 assert.ok(bytes.length>100000,'Atlas artifact too small '+id);
}
for(const name of ['Thunder','Discharge','Thunder Wave']){
 assert.ok(!bridge.includes(name),'Protected move name changed in preview bridge: '+name);
}
console.log('PASS V71: 4 approved-illustration WebP atlas files, in-game PixiJS playback, no gameplay hooks');
