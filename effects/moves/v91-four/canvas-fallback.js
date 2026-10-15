/* V91 four Grass moves: native Canvas2D safety renderer.
 * PIXI remains the enhanced layer; this renderer protects mobile browsers
 * without WebGL or missing external libraries. NEVER changes hit/cooldown.
 * No CSS animation, stock PNG or green-orb substitute.
 */
const grassFallbackV91=(()=>{
 'use strict';
 const moves=Object.freeze({
  chicotedevinha:{name:'Chicote de Vinha',frames:12,ms:1220,kind:'vine'},
  folhanavalha:{name:'Folha Navalha',frames:12,ms:1400,kind:'leaf'},
  chicotesemarea:{name:'Chicotes em Área',frames:16,ms:1330,kind:'area'},
  vinewhip:{name:'Vine Whip',frames:12,ms:1280,kind:'coil'}
 });
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
   .toLowerCase().replace(/[^a-z0-9]/g,'');
 const keyOf=name=>Object.hasOwn(moves,norm(name))?norm(name):'';
 const states=new WeakMap();
 const stats={casts:0,draws:0,hiddenLegacy:0,last:null};
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
 const blend=(a,b,t)=>a+(b-a)*t;
 function start(engine,name,time){
  const key=keyOf(name),sp=moves[key];
  if(!engine||!sp)return false;
  const p=engine.player,e=engine.enemy;
  if(!p||!e)return false;
  states.set(engine,{key,spec:sp,began:Number(time)||performance.now(),
   from:[p.x,p.y-engine.h*.11],to:[e.x,e.y-engine.h*.13],battle,
   framesDrawn:0});
  stats.casts++;return true;
 }
 function active(engine,now=performance.now()){
  const a=states.get(engine);
  if(!a||a.battle!==battle||!battle?.active)return null;
  if(now-a.began>=a.spec.ms+50){states.delete(engine);return null;}
  return a;
 }
 function clear(engine){if(engine)states.delete(engine)}
 function leaf(ctx,x,y,l,w,angle,col,alpha=1){
  ctx.save();ctx.globalAlpha*=alpha;ctx.translate(x,y);ctx.rotate(angle);
  ctx.beginPath();ctx.moveTo(-l*.70,0);
  ctx.quadraticCurveTo(-l*.22,-w*1.18,l,0);
  ctx.quadraticCurveTo(-l*.10,w*1.02,-l*.70,0);
  ctx.closePath();ctx.fillStyle=col;ctx.fill();
  ctx.lineWidth=2.1;ctx.strokeStyle='#102a1a';ctx.stroke();
  ctx.beginPath();ctx.moveTo(-l*.61,0);ctx.lineTo(l*.76,0);
  ctx.lineWidth=1.25;ctx.strokeStyle='#d7f3a1';ctx.stroke();
  ctx.restore();
 }
 function vinePoints(A,B,progress,seed,coil=false){
  const dx=B[0]-A[0],dy=B[1]-A[1],size=Math.hypot(dx,dy)||1;
  const px=-dy/size,py=dx/size;
  const list=[],pieces=Math.max(2,Math.ceil(32*progress));
  for(let i=0;i<=pieces;i++){
   const u=progress*i/pieces;
   const sway=Math.sin(u*Math.PI)*Math.sin(u*7.4+(coil?-.6:seed))*
    Math.min(size*.12,35)*(coil?1.13:.75);
   list.push([A[0]+dx*u+px*sway,A[1]+dy*u+py*sway]);
  }
  return list;
 }
 function strokeVine(ctx,pts,scale=1,bright=false){
  if(pts.length<2)return;
  const trace=()=>{ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);
   for(const [x,y] of pts.slice(1))ctx.lineTo(x,y)};
  ctx.lineCap='round';ctx.lineJoin='round';
  for(const [width,color] of [[13*scale,'#0a2316'],
   [9*scale,'#286d34'],[5.9*scale,bright?'#58cf80':'#71c955'],
   [1.8*scale,'#daf4a5']]){
   trace();ctx.lineWidth=width;ctx.strokeStyle=color;ctx.stroke();
  }
 }
 function paintVine(ctx,A,B,p,coil,t){
  const pts=vinePoints(A,B,p,coil?1.1:.45,coil);
  strokeVine(ctx,pts,coil?.85:1,coil);
  for(let k=6;k<pts.length-1;k+=7){
   const a=pts[k];leaf(ctx,a[0],a[1]+(k%2?6:-6),
    6.8,3.6,(k%2?-1:1)*.7,coil?'#48aa66':'#7ac64f',.95);
  }
  if(p>.74&&p<.97&&pts.length){
   const pt=pts.at(-1);
   for(let j=0;j<5;j++){
    const a=j*2.4+t*4;
    leaf(ctx,pt[0]+Math.cos(a)*9,pt[1]+Math.sin(a)*9,
     4.8,2.5,a,'#a9e86d',.7);
   }
  }
 }
 function paintArea(ctx,A,B,p,t){
  const d=Math.hypot(B[0]-A[0],B[1]-A[1])||1;
  const r=Math.min(d*.16,34);
  for(let i=0;i<4;i++){
   const spread=(i-1.5)*r*.75;
   const start=[B[0]+spread*1.45,B[1]+Math.min(45,r)*1.1];
   const end=[B[0]+spread*.42,B[1]-Math.min(65,r*2.1)+(i%2?8:0)];
   const q=ease((p-i*.05)/(1-i*.05));
   if(q>.012) {
    const pts=vinePoints(start,end,q,i*.85,false);
    strokeVine(ctx,pts,.78+(i%2)*.12,i%2===0);
    for(let k=6;k<pts.length-1;k+=8){
     const [x,y]=pts[k];leaf(ctx,x,y,5.8,3.4,i%2?-.7:.45,'#82cb4b',.85);
    }
   }
  }
 }
 function paintLeaves(ctx,A,B,p,t){
  const dx=B[0]-A[0],dy=B[1]-A[1];
  const a=Math.atan2(dy,dx);
  const perpendicular=[-Math.sin(a),Math.cos(a)];
  for(let i=0;i<15;i++){
   const delay=(i%5)*.038+Math.floor(i/5)*.035;
   const q=clamp((p-delay)/(1-delay));
   if(q<=.001)continue;
   const row=(i%7-3)*12;
   const weave=Math.sin(q*11+i*1.7)*7;
   const x=blend(A[0],B[0],ease(q))+perpendicular[0]*(row+weave);
   const y=blend(A[1],B[1],ease(q))+perpendicular[1]*(row+weave);
   const alpha=1-ease((q-.87)/.13);
   leaf(ctx,x,y,9+(i%3)*2.6,4.8+(i%2)*1.4,
    a+q*6.0+i*.4,['#78d84d','#2f9c54','#9ae05e'][i%3],alpha);
   if(q>.12&&q<.84){
    ctx.strokeStyle='rgba(40,92,36,.45)';ctx.lineWidth=1.2;
    ctx.beginPath();ctx.moveTo(x-Math.cos(a)*17,y-Math.sin(a)*17);
    ctx.lineTo(x-Math.cos(a)*7,y-Math.sin(a)*7);ctx.stroke();
   }
  }
 }
 function draw(engine,now){
  const fx=active(engine,now);
  if(!fx||!engine?.ctx||!engine.canvas?.isConnected)return false;
  const {key,spec,from,to}=fx;
  const t=clamp((now-fx.began)/spec.ms);
  const forward=ease(t/.68),retract=1-ease((t-.82)/.18);
  const progress=forward*retract;
  const ctx=engine.ctx;
  ctx.save();
  try{
   if(key==='folhanavalha')paintLeaves(ctx,from,to,progress,t);
   else if(key==='chicotesemarea')paintArea(ctx,from,to,progress,t);
   else paintVine(ctx,from,to,progress,key==='vinewhip',t);
   fx.framesDrawn++;stats.draws++;
   stats.last={name:spec.name,key,frame:Math.min(spec.frames,
    1+Math.floor(t*spec.frames)),of:spec.frames,renderer:'canvas-mobile-safety'};
  }finally{ctx.restore()}
  return true;
 }
 function suppressLegacy(engine,name,now){
  const fx=active(engine,now);
  if(!fx||keyOf(name)!==fx.key)return false;
  stats.hiddenLegacy++;return true;
 }
 function diagnostics(engine){
  const a=engine&&active(engine);
  return {version:'91.0',...stats,active:a?.key||null,
   frames:Object.fromEntries(Object.values(moves).map(m=>[m.name,m.frames]))};
 }
 return Object.freeze({version:'91.0',keyOf,start,active,clear,draw,suppressLegacy,diagnostics});
})();
window.PokemonTorreGrassFallbackV91=()=>grassFallbackV91.diagnostics(
 typeof engine!=='undefined'?engine:null);
