/* V119 · optional ground reflections; never replace V118 Rain Dance PMD frames.
 * Render after native engine at low opacity and minimum particle cost.
 */
(()=>{
'use strict';
if(new URLSearchParams(location.search).get('kanto119')!=='1')return;
const stats={rainReflections:0,stormFlashes:0,otherFrames:0};
const native=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(now){
 const result=native.apply(this,arguments);
 if(!battle?.active||!this.ctx||!this.w||!this.h)return result;
 const weather=String(battle.v32Weather||'').toLowerCase();
 if(!['rain','storm','snow','hail','sand','volcano'].includes(weather))return result;
 const c=this.ctx,w=this.w,h=this.h,time=(Number(now)||performance.now())*.001;
 c.save();
 try{
  c.beginPath();c.rect(0,h*.77,w,h*.19);c.clip();
  if(weather==='rain'||weather==='storm'){
   // Subtle floor reflections only. V118 original rainfall is untouched.
   c.globalAlpha=.22;
   c.strokeStyle='#a8d8fc';c.lineWidth=1;
   for(let i=0;i<4;i++){
    const phase=(time*.65+i*.37)%1.0,r=5+phase*20;
    const x=w*(.15+i*.23),y=h*(.80+(i%2)*.045);
    c.beginPath();c.ellipse(x,y,r,r*.22,0,0,Math.PI*2);c.stroke();
   }
   stats.rainReflections++;
   if(weather==='storm'&&Math.sin(time*7.1)> .985){
    c.globalAlpha=.08;c.fillStyle='#e4edff';c.fillRect(0,h*.77,w,h*.19);stats.stormFlashes++;
   }
  }else{
   c.globalAlpha=.045;c.fillStyle=(weather==='volcano'?'#f88332':weather==='sand'?'#ddbd80':'#e4f4ff');
   c.fillRect(0,h*.77,w,h*.19);stats.otherFrames++;
  }
 }finally{c.restore();}
 return result;
};
window.PokemonTorreWeatherV119=Object.freeze({installed:true,previewOnly:true,
 preservesRainDance:true,diagnostics:()=>({...stats})});
})();