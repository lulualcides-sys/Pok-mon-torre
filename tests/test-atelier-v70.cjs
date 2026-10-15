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
 const png=path.join(root,'effects/atelier-v70/sprites',id+'.png');
 assert.ok(fs.existsSync(png),'Missing V70 generated atlas '+png);
 const bytes=fs.readFileSync(png);
 assert.ok(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'Invalid PNG '+png);
 assert.equal(bytes.readUInt32BE(16),3840,'Wrong atlas width '+id);
 assert.equal(bytes.readUInt32BE(20),240,'Wrong atlas height '+id);
 assert.ok(bytes.length>25000,'Empty or suspiciously small sprite atlas '+id);
}
for(const name of ['Thunder','Discharge','Thunder Wave']){
 assert.ok(!bridge.includes(name),'Protected move name changed in preview bridge: '+name);
}
console.log('PASS V70: 4 RGBA sprite atlases / 32 frames, in-game launch, PixiJS playback, no gameplay hooks');
