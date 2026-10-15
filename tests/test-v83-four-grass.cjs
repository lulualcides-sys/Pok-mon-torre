'use strict';
/* V83 regression — four independent PixiJS attacks, native impact contact. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const index=read('index.html'),overlay=read('effects/moves/_runtime/pixi-layer.js'),
  end=read('effects/moves/_runtime/end.js'),
  renderer=read('effects/moves/v83-preview/render.js'),
  sync=read('effects/moves/v83-preview/impact-sync.js');
const moves=[
 ['Chicote de Vinha','chicote-de-vinha',4/8,4.25,1],
 ['Folha Navalha','folha-navalha',5/8,2.95,1],
 ['Chicotes em Área','chicotes-em-area',5/8,2.25,.67],
 ['Vine Whip','vine-whip',4/8,4.15,1]
];
assert.ok(index.includes("get('battle_preview')==='v83'"));
assert.ok(index.includes('fxFiles.splice(i+1,0,"effects/moves/v83-preview/render.js")'));
assert.ok(index.includes('effects/moves/v83-preview/impact-sync.js'));
assert.ok(index.includes('fxFiles[i]="effects/moves/v81-approved/render.js"'));
assert.ok(!renderer.includes('getContext(')&&!renderer.includes('<video'), 'Not a drawn canvas or static video');
assert.ok(overlay.includes('grassFourV83.animate(item,now,dt)'));
assert.ok(end.includes('grassFourV83.resolve(f?.move?.name||f?.name)'));
for(const [name,slug] of moves){
 const p=path.join(root,'effects/moves',slug,'v83-preview/sprites',slug+'.webp');
 const data=fs.readFileSync(p);
 assert.equal(data.toString('ascii',0,4),'RIFF',name);
 assert.equal(data.toString('ascii',8,12),'WEBP',name);
 assert.ok(data.length>12000,'Atlas too small: '+name);
}
class Container{
 constructor(){this.children=[];this.destroyed=false;this.visible=true;}
 addChild(...items){this.children.push(...items);return items[0];}
}
class Sprite{
 constructor(tex){this.texture=tex;this.anchor={set:()=>{}};this.position={set:(x,y)=>{this.x=x;this.y=y}};this.visible=false;this.alpha=1;}
}
class Texture{constructor(base,rect){this.baseTexture=base;this.frame=rect;}}
Texture.EMPTY={};
class Rectangle{constructor(x,y,w,h){Object.assign(this,{x,y,w,h});}}
const PIXI={Container,Sprite,Texture,Rectangle,Assets:{load:async()=>({
 baseTexture:{valid:true,width:3840,height:240}
})}};
const window={PIXI};
const ctx=vm.createContext({window,PIXI,console});
vm.runInContext(renderer,ctx);
const v83=vm.runInContext('grassFourV83',ctx);
assert.equal(window.PokemonTorreGrassFourPreviewV83.version,'83.1');
assert.ok(renderer.includes('sharedAtlasFrames'), 'Frames should be decoded once, not on each cast');
for(const name of ['Thunder','Discharge','Thunder Wave','Dragon Pulse','Aura Sphere','Leech Seed','Esporos','Chama Circular'])
 assert.equal(v83.resolve(name),'','Protected move intercepted '+name);
(async()=>{
 const app={stage:new Container(),screen:{width:640,height:370}};
 for(const [name,slug,impact,speed,heightScale] of moves){
  const key=v83.resolve(name),f={at:100,duration:1000,from:[110,165],to:[487,194],
   move:{name,type:'grass'}};
  const item=v83.install(app,f,key);
  assert.ok(item?.v83);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(item.frames.length,8);
  assert.equal(item.visualDuration,Math.max(400,f.duration)*speed);
  assert.equal(window.PokemonTorreGrassFourPreviewV83.timings.contacts[name],impact);
  assert.equal(window.PokemonTorreGrassFourPreviewV83.timings.speeds[name],speed);
  assert.equal(window.PokemonTorreGrassFourPreviewV83.timings.sizes[name],heightScale);
  const observed=[];
  for(let i=0;i<8;i++){
   v83.animate(item,100+(i+.5)*item.visualDuration/8,.016);
   observed.push(item.sprite.texture.frame.x);
   assert.ok(item.sprite.visible&&item.sprite.width>200);
   assert.ok(Math.abs(item.sprite.height/item.sprite.width-.5*heightScale)<.00001,
      name+' size lost battlefield proportions');
  }
  assert.deepEqual(observed,[0,480,960,1440,1920,2400,2880,3360]);
  assert.equal(v83.definitions[key].stages.length,8);
  if(name==='Folha Navalha'){
   assert.ok(item.blend,'Leaf blades need continuous Pixi interpolation');
   v83.animate(item,100+(2+.8)*item.visualDuration/8,.016);
   assert.equal(item.blend.visible,true,'Smooth transition should be drawn in between stages');
   assert.ok(item.blend.alpha>0&&item.blend.alpha<1,'Blend opacity must transition');
   assert.ok(v83.diagnostics().blendedFrames>0,'Blend must actually run');
   // Frames 5→6 transition must NOT leak the true damaging impact early.
   v83.animate(item,100+(4+.98)*item.visualDuration/8,.016);
   assert.equal(item.blend.visible,false,'Impact frame visible before HP changes');
  }else assert.equal(item.blend,null,'Only Folha Navalha requires double-sprite blend');
  assert.ok(v83.url(key).includes(slug+'/v83-preview/sprites/'+slug+'.webp'));
  v83.dispose(item);assert.equal(item.disposed,true);
 }
 class BattleEngine{
  constructor(){this.v359Attacks=[];this.v47MissingCollisions=[];this.v47ContactToLand=[];
   this.hitCount=0;}
  useMove(slot){
   const move=battle.actor.moves[slot];
   this.v359Attacks.push({move,at:100,duration:1000,end:1100,
    owner:battle.actor,target:battle.enemy,battle, times:[.59],hits:0});
   this.v47MissingCollisions.push({name:move.name,owner:battle.actor,victim:battle.enemy,at:780});
   return true;
  }
  update(now){
   for(const fx of this.v359Attacks){
    while(fx.hits<fx.times.length&&now>=fx.at+fx.duration*fx.times[fx.hits]){
     battle.enemy.hp-=fx.move.power;fx.hits++;this.hitCount++;
    }
   }
   for(const r of this.v47MissingCollisions){
    if(r.at<=now){battle.enemy.hp-=30;r.at=Infinity;this.hitCount++;}
   }
  }
 }
 const battle={active:true,paused:false,actor:{moves:moves.map(([name])=>({name,power:20}))},enemy:{hp:500}};
 const runtime=vm.createContext({BattleEngine,battle,current:()=>battle.actor,window});
 vm.runInContext(sync,runtime);
 for(let i=0;i<moves.length;i++){
  const engine=new BattleEngine(),[name,,ratio,speed]=moves[i];
  assert.equal(engine.useMove(i),true);
  const fx=engine.v359Attacks[0],when=100+1000*speed*ratio;
  assert.equal(fx.v83ImpactAt,when,'Wrong impact time '+name);
  assert.equal(fx.times.length,1,'Duplicate hits '+name);
  assert.equal(engine.v47MissingCollisions.length,0,'Legacy early hit '+name);
  assert.equal(fx.duration,1000,'Mechanical cooldown/cast changed');
  engine.update(when-1);
  assert.equal(battle.enemy.hp,500,'HP fell before visual contact: '+name);
  engine.update(when);
  assert.equal(battle.enemy.hp,480,'Hit not simultaneous with visual frame: '+name);
  engine.update(when+500);
  assert.equal(engine.hitCount,1,'Hit duplicated: '+name);
  battle.enemy.hp=500;
 }
 assert.equal(window.PokemonTorreGrassImpactV83().scheduled,4);
 assert.equal(window.PokemonTorreGrassImpactV83().version,'83.1');
 assert.ok(window.PokemonTorreGrassFourPreviewV83.timings.speeds['Chicote de Vinha']>
  window.PokemonTorreGrassFourPreviewV83.timings.speeds['Chicotes em Área']);
 assert.equal(window.PokemonTorreGrassFourPreviewV83.timings.sizes['Chicotes em Área'],.67);
 console.log('PASS V83.1: tuned timings, compact area height, smooth leaf blend, 32 Pixi RGBA frames, four native frame-perfect impacts, protected moves intact');
})().catch(e=>{console.error(e);process.exitCode=1});
