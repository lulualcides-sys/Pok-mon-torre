/* Pokemon Torre V133 — four new GROUND moves, opt-in playable battle preview.
 * Draws actual animated Canvas frames in the battle renderer, not PNG/CSS/Atelie.
 * Delegates every other move to V132 and the original pipeline. Never computes HP.
 */
(()=>{
 'use strict';
 const qs=new URLSearchParams(location.search);
 if(qs.get('ground133')!=='preview'||qs.get('safe')==='1')return;
 if(window.PokemonTorreGroundV133?.installed)return;
 const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,Number.isFinite(v)?v:a));
 const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
 const mix=(a,b,q)=>a+(b-a)*q;
 const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const rad=Math.PI/180;
 const registerByName=new Map(),registered=new Set();
 const stats={casts:0,frames:0,hitClockChanges:0,errors:[],last:null,previewOnly:true};
 function poly(g,points,fill,stroke='#211b16',width=2){
  if(!points?.length)return;
  g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();
  if(fill){g.fillStyle=fill;g.fill();}
  if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.lineJoin='miter';g.stroke();}
 }
 function shard(g,x,y,r,turn=0,alpha=1,fill='#9a8064'){
  if(alpha<=0)return;
  g.save();g.translate(x,y);g.rotate(turn);g.globalAlpha*=clamp(alpha);
  poly(g,[[-r*.94,r*.64],[-r*.39,-r*.61],[r*.13,-r],[r*.88,-r*.11],[r*.73,r*.82]],
    fill,'#29241f',Math.max(1,r*.18));
  g.beginPath();g.moveTo(-r*.39,-r*.61);g.lineTo(r*.12,-r*.28);g.lineTo(r*.45,r*.52);
  g.strokeStyle='#cebca0';g.lineWidth=Math.max(.7,r*.12);g.stroke();g.restore();
 }
 function grain(g,x,y,r,alpha=1,fill='#b59a75'){
  if(alpha<=0)return;g.save();g.globalAlpha*=clamp(alpha);
  g.beginPath();g.arc(x,y,Math.max(.4,r),0,2*Math.PI);
  g.fillStyle=fill;g.fill();g.restore();
 }
 function crack(g,points,w=2,alpha=1){
  if(alpha<=0||points.length<2)return;g.save();g.globalAlpha*=clamp(alpha);
  for(const [line,colour,width] of [[0,'#211e1c',w+1.7],[1,'#786451',Math.max(.6,w*.36)]]){
   g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x+(line?.55:0),y+(line?.5:0)):g.moveTo(x,y));
   g.lineJoin='bevel';g.lineCap='butt';g.strokeStyle=colour;g.lineWidth=width;g.stroke();
  }g.restore();
 }
 function register(spec){
  if(!spec?.name||!Array.isArray(spec.aliases)||typeof spec.draw!=='function'||
     !Number.isFinite(spec.ms)||spec.ms<600||spec.ms>2100||![12,16].includes(spec.frames))
   throw Error('Invalid V133 move spec');
  if(registered.has(spec.name))throw Error('V133 move already registered');
  registered.add(spec.name);
  for(const alias of [spec.name,...spec.aliases]){
   const key=norm(alias);
   if(registerByName.has(key))throw Error('V133 duplicate alias '+alias);
   registerByName.set(key,spec);
  }
 }
 window.PokemonTorreGroundV133=Object.freeze({installed:true,previewOnly:true,register,
  diagnostics:()=>({...stats,registered:[...registered],approvedPreserved:['Osso','Grande Fissura','Withdraw','Pistola d’Água','Bolhas','Mergulho','Cauda de Água','Pulso de Água']})});
 if(typeof BattleEngine!=='function')return;
 const previousPaint=window.PokemonTorreV360Paint;
 window.PokemonTorreV360Paint=function(g,fx,now,e){
  const spec=registerByName.get(norm(fx?.move?.name));
  if(!spec||!g||!fx||!e||fx.battle!==battle)
   return typeof previousPaint==='function'?previousPaint.apply(this,arguments):false;
  const duration=Math.max(1,Number(fx.duration)||spec.ms),p=(now-fx.at)/duration;
  if(p<0||p>1)return true;
  const hit=clamp(Number(fx.times?.[0])||.64,.3,.89);
  const A=fx.from||[e.player?.x||0,(e.player?.y||0)-(e.h||420)*.13],
        B=fx.to||[e.enemy?.x||0,(e.enemy?.y||0)-(e.h||420)*.12];
  const scale=clamp((e.enemy?.r||33)/35,.72,1.14);
  const frame=Math.min(spec.frames-1,Math.floor(clamp(p)*spec.frames));
  g.save();
  try{
   spec.draw(g,{t:clamp(p),hit,frame,scale,from:A,to:B,engine:e,clamp,ease,mix,poly,shard,grain,crack,rad});
   stats.frames++;
   stats.last={move:spec.name,frame:frame+1,total:spec.frames,hitAt:hit};
  }catch(err){
   if(stats.errors.length<10)stats.errors.push(spec.name+': '+String(err));
   // Intercepted only these four names; do not stack fallback layers on these.
  }finally{g.restore();}
  return true;
 };
 const beforeUse=BattleEngine.prototype.useMove;
 BattleEngine.prototype.useMove=function(slot){
  const move=battle?.active&&Number.isInteger(slot)?skillSet(current())?.[slot]:null;
  const spec=registerByName.get(norm(move?.name));
  if(!spec)return beforeUse.apply(this,arguments);
  const before=new Set(this.v359Attacks||[]);
  const result=beforeUse.apply(this,arguments);
  if(result===false||!battle?.active)return result;
  // Respect original hit power, owner, cost, cooldown and single-hit V359.
  const fx=(this.v359Attacks||[]).find(x=>!before.has(x)&&x.battle===battle&&norm(x.move?.name)===norm(move.name));
  if(fx){
   fx.duration=spec.ms;fx.end=fx.at+spec.ms;
   stats.casts++;stats.hitClockChanges++;
  }
  return result;
 };
})();