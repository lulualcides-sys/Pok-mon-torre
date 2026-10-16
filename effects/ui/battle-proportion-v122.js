/* V122 mobile battle proportions + native landscape. Original sprite assets, HP and moves untouched. */
(()=>{
'use strict';
if(window.PokemonTorreBattleV122?.installed)return;
const style=document.createElement('style');style.id='battle-v122-layout';
style.textContent="\n#modal.combatModal{overflow-x:hidden!important;overflow-y:auto!important;scrollbar-width:thin}\n#modal.combatModal .arenaPro{height:clamp(345px,55dvh,630px)!important;min-height:345px!important;max-height:none!important;aspect-ratio:auto!important}\n#modal.combatModal .arenaPro .hudPro{max-width:44%!important;width:43%!important;padding:6px 8px!important;max-height:76px!important;overflow:hidden}\n#modal.combatModal .arenaPro .hudName{font-size:clamp(11px,2.85vw,14px)!important}\n#modal.combatModal .arenaPro .hudNumbers{font-size:clamp(10px,2.5vw,12px)!important}\n#modal.combatModal .arenaPro .hudTrack{height:9px!important;margin:5px 0 3px!important}\n#modal.combatModal .battleFooter{min-width:0!important}\n#modal.combatModal .skillgridV8{gap:7px!important}\n#modal.combatModal .skillV8{min-height:64px!important;min-width:0!important}\n#modal.combatModal .skillName b{font-size:clamp(12px,3.2vw,15px)!important}\n#modal.combatModal .skillName small{font-size:clamp(9px,2.25vw,11px)!important}\n#modal.combatModal .battleMessage{font-size:clamp(11px,2.6vw,13px)!important}\n#modal.combatModal .v122LandscapeButton{font:700 11px/1.2 system-ui,sans-serif;white-space:nowrap;border:1px solid #72bbd4aa;color:#d6f4ff;background:#143044;border-radius:11px;padding:7px 9px;cursor:pointer;touch-action:manipulation}\n@media(max-width:650px) and (orientation:portrait){\n #modal.combatModal{width:calc(100vw - 8px)!important;max-height:calc(100dvh - 8px)!important;padding:7px!important}\n #modal.combatModal .arenaPro{height:clamp(370px,57dvh,645px)!important;min-height:370px!important}\n #modal.combatModal .arenaPro .joyZone{transform:scale(.92);transform-origin:bottom left}\n #modal.combatModal .arenaPro .dodgeBtn{transform:scale(.92);transform-origin:bottom right}\n}\n@media(orientation:landscape) and (max-height:650px){\n #modal.combatModal{position:fixed!important;inset:0!important;top:0!important;left:0!important;transform:none!important;width:100vw!important;max-width:100vw!important;height:100dvh!important;max-height:100dvh!important;display:flex!important;flex-direction:column!important;padding:4px 7px!important}\n #modal.combatModal .battleHeading{flex:0 0 auto!important;min-height:0!important;padding:0 4px 2px!important}\n #modal.combatModal .battleHeading h2{font-size:13px!important;margin:1px 0!important}\n #modal.combatModal .battleHeading .overline{font-size:8px!important}\n #modal.combatModal .battleHeading .v342LeaderRoster,#modal.combatModal .battleHeading .v359BossOdds{display:none!important}\n #modal.combatModal #combatContainer{display:grid!important;grid-template-columns:minmax(0,1.55fr) minmax(245px,1fr)!important;gap:7px;align-items:stretch;min-height:0;flex:1!important}\n #modal.combatModal .arenaPro{height:100%!important;min-height:0!important;max-height:none!important;min-width:0!important}\n #modal.combatModal .battleFooter{height:100%!important;min-height:0!important;display:flex!important;flex-direction:column;overflow-y:auto}\n #modal.combatModal .energyHud{flex-shrink:0}\n #modal.combatModal .skillgridV8{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:5px!important;flex:1!important;align-content:center}\n #modal.combatModal .skillV8{min-height:53px!important;padding:6px!important}\n #modal.combatModal .skillName b{font-size:12px!important}\n #modal.combatModal .skillName small{font-size:9px!important}\n #modal.combatModal .skillMeta{font-size:10px!important}\n #modal.combatModal .battleActions{gap:3px!important}\n #modal.combatModal .miniBtn{padding:5px!important;font-size:10px!important}\n #modal.combatModal .keyHelp,#modal.combatModal .crosshairHelp{display:none!important}\n #modal.combatModal .battleMessage{font-size:10px!important}\n #modal.combatModal .arenaPro .hudPro{width:42%!important;max-width:42%!important}\n #modal.combatModal .arenaPro .joyZone{transform:scale(.74);transform-origin:bottom left}\n #modal.combatModal .arenaPro .dodgeBtn{transform:scale(.76);transform-origin:bottom right}\n}";
document.head.appendChild(style);
let created=0,landscapeAttempts=0,rendered=0,scaleDraws=0;
function installControls(){
 const root=document.querySelector('#modal.combatModal');
 const heading=root?.querySelector('.battleHeading');if(!heading||heading.querySelector('.v122LandscapeButton'))return;
 const button=document.createElement('button');button.type='button';
 button.className='v122LandscapeButton';button.textContent='⛶ Deitado';
 button.setAttribute('aria-label','Ativar modo deitado na batalha');
 button.onclick=async()=>{
  landscapeAttempts++;
  try{
   if(!document.fullscreenElement&&root.requestFullscreen)await root.requestFullscreen();
   if(screen.orientation?.lock)await screen.orientation.lock('landscape');
   else button.textContent='↻ Gire o celular';
  }catch(error){button.textContent='↻ Gire o celular';
   button.title='O navegador pode bloquear a rotação automática';}
 };
 heading.appendChild(button);created++;
}
const originalRender=renderBattle;
renderBattle=function(){const r=originalRender.apply(this,arguments);rendered++;installControls();return r;};
const prevDraw=BattleEngine.prototype.drawMon;
BattleEngine.prototype.drawMon=function(actor,id,enemy,now){
 if(!actor||!this.ctx||typeof this.ctx.drawImage!=='function')
  return prevDraw.apply(this,arguments);
 const ctx=this.ctx,draw=ctx.drawImage;
 let hooked=false;
 try{
  ctx.drawImage=function(img,...a){
   const j=a.length===8?4:a.length===4?0:-1;
   if(j>=0&&a.slice(j,j+4).every(Number.isFinite)){
    const scale=1.145,w=a[j+2],h=a[j+3];
    a[j]-=(w*scale-w)/2;a[j+1]-=(h*scale-h);
    a[j+2]=w*scale;a[j+3]=h*scale;scaleDraws++;
   }
   return draw.call(ctx,img,...a);
  };hooked=ctx.drawImage!==draw;
 }catch(e){}
 try{return prevDraw.apply(this,arguments);}
 finally{if(hooked){try{ctx.drawImage=draw}catch(e){}}}
};
window.PokemonTorreBattleV122=Object.freeze({installed:true,official:true,
 diagnostics:()=>({created,landscapeAttempts,rendered,scaleDraws,
  landscape:typeof matchMedia==='function'?matchMedia('(orientation:landscape)').matches:false})});
if(typeof battle!=='undefined'&&battle?.active)installControls();
})();