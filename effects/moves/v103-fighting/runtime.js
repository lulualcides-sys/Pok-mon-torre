/* Pokémon Torre V103 — four distinct, genuinely animated contact attacks.
 * Normal and safe battle use the same native Canvas2D at 60FPS. The approved
 * Pixi/WebGL combat layer remains untouched; NO static PNG, video or CSS FX.
 * Original hitTarget/damage, energy, cooldown, movement, HP and saves own logic.
 */
const fightingV103=(()=>{
 'use strict';
 const entries=new Map(), aliases=new Map(), active=new WeakMap();
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/[^a-z0-9]/g,'');
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
 const mix=(a,b,t)=>a+(b-a)*t;
 const between=(a,b,t)=>[mix(a[0],b[0],t),mix(a[1],b[1],t)];
 const dir=(a,b)=>{const x=b[0]-a[0],y=b[1]-a[1],m=Math.hypot(x,y)||1;
  return {x:x/m,y:y/m,nx:-y/m,ny:x/m,angle:Math.atan2(y,x),dist:m}};
 function path(g,points,w,fill,edge='#141521',alpha=1){
  if(points.length<2||alpha<=0)return;
  g.save();g.globalAlpha*=clamp(alpha);g.lineCap='round';g.lineJoin='round';
  g.beginPath();g.moveTo(...points[0]);
  for(const p of points.slice(1))g.lineTo(...p);
  if(edge){g.strokeStyle=edge;g.lineWidth=w+3.4;g.stroke();}
  g.strokeStyle=fill;g.lineWidth=w;g.stroke();g.restore();
 }
 function shard(g,x,y,len,rot,fill,alpha=1,w=.48){
  if(alpha<=0)return;
  g.save();g.translate(x,y);g.rotate(rot);g.globalAlpha*=clamp(alpha);
  g.beginPath();g.moveTo(-len*.65,-len*w*.3);
  g.lineTo(len*.15,-len*w);g.lineTo(len*.7,0);
  g.lineTo(len*.12,len*w*.6);g.lineTo(-len*.36,len*w*.33);g.closePath();
  g.fillStyle=fill;g.fill();g.strokeStyle='#171723';g.lineWidth=1.8;g.stroke();
  g.restore();
 }
 function burst(g,p,r,count,colors,alpha=1,seed=0){
  if(alpha<=0)return;
  for(let i=0;i<count;i++){
   const theta=(i+seed*.19)*Math.PI*2/count;
   const rr=r*(.7+(i%3)*.16),outer=r*1.65;
   const a=[p[0]+Math.cos(theta)*rr,p[1]+Math.sin(theta)*rr*.81],
    b=[p[0]+Math.cos(theta)*outer,p[1]+Math.sin(theta)*outer*.81];
   path(g,[a,b],i%3===0?4:2.2,colors[i%colors.length],'#211827',alpha*(.88-i%3*.1));
   if(i%2===0)shard(g,b[0],b[1],(4+i%3*3),theta,
    colors[(i+1)%colors.length],alpha*.82);
  }
 }
 function slash(g,p,theta,len,width,col,alpha=1){
  const v=[Math.cos(theta),Math.sin(theta)],n=[-v[1],v[0]],
   a=[p[0]-v[0]*len*.55,p[1]-v[1]*len*.55],
   b=[p[0]+v[0]*len*.45,p[1]+v[1]*len*.45],
   c=[p[0]+n[0]*width,p[1]+n[1]*width];
  path(g,[a,c,b],Math.max(2.5,width*.9),col,'#13111c',alpha);
  path(g,[a,c,b],Math.max(.8,width*.22),'#fffcf0',null,alpha*.86);
 }
 function register(name,frames,duration,impact,renderer,alternate=[]){
  const key=norm(name);
  if(entries.has(key)||![8,12,16].includes(frames)||!(impact>.3&&impact<.85)||
    typeof renderer!=='function')throw Error('Invalid isolated fighting animation: '+name);
  const spec=Object.freeze({name,key,frames,duration,impact,renderer});
  entries.set(key,spec);for(const alias of [name,...alternate]){
   const k=norm(alias);if(aliases.has(k))throw Error('Fighting alias collision '+alias);
   aliases.set(k,key);
  }
 }
 const lookup=name=>entries.get(aliases.get(norm(name)))||null;
 const report={version:'103.0',casts:0,draws:0,removed:0,
  last:null,perMove:Object.create(null),hitSyncs:0};
 function cast(engine,spec,now,event,owner,victim,existingContacts){
  const at=Number(event?.at)||now;
  const fx={at,duration:spec.duration,spec,event,owner,victim,
   battle,from:[engine.player.x,engine.player.y-engine.h*.13]};
  if(event){
   event.duration=spec.duration;event.times=[spec.impact];
   event.end=at+spec.duration+60;
   event.v103ImpactAt=at+spec.duration*spec.impact;
   event.v103Contact=true;
  }
  const hitAt=at+spec.duration*spec.impact;
  // V47 has a native single-hit fallback for physical contact. Move its real
  // hit check to the exact SAME animation contact; never create another hit.
  for(const item of engine.v47ContactToLand||[]){
   if(existingContacts?.has(item))continue;
   if(item.name!==spec.name&&lookup(item.name)!==spec)continue;
   if(item.owner!==owner||item.victim!==victim||item.settled)continue;
   if(item.until<now||Math.abs(item.at-now)>2800)continue;
   item.at=hitAt;item.until=Math.max(item.until,hitAt+1100);
   report.hitSyncs++;
  }
  active.set(engine,fx);report.casts++;
  return fx;
 }
 function paint(g,engine,now,event){
  const state=active.get(engine);
  if(!state||state.event&&event!==state.event||!g)return false;
  if(!battle?.active||battle!==state.battle||battle.paused||
   !engine.canvas?.isConnected||current()!==state.owner||
   foe()!==state.victim||now>state.at+state.duration+60){
   active.delete(engine);report.removed++;return false;
  }
  const t=clamp((now-state.at)/state.duration);
  const frame=Math.min(state.spec.frames-1,Math.floor(t*state.spec.frames));
  const to=[engine.enemy.x,engine.enemy.y-engine.h*.12];
  const s=clamp((engine.enemy.r||engine.h*.08)/36,.68,1.4);
  g.save();
  try{state.spec.renderer(g,{from:state.from,to,t,frame,frames:state.spec.frames,
   hit:state.spec.impact,scale:s,now,dir:dir(state.from,to),
   clamp,smooth,mix,between,path,shard,burst,slash})}
  finally{g.restore()}
  report.draws++;report.perMove[state.spec.key]=(report.perMove[state.spec.key]||0)+1;
  report.last={name:state.spec.name,frame:frame+1,frames:state.spec.frames,
   contactAt:state.at+state.duration*state.spec.impact};
  return true;
 }
 return {register,lookup,cast,paint,active,report,norm,
  diagnostics:()=>({...report,perMove:{...report.perMove},
   registered:[...entries.values()].map(e=>({name:e.name,frames:e.frames,
    impactMs:Math.round(e.duration*e.impact)}))})};
})();
window.PokemonTorreFightingV103=fightingV103;
(()=>{
 'use strict';
 if(typeof BattleEngine!=='function')return;
 const api=fightingV103;
 const originalMove=BattleEngine.prototype.useMove;
 BattleEngine.prototype.useMove=function(slot){
  const owner=battle?.active?current():null;
  const move=owner&&Number.isInteger(slot)?skillSet(owner)?.[slot]:null;
  const spec=api.lookup(move?.name);
  if(!spec)return originalMove.apply(this,arguments);
  const events=new Set(this.v359Attacks||[]);
  const existingContacts=new Set(this.v47ContactToLand||[]);
  const cd=Number(cooldowns?.[slot]||0),en=Number(battle?.energy);
  const victim=foe(),now=performance.now();
  const result=originalMove.apply(this,arguments);
  if(result===false||!battle?.active||battle.paused||!this.running)return result;
  const event=(this.v359Attacks||[]).findLast(e=>!events.has(e)&&
   e.battle===battle&&api.lookup(e.move?.name)===spec);
  const accepted=!!(event||Number(battle.energy)<en||
   Number(cooldowns?.[slot]||0)>cd);
  if(accepted)api.cast(this,spec,now,event,owner,victim,existingContacts);
  return result;
 };
 const previousPainter=window.PokemonTorreV360Paint;
 window.PokemonTorreV360Paint=function(g,fx,now,engine){
  if(api.lookup(fx?.move?.name||fx?.name)){
   api.paint(g,engine,now,fx);
   return true; // do not paint an old generic fighting ball under this move
  }
  return typeof previousPainter==='function'?
   previousPainter.apply(this,arguments):false;
 };
 const originalDraw=BattleEngine.prototype.draw;
 BattleEngine.prototype.draw=function(now){
  const result=originalDraw.apply(this,arguments);
  const fx=api.active.get(this);
  if(fx&&!fx.event&&battle?.active&&this.ctx)api.paint(this.ctx,this,now,null);
  return result;
 };
})();
// Local-only combat regression harness; unavailable to production visitors.
// Cast the actual four native skill slots in a real Chrome battle, not a mock.
(()=>{
 if(!/^(localhost|127\.0\.0\.1)$/.test(location.hostname))return;
 const qa=window.PokemonTorreLocalCombatTestV47;
 if(!qa)return;
 const names=['Chute','Golpe de Karatê','Cross Chop','Brick Break'];
 qa.castFightingV103=function(slot=0){
  if(!Number.isInteger(slot)||slot<0||slot>3)return {error:'invalid fighting slot'};
  this.start(150,143);
  const actor=current(),victim=foe();
  const nativeSkills=skillSet;
  const four=names.map((name)=>({name,type:'fighting',kind:'dash',
   cat:'physical',power:34,cost:1,cd:500,level:1}));
  // Keep TRUE physical distance within the engine's melee hitbox.
  engine.player.x=engine.enemy.x-Math.min(48,engine.h*.08);
  engine.player.y=engine.enemy.y;
  engine.enemy.inv=0;engine.enemy.spawn=0;engine.running=true;
  // The QA start() stays paused until the cast() helper unpauses it.
  battle.paused=false;engine.enemyAttackCD=999;engine.foeDodgeCD=999;
  battle.energy=100;cooldowns=[0,0,0,0];
  skillSet=mon=>mon===actor?four:nativeSkills(mon);
  const hp=Number(victim.hp);
  let ok,fx;
  try{
   ok=engine.useMove(slot);
   fx=engine.v359Attacks?.findLast(x=>x.move?.name===four[slot].name);
  }finally{skillSet=nativeSkills}
  return {selected:names[slot],accepted:ok!==false,
   hpBefore:hp,hitAt:fx?.v103ImpactAt||null,
   contact:engine.v47ContactToLand?.find(x=>x.name===names[slot])?.at||null,
   cast:fightingV103.diagnostics()};
 };
 qa.fightingStateV103=()=>({hp:Number(foe()?.hp),
  nativeHits:engine?.v359Hits||0,
  fx:fightingV103.diagnostics(),canvasReady:!!engine?.canvas?.isConnected,
  safe:new URLSearchParams(location.search).get('safe')==='1'});
})();
