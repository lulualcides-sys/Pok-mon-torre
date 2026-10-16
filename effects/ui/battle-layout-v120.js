/* V120 — mobile battle layout repair. Pure UI. No sprite/attack/AI edits.
 * Fixes the photographed Blaine battle: duplicated V117 leader card,
 * oversized boss phase overlay and floating Save/Migrate blocking skills.
 */
(()=>{
'use strict';
if(window.PokemonTorreBattleLayoutV120?.installed)return;
const style=document.createElement('style');
style.id='v120-battle-layout';
style.textContent=`
/* The native V35.9 official roster and boss chance already describe the leader.
   Suppress the duplicate V117 portrait panel, never the authentic team. */
#modal.combatModal .battleHeading [data-v117-leader]{display:none!important}
/* The old V30 stage banner obscured sprites and scenery. The phase is shown
   instead as a small badge in the battle heading. */
#modal.combatModal #v30BossPhase{display:none!important}
#modal.combatModal .v120BossPhase{
 display:inline-flex;vertical-align:middle;align-items:center;gap:3px;
 margin:4px 6px 3px 0;padding:3px 7px;border-radius:8px;
 border:1px solid #b9a06f99;background:#1c3041;color:#ffe6a6;
 font-size:10px;line-height:1.3;font-weight:750;letter-spacing:.02em
}
/* Migration is accessible in menus after combat; never obstruct touch buttons. */
body:has(#modal.combatModal) #ptWebSave{display:none!important}
@media(max-width:650px){
 #modal.combatModal{width:min(calc(100vw - 10px),930px)!important;
  max-height:calc(100dvh - 10px)!important;overscroll-behavior:contain;
  overflow-x:hidden!important;padding:8px!important}
 #modal.combatModal .battleHeading{
  display:flex!important;flex-wrap:wrap!important;align-items:flex-start!important;
  gap:5px 7px!important;padding:0 3px 5px!important
 }
 #modal.combatModal .battleHeading > div:first-child{min-width:0;flex:1 1 185px}
 #modal.combatModal .battleHeading h2{font-size:clamp(14px,3.7vw,19px)!important;
  line-height:1.2!important;margin:3px 0!important;overflow-wrap:anywhere}
 #modal.combatModal .battleHeading .overline{font-size:9px!important;
  line-height:1.45!important;letter-spacing:.055em!important}
 #modal.combatModal .battleHeading .liveFlag{
  padding:5px 7px!important;font-size:8px!important;max-width:48%;
  white-space:normal!important;align-self:center
 }
 #modal.combatModal .battleHeading .v342LeaderRoster{
  width:100%!important;max-width:100%!important;margin:3px 0!important;
  padding:5px 8px!important;font-size:10px!important;line-height:1.35!important
 }
 #modal.combatModal .battleHeading .v359BossOdds{
  margin:2px 0 0!important;padding:4px 8px!important;font-size:10px!important
 }
 #modal.combatModal .arenaPro{height:clamp(265px,43dvh,430px)!important;
  min-height:265px!important;max-height:430px!important}
 #modal.combatModal .arenaPro .hudPro{
  padding:5px 7px!important;top:8px!important;max-width:45%!important;
  width:43%!important;backdrop-filter:none!important
 }
 #modal.combatModal .arenaPro .hudPro.ally{left:8px!important}
 #modal.combatModal .arenaPro .hudPro.enemy{right:8px!important}
 #modal.combatModal .arenaPro .hudName{font-size:clamp(10px,2.6vw,13px)!important;
  gap:3px!important;overflow-wrap:anywhere}
 #modal.combatModal .arenaPro .hudName em{font-size:9px!important}
 #modal.combatModal .arenaPro .hudTrack{margin:5px 0 3px!important;height:8px!important}
 #modal.combatModal .arenaPro .hudNumbers{font-size:9px!important}
 #modal.combatModal .arenaPro .v33Terrain{
  top:77px!important;right:6px!important;left:auto!important;
  transform:none!important;font-size:8px!important;padding:2px 5px!important;
  max-width:34%!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis
 }
 #modal.combatModal .arenaPro .v33Terrain.v120GenericTerrain{display:none!important}
 #modal.combatModal .skillgridV8{gap:6px!important}
 #modal.combatModal .skillV8{min-height:57px!important}
}
@media(max-width:375px){
 #modal.combatModal .battleHeading .liveFlag{font-size:7px!important}
 #modal.combatModal .arenaPro{height:clamp(260px,43dvh,380px)!important}
 #modal.combatModal .arenaPro .hudPro{width:44%!important}
}
`;
document.head.appendChild(style);
const stats={battles:0,rosterDuplicatesRemoved:0,phasesUpdated:0,terrainTags:0,saveHiddenByCSS:true};
function compact(){
 if(typeof battle==='undefined'||!battle?.active)return;
 const modal=document.querySelector('#modal.combatModal');
 if(!modal)return;
 const heading=modal.querySelector('.battleHeading');
 if(!heading)return;
 for(const panel of heading.querySelectorAll('[data-v117-leader]')){
  panel.remove();stats.rosterDuplicatesRemoved++;
 }
 // Retain the original boss phase, only move its text into the header.
 const source=modal.querySelector('#v30BossPhase');
 let small=heading.querySelector('.v120BossPhase');
 const match=String(source?.textContent||'').match(/FASE\s+(\d+)\s*\/\s*(\d+)/i);
 if(match){ // Phase label itself is proof of a current boss stage.
  if(!small){small=document.createElement('span');small.className='v120BossPhase';
   small.setAttribute('aria-label','Progresso do líder');
   const h=heading.querySelector('.overline')?.parentElement||heading;
   h.appendChild(small);
  }
  const text='FASE '+match[1]+'/'+match[2];
  if(small.textContent!==text){small.textContent=text;stats.phasesUpdated++;}
 }else small?.remove();
 const terrain=modal.querySelector('#v33TerrainTag');
 if(terrain){
  terrain.classList.toggle('v120GenericTerrain',/\bArena\b/i.test(terrain.textContent||''));
  stats.terrainTags++;
 }
}
const originalStart=startBattle;
startBattle=function(){const result=originalStart.apply(this,arguments);stats.battles++;compact();return result;};
const originalNext=nextFoe;
nextFoe=function(){const result=originalNext.apply(this,arguments);compact();return result;};
const originalRender=renderBattle;
renderBattle=function(){const result=originalRender.apply(this,arguments);compact();return result;};
window.PokemonTorreBattleLayoutV120=Object.freeze({installed:true,previewOnly:false,
 refresh:compact,fixes:['leader-duplicate','boss-phase-occlusion','save-migrate-overlay','mobile-hud-spacing'],
 diagnostics:()=>({...stats,phase:document.querySelector('.v120BossPhase')?.textContent||null,
  saveVisibleDuringBattle:!!battle?.active&&!document.querySelector('#modal.combatModal')})
});
})();
