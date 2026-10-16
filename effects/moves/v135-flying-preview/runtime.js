/* Pokemon Torre V135 - four isolated FLYING move previews inside native battle Canvas.
 * No PNG, CSS animation, offscreen canvas, extra frame loop, or gameplay edits.
 * All other effects delegate to the existing V134/V132 layers.
 */
(()=>{
'use strict';
const query=new URLSearchParams(location.search);
if(query.get('flying135')!=='preview'||query.get('safe')==='1')return;
if(window.PokemonTorreFlyingV135?.installed)return;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:a));
const ease=t=>{t=clamp(t);return t*t*(3-2*t)};
const mix=(a,b,t)=>a+(b-a)*t;
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const brush={
 clamp,ease,mix,
 path(g,pts,col='#a6d9e8',w=2,alpha=1,dark='#183044'){
  if(!pts||pts.length<2||alpha<=0)return;
  g.save();g.globalAlpha*=clamp(alpha);g.lineCap='round';g.lineJoin='round';
  g.beginPath();
  for(let i=0;i<pts.length;i++){const v=pts[i];if(i)g.lineTo(v[0],v[1]);else g.moveTo(v[0],v[1]);}
  g.strokeStyle=dark;g.lineWidth=w+2.5;g.stroke();
  g.strokeStyle=col;g.lineWidth=w;g.stroke();g.restore();
 },
 feather(g,x,y,l,angle,alpha=1){
  if(alpha<=0)return;
  g.save();g.globalAlpha*=clamp(alpha);g.translate(x,y);g.rotate(angle);
  g.beginPath();g.moveTo(0,-l*.48);
  g.bezierCurveTo(l*.26,-l*.5,l*.25,l*.09,0,l*.52);
  g.bezierCurveTo(-l*.20,l*.13,-l*.28,-l*.48,0,-l*.48);
  g.fillStyle='#c4e3e7';g.strokeStyle='#1c3648';g.lineWidth=1.6;g.fill();g.stroke();
  g.beginPath();g.moveTo(0,-l*.3);g.lineTo(0,l*.45);
  g.strokeStyle='#f6ffff';g.lineWidth=.9;g.stroke();
  g.restore();
 },
 cut(g,x,y,r,tilt,alpha=1){
  if(alpha<=0)return;
  g.save();g.globalAlpha*=clamp(alpha);g.translate(x,y);g.rotate(tilt);
  g.beginPath();g.moveTo(-r,-r*.15);
  g.quadraticCurveTo(0,-r*.85,r,r*.03);
  g.quadraticCurveTo(0,-r*.35,-r,-r*.15);g.closePath();
  g.fillStyle='#8fcbe0';g.strokeStyle='#182e42';g.lineWidth=2.7;g.fill();g.stroke();
  g.beginPath();g.moveTo(-r*.75,-r*.2);g.quadraticCurveTo(0,-r*.65,r*.8,0);
  g.strokeStyle='#f2ffff';g.lineWidth=1.4;g.stroke();
  g.restore();
 },
 mote(g,x,y,r,alpha=1,col='#a8dbeb'){
  if(alpha<=0)return;g.save();g.globalAlpha*=clamp(alpha);
  g.beginPath();g.arc(x,y,Math.max(.6,r),0,Math.PI*2);
  g.fillStyle=col;g.fill();g.restore();
 }
};
const byName=new Map(),names=new Set(),effects=new WeakMap(),stats={
 casts:0,frames:0,errors:[],last:null,slowFrames:0,detailStep:1,maxDrawMs:0,registered:0,
 previewOnly:true
};
let stress=0,lastStamp=0;
function detailFor(stamp){
 if(lastStamp&&stamp>lastStamp){
  const dt=stamp-lastStamp;
  if(dt<=160){
   if(dt>42){stress=Math.min(14,stress+3);stats.slowFrames++;}
   else if(dt>28){stress=Math.min(14,stress+2);stats.slowFrames++;}
   else stress=Math.max(0,stress-1);
  }
 }
 lastStamp=Math.max(lastStamp,stamp);
 stats.detailStep=stress>=9?3:stress>=4?2:1;
 return stats.detailStep;
}
function register(spec){
 if(!spec?.name||typeof spec.draw!=='function'||!Array.isArray(spec.aliases)||
    ![12,16].includes(spec.frames)||!Number.isFinite(spec.ms)||spec.ms<600||spec.ms>2100)
  throw Error('Invalid V135 flying spec');
 if(names.has(spec.name))throw Error('Duplicate Flying V135 '+spec.name);
 names.add(spec.name);
 for(const label of [spec.name,...spec.aliases]){
  const n=norm(label);
  if(byName.has(n)&&byName.get(n)!==spec)throw Error('Duplicate Flying alias '+label);
  byName.set(n,spec);
 }
 stats.registered++;
}
window.PokemonTorreFlyingV135=Object.freeze({installed:true,previewOnly:true,register,
 diagnostics:()=>({...stats,moves:[...names],approvedUnchanged:[
 'Osso','Grande Fissura','Garra de Areia','Soco de Terra','Lança de Areia','Fenda Rasa']})});
