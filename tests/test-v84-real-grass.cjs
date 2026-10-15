'use strict';
// Compatibility regression: V84 is archived, V90 is the production Grass FX.
// The original V84 hit-sync multiplied time by up to 5x, making damage occur
// AFTER today's animations. This archived synchronizer must not load in V90.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const index=fs.readFileSync('index.html','utf8');
const end=fs.readFileSync('effects/moves/_runtime/end.js','utf8');
assert.ok(index.includes('effects/moves/v89-four/render.js'),'V90 renderer not routed');
assert.ok(!index.includes("fetch('effects/moves/v84-preview/impact-sync.js"),
 'Obsolete V84 impact sync still delays damage');
assert.ok(end.includes('__v89HiddenGrassVisual'),
 'Must hide old orb without removing native projectile or HP updates');
const historical=fs.readFileSync('effects/moves/v84-preview/impact-sync.js','utf8');
assert.ok(historical.includes('PokemonTorreGrassImpactV84'),'Archive must remain intact');
require('./grass-v90-runtime.test.cjs');
console.log('PASS V90 stable four Grass moves, no old V84 delayed HP sync, native projectile preserved.');
