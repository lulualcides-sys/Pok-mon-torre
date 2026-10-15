'use strict';
/* V84 checks actual independent frame sequences, PixiJS leaf movement,
 * compact area bounds, the native hit queue, and protected default effects.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const index=read('index.html'),render=read('effects/moves/v84-preview/render.js');
const sync=read('effects/moves/v84-preview/impact-sync.js');
const overlay=read('effects/moves/_runtime/pixi-layer.js'),
 end=read('effects/moves/_runtime/end.js');
assert.ok(index.includes("get('battle_preview')==='v84'"),'Dedicated V84 URL missing');
assert.ok(index.includes('effects/moves/v84-preview/render.js'));
assert.ok(index.includes('effects/moves/v84-preview/impact-sync.js'));
assert.ok(index.includes('fxFiles[i]="effects/moves/v81-approved/render.js"'));
assert.ok(overlay.includes('grassFourV84.animate(item,now,dt)'));
assert.ok(end.includes('grassFourV84.resolve(f?.move?.name||f?.name)'));
assert.ok(!render.includes('getContext(')&&!render.includes('<video>'),'No fake canvas/video stroke');
const moves=[
 ['Chicote de Vinha','chicote-de-vinha',5,4/8,.94],
 ['Folha Navalha','folha-navalha',2.25,5/8,.96],
 ['Chicotes em Área','chicotes-em-area',1.85,5/8,.82],
 ['Vine Whip','vine-whip',4.95,4/8,.94]
];
for(const [name,slug] of moves){
 const file=path.join(root,'effects/moves',slug,slug==='folha-navalha'?'v83-preview/sprites':'v84-preview/sprites',slug+'.webp');
 const bytes=fs.readFileSync(file);
 assert.equal(bytes.subarray(0,4).toString('ascii'),'RIFF');
 assert.equal(bytes.subarray(8,12).toString('ascii'),'WEBP');
 assert.ok(bytes.length>20000,name+' missing authored transparent sprite');
}
class Container{constructor(){this.children=[];this.visible=true;this.destroyed=false;}
 addChild(...child){this.children.push(...child);return child[0];}}
class Texture{constructor(base,rect){this.baseTexture=base;this.frame=rect;}} Texture.EMPTY={};
class Sprite{constructor(tex){this.texture=tex;this.anchor={set(){}};
 this.position={set:(x,y)=>{this.x=x;this.y=y}};this.visible=false;this.alpha=1;}}
class Rectangle{constructor(x,y,w,h){Object.assign(this,{x,y,w,h})}}
const PIXI={Container,Sprite,Texture,Rectangle,
 Assets:{load:async p=>p.includes('leaf.webp')?{baseTexture:{valid:true,width:64,height:64}}:
  {baseTexture:{valid:true,width:3840,height:240}}}};
const window={PIXI};
const ctx=vm.createContext({window,PIXI,console});
vm.runInContext(render,ctx);
const v84=vm.runInContext('grassFourV84',ctx);
assert.equal(v84.diagnostic().version,'84.2');
for(const n of ['Thunder','Discharge','Dragon Pulse','Aura Sphere','Leech Seed'])
 assert.equal(v84.resolve(n),'','Protected move intercepted: '+n);
(async()=>{
 const app={stage:new Container(),screen:{width:640,height:380}};
 for(const [name,slug,speed,impact,scale] of moves){
  const f={at:100,duration:1000,move:{name,type:'grass'},
   from:[120,170],to:[490,185]};
  const key=v84.resolve(name);
  const item=v84.install(app,f,key);
  await new Promise(resolve=>setImmediate(resolve));
  assert.ok(item.ready);
  assert.equal(item.frames.length,8);
  assert.equal(item.visualDuration,1000*speed);
  const coords=[];
  for(let i=0;i<8;i++){
   v84.animate(item,100+(i+.5)*item.visualDuration/8,.016);
   coords.push(item.sprite.texture.frame.x);
   assert.ok(item.sprite.visible);
  }
  assert.deepEqual(coords,[0,480,960,1440,1920,2400,2880,3360]);
  assert.equal(v84.diagnostic().timings.contacts[name],impact);
  assert.equal(v84.diagnostic().timings.speeds[name],speed);
  assert.equal(v84.diagnostic().timings.sizes[name].width,scale);
  if(name==='Folha Navalha'){
   assert.equal(item.leafSprites.length,14,'Continuous Pixi leaf sprites missing');
   const before=v84.diagnostic().leafMotion;
   v84.animate(item,100+.34*item.visualDuration,.016);
   assert.ok(v84.diagnostic().leafMotion>before,'Leaves do not really move between frames');
   // Never show damaging sprite before the exact impact frame.
   v84.animate(item,100+.62*item.visualDuration,.016);
   assert.equal(item.fade.visible,false,'Impact art appeared ahead of HP');
  }
  if(name==='Chicotes em Área')
   assert.ok(item.sprite.height<item.sprite.width*.34,'Area must be compact');
  assert.ok(v84.source(key).includes(slug+'/'+(slug==='folha-navalha'?'v83-preview':'v84-preview')+'/sprites/'));
  v84.dispose(item);
 }
 class BattleEngine{
  constructor(){this.v359Attacks=[];this.v47MissingCollisions=[];this.v47ContactToLand=[];this.hitCount=0;}
  useMove(slot){
   const m=battle.actor.moves[slot];
   this.v359Attacks.push({move:m,at:100,duration:1000,end:1100,
    owner:battle.actor,target:battle.enemy,battle,times:[.62],hits:0});
   this.v47MissingCollisions.push({name:m.name,owner:battle.actor,victim:battle.enemy});
   return true;
  }
  update(now){
   for(const fx of this.v359Attacks){
    while(fx.hits<fx.times.length&&now>=fx.at+fx.duration*fx.times[fx.hits]){
     battle.enemy.hp-=fx.move.power;fx.hits++;this.hitCount++;
    }
   }
  }
 }
 const battle={active:true,paused:false,
  actor:{moves:moves.map(([name])=>({name,power:20}))},enemy:{hp:300}};
 const run=vm.createContext({window,battle,current:()=>battle.actor,BattleEngine});
 vm.runInContext(sync,run);
 for(let i=0;i<moves.length;i++){
  const engine=new BattleEngine(),[name,,speed,ratio]=moves[i];
  assert.equal(engine.useMove(i),true);
  const fx=engine.v359Attacks[0],impactAt=100+1000*speed*ratio;
  assert.equal(fx.v84ImpactAt,impactAt,name);
  assert.equal(engine.v47MissingCollisions.length,0,name+' legacy early hit');
  engine.update(impactAt-1);assert.equal(battle.enemy.hp,300,name+' early HP');
  engine.update(impactAt);assert.equal(battle.enemy.hp,280,name+' not landed');
  engine.update(impactAt+999);assert.equal(engine.hitCount,1,name+' double hit');
  battle.enemy.hp=300;
 }
 assert.equal(window.PokemonTorreGrassImpactV84().scheduled,4);
 console.log('PASS V84: real separate Pixi frames, 14 moving Razor Leaves, smaller/faster Area, slowed vines, precise single native HP hits');
})().catch(error=>{console.error(error);process.exitCode=1});
