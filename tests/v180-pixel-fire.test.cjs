'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync('effects/moves/v180-pixel-fire/runtime.js','utf8');
const html=fs.readFileSync('index.html','utf8');
new vm.Script(src,{filename:'v180-pixel-fire/runtime.js'});
assert.match(html,/get\('fire180'\)==='preview'/);
assert.match(html,/get\('fire180'\)!=='preview'/);
assert.match(html,/effects\/moves\/v180-pixel-fire\/runtime\.js/);
assert.match(src,/FRAMES=16/);
assert.match(src,/const SIZES=\{stream:\[72,26\],projectile:\[40,30\],burst:\[72,72\]\}/);
assert.match(src,/five-flame star ONLY on hit/);
assert.match(src,/renderer\.generateTexture\(g,\{region:new P\.Rectangle\(0,0,w,h\),resolution:1\}\)/);
assert.match(src,/P\.SCALE_MODES\.NEAREST/);
assert.doesNotMatch(src,/getContext\s*\(|createElement\s*\(\s*['"]canvas|requestAnimationFrame/);
let created=0,rendered=0;
class G{beginFill(){return this}drawRect(){return this}endFill(){return this}destroy(){}clear(){}}
class Texture{constructor(){this.baseTexture={scaleMode:0}}destroy(){}}
class Sprite{constructor(t){this.texture=t;this.anchor={set:()=>{}};this.position={set:()=>{}};}
 destroy(){}}
class Container{constructor(){this.parent=null;this.children=[]}addChild(c){this.children.push(c);c.parent=this;return c}destroy(){this.parent=null}}
class Rectangle{constructor(x,y,w,h){this.x=x;this.y=y;this.width=w;this.height=h;}}
const Pixi={Graphics:G,Sprite,Container,Rectangle,SCALE_MODES:{NEAREST:0}};
function setup(search,{gpu=true}={}){
 let time=1000,hitCalls=0,legacy=0;
 const battle={energy:100,active:true},cd={0:0,1:0};
 const app={renderer:{gl:gpu?{isContextLost:()=>false}:null,
  generateTexture(g,{region}){assert.ok(region.width>=40&&region.height>=26);created++;return new Texture()}},stage:new Container()};
 class Engine{constructor(){this.canvas={isConnected:true};this.h=430;this.player={x:75,y:300};this.enemy={x:330,y:125,hp:140};}
 useMove(i){battle.energy-=10;cd[i]=time+1200;return true}
 hitTarget(who,type,power){hitCalls++;this.enemy.hp-=power;return true}
 draw(){rendered++;return true}destroy(){return true}}
 const e=new Engine(),win={PIXI:Pixi,PokemonTorrePixelFlyingBridge:{labStage:()=>gpu?{app}:null},
  PokemonTorreV360Paint:()=>false},kit={paint(){legacy++;return true}};
 vm.runInNewContext(src,{window:win,location:{search},URLSearchParams,
  BattleEngine:Engine,battle,cooldowns:cd,current:()=>({id:150}),foe:()=>e.enemy,
  skillSet:()=>[{name:'Flamethrower'},{name:'Fire Blast'}],
  performance:{now:()=>time},fireSpriteV41:kit
 },{filename:'v180-pixel-fire/runtime.js'});
 return{win,engine:e,battle,kit,advance:n=>{time+=n},
  stats:()=>win.PokemonTorreFireV180?.diagnostics(),get hits(){return hitCalls},
  get old(){return legacy}};
}
assert.equal(setup('').win.PokemonTorreFireV180,undefined,'normal play must preserve V172');
assert.equal(setup('?fire180=preview&safe=1').win.PokemonTorreFireV180,undefined);
const x=setup('?fire180=preview');
assert.equal(x.stats().approved,false,'no user approval yet');
for(let k=0;k<25;k++){x.advance(25);x.engine.draw();}
x.engine.useMove(0);x.advance(110);x.engine.draw();
assert.equal(x.stats().starts.flamethrower,1);
assert.equal(x.stats().active[0],'flamethrower');
const energy=x.battle.energy;
x.engine.hitTarget('enemy','fire',20);x.advance(100);x.engine.draw();
assert.equal(x.stats().confirmedImpacts,1);
assert.equal(x.battle.energy,energy,'energy must not be spent twice');
x.engine.useMove(1);x.advance(140);x.engine.draw();
assert.equal(x.stats().starts.fireblast,1);
assert.equal(x.stats().active[0],'fireblast');
x.kit.paint({}, {name:'Fire Blast'},1000,x.engine);
assert.ok(x.stats().oldVisualsHidden>=1,'no old fire sprites on top');
x.engine.hitTarget('enemy','Fire',25);x.advance(100);x.engine.draw();
assert.equal(x.stats().confirmedImpacts,2);
x.engine.hitTarget('enemy','fire',1);
assert.equal(x.stats().confirmedImpacts,2,'repeated hit must not trigger duplicated star');
assert.equal(x.engine.enemy.hp,94,'original native hit total must remain 46');
assert.equal(x.hits,3,'real damage exactly once per engine hit');
x.advance(1600);for(let k=0;k<30;k++){x.advance(24);x.engine.draw();}
assert.equal(x.stats().active.length,0,'battle should have no lingering fire overlay');
assert.equal(x.stats().prewarm,48,'three separate 16-frame pixel animation sets');
assert.equal(x.stats().contexts,1,'must use one shared WebGL stage');
assert.deepEqual([...x.stats().errors],[]);
const missing=setup('?fire180=preview',{gpu:false});
missing.engine.useMove(1);
assert.equal(missing.stats().starts.fireblast,0,'no fake fallback graphics');
missing.kit.paint({}, {name:'Fire Blast'},1000,missing.engine);
assert.equal(missing.old,1,'old Fire Blast renderer must survive missing GPU');
console.log('PASS V180: 16 original pixel frames per sequence; single PixiJS WebGL; Fire Blast 5-tip impact; continuous flame; native damage only; no overlay; fallback and rollback');
