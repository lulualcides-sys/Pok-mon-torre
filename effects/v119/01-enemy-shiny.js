/* V119 · 1.00% per opposing Pokemon (wild, trainer, gym, League).
 * Single roll per opponent. Override the old 1–3% wild reroll, not additive.
 * No change to owned/Pokemon shiny chance or existing user save IDs.
 */
(()=>{
'use strict';
if(new URLSearchParams(location.search).get('kanto119')!=='1')return;
const rolls=new WeakMap();
const stats={odds:.01,rolls:0,shiny:0,wild:0,trainer:0,enemyEntries:0,forced:0};
function assign(mon,kind){
 if(!mon||typeof mon!=='object')return false;
 if(rolls.has(mon)){mon.shiny=rolls.get(mon);return mon.shiny;}
 const shiny=mon.v119ForcedShiny===true||Math.random()<.01;
 rolls.set(mon,shiny);
 mon.shiny=shiny;mon.shinyRoll=.01;
 stats.rolls++;if(shiny)stats.shiny++;stats[kind]++;
 return shiny;
}
function shown(){
 if(!battle?.active||!battle.foe)return;
 const enemy=battle.foe;
 if(enemy.shiny){
  if(!Array.isArray(save.v119ShinySeen))save.v119ShinySeen=[];
  if(!save.v119ShinySeen.includes(enemy.id)){save.v119ShinySeen.push(enemy.id);persist();}
  const title=document.getElementById('enemyTitle');
  if(title&&!title.querySelector('.v301ShinyFlag')){
   const tag=document.createElement('span');tag.className='v301ShinyFlag';tag.textContent='✦ SHINY';
   title.append(tag);
  }
 }
 stats.enemyEntries++;
}
const originalStart=startBattle;
startBattle=function(enemies,label,wild){
 const all=Array.isArray(enemies)?enemies:[];
 for(const e of all)assign(e,wild?'wild':'trainer');
 const result=originalStart.apply(this,arguments);
 // Legacy wild V30.1 can re-roll the same first monster: restore exact 1% result.
 for(const e of all)if(rolls.has(e))e.shiny=rolls.get(e);
 if(battle?.active)shown();
 return result;
};
const originalNext=nextFoe;
nextFoe=function(){
 const result=originalNext.apply(this,arguments);
 if(battle?.active&&battle.foe){assign(battle.foe,battle.wild?'wild':'trainer');shown();}
 return result;
};
window.PokemonTorreEnemyShinyV119=Object.freeze({
 installed:true,previewOnly:true,odds:.01,diagnostics:()=>({...stats})
});
})();