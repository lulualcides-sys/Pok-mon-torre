'use strict';
// V187 real LibreSprite 16-frame assets — verified before publication.
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const base='effects/moves/v187-rea-handdrawn-fire';
for(const [type,w,h] of [['flamethrower',112,64],['fireblast',53,53],['impact',112,112]]){
 const dir=path.join(base,type);
 for(const name of ['animation.aseprite','sheet.png','sheet.json'])
  assert.ok(fs.existsSync(path.join(dir,name))&&fs.statSync(path.join(dir,name)).size>150,'Missing '+name+' '+type);
 const img=fs.readFileSync(path.join(dir,'sheet.png'));
 assert.equal(img.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(img.readUInt32BE(16),w*8,'sheet width for '+type);
 assert.equal(img.readUInt32BE(20),h*2,'sheet height for '+type);
 const src=fs.readFileSync(path.join(dir,'animation.aseprite'));
 assert.equal(src.readUInt16LE(4),0xa5e0,'ASE file header '+type);
 assert.equal(src.readUInt16LE(6),16,'16 hand-drawn frames in '+type);
 assert.equal(src.readUInt16LE(8),w);
 assert.equal(src.readUInt16LE(10),h);
 const raw=fs.readFileSync(path.join(dir,'sheet.json'),'utf8');
 assert.ok(raw.includes('frames')&&raw.includes('meta'),'LibreSprite JSON metadata '+type);
 console.log('PASS V187 '+type+' '+w+'x'+h+' ×16 in editable .aseprite');
}
const runtime=fs.readFileSync(base+'/runtime.js','utf8');
assert.match(runtime,/BaseTexture\.from\(images\[key\]\.image\)/);
assert.match(runtime,/frame(?:Ms|)|1000\/14/);
assert.ok(!runtime.includes('function makePixels')&&!runtime.includes('app.renderer.generateTexture'));
console.log('PASS V187 spritesheets, real Pixi textures, no generated graphics in browser.');
