/* V67 — four individually-authored Canvas animations, opt-in preview first.
 * NO hooks, gameplay changes, or modifications to protected electric moves.
 * Each specific move implementation lives in its own directory.
 */
var fidelityFourV67=(()=>{
 'use strict';
 const painters=new Map(),names=new Map(),draws=Object.create(null);
 const C=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const E=t=>{t=C(t);return t*t*(3-2*t)};
 const MIX=(a,b,t)=>a+(b-a)*t,TAU=Math.PI*2;
 const seed=n=>{const q=Math.sin(n*97.13+7.81)*43758.5453;return q-Math.floor(q)};
 const P=(a,b,t)=>[MIX(a[0],b[0],t),MIX(a[1],b[1],t)];
 const plus=(a,b,s=1)=>[a[0]+b[0]*s,a[1]+b[1]*s];
 function poly(g,pts,fill,alpha=1,outline='#070a15',line=2){
  if(!pts.length)return;g.save();g.globalAlpha*=C(alpha);g.beginPath();
  pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));
  g.closePath();g.fillStyle=fill;g.fill();
  if(line){g.strokeStyle=outline;g.lineWidth=line;g.lineJoin='round';g.stroke()}
  g.restore();
 }
 function stroke(g,pts,color,width,alpha=1,outline=2){
  if(pts.length<2)return;g.save();g.globalAlpha*=C(alpha);
  g.lineCap='round';g.lineJoin='round';
  const run=()=>{g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()};
  if(outline){g.strokeStyle='#030816';g.lineWidth=width+2*outline;run();}
  g.strokeStyle=color;g.lineWidth=width;run();g.restore();
 }
 function oval(g,x,y,rx,ry,fill,alpha=1,edge='#050d20',lw=2){
  g.save();g.globalAlpha*=C(alpha);g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);
  g.fillStyle=fill;g.fill();if(lw){g.strokeStyle=edge;g.lineWidth=lw;g.stroke()}g.restore();
 }
 function sparkle(g,x,y,r,c,alpha=1){
  const a=C(alpha);stroke(g,[[x-r,y],[x+r,y]],c,Math.max(1,r*.22),a,1);
  stroke(g,[[x,y-r],[x,y+r]],c,Math.max(1,r*.22),a,1);
  oval(g,x,y,Math.max(1,r*.21),Math.max(1,r*.21),'#fff',a,'#fff',0);
 }
 // Variable-width hand-shaped energy slash, not two static lines making an X.
 function ribbon(g,p0,p1,p2,p3,reveal,width,colors,alpha=1){
  const q=C(reveal);if(q<=.004)return;
  const sample=(u)=>{const v=1-u;
   return [v*v*v*p0[0]+3*v*v*u*p1[0]+3*v*u*u*p2[0]+u*u*u*p3[0],
           v*v*v*p0[1]+3*v*v*u*p1[1]+3*v*u*u*p2[1]+u*u*u*p3[1]]};
  const side=[],reverse=[],centers=[];
  const n=Math.max(2,Math.ceil(q*26));
  for(let i=0;i<=n;i++){
   const u=q*i/n,pt=sample(u),prev=sample(C(u-.008)),next=sample(C(u+.008));
   const vx=next[0]-prev[0],vy=next[1]-prev[1],d=Math.hypot(vx,vy)||1;
   // jagged outer bevel, tapered at ends, widening with momentum
   const w=width*(.10+.88*Math.pow(Math.sin(Math.PI*u),.55))*(i===n?.82:1);
   const wiggle=(i%3===0?1:i%3===1?-.55:.35)*Math.min(2.3,w*.15);
   const norm=[-vy/d,vx/d];
   side.push([pt[0]+norm[0]*(w*.55+wiggle),pt[1]+norm[1]*(w*.55+wiggle)]);
   reverse.push([pt[0]-norm[0]*(w*.55+wiggle),pt[1]-norm[1]*(w*.55+wiggle)]);
   centers.push(pt);
  }
  poly(g,[...side,...reverse.reverse()],colors[0],alpha,'#020711',3.4);
  stroke(g,centers,colors[1],Math.max(1.5,width*.37),alpha*.92,0);
  stroke(g,centers,colors[2],Math.max(1,width*.11),alpha*.96,0);
  const tip=sample(q);sparkle(g,tip[0],tip[1],3+width*.14,colors[2],alpha*.8);
 }
 function fragments(g,x,y,t,count,palette,size=36){
  const q=C(t);if(q<=0)return;
  for(let i=0;i<count;i++){
    const a=i*2.39996+seed(i+57)*.35,r=size*(.2+seed(i+4)*.90)*E(q);
    const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r*.78;
    const s=(2.2+seed(i+20)*5.3)*(1-q*.70);
    poly(g,[[px-s,py],[px-s*.15,py-s*1.8],[px+s*.83,py-s*.27],
       [px+s*.5,py+s*.81]],palette[i%palette.length],C(q*8)*C((1-q)*4),'#09101a',1.1);
  }
 }
 function swirl(g,cx,cy,r,angle,colors,alpha=1){
  for(let j=0;j<colors.length;j++){
    const pts=[];
    for(let k=0;k<=20;k++){let a=angle+(j/colors.length)*TAU+k/20*Math.PI*1.25;
      let rr=r*(.86+.11*Math.sin(a*2+j));pts.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.8]);}
    stroke(g,pts,colors[j],j===0?3.5:2.1,alpha,1.2);
  }
 }
 function register(keys,label,draw){
  if(!Array.isArray(keys)||keys.some(k=>!/^catalog_[a-z]+$/.test(k)||painters.has(k))||typeof draw!=='function')throw Error('Invalid V67 move');
  for(const key of keys){painters.set(key,draw);names.set(key,label)}
 }
 const deny=new Set(['catalog_thunder','catalog_discharge','catalog_thunderwave','catalog_descarga','catalog_descargaeletrica','catalog_trovao']);
 const accepts=key=>typeof key==='string'&&!deny.has(key)&&painters.has(key);
 const paint=(g,fx,t,now,scale,low,key)=>{
  if(!accepts(key)||!g||!fx||!Array.isArray(fx.from)||!Array.isArray(fx.to)||fx.from.length<2||fx.to.length<2)return false;
  if(![...fx.from,...fx.to].every(Number.isFinite))return false;
  const u=C(t),s=C(scale||1,.68,1.2),dx=fx.to[0]-fx.from[0],dy=fx.to[1]-fx.from[1],d=Math.hypot(dx,dy)||1;
  const ux=[dx/d,dy/d],ny=[-dy/d,dx/d],at=(q,off=0)=>plus(P(fx.from,fx.to,q),ny,off*s);
  g.save();
  try{painters.get(key)(g,{t:u,now,scale:s,from:fx.from,to:fx.to,at,ux,ny,low:!!low,frame:Math.min(7,Math.floor(u*8))});
   draws[key]=(draws[key]||0)+1;return true;
  }finally{g.restore()}
 };
 const art={C,E,MIX,P,plus,seed,poly,stroke,oval,sparkle,ribbon,fragments,swirl,TAU};
 const api={register,accepts,paint,art,labels:names,inspect:()=>({keys:[...painters.keys()],draws:{...draws},protected:[...deny]})};
 if(typeof window!=='undefined')window.PokemonTorreFidelityFourV67=api;
 return api;
})();