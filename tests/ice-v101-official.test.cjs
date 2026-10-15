'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const files=['effects/moves/v101-ice-official/runtime.js',
 'effects/moves/aurora-beam/v101-approved/render.js',
 'effects/moves/catalog/impactoglacial/v101-approved/render.js',
 'effects/moves/raio-de-gelo/v101-approved/render.js'];
const names=['Aurora Beam','Impacto Glacial','Raio de Gelo','Ice Beam'];
const keys=['aurorabeam','impactoglacial','raiodegelo','raiodegelo'];
const counts={},frames=[16,12,12,12];
const ctx={save(){},restore(){},translate(){},rotate(){},beginPath(){},
 lineTo(){counts.lines=(counts.lines||0)+1},moveTo(){},ellipse(){},arc(){},
 closePath(){},stroke(){counts.strokes=(counts.strokes||0)+1},
 fill(){counts.fills=(counts.fills||0)+1},globalAlpha:1};
let now=2000,battle={active:true,paused:false,energy:100};
const cooldowns=[0,0,0,0],slots=names.map(name=>({name,type:'ice',cost:0,kind:'beam'}));
class BattleEngine{
 constructor(){this.canvas={isConnected:true};this.ctx=ctx;this.h=450;
  this.player={x:115,y:280};this.enemy={x:480,y:140,r:28,hp:300};
  this.v359Attacks=[];this.projectiles=[];this.particles=[];this.rings=[];}
 useMove(i){battle.energy-=10;cooldowns[i]=now+950;
  this.projectiles.push({from:'player',move:slots[i].name});
  this.v359Attacks.push({move:slots[i],at:now,duration:1200,times:[.66]});
  return true;}
 draw(){return true;}
 drawProjectile(){counts.old=(counts.old||0)+1;}
}
const window={},location={search:'?build=v101-approved-ice',hostname:'unit.test'};
const vmEnv=vm.createContext({window,location,URLSearchParams,BattleEngine,
 performance:{now:()=>now},battle,current:()=>({id:150}),skillSet:()=>slots,
 cooldowns,stopTimers:()=>{},Math,console});
for(const p of files)vm.runInContext(fs.readFileSync(p,'utf8'),vmEnv,{filename:p});
const fx=window.PokemonTorreIceV101;
assert.ok(window.PokemonTorreIceOfficialV101?.enabled);
assert.deepEqual(Array.from(fx.diagnostics().registered,v=>v.name),
 ['Aurora Beam','Impacto Glacial','Raio de Gelo']);
assert.equal(fx.canonicalKey('Ice Beam'),'raiodegelo');
assert.equal(fx.canonicalKey('Raio Congelante'),'raiodegelo');
assert.equal(fx.canonicalKey('Raio Aurora'),'aurorabeam');
const game=new BattleEngine();
for(let i=0;i<names.length;i++){
 now=2000+i*3000;battle.energy=100;
 const before=fx.diagnostics().draws;
 game.useMove(i);
 const attack=game.v359Attacks.at(-1),projectile=game.projectiles.at(-1);
 assert.equal(attack.times[0],.66,'Native HP impact time must not change');
 assert.equal(projectile.__ice99VisualOnlyHidden,true,'Hide only old projectile artwork');
 assert.ok(game.projectiles.includes(projectile),'HP-bearing projectile preserved');
 const dur=fx.current(game,attack.at).duration;
 assert.ok(dur>900,'Full animated sequence must remain visible');
 for(let k=0;k<frames[i];k++){
  now=attack.at+(k+.4)*dur/frames[i];
  game.draw(now);
  assert.equal(fx.diagnostics().last.name,i===3?'Raio de Gelo':names[i]);
 }
 assert.equal(fx.diagnostics().draws-before,frames[i]);
 assert.ok(fx.diagnostics().drawsPerMove[keys[i]]>0);
 game.drawProjectile(projectile);
 assert.equal(counts.old||0,0,'No generic ball over unique ice');
 game.projectiles.length=0;
}
assert.ok(counts.lines>100&&counts.strokes>100,'Animated strokes and outlines');
battle.active=false;assert.equal(fx.current(game),null,'No effects after battle');
const index=fs.readFileSync('index.html','utf8');
for(const p of files)assert.ok(index.includes(p),'Production module missing '+p);
assert.ok(index.includes("Iniciando Pokémon Torre V101"));
assert.ok(index.includes("get('battle_preview')==='ice99'"));
const approved=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
for(const name of ['Aurora Beam','Impacto Glacial','Raio de Gelo'])
 assert.ok(approved.moves.find(x=>x.move===name&&x.protect),'Approved V99 art must be protected');
assert.ok(fs.readFileSync('effects/ui/move-dedup-v100.js','utf8')
 .includes("['Raio de Gelo','Ice Beam','Raio Congelante']"));
console.log('PASS V101: four casts / three unique approved ice FX; alias compatibility; 52 poses; no change to native hits');
