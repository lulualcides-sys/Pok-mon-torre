'use strict';
/* V141 replaces a rejected BLACK-only palette with real colorful pixel-art.
 * Retain the historical test filename for existing GitHub Actions workflows.
 */
const fs=require('node:fs'),assert=require('node:assert/strict');
const get=f=>fs.readFileSync(f,'utf8');
const art=get('tools/build-v136-flying-pixel.py');
const validator=get('tools/test-v136-flying-art.py');
const pixi=get('effects/moves/_runtime/pixi-layer.js');
const runtime=get('effects/moves/v136-flying-pixel/runtime.js');
const html=get('index.html');
for(const name of ['roost','gust','airslash','peck'])assert.match(art,new RegExp('def '+name+'\\(frame,total,d\\):'));
assert.match(art,/INK=\(28,69,89,255\)/);
assert.match(art,/WHITE=\(244,252,249,255\)/);
assert.match(art,/GOLD=\(249,218,131,255\)/);
assert.doesNotMatch(art,/DARK_V138|black_with_pixel_outline|SILVER_PIXEL_RIM/);
assert.match(validator,/bright=sum/);
assert.match(validator,/dark=sum/);
assert.match(validator,/black silhouette regression/);
assert.match(pixi,/sprite\.tint=0xffffff;/);
assert.match(pixi,/type:'color',config:\{color:/);
assert.match(pixi,/healing\?'f9da83':'f4fcf9'/);
assert.match(pixi,/healing\?'d9eeb9':'75bbce'/);
assert.doesNotMatch(pixi,/value:'101318'|value:'050608'/);
assert.match(pixi,/PIXI\.SCALE_MODES\.NEAREST/);
assert.match(pixi,/updatePixelFlying\(now,dt\)/);
assert.match(runtime,/spritesheet\.png\?v=141-flying-color/);
assert.match(runtime,/pixelPalette:'pearlescent sky-and-white pixel art/);
assert.ok(!/(getContext\(|requestAnimationFrame\(|drawImage\()/.test(runtime),'never use Canvas 2D');
assert.ok(html.includes("get('flying136')!=='0'"));
assert.match(html,/build=v141-flying-color/);
const approved=JSON.parse(get('effects/moves/STATUS_APROVADOS.json')).moves;
assert.equal(approved.length,42);
for(const name of ['Osso','Grande Fissura','Garra de Areia','Soco de Terra','Lança de Areia','Fenda Rasa']){
 assert.equal(approved.find(m=>m.move===name)?.protect,true,'approved changed: '+name);
}
for(const name of ['Roost','Rajada','Air Slash','Bicada'])
 assert.ok(!approved.some(m=>m.move===name),'do not mark a new preview approved');
console.log('PASS V141: colorful pixel Flying sprites, soft navy edge, correct WebGL particles, protected moves untouched.');
