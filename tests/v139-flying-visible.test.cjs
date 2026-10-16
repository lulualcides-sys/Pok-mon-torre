'use strict';
/* V139: genuine invisible-Flying root regressions.
 * Prior tests mocked the GPU as always available and never tested status Roost.
 * Validate zero-damage Roost visual cue, blocked cast, errors visible when
 * Pixi fails, forced-WebGL no Canvas fallback, and prior official art safe.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const get=path=>fs.readFileSync(path,'utf8');
const runtime=get('effects/moves/v136-flying-pixel/runtime.js');
const pixi=get('effects/moves/_runtime/pixi-layer.js');
const index=get('index.html');
assert.doesNotThrow(()=>new vm.Script(runtime));
assert.doesNotThrow(()=>new vm.Script(pixi));
assert.match(runtime,/function addStatusVisual\(engine,move,spec,b\)/);
assert.match(runtime,/times:\[\]/,'status visual must never deal additional damage');
assert.match(runtime,/afterCD>beforeCD/,'native status cooldown signals success even with undefined return');
assert.match(runtime,/function loadGpuFallback\(\)/);
assert.match(runtime,/pixelFlyingGpuNotice/,'GPU failure must not remain invisible and silent');
assert.match(runtime,/pixelFlyingLastIssue|diagnosis\?\.error/);
assert.match(pixi,/WebGL não está disponível/,'Pixi stage must use WebGL not Canvas renderer');
assert.match(pixi,/const hasGPU=\(\)=>!!window\.PIXI\?\.Application/);
assert.match(pixi,/pixelFlyingLastIssue/);
assert.match(index,/build=v139-flying-visible/,'browser must fetch the corrected runtime');
assert.doesNotMatch(runtime,/getContext\(|drawImage\(|requestAnimationFrame\(|\.fillRect\(/,'four effects can never use Canvas2D');
const names=['Roost','Rajada','Air Slash','Bicada'];
const skills=names.map(name=>({name,cost:12,power:name==='Roost'?0:20,cd:1600}));
const Battle={active:true,energy:150},owner={hp:100},foeMon={hp:230};
let mounts=0,mountWorks=true,canvasCalls=0,events=[];
const cooldowns=[0,0,0,0],domNodes={};
const document={
 head:{appendChild(x){events.push('CDN:'+String(x.src||''));}},
 getElementById(id){return domNodes[id]||null},
 createElement(tag){return {tag,style:{},classList:{contains:()=>true},setAttribute(){},
  parentElement:null,textContent:'',appendChild(){},remove(){delete domNodes[this.id]}}}
};
domNodes.arenaPro={appendChild(node){domNodes[node.id]=node;}};
function TestImage(){
 this.naturalWidth=0;this.naturalHeight=0;
 Object.defineProperty(this,'src',{set(v){
  this._src=v;this.naturalWidth=512;this.naturalHeight=128;
  this.onload?.();
 },get(){return this._src;}});
}
class BattleEngine{
 constructor(){this.player={x:100,y:250};this.enemy={x:310,y:200};
  this.h=480;this.canvas={isConnected:true};this.v359Attacks=[];}
 useMove(slot){
  if(cooldowns[slot]>=2000)return undefined; // blocked native status/attack
  cooldowns[slot]=2000+slot;
  Battle.energy-=12;
  if(slot===0){owner.hp+=10;return undefined;} // native Roost heals itself
  const move=skills[slot];
  this.v359Attacks.push({move,at:1000,duration:600,end:1600,
   battle:Battle,owner,target:foeMon,times:[.64],hits:0,
   from:[100,188],to:[310,135]});
  return true;
 }
 update(now){
  for(const fx of this.v359Attacks)
   if(fx.times.length>0&&!fx.hits&&now>=fx.at+fx.duration*.64){
    fx.hits++;foeMon.hp-=fx.move.power;
   }
 }
}
const pixiFX={
 mountPixelFlying(){mounts++;return mountWorks;},
 diagnostics(){return {error:mountWorks?'':'WebGL mobile indisponível'};}
};
function build(search){
 const window={PokemonTorreV360Paint:()=>{canvasCalls++;return false}};
 const globals={window,location:{search},URLSearchParams,Image:TestImage,
  BattleEngine,performance:{now:()=>1000},battle:Battle,current:()=>owner,
  foe:()=>foeMon,skillSet:()=>skills,cooldowns,pixiFX,document,console};
 vm.runInNewContext(runtime,globals,{timeout:3000});
 return window;
}
assert.equal(build('?flying136=0').PokemonTorreFlyingPixelV136,undefined);
const ui=build(''),api=ui.PokemonTorreFlyingPixelV136;
assert.ok(api.installed&&api.officialLoad);
assert.equal(api.diagnostics().ready,4);
const engine=new BattleEngine();
const hpBefore=owner.hp;
assert.equal(engine.useMove(0),undefined,'Roost native status usually returns undefined');
assert.equal(owner.hp,hpBefore+10,'Roost native cure once');
assert.equal(engine.v359Attacks.length,1,'Roost must now spawn a PIXEL visual-only event');
const status=engine.v359Attacks[0];
assert.equal(status.kind,'pixel-flying-status');
assert.equal(status.times.length,0);
assert.equal(status.hits,0);
assert.equal(status.duration,1580);
assert.equal(api.diagnostics().visualStatusCasts,1);
engine.update(3000);
assert.equal(foeMon.hp,230,'Roost visual cue must never damage opponent');
assert.equal(owner.hp,hpBefore+10,'Roost must never heal twice');
const forbiddenCanvas=new Proxy({}, {get(){throw Error('Forbidden Canvas2D access');}});
assert.equal(ui.PokemonTorreV360Paint(forbiddenCanvas,status,1100,engine),true);
assert.equal(canvasCalls,0,'no 2D painter on status moves');
for(let slot=1;slot<4;slot++){
 const prior=engine.v359Attacks.length;
 engine.useMove(slot);
 assert.equal(engine.v359Attacks.length,prior+1);
 const fx=engine.v359Attacks[prior];
 assert.equal(fx.duration,[0,1390,1510,1150][slot]);
 assert.equal(ui.PokemonTorreV360Paint(forbiddenCanvas,fx,1100,engine),true);
 assert.equal(fx.times.length,1,'single-hit attack unchanged');
}
assert.ok(mounts>=4,'must call Pixi WebGL layer for all 4 moves');
const beforeBlocked=engine.v359Attacks.length;
engine.useMove(0); // CD still active; native method does nothing
assert.equal(engine.v359Attacks.length,beforeBlocked,'a failed status move cannot create a fake cue');
mountWorks=false;
const fx=engine.v359Attacks[1];
assert.equal(ui.PokemonTorreV360Paint(forbiddenCanvas,fx,1200,engine),true);
assert.ok(document.getElementById('pixelFlyingGpuNotice'),'GPU failure must be visible to user');
assert.match(api.diagnostics().lastMountFailure||'',/WebGL mobile indisponível/);
mountWorks=true;
assert.equal(ui.PokemonTorreV360Paint(forbiddenCanvas,fx,1300,engine),true);
assert.equal(document.getElementById('pixelFlyingGpuNotice'),null,'hide warning after successful recovery');
assert.equal(canvasCalls,0,'no rejected Canvas Flying painter executed');
assert.equal(ui.PokemonTorreV360Paint({}, {move:{name:'Osso'}},1100,engine),false);
assert.equal(canvasCalls,1,'other approved 2D effect remains unchanged');
const approved=JSON.parse(get('effects/moves/STATUS_APROVADOS.json')).moves;
assert.equal(approved.length,42);
for(const name of names)assert.ok(!approved.some(s=>s.move===name),'unapproved art must not show ✓');
console.log('PASS V139: Roost animated despite native status returning undefined, exactly one heal, all 4 GPU casts, blocked casts safe, visible GPU fault/recovery, no Flying Canvas2D.');
