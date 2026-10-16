/* Pokémon Torre V126 — longer Kanto challenge, direct move summaries and Android UI stability.
 * Visual/campaign extension only: does not change approved moves, combat VFX, saves, coins,
 * PokéMart V125 item sprites or V124.2 Pokéball timing.
 */
(()=>{
'use strict';
if(window.PokemonTorreV126?.installed)return;
if(new URLSearchParams(location.search).get('ui126')==='0')return;
const stats={teamTaps:0,openedEditors:0,renderPasses:0,frames:0,slowFrames:0,
 maxFrameMs:0,originalFallbacks:0};
const targets=Object.freeze(Array.from({length:8},(_,gym)=>13+gym*2));
const oldTrainerCount=v29TrainerCount;
v29TrainerCount=function(g){
 if(Number.isInteger(g)&&g>=0&&g<8){
  // Count represents the 13..27 TRAINERS before the original leader,
  // not battles including leader. No reset or skip on older saved journeys.
  const stage=g===save.gym?Math.max(0,Number(save.stage)||0):0;
  return Math.max(targets[g],stage);
 }
 return oldTrainerCount(g);
};
function openSummary(index){
 if(battle?.active||!save?.starter)return false;
 if(!Number.isInteger(index)||index<0||index>=save.team.length)return false;
 const m=save.team[index];
 if(!m||!D[m.id])return false;
 // Reuse V33.1's already functional editor, preserving move eligibility,
 // selected 4 slots, TMs, saved v32Slots and the existing native close buttons.
 showTeam();
 const shortcut=document.getElementById('v331MovesShortcut');
 if(!shortcut){stats.originalFallbacks++;return false;}
 shortcut.click();
 const target=document.querySelector('[data-v331-pokemon="'+index+'"]');
 if(!target){stats.originalFallbacks++;return false;}
 target.click();
 const modal=document.getElementById('modal');
 const slots=modal?.querySelector('.v331Slots');
 if(slots && !modal.querySelector('.v126Summary')){
  const note=document.createElement('div');
  note.className='v126Summary';
  note.textContent='SUMÁRIO  ·  '+D[m.id].name+'  ·  Nv. '+m.level+
   '  ·  PV '+Math.ceil(m.hp)+'/'+m.maxHp+
   '  ·  '+(TYPE_NAME[D[m.id].type]||D[m.id].type)+
   '  ·  Edite os quatro golpes abaixo';
  slots.parentElement?.insertBefore(note,slots);
 }
 stats.openedEditors++;
 return true;
}
function bindHomeCards(){
 const cards=document.querySelectorAll('#main .teamrow .moncard');
 for(let i=0;i<save.team.length&&i<cards.length;i++){
  const card=cards[i];
  if(card.dataset.v126Pokemon!==undefined)continue;
  card.dataset.v126Pokemon=String(i);
  card.setAttribute('role','button');
  card.setAttribute('tabindex','0');
  card.setAttribute('aria-label','Abrir sumário e trocar golpes de '+(D[save.team[i]?.id]?.name||'Pokémon'));
  card.addEventListener('click',()=>{
   stats.teamTaps++;openSummary(i);
  });
  card.addEventListener('keydown',e=>{
   if(e.key==='Enter'||e.key===' '){e.preventDefault();stats.teamTaps++;openSummary(i);}
  });
 }
}
const priorRender=render;
render=function(){
 const result=priorRender.apply(this,arguments);
 stats.renderPasses++;
 if(!battle?.active&&save?.starter)bindHomeCards();
 return result;
};
// Monitor real frame timings, without creating a second frame loop, forcing FPS,
// decoding sprites synchronously or deleting cinematic move timelines.
const mobile=/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent||'');
if(mobile&&typeof BattleEngine?.prototype?.frame==='function'){
 const nativeFrame=BattleEngine.prototype.frame;
 BattleEngine.prototype.frame=function(){
  const then=performance.now();
  try{return nativeFrame.apply(this,arguments)}
  finally{
   const duration=performance.now()-then;
   stats.frames++;
   if(duration>28)stats.slowFrames++;
   stats.maxFrameMs=Math.max(stats.maxFrameMs,Math.round(duration*10)/10);
  }
 };
}
const style=document.createElement('style');style.id='v126-gameplay-ui';
style.textContent=
 // Remove the type emojis BEHIND loaded Pokémon sprites, not the sprites,
 // type names, Pokémon art, PokéMart icons, or fallback for a truly missing art.
 '.spritewrap:has(img.sprite) > .placeholder{display:none!important}'+
 '.v331Pokemon .spritewrap{background:transparent!important;box-shadow:none!important}'+
 '#main .moncard[data-v126-pokemon]{cursor:pointer;touch-action:manipulation;outline-offset:3px}'+
 '#main .moncard[data-v126-pokemon]:focus-visible{outline:3px solid #79f0cb}'+
 '.v126Summary{background:#173c4b;color:#def2fa;border:1px solid #548799;border-radius:9px;padding:9px 11px;margin:8px 0 12px;font-size:12px;line-height:1.6}'+
 // Mobile UI compositing: large blurred fullscreen backdrops and rendering
 // 365 offscreen Mewtwo entries strain the GPU/DOM. Keep original gameplay art.
 '@media(max-width:750px){.modalBackdrop{backdrop-filter:none!important}'+
 '.v331MoveList .v331Choice{content-visibility:auto;contain-intrinsic-size:auto 64px}'+
 '#main .teamrow .sprite,.v331Pokemon .sprite{filter:none!important}'+
 '.v331MoveList{overscroll-behavior:contain;-webkit-overflow-scrolling:touch}'+
 '}';
document.head.appendChild(style);
if(save?.starter&&!battle?.active)bindHomeCards();
window.PokemonTorreV126=Object.freeze({installed:true,official:true,
 trainers:[...targets],mobile,openSummary,
 diagnostics:()=>({...stats,trainers:[...targets],teamSize:save.team?.length||0,
  preservesV123:true,preservesV124:true,preservesV125:true,
  noAdditionalRaf:true,measuredPhysicalAndroid:false})});
})();