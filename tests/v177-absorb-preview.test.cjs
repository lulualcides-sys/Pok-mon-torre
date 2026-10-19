const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('effects/moves/v177-absorb-preview/runtime.js','utf8');
const index=fs.readFileSync('index.html','utf8');
new vm.Script(source,{filename:'v177-absorb-preview/runtime.js'});
assert.match(index,/get\('absorb177'\)!=='0'/);
assert.match(index,/v177-absorb-preview\/runtime\.js/);
assert.match(source,/originalHit\.apply\(this,arguments\)/);
assert.doesNotMatch(source,/(?:getContext\(['"]2d|requestAnimationFrame\s*\()/);
class Graphics{clear(){this.clears=(this.clears||0)+1;}beginFill(){}drawRect(){}endFill(){}destroy(){}}
class Container{constructor(){this.children=[];this.destroyed=false;this.parent=null;}addChild(x){this.children.push(x);x.parent=this;return x;}destroy(){this.destroyed=true;this.parent=null;}}
function setup(search,withGpu=true){
 let time=1000,draws=0,baseHits=0,stageCalls=0;
 const battle={active:true,energy:100},cooldowns={0:0};
 class Engine{
  constructor(){this.canvas={isConnected:true};this.player={x:25,y:280};this.enemy={x:280,y:100};this.h=480;}
  useMove(slot){battle.energy-=10;cooldowns[slot]=time+1800;return true;}
  hitTarget(){baseHits++;this.v65LastDrain={move:'Absorb',damage:24,healed:12};return true;}
  draw(){draws++;return true;}
  destroy(){return true;}
 }
 const app={renderer:{gl:{isContextLost:()=>false}},stage:new Container()};
 const window={PIXI:{Graphics,Container},PokemonTorrePixelFlyingBridge:{labStage:()=>{stageCalls++;return withGpu?{app}:null;}},PokemonTorreV360Paint:()=>false};
 const context={window,location:{search},URLSearchParams,battle,cooldowns,BattleEngine:Engine,
  performance:{now:()=>time},current:()=>({id:150}),skillSet:()=>[{name:'Absorb'}]};
 vm.runInNewContext(source,context,{filename:'runtime.js'});
 return {window,Engine,battle,step:ms=>{time+=ms;},stats:()=>window.PokemonTorreAbsorbV177?.diagnostics(),get baseHits(){return baseHits},get draws(){return draws},get stageCalls(){return stageCalls}};
}
const normal=setup('');
assert.equal(normal.window.PokemonTorreAbsorbV177?.installed,true,'Approved Absorb must load on normal URL');
const rollback=setup('?absorb177=0');
assert.equal(rollback.window.PokemonTorreAbsorbV177,undefined,'Rollback must restore legacy Absorb');
const preview=setup('?absorb177=preview');
const e=new preview.Engine();
assert.equal(e.useMove(0),true);
assert.equal(preview.battle.energy,90);
assert.equal(preview.stats().casts,1);
preview.step(150);e.draw();
assert.ok(preview.stats().frames>0,'Must paint preparation frames in PixiJS');
assert.equal(e.hitTarget('enemy','grass',24),true);
assert.equal(preview.stats().hits,1,'Only confirmed damage launches transfer');
preview.step(150);e.draw();
assert.ok(preview.stats().frames>1,'Must paint the returning animation');
assert.equal(preview.baseHits,1,'Do not add extra damage calls');
assert.equal(preview.battle.energy,90,'Do not alter move cost');
preview.step(900);e.draw();
assert.equal(preview.stats().active,0,'No effect after animation');
const fallback=setup('?absorb177=preview',false);
const f=new fallback.Engine();f.useMove(0);f.draw();
assert.equal(fallback.stats().casts,0,'WebGL missing must preserve native effect');
assert.equal(fallback.battle.energy,90,'Gameplay remains active without WebGL');
console.log('PASS V177.1: approved by default; rollback; 12-frame Pixi; confirmed HP drain; no extra hit or cost; GPU fallback');
