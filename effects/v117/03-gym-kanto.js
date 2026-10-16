/* V117 | 03 — Kanto's eight actual Gym Leaders and faithful Gen-I species.
 * Preview only; trainer-stage counts and player save format are preserved.
 */
(()=>{
'use strict';
if(new URLSearchParams(location.search).get('kanto117')!=='1')return;
if(typeof GYMS==='undefined'||GYMS.length!==8)return;
const leaders=[
 {name:'Ginásio de Pewter',leader:'Brock',type:'rock',medal:'🪨',accent:'#927a58',
  pool:[74,74,95,75,74,95],boss:[74,95],wild:[74,27,66,41,10,19]},
 {name:'Ginásio de Cerulean',leader:'Misty',type:'water',medal:'💧',accent:'#287ea9',
  pool:[120,60,61,72,120,61],boss:[120,121]},
 {name:'Ginásio de Vermilion',leader:'Lt. Surge',type:'electric',medal:'⚡',accent:'#ad8a37',
  pool:[100,25,81,100,25,26],boss:[100,25,26]},
 {name:'Ginásio de Celadon',leader:'Erika',type:'grass',medal:'🌺',accent:'#458d65',
  pool:[43,44,69,70,71,114],boss:[71,114,45]},
 {name:'Ginásio de Fuchsia',leader:'Koga',type:'poison',medal:'☣️',accent:'#7e55a0',
  pool:[109,88,89,110,49,24],boss:[109,89,109,110]},
 {name:'Ginásio de Saffron',leader:'Sabrina',type:'psychic',medal:'🔮',accent:'#a64e91',
  pool:[63,64,96,97,122,65],boss:[64,122,49,65]},
 {name:'Ginásio de Cinnabar',leader:'Blaine',type:'fire',medal:'🔥',accent:'#b25a3a',
  pool:[37,58,77,78,59,126],boss:[58,77,78,59]},
 {name:'Ginásio de Viridian',leader:'Giovanni',type:'ground',medal:'🏔️',accent:'#8f7246',
  pool:[50,51,27,28,111,112],boss:[111,51,31,34,112]}
];
const stats={battles:0,leaderFights:0,presentations:0,aiFrames:0,invalidSpecies:[],savedGymUnchanged:true};
for(let i=0;i<leaders.length;i++){
 const src=leaders[i];
 if(!src.boss.every(id=>D[id])){stats.invalidSpecies.push({gym:i,boss:src.boss.filter(id=>!D[id])});continue;}
 Object.assign(GYMS[i],src); // Retain min, max, level caps, progression, save.stage.
}
const prevStart=startBattle;
startBattle=function(enemies,label,wild){
 const leader=!wild&&/LÍDER|LIDER|LEADER/i.test(String(label));
 const result=prevStart.apply(this,arguments);
 stats.battles++;
 if(leader&&battle?.active){
  const g=GYMS[Math.min(7,save.gym)],heading=document.querySelector('.battleHeading');
  stats.leaderFights++;
  if(heading&&!heading.querySelector('[data-v117-leader]')){
   const panel=document.createElement('aside');panel.dataset.v117Leader='yes';
   panel.style.cssText='display:flex;align-items:center;gap:8px;padding:8px 10px;margin-top:8px;background:#07101bcf;border:1px solid '+g.accent+';border-radius:12px;font-size:11px;max-width:100%;overflow:hidden';
   const portrait=document.createElement('img');portrait.src=ART+g.boss[g.boss.length-1]+'.png';
   portrait.alt=g.leader+' último Pokémon';portrait.loading='lazy';
   portrait.style.cssText='width:43px;height:43px;object-fit:contain;image-rendering:pixelated;flex-shrink:0';
   const copy=document.createElement('span');
   copy.textContent='👑 '+g.leader+' · '+g.name+' · Equipe: '+g.boss.map(id=>D[id]?.name||'#'+id).join(' / ');
   panel.append(portrait,copy);heading.appendChild(panel);stats.presentations++;
  }
 }
 return result;
};
const oldUpdate=BattleEngine.prototype.update;
BattleEngine.prototype.update=function(dt,now){
 const result=oldUpdate.apply(this,arguments);
 if(!battle?.active||battle.wild||!/LÍDER|LIDER|LEADER/i.test(String(battle.label))||
   !this.enemy||!this.player)return result;
 // Tactical short evasive focus without teleport or forced player damage.
 const d=Math.hypot(this.enemy.x-this.player.x,this.enemy.y-this.player.y);
 const threat=this.projectiles?.some(p=>p.from==='player'&&p.life>0&&
    Math.hypot(p.x-this.enemy.x,p.y-this.enemy.y)<this.h*.23);
 if(threat&&d>this.h*.12){
  this.enemy.focus=Math.max(this.enemy.focus||0,.16);
  this.foeDodgeCD=Math.min(this.foeDodgeCD||1,.6);
 }
 stats.aiFrames++;
 return result;
};
window.PokemonTorreGymsV117=Object.freeze({
 installed:true,previewOnly:true,version:'117.0',names:GYMS.map(g=>g.leader),
 diagnostics:()=>({...stats,leaderTeams:GYMS.map(g=>({leader:g.leader,boss:g.boss.slice()}))})
});
if(typeof render==='function'&&!battle?.active&&save?.starter)try{render()}catch(e){console.warn('V117 gym UI refresh skipped',e)}
})();