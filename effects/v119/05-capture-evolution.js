/* V119 · three capture shakes and real sprite evolution reveal.
 * Success probabilities, ball resources, XP and evolution rules unchanged.
 */
(()=>{
'use strict';
if(new URLSearchParams(location.search).get('kanto119')!=='1')return;
const stats={shakes:0,evolutions:0,rendered:0};
const update=BattleEngine.prototype.v25Update;
if(typeof update==='function'){
 BattleEngine.prototype.v25Update=function(dt){
  const k=this.v25?.capture;
  if(k&&battle?.active&&Number.isFinite(k.time)&&Number.isFinite(dt)){
   const next=k.time+dt;k.v119Steps=k.v119Steps||0;
   for(const threshold of [.98,1.18,1.38]){
    if(k.time<threshold&&next>=threshold){
     k.v119Steps++;
     // Existing ball art & native effects still own the main animation.
     if(typeof this.particlesAt==='function')
      this.particlesAt(k.toX,k.toY,'#f4edca',4,27);
     stats.shakes++;
    }
   }
  }
  return update.apply(this,arguments);
 };
}
const oldDrawBall=BattleEngine.prototype.v25Ball;
if(typeof oldDrawBall==='function'){
 BattleEngine.prototype.v25Ball=function(ctx,x,y,r,rotation){
  const k=this.v25?.capture;
  if(!k||k.time<.9)return oldDrawBall.apply(this,arguments);
  const n=Math.max(0,Math.min(1,(k.time-.9)/.63));
  const wave=Math.sin(n*Math.PI*6)*(1-n)*3.5;
  return oldDrawBall.call(this,ctx,x+wave,y,r,rotation+wave*.035);
 };
}
let pending=[];
const priorXP=awardXP;
awardXP=function(monster,amount){
 const before=monster?.id,ret=priorXP.apply(this,arguments);
 if(monster?.id&&before&&monster.id!==before)
  pending.push({from:before,to:monster.id,level:monster.level});
 return ret;
};
const priorResult=resultScreen;
resultScreen=function(title,description,win,caught){
 const result=priorResult.apply(this,arguments);
 if(!pending.length)return result;
 const events=pending.splice(0,6);
 const host=document.querySelector('#modal .result');
 if(!host)return result;
 const panel=document.createElement('div');
 panel.className='v119Evolution';
 panel.style.cssText='margin:12px auto;padding:12px;max-width:420px;text-align:center;border:1px solid #e7d69b77;border-radius:12px;background:#122435;color:#e9f4fa';
 host.insertAdjacentElement('afterend',panel);
 for(const evo of events){
  const line=document.createElement('div');line.style.cssText='margin:5px 0;display:flex;align-items:center;justify-content:center;gap:14px';
  const text=document.createElement('span');text.style.cssText='font-size:11px';
  text.textContent=(D[evo.from]?.name||'#'+evo.from)+'  →  '+(D[evo.to]?.name||'#'+evo.to)+' · Nv.'+evo.level;
  const old=document.createElement('img'),next=document.createElement('img');
  for(const [el,id] of [[old,evo.from],[next,evo.to]]){
   el.src=ART+id+'.png';el.alt=D[id]?.name||'Pokemon';el.loading='lazy';
   el.style.cssText='width:54px;height:54px;object-fit:contain;image-rendering:pixelated';
  }
  line.append(old,text,next);panel.append(line);stats.rendered++;
 }
 stats.evolutions+=events.length;
 return result;
};
window.PokemonTorreCaptureEvolutionV119=Object.freeze({installed:true,previewOnly:true,
 diagnostics:()=>({...stats,originalCaptureRate:true,originalXP:true})});
})();