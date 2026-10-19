const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('effects/moves/v179-video-reference/runtime.js','utf8');
const index=fs.readFileSync('index.html','utf8');
new vm.Script(source,{filename:'V179-runtime.js'});
assert.match(index,/get\('fire179'\)==='preview'/);
assert.match(index,/get\('fire179'\)!=='preview'/);
assert.match(index,/v179-video-reference\/runtime.js/);
assert.ok(index.indexOf("v179-video-reference/runtime.js")>index.indexOf("v175-official/runtime.js"));
assert.doesNotMatch(source,/(getContext\s*\(\s*['"]2d|requestAnimationFrame\s*\()/);
assert.match(source,/Five burning star tips/,'Fire Blast must produce the five-point fire star from the video');
assert.match(source,/positionFlame/,'Flamethrower must connect source and target');
assert.match(source,/float lobes=/,'Flowing flame tongues must ripple down the stream');
assert.match(source,/const fly=f.hitAt\?1:ease\(\(elapsed-70\)\/620\)/,'Fire Blast should cross arena in a short natural travel time');
assert.match(source,/impactConsumed/,'Fire Blast impact must not restart repeatedly');
class Geometry{addAttribute(){return this}addIndex(){return this}destroy(){}}
class Shader{constructor(u){this.uniforms={...u}}static from(vert,frag,u){
 assert.match(vert,/projectionMatrix/);
 assert.match(frag,/gl_FragColor/);
 return new Shader(u);
}destroy(){}}
class Sprite{
 constructor(){this.position={set:(...a)=>{this.p=a}};this.pivot={set:()=>{}};this.destroyed=false;}
 destroy(){this.destroyed=true;}
}
class Mesh extends Sprite{constructor(g,s){super();this.shader=s;this.geometry=g;}}
class Container{
 constructor(){this.children=[];this.parent=null;this.destroyed=false;}
 addChild(c){c.parent=this;this.children.push(c);return c;}
 destroy(){this.destroyed=true;this.parent=null;}
}
function setup(search,{gpu=true}={}){
 let now=1000,hitCalls=0,legacyPaint=0;
 const battle={active:true,energy:100},cooldowns={0:0,1:0};
 const moves=[{name:'Flamethrower'},{name:'Fire Blast'}];
 class Engine{
  constructor(){this.canvas={isConnected:true};this.player={x:25,y:270};this.enemy={x:275,y:105,hp:140};this.h=430;this.ctx={};}
  useMove(slot){battle.energy-=10;cooldowns[slot]=now+1600;return true;}
  hitTarget(who,type,power){hitCalls++;if(who==='enemy')this.enemy.hp=Math.max(0,this.enemy.hp-power);return true;}
  draw(){return true;}
  destroy(){return true;}
 }
 const app={renderer:{gl:gpu?{isContextLost:()=>false}:null},stage:new Container()};
 const fireKit={paint(){legacyPaint++;return true;}};
 const win={
  PIXI:{Geometry,Shader,Mesh,Container,BLEND_MODES:{NORMAL:0}},
  PokemonTorrePixelFlyingBridge:{labStage:()=>gpu?{app}:null},
  PokemonTorreV360Paint:()=>false
 };
 let engine=new Engine();
 vm.runInNewContext(source,{
  window:win,location:{search},BattleEngine:Engine,
  battle,cooldowns,foe:()=>engine.enemy,current:()=>({id:150}),
  skillSet:()=>moves,performance:{now:()=>now},URLSearchParams,Float32Array,
  fireSpriteV41:fireKit
 },{filename:'V179-runtime.js'});
 return{win,Engine,battle,fireKit,engine,advance:t=>{now+=t},
  diagnostics:()=>win.PokemonTorreFirePairV179?.diagnostics(),
  get hitCalls(){return hitCalls},
  get legacyPaint(){return legacyPaint}};
}
const normal=setup('');
assert.equal(normal.win.PokemonTorreFirePairV179,undefined,'New visuals must not leak into normal game');
const safe=setup('?fire179=preview&safe=1');
assert.equal(safe.win.PokemonTorreFirePairV179,undefined,'safe=1 must disable preview');
const test=setup('?fire179=preview');
assert.ok(test.win.PokemonTorreFirePairV179?.installed);
test.engine.useMove(0);test.advance(250);test.engine.draw();
assert.equal(test.diagnostics().starts.flamethrower,1);
assert.equal(test.diagnostics().active[0],'flamethrower');
const firstEnergy=test.battle.energy;
test.engine.hitTarget('enemy','fire',20);test.advance(200);test.engine.draw();
assert.equal(test.diagnostics().confirmedImpacts,1);
assert.equal(test.hitCalls,1);
assert.equal(test.battle.energy,firstEnergy,'V179 must not charge extra energy');
test.engine.useMove(1);test.advance(200);test.engine.draw();
assert.equal(test.diagnostics().starts.fireblast,1);
assert.equal(test.diagnostics().active[0],'fireblast');
test.fireKit.paint({}, {name:'Fire Blast'},1000,test.engine);
assert.ok(test.diagnostics().suppressedOld>=1,'Classic Fire Blast canvas overlay must be removed in GPU preview');
test.engine.hitTarget('enemy','fire',25);test.advance(100);test.engine.draw();
assert.equal(test.diagnostics().confirmedImpacts,2);
assert.equal(test.hitCalls,2,'Native damage must happen exactly once per real hit');
assert.equal(test.engine.enemy.hp,95,'Damage must remain native');
test.engine.hitTarget('enemy','fire',1);
assert.equal(test.diagnostics().confirmedImpacts,2,'Repeated hits should not duplicate the visual explosion');
assert.equal(test.engine.enemy.hp,94,'Even a second native hit must remain under combat engine control');
test.advance(1800);test.engine.draw();
assert.deepEqual([...test.diagnostics().active],[],'Fire effects must clear after battle event');
const missing=setup('?fire179=preview',{gpu:false});
missing.engine.useMove(1);
assert.equal(missing.diagnostics().starts.fireblast,0,'GPU absence must retain old renderer');
missing.fireKit.paint({}, {name:'Fire Blast'},1000,missing.engine);
assert.equal(missing.legacyPaint,1,'Fallback V41 must continue to draw Fire Blast');
console.log('PASS V179: video-matched flame tongues, fire projectile and five-point star, single visual explosion, native hits, rollback and WebGL fallback');
