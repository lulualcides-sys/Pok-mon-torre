/* V123 mega-patch: campaign systems, records, arena and safe mobile options.
 * All V95-V122 approved moves remain untouched; native engine owns damage.
 */
(()=>{
'use strict';
if(window.PokemonTorreV123?.installed)return;
const key='pt-v123-lifetime';
const leaders=['Brock','Misty','Lt. Surge','Erika','Koga','Sabrina','Blaine','Giovanni','Lorelei','Bruno','Agatha','Lance','Blue'];
const read=()=>{try{return JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(_){return {}}};
const lifetime=Object.assign({resets:0,wins:0,losses:0,eliteVictories:0,championWins:0,bestStreak:0,streak:0,towerRecord:0,leaders:{},captures:0,rewards:0,centers:0},read());
let lastSave=save,tracked=0,slowCasts=0,lastCastAt=0;
const store=()=>{try{localStorage.setItem(key,JSON.stringify(lifetime))}catch(_){}};
function sync(){
 if(lastSave!==save){lifetime.resets++;lastSave=save;store();}
 if(!save.v123||typeof save.v123!=='object')save.v123={version:123,rewards:0,centerVisits:0};
 return save.v123;
}
function add(tag,parent,txt,fn){
 const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=txt;
 b.style.cssText='margin:5px;padding:9px 11px;font-size:12px;border-radius:9px';
 b.onclick=fn;parent.appendChild(b);return b;
}
function panel(){
 if(battle?.active)return;
 const host=document.querySelector('#main section')||document.querySelector('#main');
 if(!host||host.querySelector('.v123Hub'))return;
 const wrap=document.createElement('section');wrap.className='v123Hub';
 wrap.style.cssText='margin:15px 0;padding:14px;border:1px solid #61a9d877;border-radius:14px;background:#0b2236;color:#e8f8ff';
 const title=document.createElement('h3');title.textContent='🏆 Central da Torre · V123';title.style.margin='0 0 8px';
 const summary=document.createElement('p');summary.className='v123Stats';summary.style.cssText='font-size:12px;line-height:1.65;white-space:normal';
 const update=()=>{
 summary.textContent='Vitórias totais: '+(Number(save.wins)||0)+' (histórico: '+lifetime.wins+') · Derrotas: '+(Number(save.losses)||0)+
 ' · Resets: '+lifetime.resets+' · Elite Four vencida: '+lifetime.eliteVictories+
 ' · Blue derrotado: '+lifetime.championWins+' · Títulos salvos: '+(save.v119LeagueHistory?.championships||0)+
 ' · Maior sequência: '+lifetime.bestStreak+' · Recorde Torre Infinita: '+Math.max(lifetime.towerRecord,save.v32?.tower?.best||0)+
 ' · Centro Pokémon: '+lifetime.centers+' · Recompensas: '+lifetime.rewards;
 };
 update();wrap.append(title,summary);
 const row=document.createElement('div');row.style.cssText='display:flex;flex-wrap:wrap;gap:3px';wrap.append(row);
 add('heal',row,'✚ Centro Pokémon',()=>{
  if(battle?.active)return;
  const state=sync();const team=save.team||[];
  const injured=team.filter(m=>m?.hp>0&&m.hp<m.maxHp);
  if(!injured.length){alert('Equipe saudável. O Centro recupera Pokémon feridos que ainda estão conscientes.');return;}
  // Limited strategic healing: once per stage, no resurrection; native bag unchanged.
  const stage=save.gym+':'+save.stage;
  if(state.lastCenter===stage){alert('Centro Pokémon já utilizado nesta etapa.');return;}
  const heal=Math.max(0,Math.min(60,Number(save.coins)||0));
  if(heal<20){alert('O Centro custa 20 moedas.');return;}
  save.coins-=20;for(const m of injured)m.hp=Math.min(m.maxHp,m.hp+Math.max(12,Math.ceil(m.maxHp*.45)));
  state.lastCenter=stage;state.centerVisits++;lifetime.centers++;store();persist();update();
  alert('Equipe recuperada parcialmente! Custo: 20 moedas.');
 });
 add('report',row,'📊 Relatório completo',()=>{
  const history=save.v119LeagueHistory?.victories||{};
  const names=leaders.slice(8).map(x=>x+': '+(history[x]||lifetime.leaders[x]||0)).join(' · ');
  alert('Campanha '+(save.gym+1)+' / 13 · Vitórias '+(save.wins||0)+' · Derrotas '+(save.losses||0)+
 '\nResets: '+lifetime.resets+' · Elite Four: '+lifetime.eliteVictories+' · Blue: '+lifetime.championWins+
 '\nMaior sequência: '+lifetime.bestStreak+' · Torre: '+lifetime.towerRecord+
 '\nLiga: '+names+'\nCapturas registradas: '+lifetime.captures);
 });
 if(save.gym>=13)add('tower',row,'♾️ Torre Infinita',()=>{
  if(battle?.active)return;
  // V32 already implements the full challenge, boss floors and old save.
  if(typeof v32TowerMenu==='function')v32TowerMenu();
  else alert('A Torre Infinita existente não está disponível neste modo.');
 });
 host.appendChild(wrap);
}
function rewards(){
 const stage=sync();if(battle?.active||stage.pendingReward==null)return;
 const target=document.querySelector('#modal .result')||document.querySelector('#main section');
 if(!target||target.querySelector('.v123Reward'))return;
 const box=document.createElement('div');box.className='v123Reward';
 box.style.cssText='margin:10px;padding:12px;border:1px solid #ffd57b;border-radius:12px;background:#18344a;color:white';
 const title=document.createElement('b');title.textContent='🎁 Recompensa da etapa — escolha uma';
 box.appendChild(title);
 for(const [label,fn] of [
 ['💖 Recuperar HP',()=>{for(const m of save.team||[])if(m.hp>0)m.hp=Math.min(m.maxHp,m.hp+Math.ceil(m.maxHp*.27));}],
 ['⭐ Experiência',()=>{for(const m of save.team||[])if(m.hp>0)awardXP(m,15+Math.max(0,save.gym)*3);}],
 ['🪙 65 moedas',()=>{save.coins=(save.coins||0)+65;}]
 ])add('choice',box,label,()=>{if(stage.pendingReward==null)return;
  fn();delete stage.pendingReward;stage.rewards++;lifetime.rewards++;store();persist();box.remove();if(!battle?.active)render();
 });
 target.appendChild(box);
}
const originalStart=startBattle;
startBattle=function(enemies,label,wild){
 const state=sync();const tower=/TORRE INFINITA/.test(String(label));
 const result=originalStart.apply(this,arguments);
 if(battle?.active){battle.v123Mode=tower?'tower':'campaign';battle.v123Label=String(label||'');battle.v123BeforeGym=Number(save.gym);}
 return result;
};
const originalFinish=finishBattle;
finishBattle=function(win){
 if(!battle?.active)return originalFinish.apply(this,arguments);
 const mode=battle.v123Mode,label=battle.v123Label||'',gym=battle.v123BeforeGym;
 const wild=!!battle.wild,legacyTower=battle.v32Mode==='tower'||/♾️ TORRE · ANDAR/.test(label);
 const special=battle.v33Type==='lab'||battle.v33Type==='legendary';
 const state=sync(),tower=mode==='tower'||legacyTower,before=Number(save.wins)||0;
 const result=originalFinish.apply(this,arguments);
 if(special)return result;
 if(win){lifetime.wins++;lifetime.streak++;lifetime.bestStreak=Math.max(lifetime.bestStreak,lifetime.streak);
  if(!tower&&!wild&&gym>=8&&gym<=11){lifetime.eliteVictories++;lifetime.leaders[leaders[gym]]=(lifetime.leaders[leaders[gym]]||0)+1;}
  if(!tower&&!wild&&gym===12){lifetime.championWins++;lifetime.leaders.Blue=(lifetime.leaders.Blue||0)+1;}
  if(tower){lifetime.towerRecord=Math.max(lifetime.towerRecord,save.v32?.tower?.best||0);}
  else if(!/LABORATÓRIO|LENDÁRIO/.test(label)&&!wild&&save.gym<=13&&Number(save.wins)>before){
   state.pendingReward=(state.pendingReward||0)+1;
  }
 }else{lifetime.losses++;lifetime.streak=0;}
 store();persist();rewards();return result;
};
const origRender=render;
render=function(){sync();const out=origRender.apply(this,arguments);panel();rewards();return out;};
const oldWin=renderWin;
renderWin=function(){const out=oldWin.apply(this,arguments);panel();rewards();return out;};
const prevUse=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(){const begin=performance.now();const ret=prevUse.apply(this,arguments);
 lastCastAt=performance.now();if(lastCastAt-begin>24)slowCasts++;tracked++;return ret;};
const css=document.createElement('style');css.id='v123-mobile-arena';
css.textContent='#modal.combatModal .arenaPro{height:clamp(390px,61dvh,690px)!important;min-height:390px!important}'+
 '@media(max-width:650px) and (orientation:portrait){#modal.combatModal .arenaPro{height:clamp(405px,62dvh,700px)!important;min-height:405px!important}}'+
 '@media(orientation:landscape) and (max-height:650px){#modal.combatModal .arenaPro{height:100%!important;min-height:0!important}}';
document.head.appendChild(css);
window.PokemonTorreV123=Object.freeze({installed:true,official:true,diagnostics:()=>({tracked,slowCasts,records:{...lifetime},arenaEnlarged:true})});
})();