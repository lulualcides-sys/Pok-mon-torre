/* V101 — 3 approved Ice effects on normal and safe battle.
 * Four isolated authored renderers; 12–16 animated poses, motion interpolated
 * at game FPS, original hit/damage/cooldown unchanged. Canvas 2D runtime
 * integrates with the existing Pixi-enabled game with no PNG/CSS/video overlay.
 */
const iceOfficialV101=(()=>{
 'use strict';
 const registry=new Map(),active=new WeakMap(),frames=Object.create(null);
 const allowed=Object.freeze(['aurorabeam','impactoglacial','raiodegelo']);
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/[^a-z0-9]/g,'');
 const canonicalKey=s=>{const k=norm(s);return (k==='icebeam'||k==='raiocongelante')?'raiodegelo':(k==='raioaurora'||k==='raiodaaurora')?'aurorabeam':k;};
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
 const mix=(a,b,u)=>a+(b-a)*u;
 const point=(a,b,t)=>[mix(a[0],b[0],t),mix(a[1],b[1],t)];
 const vec=(a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy)||1;
  return {dx,dy,dxn:dx/length,dyn:dy/length,nx:-dy/length,ny:dx/length,length,
   angle:Math.atan2(dy,dx)};};
 function line(g,pts,width,color,edge='#19364b',alpha=1){
  if(pts.length<2)return;
  g.save();g.globalAlpha*=clamp(alpha);g.lineCap='round';g.lineJoin='round';
  g.beginPath();g.moveTo(...pts[0]);for(const p of pts.slice(1))g.lineTo(...p);
  if(edge){g.lineWidth=width+2;g.strokeStyle=edge;g.stroke();}
  g.lineWidth=width;g.strokeStyle=color;g.stroke();g.restore();
 }
 function shard(g,x,y,size,angle,fill='#a6e5f5',opacity=1){
  g.save();g.globalAlpha*=clamp(opacity);g.translate(x,y);g.rotate(angle);
  g.beginPath();g.moveTo(0,-size);g.lineTo(size*.43,-size*.12);
  g.lineTo(size*.20,size*.72);g.lineTo(-size*.55,size*.1);g.closePath();
  g.fillStyle=fill;g.fill();g.strokeStyle='#173c55';g.lineWidth=1.4;g.stroke();
  g.beginPath();g.moveTo(0,-size*.73);g.lineTo(size*.06,size*.43);
  g.strokeStyle='#effaff';g.lineWidth=.85;g.stroke();g.restore();
 }
 function star(g,x,y,r,color,alpha){
  line(g,[[x-r,y],[x+r,y]],1.2,color,'#25445b',alpha);
  line(g,[[x,y-r],[x,y+r]],1.2,color,'#25445b',alpha);
 }
 function ring(g,x,y,rx,ry,color,opacity=1){
  g.save();g.globalAlpha*=clamp(opacity);g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);
  g.strokeStyle='#19394b';g.lineWidth=3;g.stroke();
  g.strokeStyle=color;g.lineWidth=1.4;g.stroke();g.restore();
 }
 function register(name,framesCount,duration,renderer,impactFraction){
  const key=norm(name);
  if(!allowed.includes(key)||registry.has(key)||typeof renderer!=='function')throw Error('V101 duplicate/invalid '+name);
  if(framesCount!==12&&framesCount!==16)throw Error('Only 12 or 16 key poses');
  registry.set(key,Object.freeze({name,framesCount,duration,renderer,impactFraction}));
  frames[key]=0;
 }
 const metrics={version:'101.0-approved',casts:0,draws:0,suppressed:0,
  clears:0,last:null,missing:0,forbiddenNormal:0};
 function start(engine,name,now){
  const key=canonicalKey(name),spec=registry.get(key);
  if(!spec||!battle?.active||!engine?.canvas?.isConnected)return false;
  if(Number.isFinite(engine.enemy?.hp)&&engine.enemy.hp<=0)return false;
  const from=[engine.player.x,engine.player.y-engine.h*.13],
   to=[engine.enemy.x,engine.enemy.y-engine.h*.12];
  const cast={spec,key,battle,at:now,from,to,duration:spec.duration,
   hitFraction:spec.impactFraction};
  // Only the existing attack event determines the actual damage moment.
  const events=[...(engine.v359Attacks||[]),...(engine.v3580Visuals||[])];
  const evt=events.findLast?.(f=>f?.move?.name===name&&Math.abs((f.at||0)-now)<260);
  if(evt?.duration&&Array.isArray(evt.times)&&evt.times.length){
   cast.at=Number(evt.at)||now;
   const hitMs=Number(evt.duration)*Number(evt.times[0]);
   if(Number.isFinite(hitMs)&&hitMs>100){
    cast.duration=Math.max(hitMs/spec.impactFraction+50,hitMs+160);
    cast.hitFraction=hitMs/cast.duration;
   }
  }
  active.set(engine,cast);metrics.casts++;return true;
 }
 function current(engine,now=performance.now()){
  const e=engine&&active.get(engine);
  if(!e)return null;
  if(e.battle!==battle||!battle?.active||!engine?.canvas?.isConnected||
    (Number.isFinite(engine.enemy?.hp)&&engine.enemy.hp<=0)){
   active.delete(engine);metrics.clears++;return null;
  }
  if(now-e.at>e.duration+90){active.delete(engine);return null;}
  return e;
 }
 function clear(engine){if(engine&&active.delete(engine))metrics.clears++;}
 function paint(engine,now){
  const cast=current(engine,now);if(!cast||!engine.ctx)return false;
  const progress=clamp((now-cast.at)/cast.duration),
   frame=Math.min(cast.spec.framesCount-1,
    Math.floor(progress*cast.spec.framesCount));
  const k=cast.spec,scale=clamp((engine.enemy?.r||engine.h*.08)/27,.70,1.30);
  const g=engine.ctx;
  g.save();try{
   k.renderer(g,{from:cast.from,to:cast.to,progress,frame,
    frames:k.framesCount,scale,hit:cast.hitFraction,time:now,
    phase:clamp((progress-cast.hitFraction)/Math.max(.01,1-cast.hitFraction))});
  }finally{g.restore();}
  metrics.draws++;frames[cast.key]=(frames[cast.key]||0)+1;
  metrics.last={name:k.name,frame:frame+1,total:k.framesCount,
   visual:'canvas-2d-animated-sprites',hitFraction:cast.hitFraction};
  return true;
 }
 const api=Object.freeze({register,paint,start,current,clear,norm,canonicalKey,
  line,shard,star,ring,mix,point,vec,smooth,clamp,
  diagnostics:()=>({registered:[...registry.values()].map(s=>({name:s.name,frames:s.framesCount})),
   ...metrics,drawsPerMove:{...frames},active:typeof engine!=='undefined'&&engine?
    current(engine)?.spec?.name||null:null})});
 return api;
})();
window.PokemonTorreIceV101=iceOfficialV101;
// The archived V99 preview remains opt-in; this official renderer is default.
(()=>{
 'use strict';
 if(new URLSearchParams(location.search).get('battle_preview')==='ice99')return;
 if(typeof BattleEngine!=='function')return;
 const fx=iceOfficialV101,acceptedNames=new Set([
  'aurorabeam','impactoglacial','raiodegelo']);
 const previous=BattleEngine.prototype.useMove;
 BattleEngine.prototype.useMove=function(slot){
  const actor=battle?.active?current():null;
  const move=actor&&Number.isInteger(slot)?skillSet(actor)?.[slot]:null;
  const key=fx.canonicalKey(move?.name);
  if(!acceptedNames.has(key))return previous.apply(this,arguments);
  const beforeEnergy=Number(battle.energy),
   beforeCd=Number(cooldowns?.[slot])||0;
  const shots=new Set(this.projectiles||[]);
  const oldParticles=this.particles?.length||0,oldRings=this.rings?.length||0;
  const castAt=performance.now();
  const result=previous.apply(this,arguments);
  const accepted=result!==false&&battle?.active&&!battle.paused&&
   (Number(battle.energy)<beforeEnergy||(Number(cooldowns?.[slot])||0)>beforeCd);
  if(!accepted)return result;
  if(!fx.start(this,move.name,castAt))return result;
  // Keep mechanics: tag ONLY the new bullets, never remove hit projectiles.
  for(const projectile of this.projectiles||[])
   if(!shots.has(projectile)&&projectile.from==='player')
    projectile.__ice99VisualOnlyHidden=true;
  // Remove only generic cast decoration synchronously produced for this cast.
  if(this.particles?.length>oldParticles)this.particles.length=oldParticles;
  if(this.rings?.length>oldRings)this.rings.length=oldRings;
  return result;
 };
 const olderProjectile=BattleEngine.prototype.drawProjectile;
 if(typeof olderProjectile==='function')
  BattleEngine.prototype.drawProjectile=function(p){
   if(p?.__ice99VisualOnlyHidden)return;
   return olderProjectile.apply(this,arguments);
  };
 const oldPaint=window.PokemonTorreV360Paint;
 window.PokemonTorreV360Paint=function(g,f,now,owner){
  const key=fx.canonicalKey(f?.move?.name||f?.name);
  const active=fx.current(owner,now);
  if(active&&key===active.key){return true;}
  return typeof oldPaint==='function'?oldPaint.apply(this,arguments):false;
 };
 const oldDraw=BattleEngine.prototype.draw;
 BattleEngine.prototype.draw=function(now){
  const result=oldDraw.apply(this,arguments);
  if(battle?.active)fx.paint(this,now);
  return result;
 };
 const oldStop=stopTimers;
 stopTimers=function(){
  if(typeof engine!=='undefined'&&engine)fx.clear(engine);
  return oldStop.apply(this,arguments);
 };
 // Headless localhost QA, not exposed as a playable tool on the public site.
 const qa=window.PokemonTorreLocalCombatTestV47;
 if(qa&&/^(localhost|127\.0\.0\.1)$/.test(location.hostname)){
  qa.castOfficialIceV101=function(slot=0,foeId=25,reuse=false){
   const names=['Aurora Beam','Impacto Glacial','Raio de Gelo','Ice Beam'];
   if(!Number.isInteger(slot)||slot<0||slot>=4)return {error:'Invalid ice preview slot'};
   if(!reuse||!battle?.active){
    if(this._iceOriginalSkillSet)skillSet=this._iceOriginalSkillSet;
    this.start(150,foeId);
    const actor=current(),original=skillSet;
    this._iceOriginalSkillSet=original;
    const kinds=['beam','dash','beam','beam'];
    const moves=names.map((name,i)=>({name,type:'ice',kind:kinds[i],
     cat:'special',power:[40,42,53,53][i],cost:0,cd:300,level:1,icon:''}));
    skillSet=mon=>mon===actor?moves:original(mon);
   }
   const fired=this.cast(slot);
   return {selected:fired.name,fired,preview:fx.diagnostics()};
  };
 }
 window.PokemonTorreIceOfficialV101=Object.freeze({
  version:'99.0',enabled:true,diagnostics:fx.diagnostics,
  names:['Aurora Beam','Impacto Glacial','Raio de Gelo']
 });
})();
