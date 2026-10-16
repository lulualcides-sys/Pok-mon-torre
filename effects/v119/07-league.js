/* V119 · Kanto Elite Four/Champion finish without resetting gym/league saves.
 * Base game already has Lorelei, Bruno, Agatha, Lance & Blue (stages 8-12).
 */
(()=>{
'use strict';
if(new URLSearchParams(location.search).get('kanto119')!=='1')return;
const champs=['Lorelei','Bruno','Agatha','Lance','Blue'],stats={previews:0,victories:0,championships:0};
const prevStart=startBattle;
startBattle=function(enemies,label,wild){
 const league=!wild&&save.gym>=8&&save.gym<=12&&
  /LIGA|LORELEI|BRUNO|AGATHA|LANCE|BLUE|CAMPEÃO/i.test(String(label||''));
 const step=Math.min(4,Math.max(0,save.gym-8));
 const ret=prevStart.apply(this,arguments);
 if(league&&battle?.active){
  battle.v119LeagueFoe=champs[step];
  const heading=document.querySelector('.battleHeading');
  if(heading&&!heading.querySelector('[data-v119-league]')){
   const element=document.createElement('div');
   element.dataset.v119League='yes';
   element.style.cssText='padding:7px 10px;margin-top:6px;font-size:11px;line-height:1.5;color:#fff0c8;background:#152638;border:1px solid #ba9852;border-radius:9px';
   element.textContent=(step===4?'🏆 CAMPEÃO ':'🏅 ELITE FOUR ')+champs[step]+
    ' · '+(battle.enemies.length+1)+' Pokémon · Nível crescente';
   heading.append(element);stats.previews++;
  }
 }
 return ret;
};
const prevFinish=finishBattle;
finishBattle=function(win){
 const b=battle,isLeague=!!b?.v119LeagueFoe,name=b?.v119LeagueFoe;
 const result=prevFinish.apply(this,arguments);
 if(isLeague&&win){
  if(!save.v119LeagueHistory||typeof save.v119LeagueHistory!=='object')
   save.v119LeagueHistory={victories:{},championships:0};
  const history=save.v119LeagueHistory;
  history.victories[name]=(history.victories[name]||0)+1;stats.victories++;
  if(name==='Blue'){history.championships++;stats.championships++;}
  persist();
 }
 return result;
};
const prevLeague=v27RenderLeague;
v27RenderLeague=function(){
 const ret=prevLeague.apply(this,arguments);
 const root=document.querySelector('#main .v27League');
 if(root){
  const data=save.v119LeagueHistory||{victories:{},championships:0};
  if(!root.querySelector('[data-v119-league-record]')){
   const header=document.createElement('p');header.dataset.v119LeagueRecord='yes';
   header.style.cssText='font-size:12px;margin:10px 14px;color:#ffe5a8';
   header.textContent='🏆 Títulos: '+data.championships+' · Vitórias na Liga: '+
    Object.values(data.victories).reduce((a,b)=>a+(Number(b)||0),0);
   root.append(header);
  }
 }
 return ret;
};
window.PokemonTorreLeagueV119=Object.freeze({installed:true,previewOnly:true,champs,
 diagnostics:()=>({...stats,stages:champs.length,savesPreserved:true})});
})();