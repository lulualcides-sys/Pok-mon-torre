'use strict';
/* V104 — test the physical approach, impact and retreat of ALL Fighting moves,
 * without modifying non-Fighting approved effects or damage/save mechanics.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const files=['effects/moves/v103-fighting/runtime.js',
 'effects/moves/catalog/chute/v103/render.js',
 'effects/moves/catalog/golpedekarate/v103/render.js',
 'effects/moves/catalog/crosschop/v103/render.js',
 'effects/moves/catalog/brickbreak/v103/render.js',
 'effects/moves/v104-fighting/runtime.js',
 'effects/moves/catalog/chute/v104/render.js',
 'effects/moves/catalog/golpedekarate/v104/render.js',
 'effects/moves/catalog/crosschop/v104/render.js',
 'effects/moves/catalog/brickbreak/v104/render.js'];
for(const path of files)assert.ok(fs.existsSync(path),'missing '+path);
const index=fs.readFileSync('index.html','utf8'),core=fs.readFileSync('parts/p012.txt','utf8');
assert.ok(index.includes('v104-real-contact'));
for(const p of files.slice(5))assert.ok(index.includes(p),p);
assert.ok(core.includes('PokemonTorreFightingV104?.allowed'));
assert.ok(core.includes('if(window.PokemonTorreFightingV104?.allowed?.(fx?.move))return'));
const registry=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
for(const name of ['Chute','Golpe de Karatê','Cross Chop','Brick Break']){
 const row=registry.moves.find(x=>x.move===name);
 assert.equal(row?.version,'V104');assert.equal(row?.protect,true);
}
const names=['Chute','Golpe de Karatê','Cross Chop','Brick Break','Soco Dinâmico','Aura Sphere'];
function test(safe){
 let now=1000,hitCount=0,glow=0,oldGeneric=0,fireUses=0;
 const owner={id:150,hp:500},foeMon={id:143,hp:10000},
  battle={active:true,paused:false,energy:100};
 let cooldowns=[0,0,0,0],moves=[],last=null;
 const window={};
 const g={save(){},restore(){},beginPath(){},
  moveTo(){glow++},lineTo(){glow++},fill(){glow++},
  stroke(){glow++},closePath(){},rotate(){},translate(){}};
 class BattleEngine{
  constructor(){this.running=true;this.canvas={isConnected:true};this.ctx=g;
   this.h=560;this.w=900;this.player={x:200,y:300,r:46};
   this.enemy={x:610,y:300,r:45};this.v359Attacks=[];this.v47ContactToLand=[];
   this.v47MissingCollisions=[];this.v3580Visuals=[];}
  bounds(p){p.x=Math.max(50,Math.min(850,p.x));}
  useMove(slot){
   const move=moves[slot];
   if(!move||cooldowns[slot]>now||battle.energy<move.cost)return false;
   if(move.type==='fighting'){
    const d=Math.hypot(this.player.x-this.enemy.x,this.player.y-this.enemy.y);
    if(d>this.h*.245)return false; // V104 core physical range
   }
   fireUses+=(move.type==='fire'?1:0);
   battle.energy-=move.cost;cooldowns[slot]=now+move.cd;
   const evt={at:now,move,duration:540,times:[.64],end:now+540,
    owner,target:foeMon,battle,hits:0,kind:'contact'};
   this.v359Attacks.push(evt);
   if(move.type==='fighting')this.v47ContactToLand.push({owner,victim:foeMon,
    name:move.name,at:now+380,until:now+2500,hpBefore:foeMon.hp,settled:false});
   last=evt;
   return true;
  }
  update(dt,when){
   for(const e of this.v359Attacks){
    if(e.hits>=e.times.length||when<e.at+e.duration*e.times[e.hits])continue;
    const dist=Math.hypot(this.player.x-this.enemy.x,this.player.y-this.enemy.y);
    if(e.move.type==='fighting'&&dist>this.h*.245)throw Error('missed melee range at visual contact');
    this.hitTarget('enemy',e.move.type,e.move.power);
    e.hits++;
   }
  }
  hitTarget(who,type,power){if(who!=='enemy')return;
   foeMon.hp-=power;hitCount++;
  }
  draw(when){
   for(const evt of this.v359Attacks)
    if(evt.end>when)window.PokemonTorreV360Paint?.(g,evt,when,this);
  }
 }
 const sandbox={window,BattleEngine,location:{hostname:'ci.example',search:safe?'?safe=1':''},
  battle,cooldowns,performance:{now:()=>now},current:()=>owner,foe:()=>foeMon,
  skillSet:()=>moves,Math,console,URLSearchParams};
 vm.createContext(sandbox);
 sandbox.window.PokemonTorreV360Paint=()=>{oldGeneric++;return true};
 for(const file of files)vm.runInContext(fs.readFileSync(file,'utf8'),sandbox,{timeout:1500,filename:file});
 const api=sandbox.window.PokemonTorreFightingV104;
 assert.equal(api.diagnostics().registered.length,4);
 for(let j=0;j<names.length;j++){
  const name=names[j],style=api.styleOf(name);
  const monMove={name,type:'fighting',kind:name==='Aura Sphere'?'bolt':'dash',
   cat:'physical',power:37+j,cost:3,cd:600,level:1};
  moves=[monMove];cooldowns=[0];battle.energy=100;
  const e=new sandbox.BattleEngine();
  const initial=foeMon.hp;now=1000+j*4000;
  assert.equal(e.useMove(0),true);
  assert.equal(battle.energy,100,'approach must not charge before native cast');
  assert.equal(e.v359Attacks.length,0,'no projectile on approaching');
  let castTime=0,impactTime=0,impactDist=0,retreatedDist=0;
  for(let n=0;n<175;n++){
   now+=16;e.update(.016,now);e.draw(now);
   const ev=e.v359Attacks[0];
   if(ev&&!castTime){
    castTime=ev.at;impactTime=ev.at+ev.duration*ev.times[0];
    assert.equal(e.v47ContactToLand[0].at,impactTime,'native fallback synchronised');
    assert.ok(Math.hypot(e.player.x-e.enemy.x,e.player.y-e.enemy.y)>.19*e.h,
     'do not place sprites on top of one another');
   }
   if(ev&&Math.abs(now-impactTime)<18)impactDist=Math.hypot(e.player.x-e.enemy.x,e.player.y-e.enemy.y);
   if(ev&&now>=impactTime+360&&now<=impactTime+450)
    retreatedDist=Math.max(retreatedDist,Math.hypot(e.player.x-e.enemy.x,e.player.y-e.enemy.y));
  }
  assert.ok(castTime>1000+j*4000,'must walk first, then cast '+name);
  assert.ok(impactDist>.17*e.h&&impactDist<.25*e.h,'contact without overlap '+name);
  assert.ok(retreatedDist>impactDist+35,'recoil physically away from foe '+name);
  assert.equal(foeMon.hp,initial-monMove.power,'one authentic native hit for '+name);
  assert.equal(e.v359Attacks.length,1,'one native hit event per cast');
  assert.equal(hitCount,j+1,'no repeated hits');
  assert.equal(oldGeneric,0,'NO original projectile or generic VFX');
  assert.ok(api.diagnostics().draws[name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'')]>0,'animated '+name);
  assert.ok(style,'style '+name);
 }
 // Non-Fighting moves retain native mechanics and their own painter.
 moves=[{name:'Brasa',type:'fire',kind:'bolt',cat:'physical',power:23,cost:2,cd:100}];
 const e=new sandbox.BattleEngine();now=50000;
 assert.equal(e.useMove(0),true);
 assert.equal(fireUses,1);
 e.draw(now+5);assert.ok(oldGeneric>0);
 console.log('PASS V104 '+(safe?'SAFE':'NORMAL')+
  ' / all six melee spells approach, original HP, localized art, recoil, no generic projectile');
}
test(false);test(true);
