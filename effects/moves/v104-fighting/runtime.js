/* Pokémon Torre V104 — TODOS os golpes ofensivos Lutador são de contato.
 * O Pokémon se aproxima fisicamente, golpeia sem sobreposição e RECUA.
 * O original V359/V47 continua sendo a única fonte de dano e cooldown.
 * Canvas2D animado, sem projétil, PNG estático, CSS ou imagem de prévia.
 */
const fightingV104=(()=>{
 'use strict';
 const specByName=new Map(),state=new WeakMap(),approach=new WeakMap();
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/[^a-z0-9]/g,'');
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
 const lerp=(a,b,u)=>a+(b-a)*u;
 const allowed=m=>!!m&&m.type==='fighting'&&Number(m.power)>0&&
  m.cat!=='status'&&!['shield','status','recover','illusion','weather'].includes(m.kind);
 const log={version:'104.0',visualVersion:'105.0',casts:0,frames:0,approaches:0,contact:0,
  retreats:0,nativeHits:0,nativeRecovered:0,removedGeneric:0,rejected:0,
  distances:[],draws:{},last:null};
 function register(name,frames,duration,impact,paint,other=[]){
  if(![8,12,16].includes(frames)||typeof paint!=='function')
   throw Error('invalid fighting effect '+name);
  const spec=Object.freeze({name,frames,duration,impact,paint});
  for(const id of [name,...other]){
   const key=norm(id);if(specByName.has(key))throw Error('duplicate fighting move '+id);
   specByName.set(key,spec);
  }
 }
 function styleOf(name){
  const n=norm(name),h=[...n].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
  if(/kick|chute|lowkick|doublekick|pulo|joelhada/.test(n))return 'kick';
  if(/chop|karate|corte|lamina/.test(n))return 'chop';
  if(/break|quebra|martelo/.test(n))return 'break';
  if(/cross|cruzado/.test(n))return 'cross';
  if(/aurasphere|golpedeaura|vacuum|focusblast/.test(n))return 'aura';
  if(/punch|soco|punho|mach|uppercut/.test(n))return 'punch';
  return ['punch','kick','chop','cross','break'][h%5];
 }
 function specFor(move){
  return specByName.get(norm(move?.name))||
   {name:move?.name||'Lutador',duration:1000,frames:12,impact:.59,
    style:styleOf(move?.name),paint:window.PokemonTorreFightingInkV105?.generic||generic};
 }
 function shaft(g,a,b,w,fill,edge='#131721',alpha=1){
  if(alpha<=0)return;
  g.save();g.globalAlpha*=clamp(alpha);g.lineCap='round';g.lineJoin='round';
  g.beginPath();g.moveTo(...a);g.lineTo(...b);
  g.lineWidth=w+3;g.strokeStyle=edge;g.stroke();
  g.lineWidth=w;g.strokeStyle=fill;g.stroke();g.restore();
 }
 function shard(g,x,y,len,theta,color,alpha=1){
  if(alpha<=0)return;
  g.save();g.globalAlpha*=clamp(alpha);g.translate(x,y);g.rotate(theta);
  g.beginPath();g.moveTo(-len*.52,-len*.27);
  g.lineTo(len*.22,-len*.42);g.lineTo(len*.65,0);
  g.lineTo(len*.11,len*.32);g.lineTo(-len*.33,len*.2);g.closePath();
  g.fillStyle=color;g.fill();g.strokeStyle='#141825';g.lineWidth=1.6;g.stroke();
  g.restore();
 }
 function star(g,x,y,r,color,alpha=1){
  if(alpha<=0)return;for(let k=0;k<6;k++){
   const a=k*Math.PI/3;
   shaft(g,[x+Math.cos(a)*r*.20,y+Math.sin(a)*r*.20],
    [x+Math.cos(a)*(r+(k%2)*r*.35),y+Math.sin(a)*(r+(k%2)*r*.35)],
    k%2?2.5:3.6,color,'#231a24',alpha*(1-k*.055));
  }
 }
 // Local, compact impact. NEVER interpolate attack artwork from attacker to foe.
 function generic(g,a){
  const s=a.scale,t=a.t,h=a.hit,B=a.to,style=a.style,
   attack=Math.max(0,1-ease((h-t)/.18)),out=ease((t-h)/.25),
   fade=(1-ease((t-.83)/.17))*(1-out*.23);
  if(t<h-.18)return;
  const theta=a.angle,dirx=Math.cos(theta),diry=Math.sin(theta);
  if(t<h){
   const wrist=[B[0]-dirx*25*s,B[1]-diry*25*s],
    tip=[B[0]-dirx*(17-13*attack)*s,B[1]-diry*(17-13*attack)*s];
   shaft(g,wrist,tip,(style==='kick'?8:6)*s,
    style==='aura'?'#ad91ff':'#ffbf83','#251924',attack*.85);
   if(style==='kick'||style==='chop'){
    const k=style==='kick'?.65:-.55;
    shard(g,tip[0],tip[1],(11+18*attack)*s,theta+k,
     style==='kick'?'#ffb35e':'#e6acff',attack*.85);
   }
   return;
  }
  const colors={
   kick:['#f69a48','#ffdfa3'],
   chop:['#b46af8','#f1d1ff'],
   break:['#dc884d','#ffdfb0'],
   cross:['#e6345f','#ffe5e9'],
   aura:['#6b8ff6','#e6f4ff'],
   punch:['#f5774a','#ffe4bd']
  }[style]||['#fc9e55','#fff2cc'];
  const seed=[...norm(a.name)].reduce((n,c)=>n+c.charCodeAt(0),0);
  if(style==='cross'){
   for(const d of [-1,1]){
    const angle=theta+d*.73,vx=Math.cos(angle),vy=Math.sin(angle),r=(26-8*out)*s;
    shaft(g,[B[0]-vx*r,B[1]-vy*r],[B[0]+vx*r,B[1]+vy*r],
     8*s,colors[d>0?0:1],'#281322',fade);
   }
  }else if(style==='break'){
   for(let k=0;k<8;k++){
    const ang=k*Math.PI*2/8+seed*.02,rr=(10+26*out+(k%3)*3)*s;
    shard(g,B[0]+Math.cos(ang)*rr,B[1]+Math.sin(ang)*rr*.78,
     (7+k%3*3)*s,ang,'#c7a382',fade);
   }
  }else if(style==='kick'||style==='chop'){
   const ang=theta+(style==='kick'?.50:-.52);
   const vx=Math.cos(ang),vy=Math.sin(ang),len=(32-10*out)*s;
   shaft(g,[B[0]-vx*len,B[1]-vy*len],[B[0]+vx*len,B[1]+vy*len],
    7*s,colors[0],'#201526',fade);
  }else{
   shaft(g,[B[0]-dirx*(23+8*out)*s,B[1]-diry*(23+8*out)*s],
    [B[0]+dirx*12*s,B[1]+diry*12*s],(10-4*out)*s,
    colors[0],'#1d1722',fade);
  }
  if(t<h+.17)star(g,B[0],B[1],(9+25*out)*s,colors[1],fade*.95);
  for(let i=0;i<7;i++){
   const q=i*Math.PI*2/7+seed*.05,rr=(11+30*out+(i%2)*6)*s;
   shard(g,B[0]+Math.cos(q)*rr,B[1]+Math.sin(q)*rr*.83,
    (3+i%3*2)*s,q,colors[i%2],fade*(1-i*.07));
  }
 }
 // V105 only swaps paint callbacks. Battle movement, original native hit,
 // distance, cooldown, energy, saves and sprite animation never change.
 function retexture(name,painter){
  if(typeof painter!=='function')throw Error('V105 painter invalid '+name);
  const original=specByName.get(norm(name));
  if(!original)throw Error('V105 protected move not found '+name);
  const newer=Object.freeze({...original,paint:painter});
  for(const [alias,item] of specByName)if(item===original)specByName.set(alias,newer);
  return newer;
 }
 const gap=(e,f=.226)=>Math.max(57,(e.h||560)*f);
 function legal(e,fx){
  return !!(fx&&battle?.active&&!battle.paused&&fx.battle===battle&&
   fx.owner===current()&&fx.victim===foe()&&e.running&&
   e.player&&e.enemy&&Number(fx.victim.hp)>0);
 }
 function cancel(e){if(state.has(e)){state.delete(e);log.retreats++;}
  approach.delete(e);}
 function start(e,move,event,owner,victim,now,contacts,misses){
  const spec=specFor(move);
  const began=Number(event?.at)||now;
  const fx={name:move.name,spec,owner,victim,battle,at:began,
   duration:spec.duration,hit:spec.impact,event,before:Number(victim?.hp),
   connected:false,contactAt:began+spec.duration*spec.impact,
   style:spec.style||styleOf(move.name),retreated:false};
  if(event){
   event.duration=spec.duration;event.times=[spec.impact];event.end=began+spec.duration+70;
   event.v104Contact=true;event.v104ContactAt=fx.contactAt;
   // One ORIGINAL hit event. Existing saved damage/power stays untouched.
   event.v103ImpactAt=fx.contactAt;
  }
  for(const c of e.v47ContactToLand||[]){
   if(contacts.has(c)||c.settled||c.owner!==owner||c.victim!==victim||norm(c.name)!==norm(move.name))continue;
   c.at=fx.contactAt;c.until=Math.max(c.until,fx.contactAt+1150);
  }
  if(Array.isArray(e.v47MissingCollisions)){
   const old=e.v47MissingCollisions.length;
   e.v47MissingCollisions=e.v47MissingCollisions.filter(c=>misses.has(c)||
     c.owner!==owner||c.victim!==victim||norm(c.name)!==norm(move.name));
   log.removedGeneric+=old-e.v47MissingCollisions.length;
  }
  // No legacy secondary catalog visuals for the SAME physical attack.
  if(Array.isArray(e.v3580Visuals))
   e.v3580Visuals=e.v3580Visuals.filter(c=>norm(c?.move?.name)!==norm(move.name));
  state.set(e,fx);log.casts++;
  log.last={name:move.name,style:fx.style,impactAt:fx.contactAt,
   frames:spec.frames,approachGap:gap(e),retreatGap:gap(e,.315)};
  return fx;
 }
 function step(e,dt,now){
  if(!battle?.active||battle.paused||!e.running){cancel(e);return;}
  const p=approach.get(e);
  if(p){
   if(p.battle!==battle||p.owner!==current()||p.victim!==foe()||p.owner.hp<=0||
     now>p.until){approach.delete(e);log.rejected++;return;}
   const dx=e.enemy.x-e.player.x,dy=e.enemy.y-e.player.y,
    d=Math.hypot(dx,dy)||1,stop=gap(e,.225);
   if(d>stop){
    const advance=Math.min(d-stop,Math.max(e.h*1.65,620)*Math.min(.05,Math.max(.008,dt||.016)));
    e.player.x+=dx/d*advance;e.player.y+=dy/d*advance;
    e.bounds?.(e.player);e.collideRocks?.(e.player);
   }
   if(Math.hypot(e.enemy.x-e.player.x,e.enemy.y-e.player.y)<=gap(e,.232)){
    approach.delete(e);log.approaches++;p.launch();
   }
  }
  const a=state.get(e);if(!a)return;
  if(!legal(e,a)||now>a.at+a.duration+100){cancel(e);return;}
  const t=clamp((now-a.at)/a.duration);
  // From a readable non-overlapping distance (ca. 100px at 560h),
  // recoil ca. 50px after the REAL contact. Moves actual actor coordinates.
  const initial=gap(e,.225),closest=gap(e,.215),recoil=gap(e,.315);
  const desired=t<a.hit?
   lerp(initial,closest,ease((t-.10)/Math.max(.12,a.hit-.10))):
   lerp(closest,recoil,ease((t-a.hit)/.24));
  const dx=e.player.x-e.enemy.x,dy=e.player.y-e.enemy.y,
   d=Math.hypot(dx,dy)||1,nx=dx/d,ny=dy/d;
  const speed=(t<a.hit?e.h*2.5:e.h*3.1)*Math.min(.05,Math.max(.008,dt||.016));
  const delta=clamp(desired-d,-speed,speed);
  e.player.x+=nx*delta;e.player.y+=ny*delta;
  e.bounds?.(e.player);
  // Keep air between actual sprite centers, including legacy rendering offset.
  const after=Math.hypot(e.player.x-e.enemy.x,e.player.y-e.enemy.y);
  log.distances.push(Math.round(after));if(log.distances.length>30)log.distances.shift();
  if(t>=a.hit&&!a.retreated){a.retreated=true;log.contact++;}
  if(t>=.93){state.delete(e);log.retreats++;}
 }
 function draw(g,e,fx,now){
  const a=state.get(e);
  if(!a||!legal(e,a))return false;
  if(fx&&a.event&&fx!==a.event)return false;
  if(now<a.at||now>a.at+a.duration+65)return false;
  const t=clamp((now-a.at)/a.duration);
  // Artwork stays anchored to the enemy's contact side — no flying projectile.
  const ex=e.enemy.x,ey=e.enemy.y-e.h*.12;
  const dx=e.enemy.x-e.player.x,dy=e.enemy.y-e.player.y,
   ang=Math.atan2(dy,dx);
  const target=[ex-Math.cos(ang)*Math.min(9,e.h*.016),ey-Math.sin(ang)*Math.min(9,e.h*.016)];
  const s=clamp((e.enemy.r||e.h*.08)/39,.70,1.25),spec=a.spec;
  g.save();try{spec.paint(g,{name:a.name,style:a.style,t,hit:a.hit,
   now,frames:spec.frames,frame:Math.min(spec.frames-1,Math.floor(t*spec.frames)),
   to:target,angle:ang,scale:s,clamp,ease,lerp,shaft,shard,star});}
  finally{g.restore()}
  log.frames++;log.draws[norm(a.name)]=(log.draws[norm(a.name)]||0)+1;
  return true;
 }
 function hit(e,who,type,prev,after){
  if(who!=='enemy'||!(after<prev))return;
  const fx=state.get(e);
  if(!fx||!legal(e,fx)||type!== 'fighting')return;
  const now=performance.now();
  if(now<fx.contactAt-135||now>fx.contactAt+480)return;
  if(fx.event&&!fx.connected){
   fx.event.hits=Math.max(fx.event.hits||0,fx.event.times?.length||1);
   fx.connected=true;log.nativeHits++;
  }
 }
 return {register,retexture,allowed,styleOf,step,draw,start,cancel,state,approach,hit,gap,report:log,
  diagnostics:()=>({...log,distances:log.distances.slice(),draws:{...log.draws},
   active:typeof engine!=='undefined'&&engine?state.get(engine)?.name||null:null,
   pending:typeof engine!=='undefined'&&engine?!!approach.get(engine):false,
   registered:[...new Set(specByName.values())].map(x=>({name:x.name,frames:x.frames}))})};
})();
window.PokemonTorreFightingV104=fightingV104;
(()=>{
 'use strict';if(typeof BattleEngine!=='function')return;
 const api=fightingV104;
 const priorUse=BattleEngine.prototype.useMove;
 BattleEngine.prototype.useMove=function(slot){
  const owner=battle?.active?current():null,move=owner&&Number.isInteger(slot)?
   skillSet(owner)?.[slot]:null;
  if(!api.allowed(move))return priorUse.apply(this,arguments);
  const now=performance.now(),victim=foe();
  if(!this.running||battle.paused||owner.hp<=0||
   (cooldowns[slot]||0)>now||Number(battle.energy)<Number(move.cost||0))
   return priorUse.apply(this,arguments);
  // Physical punches NEVER fire remotely. First travel toward target on real
  // arena coordinates. No energy/cooldown charged until a legal native cast.
  if(Math.hypot(this.player.x-this.enemy.x,this.player.y-this.enemy.y)>api.gap(this,.233)){
   if(api.approach.has(this))return false;
   api.approach.set(this,{battle,owner,victim,until:now+2700,
    launch:()=>this.useMove(slot)});
   // Moving actual actor coordinates (not launching a visual projectile).
   return true;
  }
  const beforeEvents=new Set(this.v359Attacks||[]),
   beforeContacts=new Set(this.v47ContactToLand||[]),
   beforeMisses=new Set(this.v47MissingCollisions||[]),
   beforeShots=new Set(this.projectiles||[]),beforeBeam=this.telegraph,
   energy=Number(battle.energy),cd=Number(cooldowns[slot]||0);
  const result=priorUse.apply(this,arguments);
  if(!battle?.active||battle.paused||owner!==current()||victim!==foe())return result;
  let event=(this.v359Attacks||[]).findLast(f=>!beforeEvents.has(f)&&
   f.move?.name===move.name&&f.battle===battle&&f.owner===owner);
  const charged=Number(battle.energy)<energy||Number(cooldowns[slot]||0)>cd;
  if(!event){
   // Some old V81/V80 "ranged Fighting" adapters swallow Aura Sphere's cast
   // without allocating a V359 hit event. It must not become an invisible
   // zero-damage animation. Recover using the SAME native V359 hit queue,
   // energy, cooldown and hitTarget(); never apply fake damage here.
   if(!charged){
    if(result!==false&&this.v33Windup?.until>now)return result;
    if(Number(battle.energy)<Number(move.cost||0)||(cooldowns[slot]||0)>now)
     return result;
    battle.energy=Math.max(0,Number(battle.energy)-Number(move.cost||0));
    cooldowns[slot]=now+Math.max(450,Number(move.cd)||1000);
   }
   event={kind:'contact',move,at:now,end:now+540,duration:540,
    battle,owner,target:victim,hits:0,times:[.64],
    from:[this.player.x,this.player.y-this.h*.13],
    to:[this.enemy.x,this.enemy.y-this.h*.12]};
   this.v359Attacks||=[];
   this.v359Attacks.push(event);
   this.v359Attacks=this.v359Attacks.slice(-16);
   this.v359Casts=(this.v359Casts||0)+1;
   this.v359LastMove=move.name;
   api.report.nativeRecovered=(api.report.nativeRecovered||0)+1;
  }
  // A few legacy Fighting moves still spawn a projectile in parallel with
  // their contact event. Discard only those spawned by THIS physical cast,
  // never shots from an older or different-type approved move.
  if(Array.isArray(this.projectiles)){
   const before=this.projectiles.length;
   this.projectiles=this.projectiles.filter(p=>beforeShots.has(p)||p.from!=='player');
   api.report.removedGeneric+=before-this.projectiles.length;
  }
  if(this.telegraph!==beforeBeam&&this.telegraph?.from==='player')
   this.telegraph=beforeBeam;
  api.start(this,move,event,owner,victim,now,beforeContacts,beforeMisses);
  return result===false?true:result;
 };
 const prevUpdate=BattleEngine.prototype.update;
 BattleEngine.prototype.update=function(dt,now){
  // Damage occurs in the ORIGINAL V359 update, on the previous frame's
  // physically approached sprite. Frame step only modifies movement afterward.
  const result=prevUpdate.apply(this,arguments);
  api.step(this,dt,Number.isFinite(now)?now:performance.now());
  return result;
 };
 const prevHit=BattleEngine.prototype.hitTarget;
 BattleEngine.prototype.hitTarget=function(who,type,power){
  const prev=who==='enemy'?Number(foe()?.hp):NaN;
  const result=prevHit.apply(this,arguments);
  api.hit(this,who,type,prev,who==='enemy'?Number(foe()?.hp):NaN);
  return result;
 };
 const oldFX=window.PokemonTorreV360Paint;
 window.PokemonTorreV360Paint=function(g,f,now,e){
  if(api.allowed(f?.move)){
   api.draw(g,e,f,now);
   return true; // NO Pixi orb, V103 beam, generic catalog or other projectile
  }
  return typeof oldFX==='function'?oldFX.apply(this,arguments):false;
 };
 const prevDraw=BattleEngine.prototype.draw;
 BattleEngine.prototype.draw=function(now){
  const done=prevDraw.apply(this,arguments);
  const fx=api.state.get(this);
  if(fx&&!fx.event&&battle?.active&&this.ctx)api.draw(this.ctx,this,null,now);
  return done;
 };
})();
// Existing localhost-only Chromium harness; DOES NOT ship game modification UI.
(()=>{
 if(!/^(localhost|127\.0\.0\.1)$/.test(location.hostname))return;
 const qa=window.PokemonTorreLocalCombatTestV47;
 if(!qa)return;
 const names=['Chute','Golpe de Karatê','Cross Chop','Brick Break','Soco Dinâmico','Aura Sphere'];
 qa.castFightingV104=function(slot=0,far=true){
  if(!Number.isInteger(slot)||slot<0||slot>=names.length)return {error:'bad V104 slot'};
  if(this._v104SkillSetOriginal){skillSet=this._v104SkillSetOriginal;this._v104SkillSetOriginal=null;}
  this.start(150,143);
  const owner=current(),victim=foe(),oldSkills=skillSet;
  const skills=names.map((name,i)=>({name,type:'fighting',kind:i===5?'bolt':'dash',
    cat:'physical',power:45,cost:1,cd:650,level:1,icon:''}));
  this._v104SkillSetOriginal=oldSkills;
  skillSet=mon=>mon===owner?skills:oldSkills(mon);
  // Deliberately start FAR out of attack range, verifying real walking.
  const sep=engine.h*(far?.61:.23);
  engine.player.x=engine.enemy.x-sep;engine.player.y=engine.enemy.y;
  engine.enemy.inv=0;engine.enemy.spawn=0;engine.enemyAttackCD=999;
  engine.foeDodgeCD=999;engine.v33Windup=null;engine.running=true;
  battle.paused=false;battle.energy=100;cooldowns=[0,0,0,0];
  const hpBefore=Number(victim.hp),positionBefore=engine.player.x,
   enemyX=engine.enemy.x,cast=engine.useMove(slot);
  return {name:names[slot],accepted:cast!==false,hpBefore,
   initialGap:enemyX-positionBefore,
   afterInputEnergy:battle.energy,stats:fightingV104.diagnostics()};
 };
 qa.fightingStateV104=()=>({
  active:!!battle?.active,paused:!!battle?.paused,hp:Number(foe()?.hp),
  distance:Math.hypot(engine.enemy.x-engine.player.x,engine.enemy.y-engine.player.y),
  h:engine.h,enemyInv:engine.enemy.inv,
  nativeHits:window.PokemonTorreCombatV47?.().realHits||0,
  fx:fightingV104.diagnostics(),pixel:window.PokemonTorreFightingInkV105?.diagnostics()||null,canvasReady:!!engine.canvas?.isConnected,
  running:!!engine.running,safe:new URLSearchParams(location.search).get('safe')==='1'
 });
})();
