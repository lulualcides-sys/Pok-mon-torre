'use strict';
/* V130: 4 animated Ground previews, no fake PNG and no gameplay mutation. */
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const root='effects/moves/v130-ground-preview/';
const dirs=['mud-slap','bone-club','mud-shot','earth-power'];
const scripts=['runtime.js',...dirs.map(x=>x+'/index.js')];
const source=scripts.map(x=>fs.readFileSync(root+x,'utf8'));
for(let i=0;i<source.length;i++)assert.doesNotThrow(()=>new vm.Script(source[i],{filename:scripts[i]}));
const index=fs.readFileSync('index.html','utf8');
for(const script of scripts)assert.ok(index.includes(root+script),'missing preview module '+script);
assert.ok(index.includes("get('ground130')==='preview'"),'V130 must load only when requested');
assert.ok(!source.join('\n').match(/drawImage\s*\(|new Image\s*\(|\.png\b|document\.createElement\s*\(|\.innerHTML\s*=/),'no static images, external atelier or alternate DOM output');
const normal=['Mud-Slap','Bone Club','Mud Shot','Earth Power']; 
const names=['Tapa de Lama','Osso','Mud Shot','Poder Terrestre'];
const skills=names.map((name,i)=>({name,type:'ground',power:[16,28,28,31][i],cost:[0,19,18,18][i],cd:[1100,2300,1400,1400][i],kind:'projectile'}));
const active={active:true,paused:false,energy:100},owner={id:150,hp:100},enemy={id:1,hp:300};
const ops={count:0,shapes:0,drawHits:0};
const g=new Proxy({globalAlpha:1}, {get(obj,k){if(k in obj)return obj[k];if(k==='beginPath')return ()=>{ops.shapes++;};
 return (...args)=>{ops.count++;};},set(obj,k,v){obj[k]=v;return true;}});
let slot=0,oldPaint=0;const now=()=>1000;
class BattleEngine{
 constructor(){this.player={x:110,y:250,r:34};this.enemy={x:340,y:242,r:35};this.h=440;this.ctx=g;this.canvas={isConnected:true};this.v359Attacks=[];this.hits=0;this.energy=100;this.running=true;}
 useMove(i){
  const s=skills[i],moment=now();
  active.energy-=s.cost;
  this.v359Attacks.push({move:s,at:moment,end:moment+680,duration:680,battle:active,owner,target:enemy,hits:0,times:[.64],from:[110,192],to:[340,186]});
  return true;
 }
 update(clock){
  for(const fx of this.v359Attacks){
   if(fx.hits<1&&clock>=fx.at+fx.duration*fx.times[0]){
    fx.hits++;this.hits++;enemy.hp-=fx.move.power;
   }
  }
 }
}
function setup(search){
 const window={PokemonTorreV360Paint:()=>{oldPaint++;return false;}};
 const state={window,BattleEngine,battle:active,current:()=>owner,foe:()=>enemy,
  skillSet:()=>skills,location:{search},URLSearchParams,performance:{now},console};
 for(let i=0;i<source.length;i++)vm.runInNewContext(source[i],state,{filename:scripts[i],timeout:3000});
 return {window,state};
}
assert.equal(setup('').window.PokemonTorreGroundV130,undefined,'default game must preserve originals');
assert.equal(setup('?ground130=preview&safe=1').window.PokemonTorreGroundV130,undefined,'safe fallback must work');
const {window}=setup('?ground130=preview');
const v130=window.PokemonTorreGroundV130;
assert.equal(v130.previewOnly,true);
assert.equal(v130.diagnostics().registered.length,4);
const engine=new BattleEngine();
for(let i=0;i<4;i++){
 slot=i;
 assert.equal(engine.useMove(i),true,'cast accepted');
 const fx=engine.v359Attacks.at(-1);
 const prevHits=engine.hits,prevHp=enemy.hp;
 assert.ok(fx.duration>=1100&&fx.duration<=1600,'extended animation has bounded frames');
 assert.equal(fx.end,fx.at+fx.duration,'V359 cleanup end synced');
 for(const t of [.025,.10,.22,.37,.50,.62,.64,.74,.86,.95,.99]){
  assert.equal(window.PokemonTorreV360Paint(g,fx,fx.at+fx.duration*t,engine),true,'preview drew '+skills[i].name+' at '+t);
 }
 assert.equal(engine.hits,prevHits,'visuals must never hit');
 assert.equal(enemy.hp,prevHp,'visuals must not change HP');
 engine.update(fx.at+fx.duration*.63);
 assert.equal(engine.hits,prevHits,'hit must not occur before visible impact');
 engine.update(fx.at+fx.duration*.65);
 engine.update(fx.at+fx.duration*.96);
 assert.equal(engine.hits,prevHits+1,'exactly one native hit per cast');
 assert.equal(enemy.hp,prevHp-skills[i].power,'native damage preserved');
}
assert.ok(ops.shapes>35&&ops.count>150,'actual multi-frame dynamic geometry drawn');
assert.equal(v130.diagnostics().errors.length,0);
assert.equal(v130.diagnostics().casts,4);
assert.equal(v130.diagnostics().draws,44);
assert.equal(v130.diagnostics().hitChanges,4);
const registered=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
const fissure=registered.moves.find(x=>x.move==='Grande Fissura');
assert.equal(fissure?.status,'aprovado');
assert.equal(fissure?.protect,true);
for(const n of names.filter(n=>n!=='Osso'))assert.ok(!registered.moves.some(x=>x.move===n),'unapproved preview move must not claim approval');
assert.equal(registered.moves.find(x=>x.move==='Osso')?.status,'aprovado','V132 official Osso does not approve the older V130 artwork');
for(const n of ['Withdraw','Cauda de Água','Pulso de Água'])
 assert.equal(registered.moves.find(x=>x.move===n)?.status,'aprovado');
console.log('PASS V130: 4 animated gameplay previews, native one-hit timing, untouched energy/HP/cooldowns, approved Grande Fissura, no PNG/Atelier.');
