/* V93: proportionate EQUIPPED four moves, native 2D fallback without WebGL.
 * Different artwork per move. Real battle physics / HP remain untouched.
 * PIXI V86 WebP remains the preferred renderer when ready.
 */
const equippedFourV92=(()=>{
 'use strict';
 const moves=Object.freeze({
  raizesviolentas:{name:'Raízes Violentas',ms:1860,frames:16,kind:'roots'},
  geadapersistente:{name:'Geada Persistente',ms:1940,frames:16,kind:'frost'},
  soprocongelante:{name:'Sopro Congelante',ms:1300,frames:12,kind:'breath'},
  chicoteduplo:{name:'Chicote Duplo',ms:1600,frames:12,kind:'double'}
 });
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/[^a-z0-9]/g,'');
 const keyOf=name=>Object.prototype.hasOwnProperty.call(moves,normalize(name))?normalize(name):'';
 const map=new WeakMap();
 const stats={casts:0,draws:0,suppressed:0,last:null};
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
 const lerp=(a,b,q)=>a+(b-a)*q;
 const closed=engine=>!battle?.active||!engine?.canvas?.isConnected||
  (Number.isFinite(engine.enemy?.hp)&&engine.enemy.hp<=0);
 function begin(engine,name,now){
  const key=keyOf(name),spec=moves[key];
  if(!key||!engine||closed(engine)||!engine.player||!engine.enemy)return false;
  map.set(engine,{key,spec,started:now,
   from:[engine.player.x,engine.player.y-engine.h*.11],
   to:[engine.enemy.x,engine.enemy.y-engine.h*.12],battle});
  stats.casts++;return true;
 }
 function active(engine,now=performance.now()){
  const s=engine&&map.get(engine);
  if(!s||s.battle!==battle||closed(engine)){
   if(engine)map.delete(engine);return null;
  }
  if(now-s.started>s.spec.ms+40){map.delete(engine);return null;}
  return s;
 }
 function clear(engine){if(engine)map.delete(engine)}
 function poly(ctx,pts,fill,edge='#0d2631',lw=1.2){
  if(!pts.length)return;
  ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);
  for(const p of pts.slice(1))ctx.lineTo(p[0],p[1]);
  ctx.closePath();ctx.fillStyle=fill;ctx.fill();
  ctx.lineWidth=lw;ctx.strokeStyle=edge;ctx.stroke();
 }
 // Adaptive dimensions: the target's battle radius follows screen size and
 // is a safer visual reference than fixed pixels on small mobile screens.
 const targetRadius=engine=>clamp(
  Number(engine?.enemy?.r)||Number(engine?.h)*.08||28,14,50);
 function vine(ctx,from,to,t,thick=3.2,color='#4c9859',bend=.4){
  const end=ease(t);if(end<.02)return;
  const dx=to[0]-from[0],dy=to[1]-from[1],
   length=Math.hypot(dx,dy)||1,nx=-dy/length,ny=dx/length;
  const pts=[],sway=Math.min(length*.052,12)*bend,steps=Math.max(2,Math.ceil(28*end));
  for(let j=0;j<=steps;j++){
   const q=end*j/steps;
   const side=Math.sin(q*Math.PI)*Math.sin(q*7.2+bend)*sway;
   pts.push([from[0]+dx*q+nx*side,from[1]+dy*q+ny*side]);
  }
  function stroke(width,ink){
   ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);
   for(let j=1;j<pts.length;j++)ctx.lineTo(pts[j][0],pts[j][1]);
   ctx.lineCap='round';ctx.lineJoin='round';
   ctx.lineWidth=width;ctx.strokeStyle=ink;ctx.stroke();
  }
  stroke(thick+1.6,'#17291b');stroke(thick,color);
  stroke(Math.max(.65,thick*.19),'#b2d88d');
  for(let j=7;j<pts.length-3;j+=10){
   const [x,y]=pts[j],sgn=j%2?-1:1;
   poly(ctx,[[x-2.4,y],[x,y-3.2*sgn],[x+4.0,y-1.1*sgn]],
    '#6eaf62','#24492c',.85);
  }
 }
 function roots(ctx,from,to,t,r){
  const progress=ease(t/.76)*(1-ease((t-.90)/.10));
  if(progress<.02)return;
  const x=to[0],y=to[1]+r*.16;
  // Three independent, angular BROWN roots; footprint ~1.5 target radii.
  ctx.lineWidth=Math.max(.9,r*.035);ctx.strokeStyle='#3a3025';
  for(let i=-1;i<=1;i++){
   ctx.beginPath();ctx.moveTo(x+i*r*.31,y+r*.38);
   ctx.lineTo(x+i*r*.38-r*.14,y+r*.44);ctx.stroke();
  }
  for(let i=0;i<3;i++){
   const spread=(i-1)*r*.56;
   const fromRoot=[x+spread*1.18,y+r*.54];
   const toRoot=[x+spread*.53,y-r*(1.04-(i%2)*.16)];
   const q=clamp((progress-i*.065)/(1-i*.065));
   if(q>.01)vine(ctx,fromRoot,toRoot,q,Math.max(2,r*.10),
    i%2?'#94734c':'#78603e',.18+i*.12);
  }
  if(progress>.59){
   for(let i=0;i<7;i++){
    const a=i*2.4,d=r*(.16+(i%3)*.20);
    const sx=x+Math.cos(a)*d,sy=y+Math.sin(a)*d*.64;
    poly(ctx,[[sx,sy],[sx+r*.075,sy-r*.17],
     [sx-r*.065,sy-r*.025]],'#a28a61','#3e372a',.85);
   }
  }
 }
 function crystal(ctx,x,y,r,angle,alpha=1){
  ctx.save();ctx.globalAlpha*=alpha;ctx.translate(x,y);ctx.rotate(angle);
  poly(ctx,[[0,-r],[-r*.42,-r*.20],[-r*.23,r*.48],[r*.16,r*.63],
   [r*.48,-r*.16]],'#a8e4f4','#244b62',1.05);
  ctx.beginPath();ctx.moveTo(0,-r*.82);ctx.lineTo(0,r*.39);
  ctx.lineWidth=.75;ctx.strokeStyle='#e5f7ff';ctx.stroke();ctx.restore();
 }
 function frost(ctx,from,to,t,r){
  const grow=ease(t/.50),fade=1-ease((t-.87)/.13);
  if(grow<.01||fade<.01)return;
  const x=to[0],y=to[1]+r*.48,rx=r*(.28+grow*.80),ry=r*(.10+grow*.20);
  ctx.save();ctx.globalAlpha*=fade;
  ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);
  ctx.fillStyle='rgba(125,196,218,.12)';ctx.fill();
  ctx.lineWidth=1.5;ctx.strokeStyle='#315d74';ctx.stroke();
  ctx.beginPath();ctx.ellipse(x,y,rx*.76,ry*.61,0,0,Math.PI*2);
  ctx.lineWidth=.85;ctx.strokeStyle='#c8ecf6';ctx.stroke();
  // Fewer tiny sharp crystals emerging from the icy ground.
  for(let i=0;i<9;i++){
   const a=i*2.399,rad=r*(.22+grow*(.19+(i%4)*.13));
   crystal(ctx,x+Math.cos(a)*rad,y+Math.sin(a)*rad*.35-r*grow*.34,
    r*(.10+(i%3)*.034+grow*.07),a,fade*.85);
  }
  ctx.restore();
 }
 function breath(ctx,from,to,t,r){
  const p=ease(t/.74)*(1-ease((t-.88)/.12));if(p<.015)return;
  const dx=to[0]-from[0],dy=to[1]-from[1],a=Math.atan2(dy,dx),
   nx=-Math.sin(a),ny=Math.cos(a);
  // The stream stays slender along its long flight; only the tip flares.
  for(let i=0;i<8;i++){
   const offset=(i-3.5)/3.5,side=offset*r*(.12+p*.57);
   const q=clamp(p-(i%3)*.03);
   const ax=from[0]+nx*offset*r*.10,ay=from[1]+ny*offset*r*.10;
   const bx=from[0]+dx*q+nx*side,by=from[1]+dy*q+ny*side;
   ctx.beginPath();ctx.moveTo(ax,ay);
   ctx.quadraticCurveTo(lerp(ax,bx,.62)+nx*offset*r*.15,
    lerp(ay,by,.62)+ny*offset*r*.15,bx,by);
   ctx.lineWidth=i%3===0?2.7:1.7;ctx.strokeStyle='#294860';ctx.stroke();
   ctx.lineWidth=.85;ctx.strokeStyle='#a9d9eb';ctx.stroke();
   if(i%2===0){
    const w=.42+(i%3)*.10;
    crystal(ctx,lerp(ax,bx,w),lerp(ay,by,w),r*.10,a+i*.2,
     1-ease((t-.83)/.17));
   }
  }
  if(t>.55&&t<.84)for(let i=0;i<4;i++){
   const angle=i*Math.PI/2;
   crystal(ctx,to[0]+Math.cos(angle)*r*.30,
    to[1]+Math.sin(angle)*r*.30,r*.13,angle,.80);
  }
 }
 function double(ctx,from,to,t,r){
  const u1=ease(t/.46)*(1-ease((t-.57)/.14));
  const u2=ease((t-.32)/.44)*(1-ease((t-.89)/.11));
  // A clearly directed two-hit lash, slim enough to read over the Pokemon.
  const dx=to[0]-from[0],dy=to[1]-from[1];
  const near=[from[0]+dx*.22,from[1]+dy*.22];
  if(u1>.01)vine(ctx,[near[0],near[1]-r*.24],
   [to[0],to[1]-r*.13],u1,Math.max(2.1,r*.095),'#4d9d5f',-.28);
  if(u2>.01)vine(ctx,[near[0],near[1]+r*.24],
   [to[0],to[1]+r*.13],u2,Math.max(2.1,r*.085),'#5fb480',.31);
  if((t>.41&&t<.55)||(t>.71&&t<.86)){
   for(let i=0;i<5;i++){
    const angle=i*2.4,rr=r*(.18+(i%2)*.10);
    const x=to[0]+Math.cos(angle)*rr,y=to[1]+Math.sin(angle)*rr;
    poly(ctx,[[x,y],[x+r*.08,y-r*.07],[x-r*.045,y+r*.07]],
     '#aad484','#315a3d',.9);
   }
  }
 }
 function draw(engine,now){
  const state=active(engine,now);
  if(!state||!engine.ctx)return false;
  // When the V86 authored GPU sheet is ready for the same move, don't
  // double draw identical effects. The fallback runs during loading/failed GPU.
  const d=typeof pixiFX!=='undefined'?pixiFX.diagnostics():null;
  if(d?.v86Active&&d.v86Ready&&d.v86Name===state.spec.name)return false;
  const p=clamp((now-state.started)/state.spec.ms);
  const ctx=engine.ctx,r=targetRadius(engine);
  ctx.save();try{
   if(state.spec.kind==='roots')roots(ctx,state.from,state.to,p,r);
   else if(state.spec.kind==='frost')frost(ctx,state.from,state.to,p,r);
   else if(state.spec.kind==='breath')breath(ctx,state.from,state.to,p,r);
   else double(ctx,state.from,state.to,p,r);
  }finally{ctx.restore();}
  stats.draws++;stats.last={name:state.spec.name,frame:
   Math.min(state.spec.frames,1+Math.floor(p*state.spec.frames)),
   total:state.spec.frames,renderer:'native-canvas-mobile'};
  return true;
 }
 function hideLegacy(engine,name,now){
  const state=active(engine,now);
  if(!state||state.key!==keyOf(name))return false;
  stats.suppressed++;return true;
 }
 function diagnostics(engine){const live=engine&&active(engine);
  return {version:'93.0',...stats,active:live?.key||null,
   frames:Object.fromEntries(Object.values(moves).map(m=>[m.name,m.frames]))};}
 return Object.freeze({keyOf,begin,active,clear,draw,hideLegacy,diagnostics,version:'92.0'});
})();
window.PokemonTorreEquippedV92=()=>equippedFourV92.diagnostics(
 typeof engine!=='undefined'?engine:null);
