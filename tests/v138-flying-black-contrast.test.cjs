'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const read=f=>fs.readFileSync(f,'utf8');
const generator=read('tools/build-v136-flying-pixel.py'),validator=read('tools/test-v136-flying-art.py');
const runtime=read('effects/moves/v136-flying-pixel/runtime.js');
const pixi=read('effects/moves/_runtime/pixi-layer.js'),html=read('index.html');
assert.match(generator,/SIZE=256/);
for(const pattern of [/build\("roost",16,roost\)/,/build\("gust",20,gust\)/,
 /build\("air-slash",20,air_slash\)/,/build\("peck",16,peck\)/,/GaussianBlur/])
 assert.match(generator,pattern);
assert.match(validator,/hard\/pixelated edges/);
assert.match(pixi,/base\.scaleMode=PIXI\.SCALE_MODES\.LINEAR/);
assert.match(pixi,/sprite\.roundPixels=false/);
assert.match(pixi,/new PIXI\.Rectangle\(\(i%8\)\*size,Math\.floor\(i\/8\)\*size,size,size\)/);
assert.match(pixi,/sprite\.tint=0xffffff;/);
assert.match(runtime,/spritesheet\.png\?v=142-hd-alpha/);
assert.match(runtime,/frameSize:256/);
assert.match(html,/build=v142-hd-alpha/);
assert.doesNotMatch(runtime,/getContext\(|drawImage\(|requestAnimationFrame\(/);
const approved=JSON.parse(read('effects/moves/STATUS_APROVADOS.json')).moves;
assert.equal(approved.length,42);
for(const name of ['Osso','Grande Fissura','Garra de Areia','Soco de Terra','Lança de Areia','Fenda Rasa'])
 assert.equal(approved.find(s=>s.move===name)?.protect,true);
for(const name of ['Roost','Rajada','Air Slash','Bicada'])
 assert.ok(!approved.some(s=>s.move===name));
console.log('PASS V142: 256px detailed Flying frames, smooth textures, protected moves unchanged.');
