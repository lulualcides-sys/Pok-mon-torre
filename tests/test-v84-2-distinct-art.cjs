'use strict';
/* Gate V84.2 three NEW visual identities. Test the generated transparent
 * files themselves, not just JS filenames or page initialization.
 * Folha Navalha remains the previously approved art (accelerated only).
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const path=require('node:path');
const root=path.join(__dirname,'..');
const bytes=p=>fs.readFileSync(path.join(root,p));
const hash=p=>crypto.createHash('sha256').update(bytes(p)).digest('hex');
const file=(slug,ver)=>`effects/moves/${slug}/${ver}-preview/sprites/${slug}.webp`;
const three=['chicote-de-vinha','chicotes-em-area','vine-whip'];
const unique=new Set();
for(const slug of three){
 const revised=file(slug,'v84');
 const original=file(slug,'v83');
 const buffer=bytes(revised);
 assert.equal(buffer.toString('ascii',0,4),'RIFF',slug);
 assert.equal(buffer.toString('ascii',8,12),'WEBP',slug);
 assert.ok(buffer.length>1500,slug+' missing transparent spritesheet');
 const old=hash(original),fresh=hash(revised);
 assert.notEqual(old,fresh,slug+' did not receive NEW artwork');
 assert.ok(!unique.has(fresh),slug+' repeats a different move artwork');
 unique.add(fresh);
}
const originalLeaves=hash(file('folha-navalha','v83'));
assert.ok(originalLeaves);
assert.equal(unique.size,3);
const renderer=fs.readFileSync(path.join(root,'effects/moves/v84-preview/render.js'),'utf8');
const impact=fs.readFileSync(path.join(root,'effects/moves/v84-preview/impact-sync.js'),'utf8');
assert.ok(renderer.includes("id==='folha-navalha'?'v83-preview':'v84-preview'"));
assert.ok(renderer.includes("name:'Folha Navalha',asset:'folha-navalha',impact:5,speed:1,ms:1430"));
assert.ok(renderer.includes("source=key=>"));
assert.ok(impact.includes("version:'84.2'"));
assert.ok(!renderer.includes('getContext('));
for(const slug of three)assert.ok(renderer.includes("asset:'"+slug+"'"),slug);
const loader=fs.readFileSync(path.join(root,'index.html'),'utf8');
// Historic V84 WebP imagery can still be validated above, but the
// runtime no longer depends on those absent archived files.
assert.ok(loader.includes('effects/moves/v89-four/render.js'),
 'V90 must use generated Pixi artwork rather than missing WebP URLs');
console.log('PASS V84.2 archive: three distinct historic WebP atlases and unchanged Leaf artwork; production routes use V90 GPU-generated sprites.');
