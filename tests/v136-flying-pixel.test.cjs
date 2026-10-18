'use strict';
/* V136 protects all approvals and proves the FOUR Flying moves never use 2D painting.
 * Simulated battle/Cast checks Pixi-only texture mounting, hit clock and Roost heal.
 * Real spritesheet pixels are validated by tools/test-v136-flying-art.py in Pages CI.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const script=read('effects/moves/v136-flying-pixel/runtime.js');
const pixi=read('effects/moves/_runtime/pixi-layer.js'),index=read('index.html');
assert.doesNotThrow(()=>new vm.Script(script));
assert.ok(index.includes("get('flying136')!=='0'"),'normal URL must activate the new pixel art');
assert.ok(index.includes('effects/moves/v136-flying-pixel/runtime.js'));
assert.ok(index.includes('pixi.js@7.4.3')&&index.includes('@pixi/particle-emitter@5.0.10'));
assert.match(pixi,/function mountPixelFlying\(engine,fx,spec\)/);
assert.match(pixi,/new PIXI.Texture\(base,rect\)/);
assert.match(pixi,/PIXI.SCALE_MODES.LINEAR/);
assert.match(pixi,/new PIXI.particles.Emitter/);
assert.match(pixi,/updatePixelFlying\(now,dt\)/);
assert.match(pixi,/pixelFlying\.size/);
assert.match(pixi,/destroyPixelFlying\(fx\)/);
const nativeDraw=read('parts/p013.txt');
assert.ok(nativeDraw.includes("!window.PokemonTorreFlyingPixelV136?.hasMove?.(fx.move?.name)&&") &&
 nativeDraw.includes("!window.PokemonTorreFlyingOriginalV144?.hasMove?.(fx.move?.name)&&")&&
 nativeDraw.includes("!window.PokemonTorreFlyingLibreV145?.hasMove?.(fx.move?.name))speciesAura359(ctx,fx,now)"),
 'both V143 and V144 GPU sprites suppress old 2D species aura');
assert.ok(pixi.includes("window.PokemonTorreFlyingPixelV136?.hasMove?.(f?.move?.name||f?.name)"),
 'new Flying moves must suppress generic PIXI semantic effects too');
assert.ok(!/(\.beginPath|\.lineTo|\.arc\(|\.stroke\(|\.fill\(|drawImage\(|requestAnimationFrame\(|getContext\()/.test(script),
 'V136 runtime contains Canvas/geometry rather than GPU spritesheet');
const approved=JSON.parse(read('effects/moves/STATUS_APROVADOS.json')).moves;
assert.equal(approved.length,47);
for(const name of ['Osso','Grande Fissura','Garra de Areia','Soco de Terra','Lança de Areia','Fenda Rasa']){
 assert.equal(approved.find(x=>x.move===name)?.protect,true);
}
for(const name of ['Roost','Rajada','Air Slash','Bicada']){
 assert.ok(approved.some(x=>x.move===name&&x.status==='salvo'&&x.protect),'saved V143 Flying move is protected '+name);
}
const names=['Roost','Rajada','Air Slash','Bicada'];
const skills=names.map((name,i)=>({name,power:i?22+i*3:0,cost:10}));
const actor={hp:100},enemy={hp:400},battle={active:true,energy:200};
let mounts=0,draw2d=0;
const pixiFX={
 mountPixelFlying(engine,fx,spec){
  assert.ok(spec.loaded&&spec.image.naturalWidth===2048);
  assert.ok(spec.frames===16||spec.frames===20);
  mounts++;return true;
 }};
class ImageFake{
 naturalWidth=0;naturalHeight=0;complete=true;
 set src(v){
  this._src=v;
  this.naturalWidth=2048;
  this.naturalHeight=v.includes('roost')||v.includes('peck')?512:768;
  this.onload?.();
 }
 get src(){return this._src;}
}
class BattleEngine{
 constructor(){this.player={x:100,y:220};this.enemy={x:360,y:220};
  this.canvas={isConnected:true};this.v359Attacks=[];}
 useMove(i){
  const move=skills[i];battle.energy-=move.cost;
  this.v359Attacks.push({move,battle,at:1000,end:1700,duration:700,
    hits:0,times:[.64],from:[100,180],to:[360,180]});return true;
 }
 update(t){
  for(const fx of this.v359Attacks)if(!fx.hits&&t>=fx.at+fx.duration*fx.times[0]){
   fx.hits++;
   if(fx.move.name==='Roost')actor.hp+=25;else enemy.hp-=fx.move.power;
  }
 }
}
function setup(search){
 const window={PokemonTorreV360Paint:()=>{draw2d++;return false},
  PokemonTorrePixelFlyingBridge:pixiFX};
 const globals={Image:ImageFake,window,URLSearchParams,location:{search},BattleEngine,
  performance:{now:()=>1000},battle,skillSet:()=>skills,current:()=>actor,pixiFX,console};
 vm.runInNewContext(script,globals,{timeout:3000});
 return window;
}
assert.equal(setup('').PokemonTorreFlyingPixelV136?.officialLoad,true,
 'normal game must mount Pixi pixel effects by default');
assert.equal(setup('?flying136=0').PokemonTorreFlyingPixelV136,undefined,
 'explicit rollback must restore previous Flying renderer');
assert.equal(setup('?flying135=preview').PokemonTorreFlyingPixelV136,undefined,
 'old rejected V135 comparison must remain isolated');
assert.equal(setup('?flying136=pixel&safe=1').PokemonTorreFlyingPixelV136,undefined);
const window=setup('');
const plugin=window.PokemonTorreFlyingPixelV136;
assert.equal(plugin?.installed,true);
assert.equal(plugin?.previewOnly,false);
assert.equal(plugin?.officialLoad,true);
assert.equal(setup('?flying136=pixel').PokemonTorreFlyingPixelV136?.previewOnly,true);
assert.equal(plugin.hasMove('Air Slash'),true);
assert.equal(plugin.diagnostics().ready,4);
assert.deepEqual([...plugin.moves],names);
const engine=new BattleEngine();
for(let i=0;i<4;i++){
 const prior=new Set(engine.v359Attacks),hp=enemy.hp,own=actor.hp,energy=battle.energy;
 assert.equal(engine.useMove(i),true);
 const fx=engine.v359Attacks.find(x=>!prior.has(x));
 assert.equal(fx.duration,[1580,1390,1510,1150][i]);
 assert.equal(fx.end,fx.at+fx.duration);
 assert.equal(battle.energy,energy-10);
 // Throwing object proves we do NOT draw to 2D context on any frame.
 const forbidden2d=new Proxy({}, {get(){throw Error('Canvas 2D forbidden for V136')}});
 for(const t of [.06,.15,.32,.62,.67,.81,.92]){
  assert.equal(window.PokemonTorreV360Paint(forbidden2d,fx,fx.at+fx.duration*t,engine),true);
 }
 assert.equal(enemy.hp,hp);assert.equal(actor.hp,own);
 engine.update(fx.at+fx.duration*.63);
 assert.equal(enemy.hp,hp);assert.equal(actor.hp,own);
 engine.update(fx.at+fx.duration*.66);
 engine.update(fx.at+fx.duration*.96);
 assert.equal(enemy.hp,i?hp-skills[i].power:hp);
 assert.equal(actor.hp,i?own:own+25);
}
assert.ok(mounts>=4);
assert.equal(draw2d,0,'a rejected Canvas painter was called');
const foreign={move:{name:'Osso'},battle,at:1000,end:2000,times:[.64]};
assert.equal(window.PokemonTorreV360Paint({},foreign,1600,engine),false);
assert.equal(draw2d,1,'foreign approved V132 effect should delegate untouched');
battle.active=false;
const count=mounts;
assert.equal(window.PokemonTorreV360Paint({},engine.v359Attacks[1],1200,engine),true);
assert.equal(mounts,count,'no new GPU effect after battle');
console.log('PASS V137: pixel spritesheets now load on NORMAL URL, rollback works, PixiJS/Particle Emitter and native heal/hit intact; no 2D move painter.');
