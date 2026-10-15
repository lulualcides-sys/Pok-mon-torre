/* V92: actual EQUIPPED four moves, native 2D fallback with no WebGL.
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
 function poly(ctx,pts,fill,edge='#0d2631',lw=2){
  if(!pts.length)return;
  ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);
  for(const p of pts.slice(1))ctx.lineTo(p[0],p[1]);
  ctx.closePath();ctx.fillStyle=fill;ctx.fill();
  ctx.lineWidth=lw;ctx.strokeStyle=edge;ctx.stroke();
 }
 function vine(ctx,from,to,t,thick=11,color='#367c45',bend=1){
  const end=ease(t),dx=to[0]-from[0],dy=to[1]-from[1],
   length=Math.hypot(dx,dy)||1,nx=-dy/length,ny=dx/length;
  const pts=[];for(let j=0;j<=32*end;j++){
   const k=(j/32),w=Math.sin(k*Math.PI)*Math.sin(k*8+bend)*35*bend;
   pts.push([from[0]+dx*k+nx*w,from[1]+dy*k+ny*w]);
  }
  if(pts.length<2)return;
  function stroke(width,ink){
   ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);
   for(const p of pts.slice(1))ctx.lineTo(p[0],p[1]);
   ctx.lineCap='round';ctx.lineJoin='round';
   ctx.lineWidth=width;ctx.strokeStyle=ink;ctx.stroke();
  }
  stroke(thick+5,'#111d17');stroke(thick,color);
  stroke(thick*.28,'#b4d58c');
  for(let j=5;j<pts.length-3;j+=7){
   const [x,y]=pts[j];poly(ctx,[[x-6,y],[x,y-8],[x+9,y-3],[x+3,y+4]],
    '#67b64c','#143423',1.7);
  }
 }
 function roots(ctx,from,to,t){
  const progress=ease(t/.76)*(1-ease((t-.91)/.09)),x=to[0],y=to[1];
  if(progress<.02)return;
  ctx.lineWidth=3;ctx.strokeStyle='#221f19';
  for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(x+i*16,y+26);
   ctx.lineTo(x+i*21-12,y+33);ctx.stroke();}
  for(let i=0;i<4;i++){
   const w=(i-1.5)*22,start=[x+w*1.7,y+43],finish=[x+w*.35,y-63+(i%2)*14];
   const p=clamp((progress-i*.05)/(1-i*.05));
   if(p>.01)vine(ctx,start,finish,p,13+(i%2)*4,
     i%2?'#906238':'#6b492c',.50+i*.23);
  }
  const shards=progress>.58?Math.min(14,Math.floor((progress-.58)*36)):0;
  for(let i=0;i<shards;i++){
   const a=i*2.4,r=13+(i%3)*11;
   poly(ctx,[[x+Math.cos(a)*r,y+Math.sin(a)*r],
    [x+Math.cos(a)*r+5,y+Math.sin(a)*r-7],
    [x+Math.cos(a)*r-5,y+Math.sin(a)*r-2]],'#9b744a','#342c20',1.5);
  }
 }
 function crystal(ctx,x,y,r,angle,alpha=1){
  ctx.save();ctx.globalAlpha*=alpha;ctx.translate(x,y);ctx.rotate(angle);
  poly(ctx,[[0,-r],[-r*.7,-r*.16],[-r*.46,r*.56],[r*.27,r*.90],
   [r*.72,-r*.1]],'#91e7fc','#173e66',2.4);
  ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(0,r*.76);
  ctx.lineWidth=1.4;ctx.strokeStyle='#effcff';ctx.stroke();ctx.restore();
 }
 function frost(ctx,from,to,t){
  const grow=ease(t/.55),fade=1-ease((t-.87)/.13);
  if(grow<.01||fade<.01)return;
  const x=to[0],y=to[1]+8,rx=15+grow*72,ry=5+grow*23;
  ctx.save();ctx.globalAlpha*=fade;
  ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);
  ctx.fillStyle='rgba(110,222,249,.23)';ctx.fill();
  ctx.lineWidth=4;ctx.strokeStyle='#1f5876';ctx.stroke();
  ctx.beginPath();ctx.ellipse(x,y,rx*.83,ry*.72,0,0,Math.PI*2);
  ctx.lineWidth=2.5;ctx.strokeStyle='#c6f5ff';ctx.stroke();
  for(let i=0;i<19;i++){
   const a=i*2.399,rad=12+grow*(18+(i%6)*9);
   crystal(ctx,x+Math.cos(a)*rad,y+Math.sin(a)*rad*.37-
    Math.min(36,grow*30),4+(i%4)*3+grow*7,a,fade);
  }
  ctx.restore();
 }
 function breath(ctx,from,to,t){
  const p=ease(t/.75)*(1-ease((t-.88)/.12));if(p<.015)return;
  const dx=to[0]-from[0],dy=to[1]-from[1],a=Math.atan2(dy,dx);
  const len=Math.hypot(dx,dy)||1,nx=-Math.sin(a),ny=Math.cos(a);
  for(let i=0;i<13;i++){
   const s=(i-6)/6,off=s*(9+p*51),u=clamp(p-(i%3)*.04);
   const ax=from[0]+nx*s*6,ay=from[1]+ny*s*6;
   const bx=from[0]+dx*u+nx*off,by=from[1]+dy*u+ny*off;
   ctx.beginPath();ctx.moveTo(ax,ay);
   ctx.quadraticCurveTo(lerp(ax,bx,.6)+nx*s*18,
    lerp(ay,by,.6)+ny*s*18,bx,by);
   ctx.lineWidth=i%3===0?5:3;ctx.strokeStyle='#183b65';ctx.stroke();
   ctx.lineWidth=i%3===0?2.3:1.4;ctx.strokeStyle='#abebff';ctx.stroke();
   for(let j=0;j<2;j++){
    const q=clamp(p*.40+j*.37+(i%3)*.05);
    crystal(ctx,lerp(ax,bx,q)+nx*Math.sin(i*3+j)*7,
     lerp(ay,by,q)+ny*Math.sin(i*3+j)*7,
     3+(i+j)%4*2,a+(i+j)*.3,1-ease((t-.86)/.14));
   }
  }
  if(t>.52&&t<.87)for(let i=0;i<7;i++){
   const angle=i*2.4;
   crystal(ctx,to[0]+Math.cos(angle)*18,to[1]+Math.sin(angle)*17,
    5+(i%3)*2,angle);
  }
 }
 function double(ctx,from,to,t){
  // TWO contacts, one overhead arc, one low diagonal lash.
  const u1=ease(t/.48)*(1-ease((t-.58)/.14));
  const u2=ease((t-.32)/.47)*(1-ease((t-.90)/.10));
  const a=[from[0],from[1]-16],b=[to[0],to[1]-14];
  const c=[from[0],from[1]+19],d=[to[0],to[1]+15];
  if(u1>.01)vine(ctx,a,b,u1,15,'#3b9f54',-.85);
  if(u2>.01)vine(ctx,c,d,u2,14,'#48b66d',.86);
  if((t>.39&&t<.58)||(t>.73&&t<.91)){
   for(let i=0;i<7;i++){
    const angle=i*2.4,r=13+(i%2)*7;
    const x=to[0]+Math.cos(angle)*r,y=to[1]+Math.sin(angle)*r;
    poly(ctx,[[x,y],[x+7,y-4],[x+2,y+5]],'#b9f17c','#214d2c',1.5);
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
  const ctx=engine.ctx;
  ctx.save();try{
   if(state.spec.kind==='roots')roots(ctx,state.from,state.to,p);
   else if(state.spec.kind==='frost')frost(ctx,state.from,state.to,p);
   else if(state.spec.kind==='breath')breath(ctx,state.from,state.to,p);
   else double(ctx,state.from,state.to,p);
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
  return {version:'92.0',...stats,active:live?.key||null,
   frames:Object.fromEntries(Object.values(moves).map(m=>[m.name,m.frames]))};}
 return Object.freeze({keyOf,begin,active,clear,draw,hideLegacy,diagnostics,version:'92.0'});
})();
window.PokemonTorreEquippedV92=()=>equippedFourV92.diagnostics(
 typeof engine!=='undefined'?engine:null);
