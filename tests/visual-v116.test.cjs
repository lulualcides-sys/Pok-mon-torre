'use strict';
/* V116 is opt-in; confirm official V115 is untouched and sprite-only effects. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('effects/pokemon/visual-preview-v116.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const standard=JSON.parse(fs.readFileSync('effects/pokemon/VISUAL_STANDARD.json','utf8'));
assert.equal(standard.global_rollout.approval,'aprovado');
assert.equal(standard.global_rollout.protect,true);
assert.equal(standard.pilot.approval,'aprovado');
assert.ok(index.includes("get('pokemon_visual_preview')==='v116'"));
assert.ok(source.includes('V95 Mewtwo'));
assert.ok(!source.includes('BattleEngine.prototype.useMove'));
assert.ok(!source.includes('hitTarget('));
assert.ok(!source.includes('.hp='));
assert.ok(!source.includes('hue-rotate'));
const base=Object.freeze({current:{id:25,shiny:false},enemy:{id:143,shiny:false}});
function setup(query){
 const calls=[],data={...base,current:{...base.current},enemy:{...base.enemy}};
 const ctx={drawImage(img,...args){calls.push({img,args})},save(){},restore(){}};
 const native=ctx.drawImage;
 const battle={active:true,v3559PlayerEntryUntil:0,v3559EnemyEntryUntil:0};
 class BattleEngine{
  constructor(){this.ctx=ctx;this.h=500;this.player={x:140,y:200,flash:0};this.enemy={x:380,y:200,flash:0};}
  drawMon(actor,id,enemy,now){
   ctx.drawImage({src:'existing-pokemon-sprite'},5,7,24,24,actor.x-12,actor.y-20,24,24);
   return id+now;
  }
 }
 const window={};
 const sandbox={BattleEngine,window,location:{hostname:'testhost',search:query},URLSearchParams,
   current:()=>data.current,foe:()=>data.enemy,battle,Math,Number,Set,Map,console};
 vm.runInNewContext(source,sandbox,{filename:'visual-preview-v116.js'});
 return {window,ctx,native,calls,engine:new BattleEngine(),data,battle};
}
let off=setup('');
assert.equal(off.window.PokemonTorreVisualPreviewV116,undefined,'V116 must not run in official game');
off.engine.drawMon(off.engine.player,25,false,1000);
assert.equal(off.calls.at(-1).args[4],140-12,'baseline original untouched');
let p=setup('?pokemon_visual_preview=v116');
const api=p.window.PokemonTorreVisualPreviewV116;
assert.equal(api.previewOnly,true);
assert.equal(api.scaleFor(25),.865);assert.equal(api.scaleFor(95),1.27);
assert.equal(api.scaleFor(150),1);
const pik=p.engine.player;
const originalValue=p.engine.drawMon(pik,25,false,1000);
assert.equal(originalValue,1025,'no original logic changes');
const args=p.calls.at(-1).args;
assert.equal(args[6],24*.865,'Pikachu should be visually smaller');
assert.equal(args[7],24*.865);
assert.ok(Math.abs((args[5]+args[7])-(pik.y-20+24))<1e-9,'feet should remain aligned');
assert.equal(p.ctx.drawImage,p.native,'canvas method must restore');
const mewtwoCount=p.calls.length;
p.engine.drawMon(pik,150,false,1050);
assert.equal(p.calls.length,mewtwoCount+1);
assert.equal(p.calls.at(-1).args[6],24,'approved Mewtwo V95 size untouched');
p.engine.drawMon(pik,95,false,1100);
assert.equal(p.calls.at(-1).args[6],24*1.27,'Onix should be larger');
pik.flash=.13;
p.engine.drawMon(pik,25,false,1200);
const knocked=p.calls.at(-1).args;
assert.ok(knocked[4] < pik.x-12+(24-24*.865)/2-5,'physical recoil away from enemy');
assert.ok(api.diagnostics().maxRecoil>5,'hit reaction must be visible');
assert.ok(api.diagnostics().noHitboxChanges);
assert.equal(pik.x,140);assert.equal(pik.y,200);
p.data.current.shiny=true;
p.battle.v3559PlayerEntryUntil=3500;
p.engine.drawMon(pik,25,false,2000);
assert.equal(p.battle.v3559PlayerEntryUntil,3500,'do not extend entrance stars');
p.battle.v3559PlayerEntryUntil=4200;
p.engine.drawMon(pik,25,false,2000);
assert.equal(p.battle.v3559PlayerEntryUntil,3500,'native shiny stars limited to 1.5s');
assert.ok(api.diagnostics().shinyDraws>=2);
assert.equal(api.diagnostics().shinyEntranceCorrections,1);
assert.ok(api.diagnostics().species.includes(25)&&api.diagnostics().species.includes(95));
assert.ok(api.diagnostics().sizeClasses.length>=2);
assert.equal(api.diagnostics().errors.length,0);
console.log('PASS V116 preview: official V115 protected, scales preserve feet, shiny palette untouched and 1.5s star duration, damage recoil sprite only; Mewtwo original preserved');
