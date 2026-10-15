'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const files=[
 'effects/moves/v99-ice-preview/runtime.js',
 'effects/moves/aurora-beam/v99-preview/render.js',
 'effects/moves/ice-beam/v99-preview/render.js',
 'effects/moves/catalog/impactoglacial/v99-preview/render.js',
 'effects/moves/raio-de-gelo/v99-preview/render.js'
];
const names=['Aurora Beam','Ice Beam','Impacto Glacial','Raio de Gelo'];
const frameCounts=[16,16,12,12],counts={};
const ctx={
 save(){},restore(){},translate(){},rotate(){},beginPath(){},
 lineTo(){counts.lines=(counts.lines||0)+1},moveTo(){},
 ellipse(){counts.ellipses=(counts.ellipses||0)+1},arc(){},
 closePath(){},stroke(){counts.strokes=(counts.strokes||0)+1},
 fill(){counts.fills=(counts.fills||0)+1},drawImage(){},
 globalAlpha:1
};
let now=2000,battle={active:true,paused:false,energy:100};
let cooldowns=[0,0,0,0],slots=names.map(name=>({name,type:'ice',cost:0,kind:'beam'}));
const win={},saved={};
class BattleEngine{
 constructor(){this.canvas={isConnected:true};this.ctx=ctx;
  this.h=450;this.player={x:115,y:280};this.enemy={x:480,y:140,r:28,hp:200};
  this.v359Attacks=[];this.projectiles=[];this.particles=[];this.rings=[];}
 useMove(i){battle.energy-=10;cooldowns[i]=now+950;
  this.projectiles.push({from:'player',type:'ice',move:slots[i].name});
  this.v359Attacks.push({move:slots[i],at:now,
   duration:1200,times:[.66],hits:0});
  return true;}
 draw(){return true;}
 drawProjectile(){counts.oldOrbs=(counts.oldOrbs||0)+1;}
}
const env={window:win,BattleEngine,URLSearchParams,location:{
 search:'?battle_preview=ice99',hostname:'unit.test'
},performance:{now:()=>now},battle,current:()=>({id:150}),
 skillSet:()=>slots,cooldowns,stopTimers:()=>{},Math,console};
const context=vm.createContext(env);
for(const path of files)vm.runInContext(fs.readFileSync(path,'utf8'),context,{filename:path});
const registered=Array.from(win.PokemonTorreIceV99.diagnostics().registered);
assert.deepEqual(registered.map(x=>x.name),names);
assert.deepEqual(registered.map(x=>x.frames),frameCounts);
const game=new BattleEngine();
for(let slot=0;slot<4;slot++){
 now=2000+slot*3000;battle.energy=100;
 const before=win.PokemonTorreIceV99.diagnostics().draws;
 game.useMove(slot);const visual=game.projectiles.at(-1);
 assert.equal(visual.__ice99VisualOnlyHidden,true,'Need suppress old orb for '+names[slot]);
 const event=game.v359Attacks.at(-1);
 assert.equal(event.times[0],.66,'Do not change hit event');
 const runtime=win.PokemonTorreIceV99;
 const collected=new Set();
 for(let i=0;i<frameCounts[slot];i++){
  now=event.at+((i+.4)/frameCounts[slot])*1250;game.draw(now);
  const d=runtime.diagnostics();
  assert.equal(d.last.name,names[slot]);collected.add(d.last.frame);
 }
 assert.equal(collected.size,frameCounts[slot],'Not enough animated poses for '+names[slot]);
 assert.equal(runtime.diagnostics().draws-before,frameCounts[slot]);
 game.drawProjectile(visual);
 assert.equal(counts.oldOrbs||0,0,'Old generic orb returned for '+names[slot]);
 assert.ok(game.projectiles.includes(visual),'Native projectile must remain in hit queue');
 // Expired visual must not restore generic ball for a tagged projectile.
 now=event.at+1750;game.draw(now);game.drawProjectile(visual);
 assert.equal(counts.oldOrbs||0,0);
 game.projectiles.length=0;
}
assert.ok(counts.lines>100&&counts.strokes>100,'Animation needs real shaped geometry');
assert.equal(win.PokemonTorreIceV99.diagnostics().draws,56);
game.enemy.hp=0;assert.equal(win.PokemonTorreIceV99.current(game),null);
assert.ok(!fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8')
 .includes('"Impacto Glacial"'), 'Preview must remain unapproved');
const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes("get('battle_preview')==='ice99'"));
assert.ok(index.includes(files[4]));
console.log('PASS V99: 4 unique real battle effects, 56 interpolated key poses, no generic orbs, no gameplay hit timing changes');
