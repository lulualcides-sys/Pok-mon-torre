/* V130 GROUND — preview-only animation layer.
 * Uses the battle's native Canvas: animated brush geometry, no image sprites,
 * no CSS effects, no user-facing atelier, no changed save, cooldown or damage.
 * Only four exact names are intercepted. Grande Fissura is protected.
 */
(()=>{
'use strict';
const query=new URLSearchParams(location.search);
if(query.get('ground130')!=='preview'||query.get('safe')==='1')return;
if(window.PokemonTorreGroundV130?.installed)return;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
const mix=(a,b,t)=>a+(b-a)*t;
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const byName=new Map(),seen=new Set();
const state={casts:0,draws:0,errors:[],last:null,previewOnly:true,hitChanges:0};
function path(g,points,fill,stroke='#211910',lineWidth=2){
 g.beginPath();points.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));
 g.closePath();if(fill){g.fillStyle=fill;g.fill();}
 if(stroke){g.strokeStyle=stroke;g.lineWidth=lineWidth;g.lineJoin='round';g.stroke();}
}
function crumb(g,x,y,r,angle=0,colour='#8e633f',alpha=1){
 g.save();g.globalAlpha*=clamp(alpha);g.translate(x,y);g.rotate(angle);
 const points=Array.from({length:6},(_,i)=>{
  const th=i*Math.PI/3,rr=r*(i%2?.87:1.12);
  return [Math.cos(th)*rr,Math.sin(th)*rr*.83];
 });
 path(g,points,colour,'#241b17',Math.max(1.1,r*.16));
 g.beginPath();g.moveTo(-r*.58,-r*.05);g.lineTo(-r*.20,-r*.52);g.lineTo(r*.23,-r*.38);
 g.strokeStyle='#f3d19a';g.lineWidth=Math.max(1,r*.14);g.stroke();g.restore();
}
function ripple(g,x,y,rx,ry,alpha=1,light='#ddb56b'){
 g.save();g.globalAlpha*=clamp(alpha);
 for(let n=0;n<2;n++){
  g.beginPath();g.ellipse(x,y,Math.max(1,rx+n*3),Math.max(1,ry+n*1.3),0,0,Math.PI*2);
  g.lineWidth=n?2.1:4.2;g.strokeStyle=n?light:'#24180d';g.stroke();
 }g.restore();
}
function splat(g,x,y,r,a=1){
 if(a<=0)return;
 g.save();g.globalAlpha*=clamp(a);g.translate(x,y);
 const pts=Array.from({length:22},(_,i)=>{
  const theta=i*Math.PI*2/22,rad=r*(.84+.19*Math.sin(i*4.2)+((i%5===0)? .28:0));
  return [Math.cos(theta)*rad,Math.sin(theta)*rad*.84];
 });
 path(g,pts,'#765032','#20180f',Math.max(1.5,r*.12));
 g.beginPath();g.moveTo(-r*.55,-r*.28);g.quadraticCurveTo(-r*.17,-r*.73,r*.33,-r*.33);
 g.lineWidth=Math.max(1.2,r*.12);g.strokeStyle='#dcb47d';g.stroke();
 g.restore();
}
function shock(g,x,y,r,a=1){
 if(a<=0)return;g.save();g.globalAlpha*=clamp(a);
 for(let n=0;n<2;n++){
  g.beginPath();g.arc(x,y,r*(1+n*.37),-.73*Math.PI,.75*Math.PI);
  g.lineWidth=n?2:4;g.strokeStyle=n?'#ffe3a5':'#372214';g.stroke();
 }g.restore();
}
function register(s){
 if(!s||!s.id||typeof s.draw!=='function'||!Number.isFinite(s.ms)||!s.frames)throw Error('Invalid V130 effect');
 if(seen.has(s.id))throw Error('Duplicated V130 move '+s.id);
 seen.add(s.id);
 for(const name of s.names){const key=norm(name);if(byName.has(key))throw Error('Duplicate V130 alias '+name);byName.set(key,s);}
}
window.PokemonTorreGroundV130=Object.freeze({installed:true,previewOnly:true,register,
 diagnostics:()=>({...state,registered:[...seen],approvedUnchanged:['Grande Fissura','Cauda de Água','Pulso de Água','Withdraw','Pistola d’Água','Bolhas','Mergulho']})});
if(typeof BattleEngine!=='function')return;
const previousPaint=window.PokemonTorreV360Paint;
window.PokemonTorreV360Paint=function(g,fx,now,engine){
 const spec=byName.get(norm(fx?.move?.name||fx?.name));
 if(!spec||!g||!fx||!engine||fx.battle!==battle)
  return typeof previousPaint==='function'?previousPaint.apply(this,arguments):false;
 const elapsed=(now-fx.at)/Math.max(1,Number(fx.duration)||spec.ms);
 if(elapsed<0||elapsed>1)return true;
 // V359 applies HP once at its own relative fx.times[0], never here.
 const hit=clamp(Number(fx.times?.[0])||.64,.2,.88);
 const from=fx.from||[engine.player.x,engine.player.y-engine.h*.13];
 const to=fx.to||[engine.enemy.x,engine.enemy.y-engine.h*.12];
 const scale=clamp((engine.enemy?.r||34)/35,.72,1.22);
 const phase=Math.min(spec.frames-1,Math.floor(clamp(elapsed)*spec.frames));
 g.save();
 try{
  spec.draw(g,{t:clamp(elapsed),hit,frame:phase,from,to,scale,engine,fx,clamp,ease,mix,path,crumb,ripple,splat,shock});
  state.draws++;state.last={name:spec.id,frame:phase+1,total:spec.frames,nativeHit:hit,previewOnly:true};
 }catch(error){
  if(state.errors.length<12)state.errors.push(String(error));
  // No double effects or draw() after restore; native caller can safely skip this frame.
 }finally{g.restore();}
 return true;
};
const oldUse=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(slot){
 const move=battle?.active&&Number.isInteger(slot)?skillSet(current())?.[slot]:null;
 const spec=byName.get(norm(move?.name));
 if(!spec)return oldUse.apply(this,arguments);
 const before=new Set(this.v359Attacks||[]);
 const result=oldUse.apply(this,arguments);
 if(result===false||!battle?.active)return result;
 const event=(this.v359Attacks||[]).find(e=>!before.has(e)&&e.battle===battle&&norm(e.move?.name)===norm(move.name));
 // Preserve all original V359 damage/energy/cooldown and the native one-hit event.
 // Only lengthen/shorten the artwork clock, so the real hit follows the visible hit.
 if(event){event.duration=spec.ms;event.end=event.at+spec.ms;state.hitChanges++;}
 if(event)state.casts++;
 return result;
};
})();