if(typeof BattleEngine!=='function')return;
const earlierPaint=window.PokemonTorreV360Paint;
window.PokemonTorreV360Paint=function(g,fx,now,e){
 if(!g||!fx||!e)return typeof earlierPaint==='function'?earlierPaint.apply(this,arguments):false;
 let spec=effects.get(fx);
 if(spec===undefined){spec=byName.get(norm(fx?.move?.name))||null;effects.set(fx,spec);}
 if(!spec||fx.battle!==battle)return typeof earlierPaint==='function'?earlierPaint.apply(this,arguments):false;
 // No stale artwork after a battle, menu or death.
 if(!battle?.active||fx.end<=now||e.canvas?.isConnected===false)return true;
 const duration=Math.max(1,Number(fx.duration)||spec.ms),t=(now-fx.at)/duration;
 if(t<0||t>=1)return true;
 const frame=Math.min(spec.frames-1,Math.floor(clamp(t)*spec.frames));
 const hit=clamp(Number(fx.times?.[0])||.64,.25,.89),detailStep=detailFor(now);
 const A=fx.from||[e.player?.x||0,(e.player?.y||0)-(e.h||420)*.13];
 const B=fx.to||[e.enemy?.x||0,(e.enemy?.y||0)-(e.h||420)*.12];
 const scale=clamp((e.enemy?.r||34)/35,.7,1.17);
 const started=performance.now();
 g.save();
 try{
  spec.draw(g,{...brush,t,frame,hit,from:A,to:B,scale,detailStep,e,fx});
  stats.frames++;stats.last={move:spec.name,frame:frame+1,total:spec.frames,detailStep};
 }catch(error){
  if(stats.errors.length<12)stats.errors.push(spec.name+': '+String(error));
 }finally{
  g.restore();
  const ms=performance.now()-started;
  if(ms>stats.maxDrawMs)stats.maxDrawMs=Math.round(ms*10)/10;
  if(ms>8)stress=Math.min(14,stress+3);
 }
 return true;
};
const earlierUse=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(slot){
 const move=battle?.active&&Number.isInteger(slot)?skillSet(current())?.[slot]:null;
 const spec=byName.get(norm(move?.name));
 if(!spec)return earlierUse.apply(this,arguments);
 const prev=new Set(this.v359Attacks||[]);
 const result=earlierUse.apply(this,arguments);
 if(result===false||!battle?.active)return result;
 const fx=(this.v359Attacks||[]).find(f=>!prev.has(f)&&f.battle===battle&&norm(f.move?.name)===norm(move.name));
 if(fx){fx.duration=spec.ms;fx.end=fx.at+spec.ms;stats.casts++;}
 // Native motor handles all heal/damage/cost/cooldown and persists equipped moves.
 return result;
};
})();