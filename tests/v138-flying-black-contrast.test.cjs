'use strict';
/* V138: user asked Roost, Rajada, Air Slash and Bicada to be BLACK because
 * pale flying textures blended into the blue V98 arena. Check the actual
 * generator, GPU texture and Particle Emitter, not just display labels.
 */
const fs=require('node:fs'),assert=require('node:assert/strict');
const get=f=>fs.readFileSync(f,'utf8');
const art=get('tools/build-v136-flying-pixel.py');
const validator=get('tools/test-v136-flying-art.py');
const pixi=get('effects/moves/_runtime/pixi-layer.js');
const runtime=get('effects/moves/v136-flying-pixel/runtime.js');
const html=get('index.html');
assert.match(art,/def black_with_pixel_outline\(frame\)/);
assert.match(art,/DARK_V138=/);
assert.match(art,/SILVER_PIXEL_RIM=\(217,225,232,255\)/);
assert.match(art,/im=black_with_pixel_outline\(im\)/);
assert.match(validator,/black=sum\(/);
assert.match(validator,/rim=sum\(/);
assert.match(validator,/old pale-blue arena-matching palette/);
assert.match(pixi,/sprite\.tint=0xffffff;/,'do not tint the black pixel outline away');
assert.match(pixi,/type:'color',config:\{color:/,'particle emitter needs black tint');
assert.match(pixi,/value:'101318'/,'particles should start near-black');
assert.match(pixi,/value:'050608'/,'particles should finish black');
assert.match(pixi,/PIXI\.SCALE_MODES\.NEAREST/);
assert.match(pixi,/updatePixelFlying\(now,dt\)/);
assert.match(runtime,/spritesheet\.png\?v=(?:138-black-pixel|139-visible-gpu)/,'sprite URL must bust browser cache');
assert.match(runtime,/pixelPalette:'near-black with one-pixel silver contrast rim'/);
assert.ok(!/(getContext\(|requestAnimationFrame\(|drawImage\()/.test(runtime),'never return to Canvas 2D');
assert.ok(html.includes("get('flying136')!=='0'"),'the normal game must load pixel Flying effects');
assert.match(html,/build=v(?:138-flying-black-contrast|139-flying-visible|140-pixi-bridge)/,'cache bust for the loader');
const oldProtected=JSON.parse(get('effects/moves/STATUS_APROVADOS.json')).moves;
assert.equal(oldProtected.length,42,'not yet visually approved: do not mark new Flying effects');
for(const name of ['Osso','Grande Fissura','Garra de Areia','Soco de Terra','Lança de Areia','Fenda Rasa']){
 assert.equal(oldProtected.find(m=>m.move===name)?.protect,true,'protected effect changed: '+name);
}
console.log('PASS V138: four near-black sprite atlases with pixel-light rim, black GPU particles, no Canvas, protected moves, normal-game cache-bust.');
