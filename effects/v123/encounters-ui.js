/* V123 route UI matches new five-encounter limit; native rarity odds preserved. */
(()=>{
'use strict';
const key=()=>save.gym+'-'+save.stage,used=()=>Math.max(0,Number(save.routeUsed?.[key()]||0));
function updateRoute(){
 if(battle?.active||save.gym>=8)return;
 const remain=Math.max(0,5-used()),b=document.getElementById('grassBtn');
 if(b)b.disabled=save.stage<1||save.stage>v29TrainerCount(save.gym)||remain<=0||
  ((save.balls||0)+(save.superBalls||0)+(save.ultraBalls||0))<=0;
 const line=document.querySelector('.grass .grassText span');
 if(line&&save.stage>=1&&save.stage<=v29TrainerCount(save.gym))
  line.textContent='151 Pokémon de Kanto por região. '+remain+' de 5 encontros disponíveis nesta etapa.';
 const label=document.querySelector('.v123WildCounter');
 if(label)label.textContent='🌾 Encontros desta etapa: '+used()+'/5';
}
const oldRender=render;
render=function(){const out=oldRender.apply(this,arguments);updateRoute();return out;};
const oldOdds=v27ShowOdds;
v27ShowOdds=function(){
 const out=oldOdds.apply(this,arguments),remain=Math.max(0,5-used());
 const panel=document.querySelector('#modal .v27OddsList');
 const p=panel?.parentElement?.querySelector('.desc');
 if(p)p.textContent='Probabilidade real por espécie. '+remain+' de 5 encontros restantes nesta parada.';
 const button=document.getElementById('v27CatchFromOdds');
 if(button){
  const allowed=save.gym<8&&save.stage>=1&&save.stage<=v29TrainerCount(save.gym)&&remain>0&&
    ((save.balls||0)+(save.superBalls||0)+(save.ultraBalls||0))>0;
  button.disabled=!allowed;
  button.onclick=()=>{if(!allowed)return;close();grassEncounter();};
 }
 return out;
};
const oldCatch=finishCapture;
finishCapture=function(){
 const active=!!battle?.active,out=oldCatch.apply(this,arguments);
 if(active){
  const s=save.v123Stats;
  if(!s||typeof s!=='object')save.v123Stats={
    created:Date.now(),trainers:0,wildWins:0,rareSeen:0,
    eliteWins:{},eliteLosses:{},gymWins:{},gymLosses:{},towerWins:0,towerLosses:0,
    captures:0,potionsUsed:0,centres:0,rewards:0,events:[]
  };
  save.v123Stats.captures=(Number(save.v123Stats.captures)||0)+1;
  persist();
 }
 return out;
};
window.PokemonTorreRoutesV123={installed:true,official:true,encountersPerStop:5};
})();