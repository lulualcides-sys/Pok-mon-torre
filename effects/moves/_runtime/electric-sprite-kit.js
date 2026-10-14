/* Pokemon Torre V49 — clean bounded electric battle renderer.
 * The four finalized moves use animated outlined Canvas paths without oversized static sprites.
 * No CSS animation, static PNG overlay or changed combat rules.
 */
const electricSpriteV46=(()=>{
 'use strict';
 const base='effects/moves/electric-original/';
 const names=['bolt-a','bolt-b','bolt-c','bolt-fork','bolt-shatter','arc','spark','impact','storm-cloud'];
 const images=Object.create(null),registered=new Map(),counters=Object.create(null);
 const clamp=(v,lo=0,hi=1)=>Math.max(lo,Math.min(hi,v));
 const ease=v=>{const t=clamp(v);return t*t*(3-2*t)};
 const lerp=(a,b,t)=>a+(b-a)*t;
 const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/[^a-z0-9]/g,'');
 let error='';
 for(const name of names){
  const img=new Image();
  img.decoding='async';
  img.onerror=()=>{error='Electric sprite could not be loaded: '+name;};
  img.src=base+name+'.svg?v=47.0';
  images[name]=img;
 }
 function stamp(g,name,x,y,w,h,o={}){
  const src=images[name];
  if(!src?.naturalWidth||!g||!Number.isFinite(x)||!Number.isFinite(y))return false;
  const alpha=clamp(o.alpha===undefined?1:o.alpha);
  if(alpha<.015||w<=0||h<=0)return false;
  g.save();g.translate(x,y);g.rotate(o.rotation||0);
  if(o.flipX)g.scale(-1,1);
  g.globalAlpha=alpha;g.imageSmoothingEnabled=false;
  if(o.additive)g.globalCompositeOperation='lighter';
  g.drawImage(src,-w/2,-h/2,w,h);
  g.restore();
  counters[name]=(counters[name]||0)+1;
  return true;
 }
 function between(g,name,x1,y1,x2,y2,height,options={}){
  const dx=x2-x1,dy=y2-y1,length=Math.hypot(dx,dy);
  if(length<2)return false;
  return stamp(g,name,(x1+x2)/2,(y1+y2)/2,length,
   height,{...options,rotation:Math.atan2(dy,dx)});
 }
 // A compact cinematic burst built exclusively from authored electric sprites.
 // Calling this method never draws a CSS animation, procedural Canvas arc or line.
 function burst(g,x,y,ms,s,alpha,power=1){
  const a=clamp(alpha);if(a<.02)return;
  const jitter=Math.sin(ms*.024)*3*s;
  stamp(g,'impact',x+jitter,y,(68+44*power)*s,(65+38*power)*s,
   {alpha:a*.83,additive:true,rotation:ms*.0004});
  for(let j=0;j<8;j++){
   const angle=j*Math.PI/4+(ms*.003),distance=(28+23*power)*s;
   stamp(g,j%2?'spark':'arc',x+Math.cos(angle)*distance,y+Math.sin(angle)*distance*.74,
    (17+j%3*6)*s,(22+j%2*7)*s,
    {alpha:a*(.66-j*.045),rotation:angle,additive:true});
  }
 }

 // V49 FINAL: clean bounded, frame-animated lightning, not stacked giant SVG bolts.
 // All four attacks use the same quality and eight distinct choreography beats.
 // The underlying battle system still owns player movement, HP, cooldown and hit.
 function cinematic(g,fx,t,ms,s,kind){
  if(!g||typeof g.beginPath!=='function'||!Array.isArray(fx.from)||!Array.isArray(fx.to))return;
  const phase=Math.min(7,Math.floor(clamp(t)*8)),within=clamp(t*8-phase);
  const A=fx.from,B=fx.to,P=fx.actor||A,TAU=Math.PI*2;
  const size=clamp(s,.72,1.14),beat=Math.floor(ms/88);
  const seed=n=>{const v=Math.sin((n+phase*11+beat*5)*97.17)*42739.123;return v-Math.floor(v)};
  const alphaEnd=phase===7?1-within*.92:1;
  const palette=['#090717','#663414','#ffb82e','#fff6ac','#ffffff'];
  function path(points,alpha=1,weight=3){
   if(points.length<2||alpha<.025)return;
   const widths=[weight+5,weight+2.2,weight,weight*.53,Math.max(.65,weight*.20)].map(w=>w*size);
   g.save();g.globalAlpha=clamp(alpha)*alphaEnd;g.lineJoin='round';g.lineCap='round';g.shadowBlur=0;
   for(let layer=0;layer<palette.length;layer++){
    g.beginPath();g.moveTo(points[0][0],points[0][1]);
    for(let i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);
    g.strokeStyle=palette[layer];g.lineWidth=widths[layer];g.stroke();
   }
   g.restore();
  }
  function bolt(x1,y1,x2,y2,n,alpha=1,weight=3,zigzag=7,withBranch=false){
   const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy);
   if(L<3||alpha<.025)return;
   const nx=-dy/L,ny=dx/L,count=6,pts=[[x1,y1]];
   const maxDis=Math.min(zigzag*size,L*.13);
   for(let i=1;i<count;i++){
    const p=i/count,d=(seed(n*13+i)*2-1)*maxDis*Math.sin(p*Math.PI);
    pts.push([x1+dx*p+nx*d,y1+dy*p+ny*d]);
   }
   pts.push([x2,y2]);path(pts,alpha,weight);
   if(withBranch&&L>24){
    const p=pts[3],angle=Math.atan2(dy,dx)+(seed(n*7)-.5)*1.6;
    const length=Math.min(23*size,L*.23);
    path([p,[p[0]+Math.cos(angle+.90)*length,p[1]+Math.sin(angle+.90)*length]],alpha*.62,Math.max(.8,weight*.48));
   }
  }
  function ring(x,y,r,alpha=.6,n=0){
   const points=[];
   for(let i=0;i<=16;i++){
    const a=i*TAU/16,rr=r*(.94+.09*seed(n+i));
    points.push([x+Math.cos(a)*rr*size,y+Math.sin(a)*rr*.42*size]);
   }
   path(points,alpha,1.5);
  }
  function sparks(x,y,num,rad,alpha=1,n=0){
   for(let i=0;i<num;i++){
    const a=TAU*i/num+seed(i+n)*.34;
    const r=(rad*(.63+seed(n+i*3)*.35))*size;
    bolt(x+Math.cos(a)*r*.36,y+Math.sin(a)*r*.36,
     x+Math.cos(a)*r,y+Math.sin(a)*r,
     n+i,alpha*(.73+seed(n+i)*.23),1.6,3);
   }
  }
  function energy(x,y,amp,tag){
   ring(x,y,15+amp*13,.27+amp*.42,tag);
   sparks(x,y,3+Math.round(amp*2),21+amp*14,.41+amp*.34,tag+12);
  }
  function hit(x,y,power,tag){
   if(power<.03)return;
   sparks(x,y,6,19+power*21,clamp(power)*.90,tag);
   ring(x,y,18+power*24,clamp(power)*.72,tag+19);
  }
  function cloud(x,y,power){
   if(typeof g.arc!=='function'||typeof g.fill!=='function'||power<=0)return;
   g.save();g.globalAlpha=.40*power*alphaEnd;g.fillStyle='#21172f';
   for(let j=0;j<5;j++){
    const xx=x+(j-2)*20*size,yy=y+Math.sin(j*1.6)*5*size;
    g.beginPath();g.arc(xx,yy,(16+(j%2)*5)*size,0,TAU);g.fill();
   }
   g.restore();
   bolt(x-33*size,y+12*size,x+31*size,y+9*size,618,.33*power,1.2,5);
  }
  // Every attack is fully finalized in the battle renderer; no in-game preview.
  if(kind==='faisca'){
   if(phase<=2)energy(P[0],P[1],.30+phase*.24,20);
   if(phase>=2&&phase<=5){
    const ux=(B[0]-A[0])/(Math.hypot(B[0]-A[0],B[1]-A[1])||1);
    const uy=(B[1]-A[1])/(Math.hypot(B[0]-A[0],B[1]-A[1])||1);
    const x=P[0],y=P[1];
    for(let i=0;i<3;i++){
     const off=(i-1)*12*size,trail=(32+i*18)*size;
     bolt(x-ux*trail-uy*off,y-uy*trail+ux*off,x-uy*off*.45,y+ux*off*.45,
      31+i,.67,.95+i*.22,6,i===1);
    }
   }
   if(phase===4)bolt(P[0],P[1],B[0],B[1],40,.67,2.3,10);
   if(phase===5)hit(B[0],B[1],1,49);
   if(phase===6)hit(B[0],B[1],.62,53);
   if(phase===7)sparks(B[0],B[1],3,19,.28,54);
  }else if(kind==='discharge'){
   if(phase<3)energy(A[0],A[1],.26+phase*.26,61);
   const r=(18+Math.min(phase,6)*10+within*8);
   ring(A[0],A[1],Math.min(r,84),phase===7?.20:.68,66);
   if(phase>=2&&phase<=6){
    const count=phase===4||phase===5?7:5;
    for(let i=0;i<count;i++){
     const a=TAU*i/count+.035*Math.sin(ms*.007+i);
     const endR=Math.min(r*(.83+.17*seed(i+67)),84)*size;
     const inner=15*size;
     bolt(A[0]+Math.cos(a)*inner,A[1]+Math.sin(a)*inner,
      A[0]+Math.cos(a)*endR,A[1]+Math.sin(a)*endR*.74,
      71+i,.71,phase===4?2.9:1.9,8,phase===4&&i%3===0);
    }
    if(phase>=4&&phase<=6){
     const dist=Math.hypot(B[0]-A[0],B[1]-A[1]);
     if(dist<=105*size)hit(B[0],B[1],phase===5?.75:.43,90);
    }
   }
   if(phase===7)sparks(A[0],A[1],3,21,.24,96);
  }else if(kind==='tempestade'){
   const top=B[1]-134*size;
   const intensity=phase===7?.22:phase<2?.48:.82;
   cloud(B[0],top,intensity);
   if(phase<=1)ring(B[0],B[1],23+phase*6,.32+phase*.16,111);
   if(phase>=2&&phase<=6){
    const offsets=[-21,18,-12,20,0];
    const dx=offsets[phase-2]*size;
    const hitX=B[0]+dx,fromX=B[0]+dx*.65;
    const p=phase===2?.65:1;
    bolt(fromX,top+9*size,hitX,top+(B[1]-top)*p,
     120+phase,.93,phase===5?4.7:3.1,10,true);
    if(phase>=3&&phase<=5)hit(hitX,B[1],phase===5?.90:.70,140+phase);
    if(phase===5){
     bolt(B[0]+30*size,top+10*size,B[0]+36*size,B[1]-9*size,162,.71,2.5,9);
    }
   }
   if(phase===7)sparks(B[0],B[1],3,20,.26,178);
  }else if(kind==='trovao'){
   const top=B[1]-170*size;
   if(phase<=3){cloud(B[0],top,.42+phase*.17);ring(B[0],B[1],20+phase*7,.46,202);}
   if(phase===2)bolt(B[0]+8*size,top+10*size,B[0],top+50*size,203,.59,1.9,6);
   if(phase>=3&&phase<=6){
    const progress=phase===3?.67:1;
    bolt(B[0]-5*size,top+12*size,B[0],top+12*size+(B[1]-top-12*size)*progress,
     216,phase===6?.49:1,phase===4||phase===5?6.7:4.0,12,true);
    if(phase>=4&&phase<=5){
     bolt(B[0],B[1]-58*size,B[0]-31*size,B[1]-21*size,218,.85,2.4,7);
     bolt(B[0],B[1]-43*size,B[0]+30*size,B[1]-13*size,219,.82,2.4,7);
     hit(B[0],B[1],phase===5?1:.83,225);
    }
    if(phase===6)hit(B[0],B[1],.43,228);
   }
   if(phase===7){ring(B[0],B[1],39,.23,230);sparks(B[0],B[1],3,17,.24,232);}
  }
  counters['cinema-'+kind]=(counters['cinema-'+kind]||0)+1;
  counters['phase-'+kind+'-'+(phase+1)]=(counters['phase-'+kind+'-'+(phase+1)]||0)+1;
 }

 function add(name,desc){
  const id=norm(name);
  if(!id||typeof desc?.paint!=='function'||registered.has(id))
   throw Error('Duplicate or invalid V46 electric effect '+id);
  registered.set(id,Object.freeze(desc));
 }
 function resolve(f){
  const raw=f?.move?.name||f?.name||f?.skill?.name||f?.moveName||'';
  const k=norm(raw);
  return registered.get(k)||null;
 }
 function paint(g,fx,now,e){
  const d=resolve(fx);if(!d)return false;
  if(!Array.isArray(fx.from)||!Array.isArray(fx.to)||now<fx.at)return true;
  const t=clamp((now-fx.at)/(fx.duration||d.duration)),s=clamp((e?.h||560)/560,.72,1.16);
  try{d.paint(g,fx,t,now-fx.at,s,{stamp,between,burst,cinematic,clamp,ease,lerp});}
  catch(err){error=d.key+': '+err.message;console.warn('[V46 Electric]',err)}
  return true;
 }
 function diagnostics(){return {
  version:'49.0',registered:[...registered.keys()],
  ready:Object.fromEntries(names.map(n=>[n,!!images[n].naturalWidth])),
  stamps:{...counters},error
 }}
 return {add,resolve,paint,stamp,between,burst,cinematic,clamp,ease,lerp,images,diagnostics};
})();
