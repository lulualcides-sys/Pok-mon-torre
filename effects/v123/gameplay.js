/* V123 ONE-PATCH | Kanto strategy, encounters, rewards, centre, Tower records.
 * Reuses ALL approved native battle/capture/league/tower mechanics. No move VFX edits.
 */
(()=>{
'use strict';
if(window.PokemonTorreGameplayV123?.installed)return;
const k='pokeTorreV123Lifetime', leaders=['Brock','Misty','Lt. Surge','Erika','Koga','Sabrina','Blaine','Giovanni'];
const elite=['Lorelei','Bruno','Agatha','Lance','Blue'];
const num=n=>Number.isFinite(+n)?Math.max(0,Math.floor(+n)):0;
const stored=()=>{try{const x=JSON.parse(localStorage.getItem(k)||'null');return x&&typeof x==='object'?x:{resets:0,careers:0}}catch{return {resets:0,careers:0}}};
let lifetime=stored(),hadStarter=!!save.starter;
function state(){
 if(!save.v123Stats||typeof save.v123Stats!=='object'){
  save.v123Stats={created:Date.now(),trainers:0,wildWins:0,rareSeen:0,
   eliteWins:{},eliteLosses:{},gymWins:{},gymLosses:{},towerWins:0,towerLosses:0,
   captures:0,potionsUsed:0,centres:0,rewards:0,events:[]};
 }
 return save.v123Stats;
}
const safeWrite=()=>{try{localStorage.setItem(k,JSON.stringify(lifetime))}catch{}};
const oldPersist=persist;
persist=function(){
 const now=!!save.starter;
 if(hadStarter&&!now){lifetime.resets=num(lifetime.resets)+1;lifetime.careers=num(lifetime.careers)+1;safeWrite();}
 hadStarter=now;
 return oldPersist.apply(this,arguments);
};
const oldCount=v29TrainerCount;
v29TrainerCount=function(g){
 if(!Number.isInteger(g)||g<0||g>7)return oldCount(g);
 if(!save.v123GymTargets||typeof save.v123GymTargets!=='object')save.v123GymTargets={};
 const current=save.v123GymTargets[g];
 if(Number.isInteger(current)&&current>=3&&current<=oldCount(g))return current;
 const target=Math.min(oldCount(g),Math.max(4,4+Math.floor(g/2),g===save.gym?num(save.stage):0));
 save.v123GymTargets[g]=target;
 return target;
};
const oldStart=startBattle;
startBattle=function(enemies,label,wild){
 const out=oldStart.apply(this,arguments);
 if(!battle?.active)return out;
 battle.v123Consumables={potion:0,super:0};
 battle.v123Timestamp=Date.now();
 battle.v123InitialGym=save.gym;
 battle.v123InitialStage=save.stage;
 if(wild&&foe()){
  const rarity=KANTO_RARE.has(foe().id)&&!KANTO_LEGENDS.has(foe().id);
  battle.v123Rare=rarity;
  const s=state();if(rarity){s.rareSeen++;persist();}
  const heading=document.querySelector('#modal .battleHeading');
  if(heading&&rarity){
   const el=document.createElement('span');el.className='v123RareTag';el.textContent='✦ ENCONTRO RARO';heading.appendChild(el);
  }
 }
 return out;
};
// Use precisely five wild encounters at each route stop; preserve original odds,
// Kanto species, catch formulas and 1% shiny generation from the native engine.
grassEncounter=function(){
 if((num(save.balls)+num(save.superBalls)+num(save.ultraBalls))<1||save.gym>=8)return;
 const key=save.gym+'-'+save.stage,used=num(save.routeUsed?.[key]);
 if(save.stage<1||save.stage>v29TrainerCount(save.gym)||used>=5)return;
 const options=v27WildOdds(save.gym);if(!options.length)return;
 const total=options.reduce((a,x)=>a+x.weight,0);
 let roll=Math.random()*total,entry=options[options.length-1];
 for(const item of options){roll-=item.weight;if(roll<=0){entry=item;break;}}
 if(!save.routeUsed||typeof save.routeUsed!=='object')save.routeUsed={};
 save.routeUsed[key]=used+1;
 const gym=GYMS[save.gym],level=clamp(gym.min-2+Math.floor(Math.random()*4),3,gym.levelCap-2);
 persist();return startBattle([mon(entry.id,level)],'🌾 ENCONTRO SELVAGEM',true);
};
const potionPrev=battlePotion,superPrev=battleSuperPotion;
function useItem(kind,prev,limit){
 if(!battle?.active||battle.paused)return prev.apply(this,[]);
 const used=battle.v123Consumables||{potion:0,super:0};
 if(num(used[kind])>=limit){log('Limite estratégico: '+(kind==='potion'?'2 poções':'1 superpoção')+' por combate.');return;}
 const before=num(kind==='potion'?save.potions:save.superPotions);
 const out=prev.apply(this,[]);
 const after=num(kind==='potion'?save.potions:save.superPotions);
 if(after<before){used[kind]=num(used[kind])+1;state().potionsUsed++;persist();}
 return out;
}
battlePotion=function(){return useItem.call(this,'potion',potionPrev,2)};
battleSuperPotion=function(){return useItem.call(this,'super',superPrev,1)};
const prevFinish=finishBattle;
finishBattle=function(win){
 if(!battle?.active)return;
 const b=battle,g=num(save.gym),st=num(save.stage),wild=!!b.wild;
 const tower=b.v32Mode==='tower',laboratory=b.v33Type==='lab'||b.v32Mode==='lab'||/LABORATÓRIO|TESTE DUPLO/i.test(String(b.label||''));
 const leader=g<8&&!wild&&!tower&&!laboratory&&st===v29TrainerCount(g);
 const league=g>=8&&g<=12&&!wild&&!tower&&!laboratory;
 const towerFloor=tower?(b.v3563Floor||b.v32Floor||save.v32?.tower?.floor||0):0;
 const took=Date.now()-(b.v123Timestamp||Date.now());
 const out=prevFinish.apply(this,arguments);
 if(laboratory)return out;
 const s=state(),kind=tower?'Torre':league?'Elite Four':wild?'Selvagem':leader?'Líder':'Treinador';
 if(tower){if(win)s.towerWins++;else s.towerLosses++;}
 else if(league){
  const n=elite[Math.min(4,g-8)];
  const map=win?s.eliteWins:s.eliteLosses;map[n]=num(map[n])+1;
 }else if(wild){if(win)s.wildWins++;}
 else if(leader){const n=leaders[g];const map=win?s.gymWins:s.gymLosses;map[n]=num(map[n])+1;}
 else if(win)s.trainers++;
 s.events.unshift({at:Date.now(),kind,opponent:league?elite[g-8]:leader?leaders[g]:String(b.label||''),win:!!win,
   floor:tower?num(towerFloor):null,duration:Math.round(Math.max(0,took)/1000)});
 s.events=s.events.slice(0,75);
 if(win&&!wild&&!tower&&!league&&g<8&&(leader||st>0&&st%2===0)){
  const rewardKey=g+':'+st;
  if(!save.v123RewardsSeen||typeof save.v123RewardsSeen!=='object')save.v123RewardsSeen={};
  if(!save.v123RewardsSeen[rewardKey]){
   save.v123RewardsSeen[rewardKey]=true;
   save.v123PendingReward={key:rewardKey,gym:g,stage:st};
   attachReward();
  }
 }
 persist();return out;
};
function takeReward(type){
 if(!save.v123PendingReward||battle?.active)return;
 if(type==='heal')for(const m of save.team||[])m.hp=Math.min(m.maxHp,m.hp+Math.ceil(m.maxHp*.36));
 else if(type==='xp')for(const m of save.team||[]){if(m.hp>0)awardXP(m,30+save.gym*4);}
 else if(type==='kit'){save.balls=num(save.balls)+2;save.coins=num(save.coins)+25;}
 else return;
 state().rewards++;save.v123PendingReward=null;persist();close();render();
}
function showRewards(){
 if(battle?.active||!save.v123PendingReward)return;
 overlay('<div class="sectionhead"><div><div class="overline">RECOMPENSA DA TORRE</div><h2>🎁 Escolha estratégica</h2></div></div><p class="desc">Uma recompensa por etapa concluída. Escolha a que melhor ajuda a próxima batalha.</p><div class="actionRow" id="v123RewardButtons"><button class="btn gold" data-reward="heal">💚 Recuperar 36% dos PV</button><button class="btn primary" data-reward="xp">✦ EXP para equipe</button><button class="btn" data-reward="kit">🔴 2 Pokébolas + 25 moedas</button></div>');
 document.querySelectorAll('#v123RewardButtons [data-reward]').forEach(b=>b.onclick=()=>takeReward(b.dataset.reward));
}
function attachReward(){
 if(!save.v123PendingReward||battle?.active)return;
 const box=document.querySelector('#modal .result');
 if(box&&!document.getElementById('v123RewardClaim')){
  const button=document.createElement('button');
  button.id='v123RewardClaim';button.type='button';button.className='btn gold wide';
  button.textContent='🎁 ESCOLHER RECOMPENSA';button.onclick=showRewards;
  box.insertAdjacentElement('afterend',button);
 }
}
// Preserve the existing League, champion, infinite Tower, native inventory and shop.
// Add a visitable centre after every trainer milestone; one free heal per stop,
// subsequent visits have a monetary cost, instead of unlimited free recovery.
function showCentre(){
 if(battle?.active||!save.starter)return;
 const key=save.gym+':'+save.stage,free=save.v123CenterFree!==key,cost=20+Math.min(45,num(save.gym)*5);
 overlay('<div class="sectionhead"><div><div class="overline">SERVIÇO DA TORRE</div><h2>🏥 Centro Pokémon</h2></div><button class="btn tiny ghost" id="v123CentreBack">✕</button></div><p class="desc">Cura completa da equipe entre confrontos. Uma recuperação gratuita por etapa; depois custa moedas.</p><p class="pill">Equipe '+(save.team||[]).length+' Pokémon · '+(free?'GRÁTIS':cost+' moedas')+'</p><button class="btn gold wide" id="v123CentreHeal" '+(!free&&num(save.coins)<cost?'disabled':'')+'>💚 RECUPERAR EQUIPE</button><p class="desc">Saldo atual: '+num(save.coins)+' moedas</p>');
 document.getElementById('v123CentreBack').onclick=()=>{close();render();};
 document.getElementById('v123CentreHeal').onclick=()=>{
  if(!free&&num(save.coins)<cost)return;
  if(!free)save.coins-=cost;else save.v123CenterFree=key;
  for(const m of save.team||[])m.hp=m.maxHp;
  state().centres++;persist();close();render();
 };
}
function records(){
 if(battle?.active||!save.starter)return;
 const s=state(),life=stored(),v=save.v119LeagueHistory||{},vv=v.victories||{};
 const line=(key,val)=>'<div class="v123Stat"><span>'+key+'</span><strong>'+num(val)+'</strong></div>';
 const league=elite.map(n=>line('Elite Four · '+n+' (vitórias)',Math.max(num(vv[n]),num(s.eliteWins[n])))+
  line('Elite Four · '+n+' (derrotas registradas)',s.eliteLosses[n])).join('');
 const gym=leaders.map(n=>line('Ginásio · '+n+' (vitórias)',s.gymWins[n])).join('');
 const hist=s.events.slice(0,16).map(e=>'<div class="v123Event"><span>'+new Date(e.at).toLocaleDateString('pt-BR')+' · '+(e.win?'✓ Vitória':'✕ Derrota')+' · '+e.kind+' · '+(e.opponent||'')+'</span></div>').join('');
 const resets=num(life.resets);
 overlay('<div class="sectionhead"><div><div class="overline">DADOS REAIS DO SALVAMENTO</div><h2>📊 Carreira Pokémon Torre</h2></div><button class="btn tiny ghost" id="v123StatsBack">✕</button></div>'+
 '<p class="desc">Totais da campanha existente e métricas detalhadas registradas desde a V123. Não inventamos resultados anteriores que não estavam salvos.</p>'+
 '<div class="v123Stats">'+line('Vitórias gerais do jogo',save.wins)+line('Derrotas gerais do jogo',save.losses)+
 line('Resets da jornada neste navegador',resets)+line('Vitórias contra treinadores (V123)',s.trainers)+
 line('Encontros selvagens vencidos (V123)',s.wildWins)+line('Espécies raras encontradas (V123)',s.rareSeen)+
 line('Recompensas escolhidas',s.rewards)+line('Visitas ao Centro',s.centres)+
 line('Poções usadas em batalha',s.potionsUsed)+line('Pokémon da coleção',new Set(save.caught||[]).size)+
 line('Shinies encontrados',new Set(save.v119ShinySeen||[]).size)+
 line('Títulos contra Blue',Math.max(num(v.championships),num(save.v3563Tower?.championships)))+
 line('Vitórias da Torre Infinita (V123)',s.towerWins)+line('Derrotas da Torre (V123)',s.towerLosses)+
 line('Recorde na Torre',Math.max(num(save.v32?.tower?.best),num(save.v3563Tower?.best)))+
 league+gym+'</div><h3>Últimas partidas registradas</h3><div class="v123History">'+(hist||'<p class="desc">O histórico começa na V123.</p>')+'</div>');
 document.getElementById('v123StatsBack').onclick=()=>{close();render()};
}
function addButtons(){
 if(battle?.active||!save.starter)return;
 const main=document.getElementById('main');if(!main||main.querySelector('#v123Menu'))return;
 const wrapper=document.createElement('div');wrapper.id='v123Menu';wrapper.className='v123Menu';
 wrapper.innerHTML='<button class="btn primary" type="button" id="v123Stats">📊 Carreira e recordes</button>'+
 '<button class="btn ghost" type="button" id="v123Centre">🏥 Centro Pokémon</button>'+
 (save.v123PendingReward?'<button class="btn gold" id="v123Pending">🎁 Recompensa pendente</button>':'')+
 '<p>Elite Four, resets, vitórias, Tower e equipe · histórico salvo neste navegador</p>';
 main.appendChild(wrapper);
 document.getElementById('v123Stats').onclick=records;
 document.getElementById('v123Centre').onclick=showCentre;
 if(document.getElementById('v123Pending'))document.getElementById('v123Pending').onclick=showRewards;
 const key=save.gym+'-'+save.stage;
 const wildUsed=num(save.routeUsed?.[key]);
 document.querySelectorAll('.grass .desc,.grass p').forEach(n=>{if(n.textContent&&/encontros|encontro/i.test(n.textContent))n.textContent=n.textContent.replace(/3 encontros|três encontros/ig,'5 encontros')});
 const grass=document.querySelector('.grass');
 if(grass){let note=grass.querySelector('.v123WildCounter');if(!note){note=document.createElement('small');note.className='v123WildCounter';grass.appendChild(note);}note.textContent='🌾 Encontros desta etapa: '+Math.min(5,wildUsed)+'/5 · raridade progressiva';}
}
const oldRender=render;
render=function(){const out=oldRender.apply(this,arguments);if(!battle?.active)addButtons();return out;};
const oldResult=resultScreen;
resultScreen=function(){const out=oldResult.apply(this,arguments);attachReward();return out;};
// Leader AI uses type matchup, health and current attack danger; never changes
// opponents' identity, HP, move art or imposes instant damage.
const oldUpdate=BattleEngine.prototype.update;
let aiUpdates=0;
BattleEngine.prototype.update=function(dt,now){
 const out=oldUpdate.apply(this,arguments),b=battle;
 if(!b?.active||b.paused||b.wild||save.gym>7||!b.v30Boss||!this.enemy||!this.player)return out;
 const d=Number.isFinite(dt)?Math.max(0,Math.min(.05,dt)):0;
 const atk=D[foe()?.id],def=D[current()?.id];if(!atk||!def)return out;
 const match=advantage(atk.type,def),hp=(foe()?.hp||0)/Math.max(1,foe()?.maxHp||1);
 const projectileDanger=(this.projectiles||[]).some(p=>p.from==='player'&&p.life>0&&
   Math.hypot(p.x-this.enemy.x,p.y-this.enemy.y)<this.h*.24);
 if(projectileDanger&&this.foeDodgeCD>.8)this.foeDodgeCD=Math.max(.8,this.foeDodgeCD-d*.6);
 if(match>1&&this.enemyAttackCD>1)this.enemyAttackCD=Math.max(.9,this.enemyAttackCD-d*.35);
 if(hp<.28&&this.enemy?.focus<.35)this.enemy.focus=.35;
 aiUpdates++;return out;
};
const style=document.createElement('style');style.id='v123-gameplay-style';
style.textContent='.v123Menu{margin:16px auto;max-width:980px;padding:15px;display:flex;flex-wrap:wrap;gap:9px;align-items:center;background:#0c2133;border:1px solid #39789c;border-radius:14px}.v123Menu p{width:100%;font-size:11px;color:#9cc8dd;margin:0}.v123Stats{max-height:52dvh;overflow-y:auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.v123Stat{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:7px 10px;border-radius:7px;background:#123049;color:#d6ecf6;font-size:11px}.v123Stat strong{font-size:14px;color:#fff0b2}.v123History{max-height:180px;overflow:auto}.v123Event{font-size:11px;padding:5px 8px;color:#cde6f4}.v123RareTag{display:inline-block;margin-left:8px;color:#ffe8a2;font-size:10px}.v123WildCounter{display:block;color:#9dd2e7;margin-top:5px}@media(max-width:550px){.v123Stats{grid-template-columns:1fr}.v123Menu .btn{flex:1 1 100%}}';
document.head.appendChild(style);
if(save.starter&&!battle?.active)addButtons();
window.PokemonTorreGameplayV123=Object.freeze({installed:true,official:true,
 diagnostics:()=>({aiUpdates,resets:stored().resets,gymTargets:{...save.v123GymTargets},stats:{...state()},
  townCentre:true,wildEncounterLimit:5,league:!!save.v119LeagueHistory,olderMovesUntouched:true})});
})();