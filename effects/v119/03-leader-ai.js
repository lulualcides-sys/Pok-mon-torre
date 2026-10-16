/* V119 · leader-specific tactics, within original engine's attack logic.
 * Does not create damage, auto-win, override move VFX or move hitboxes.
 */
(()=>{
'use strict';
if(new URLSearchParams(location.search).get('kanto119')!=='1')return;
const profiles=[
 {name:'Brock',cadence:1.08,dodge:.92,pressure:.85,style:'Defensivo'},
 {name:'Misty',cadence:.91,dodge:1.10,pressure:1.1,style:'Ágil'},
 {name:'Lt. Surge',cadence:.84,dodge:1.02,pressure:1.18,style:'Ofensivo'},
 {name:'Erika',cadence:1.06,dodge:1.07,pressure:.94,style:'Controle'},
 {name:'Koga',cadence:.97,dodge:1.18,pressure:1.04,style:'Evasivo'},
 {name:'Sabrina',cadence:.89,dodge:1.12,pressure:1.12,style:'Psíquico'},
 {name:'Blaine',cadence:.87,dodge:.95,pressure:1.20,style:'Agressivo'},
 {name:'Giovanni',cadence:.92,dodge:1.05,pressure:1.15,style:'Chefe'}
];
const stats={frames:0,lowHpPhases:0,leagueFrames:0,last:null};
const oldUpdate=BattleEngine.prototype.update;
BattleEngine.prototype.update=function(dt,now){
 const ret=oldUpdate.apply(this,arguments);
 if(!battle?.active||battle.wild||!this.enemy||!Number.isFinite(dt))return ret;
 const gym=Number(save.gym);
 const isLeader=gym<8&&(battle.v30Boss||battle.v33Boss>=0&&battle.v33Boss<8||
   /LÍDER|LIDER|LEADER/.test(String(battle.label||'')));
 const isLeague=gym>=8&&gym<=12&&
   (/LIGA|LORELEI|BRUNO|AGATHA|LANCE|BLUE|RIVAL|CHAMPION/i.test(String(battle.label||''))||battle.v32Mode==='league');
 if(!isLeader&&!isLeague)return ret;
 const preset=isLeague?{name:['Lorelei','Bruno','Agatha','Lance','Blue'][Math.min(4,gym-8)],cadence:.91,dodge:1.08,pressure:1.12,style:'Liga'}:profiles[gym];
 if(!preset)return ret;
 const hp=foe()?.hp||0,cap=foe()?.maxHp||1,weak=hp>0&&hp/cap<.33;
 const scale=(Math.max(0,Math.min(.05,dt)))*.5;
 if(Number.isFinite(this.enemyAttackCD)&&this.enemyAttackCD>0)
  this.enemyAttackCD=Math.max(.20,this.enemyAttackCD+(preset.cadence-1)*scale);
 if(Number.isFinite(this.foeDodgeCD)&&this.foeDodgeCD>0)
  this.foeDodgeCD=Math.max(.18,this.foeDodgeCD+(1-preset.dodge)*scale);
 if(weak&&!battle.v119FinalPush){battle.v119FinalPush=true;stats.lowHpPhases++;
  this.enemy.focus=Math.max(this.enemy.focus||0,.35);
 }
 stats.frames++;if(isLeague)stats.leagueFrames++;
 stats.last={leader:preset.name,style:preset.style,lowHp:weak};
 return ret;
};
window.PokemonTorreLeadersV119=Object.freeze({installed:true,previewOnly:true,profiles,
 diagnostics:()=>({...stats,profiles:profiles.map(x=>({name:x.name,style:x.style}))})});
})();