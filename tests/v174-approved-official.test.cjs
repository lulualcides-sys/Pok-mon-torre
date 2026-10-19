'use strict';
// V174 user-approved promotion: official URL, default enabled and isolated rollback.
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const official=fs.readFileSync('index.html','utf8');
const lab=fs.readFileSync('torre-v174-light-2p5d-lab.html','utf8');
const regional=fs.readFileSync('effects/arena/v174-regional-pixel.js','utf8');
const approvals=fs.readFileSync('effects/arena/STATUS_V174_APROVADA.md','utf8');
const prior=fs.readFileSync('effects/arena/STATUS_V173_REPROVADA.md','utf8');
const approvedMoves=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
new vm.Script(regional);
new vm.Script(official.slice(official.indexOf('<script>')+8,official.lastIndexOf('</script>')));
assert(official.includes('window.__V174_OFFICIAL=true;'),'official bootstrap sets installed flag before regional code');
assert(official.includes('effects/arena/v174-regional-pixel.js'),'regional module present in official loader');
assert(official.includes("get('arena174')!=='0'"),'rollback is opt-in only');
assert(official.includes("get('safe')!=='1'"),'safe mode must skip regional stage');
assert(!official.includes('__torre_lab_v174__'),'lab sandbox save interception prohibited in normal game');
assert(!official.includes('effects/arena/v173-three-world.js'),'rejected Three.js V173 must never be default');
assert(official.includes('effects/moves/v172-flamethrower-approved/runtime.js'));
assert(official.includes('effects/moves/v128-water-preview/bubbles/index.js'));
assert(official.includes('effects/moves/v128-water-preview/water-gun/index.js'));
assert(!regional.includes("getContext('2d'"));
assert(!regional.includes('new PIXI.Application'));
assert(!regional.includes('new T.WebGLRenderer'));
assert(regional.includes("url=await extracted.base64("),'Pixi v7 asynchronous texture extraction');
assert(lab.includes('__torre_lab_v174__'),'historical V174 preview is still isolated');
assert(approvals.includes('APROVADAS')&&approvals.includes('?arena174=0'));
assert(prior.includes('REPROVADA'),'V173 rejection record preserved');
assert(approvedMoves.moves.filter(m=>m.protect).length>20);
class DummyEngine {generateBackdrop(){return 7;}draw(){return 11;}}
function setup(search,flg){
 const sandbox={window:flg,location:{search},URLSearchParams,Image:class{},BattleEngine:DummyEngine,
  performance:{now:()=>0},save:{gym:0,stage:0},battle:{active:true}};
 vm.runInNewContext(regional,sandbox);
 return flg.PokemonTorreV174Regional.diagnostics();
}
const normal=setup('',{__V174_OFFICIAL:true});
assert.equal(normal.enabled,true);
assert.equal(normal.official,true);
assert.equal(normal.approved,true);
assert.equal(normal.sandboxOnly,false);
assert.equal(normal.regionCount,8);
const rollback=setup('?arena174=0',{__V174_OFFICIAL:true});
assert.equal(rollback.enabled,false);
const safe=setup('?safe=1',{__V174_OFFICIAL:true});
assert.equal(safe.enabled,false);
const special=setup('?arena_lab=blue152',{__V174_OFFICIAL:true});
assert.equal(special.enabled,false,'legacy arena comparison should not stack stages');
const preview=setup('?arena_lab=regional174',{__V174_LAB:true});
assert.equal(preview.enabled,true);
assert.equal(preview.sandboxOnly,true,'test lab save remains isolated');
console.log('V174 APPROVED OFFICIAL SOURCE PASS: normal Kanto arena, rollbacks, unchanged approved moves and no save hijack');
