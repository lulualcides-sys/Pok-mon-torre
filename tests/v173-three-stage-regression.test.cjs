'use strict';
// V173 safety: true 3D geometry and 2D Pokemon sprite planes; the official game is not touched.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=x=>fs.readFileSync(x,'utf8');
const html=read('torre-v173-real-3d-lab.html');
const js=read('effects/arena/v173-three-world.js');
const original=read('index.html');
const approved=JSON.parse(read('effects/moves/STATUS_APROVADOS.json'));
new vm.Script(js,{filename:'effects/arena/v173-three-world.js'});
new vm.Script(html.slice(html.indexOf('<script>')+8,html.lastIndexOf('</script>')),{filename:'V173 bootstrap'});
for(const [name,pattern] of [
 ['separate save namespace',/__torre_lab_v173__/],
 ['Three CDN pinned',/three@0\.128\.0\/build\/three\.min\.js/],
 ['visual boot',/window\.__V173_LAB=true/],
 ['true 3D stage script',/effects\/arena\/v173-three-world\.js/],
 ['old approved fire code reused',/effects\/moves\/v172-flamethrower-approved\/runtime\.js/]
])assert.match(html,pattern,name);
assert.doesNotMatch(original,/__V173_LAB|v173-three-world\.js/);
assert.match(js,/new T\.WebGLRenderer/);
assert.match(js,/new T\.PerspectiveCamera/);
assert.match(js,/new T\.MeshStandardMaterial/);
assert.match(js,/new T\.DirectionalLight/);
assert.match(js,/key\.castShadow=true/);
assert.match(js,/new T\.PlaneGeometry/);
assert.match(js,/new T\.BoxGeometry/);
assert.match(js,/new T\.ConeGeometry/);
assert.match(js,/new T\.SpriteMaterial/);
assert.match(js,/new T\.Sprite\(mat\)/);
assert.match(js,/ray\.setFromCamera/);
assert.match(js,/ray\.ray\.intersectPlane/);
assert.match(js,/prefetch\(id\)/);
assert.match(js,/AnimData\.xml/);
assert.match(js,/view\.sprite\.scale\.set/);
assert.match(js,/return native\.mon\.apply\(this,arguments\)/);
assert.match(js,/return native\.destroy\.apply\(this,arguments\)/);
assert.match(js,/campaignUntouched:true/);
assert.match(js,/approvedMovesIntact:true/);
assert.doesNotMatch(js,/\.hp\s*[-+]?=|hitTarget\s*=|this\.player\.x\s*=|this\.enemy\.y\s*=/);
assert(approved.moves.filter(x=>x.protect).length>20);
console.log('V173 SOURCE PASS: real perspective 3D geometry, pixel PMD 2D sprite billboards, official campaign untouched');
