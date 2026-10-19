'use strict';
// V174 regional pixel art: eight Kanto leaders, 3 trainer variants + boss,
// uses the existing Pixi WebGL renderer and leaves rules/campaign untouched.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const js=fs.readFileSync('effects/arena/v174-regional-pixel.js','utf8');
const lab=fs.readFileSync('torre-v174-light-2p5d-lab.html','utf8');
const official=fs.readFileSync('index.html','utf8');
new vm.Script(js);
assert(lab.includes("v174Query.set('arena_lab','regional174')"));
assert(lab.includes('effects/arena/v174-regional-pixel.js'));
assert(lab.includes('window.__V174_LAB=true'));
assert(lab.includes('__torre_lab_v174__'));
assert(lab.includes('v172-flamethrower-approved/runtime.js'));
assert(official.includes('v174-regional-pixel.js'),'approved V174 must now be on normal URL');
assert(official.includes('window.__V174_OFFICIAL=true;'));
assert(official.includes("get('arena174')!=='0'"),'rollback required');
assert(!official.includes('__torre_lab_v174__'),'normal game never receives lab save isolation');
assert(!/new\\s+PIXI\\.Application|new\\s+T\\.WebGLRenderer|window\\.THREE/.test(js));
assert(!js.includes("getContext('2d'"));
let rects=0,extractions=0;
class Graphics{
 beginFill(){return this;}
 drawRect(){rects++;return this;}
 endFill(){return this;}
 lineStyle(){return this;}
 moveTo(){return this;}
 lineTo(){return this;}
 drawPolygon(){return this;}
 drawEllipse(){return this;}
 destroy(){}
}
class LoadedImage{
 constructor(){this.naturalWidth=480;this.naturalHeight=300;this.complete=true;}
 set src(value){this.value=value;this.onload?.();}
 get src(){return this.value;}
}
class BattleEngine{
 constructor(){
  this.w=900;this.h=560;this.bg=null;
  this.canvas={isConnected:true};this.ctx={imageSmoothingEnabled:true};
 }
 generateBackdrop(){this.bg={native:true};}
 draw(){return true;}
}
const save={gym:0,stage:0},battle={active:true};
let t=1000;
const window={
 __V174_LAB:true,
 PIXI:{Graphics},
 PokemonTorrePixelFlyingBridge:{
  labStage:()=>({app:{renderer:{gl:{},extract:{base64:()=>{extractions++;return Promise.resolve('data:image/png;base64,AA==');}}}}})
 }
};
vm.runInNewContext(js,{window,URLSearchParams,location:{search:'?arena_lab=regional174'},
 BattleEngine,save,battle,performance:{now:()=>t},
 v29TrainerCount:g=>13+2*g,Image:LoadedImage});
(async()=>{
const instance=new BattleEngine();
const regionNames=['Brock','Misty','Lt. Surge','Erika','Koga','Sabrina','Blaine','Giovanni'];
for(let i=0;i<8;i++){
 save.gym=i;save.stage=0;t+=1400;
 instance.generateBackdrop();instance.draw(t);
 await new Promise(resolve=>setImmediate(resolve));
 instance.draw(t);
 const d=window.PokemonTorreV174Regional.diagnostics();
 assert.equal(d.leader,regionNames[i]);
 assert.equal(d.variant,0);
 assert.equal(d.leaderRoom,false);
 assert(instance.bg&&!instance.bg.native);
 assert.equal(d.extraWebGLContexts,0);
 assert.equal(d.dynamicShadowPasses,0);
}
assert.equal(extractions,8);
instance.draw(t+16);instance.draw(t+33);
assert.equal(extractions,8,'reuse cached room instead of redrawing each frame');
save.gym=0;save.stage=1;t+=1400;instance.generateBackdrop();instance.draw(t);
await new Promise(resolve=>setImmediate(resolve));instance.draw(t);
assert.equal(window.PokemonTorreV174Regional.diagnostics().variant,1);
save.stage=13;t+=1400;instance.generateBackdrop();instance.draw(t);
await new Promise(resolve=>setImmediate(resolve));instance.draw(t);
assert.equal(window.PokemonTorreV174Regional.diagnostics().leaderRoom,true);
assert.equal(window.PokemonTorreV174Regional.diagnostics().variant,'leader');
assert.equal(extractions,10);
assert(rects>3000,'real pixel geometry should be generated, not a palette-only background');
// A safe URL never wraps the original engine.
class SafeEngine{generateBackdrop(){return 17;}draw(){return 19;}}
vm.runInNewContext(js,{window:{__V174_LAB:true},URLSearchParams,
 location:{search:'?arena_lab=regional174&safe=1'},BattleEngine:SafeEngine,
 save,battle,performance:{now:()=>t},v29TrainerCount:g=>13+2*g,Image:LoadedImage});
assert.equal(new SafeEngine().draw(),19);
const approved=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
assert(approved.moves.filter(x=>x.protect).length>20);
console.log('V174 REGIONAL PIXEL PASS: async WebGL extraction, 8 leaders, trainer variants, boss, cache and rollback');
})().catch(e=>{console.error(e);process.exitCode=1;});
