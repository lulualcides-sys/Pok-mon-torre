/* Pokemon Torre V47 — cinematic electric pixel-sprite rendering kit.
 * Every actual stroke is a reusable authored SVG sprite, with independent V48 black-ink lightning strokes layered over the authored SVGs.
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

 // V48: independent, eight-beat, frame-synchronous electric ink layer.
 // In addition to authored SVG sprites, this draws genuinely changing
 // branching paths, dark edge contours, secondary forks and impact shards.
 // Purely visual: never touches game hitboxes, HP, cooldowns or actors.
 function cinematic(g,fx,t,ms,s,kind){
  if(!g||typeof g.beginPath!=='function'||!Array.isArray(fx.from)||!Array.isArray(fx.to))return;
  const phase=Math.min(7,Math.floor(clamp(t)*8));
  const within=clamp(t*8-phase),tick=Math.floor(ms/62);
  const A=fx.from,B=fx.to,P=fx.actor||A,TAU=Math.PI*2;
  const fade=phase===7?1-within:1;
  const rnd=n=>{const v=Math.sin(n*127.1+tick*31.7+phase*19.3)*43758.5453;return v-Math.floor(v)};
  const ink=(points,alpha=.9,weight=1)=>{
   if(points.length<2||alpha<=.015)return;
   g.save();g.globalAlpha=clamp(alpha)*fade;
   g.lineJoin='miter';g.lineCap='round';
   const widths=[9,6.2,3.6,1.35].map(v=>Math.max(.75,v*s*weight));
   const colors=['#080714','#7b390b','#ffca20','#fff9df'];
   for(let k=0;k<4;k++){
    g.beginPath();g.moveTo(points[0][0],points[0][1]);
    for(let j=1;j<points.length;j++)g.lineTo(points[j][0],points[j][1]);
    g.strokeStyle=colors[k];g.lineWidth=widths[k];
    g.shadowBlur=k===2?5*s:0;g.shadowColor='#ffde36';g.stroke();
   }
   g.restore();
  };
  const bolt=(x1,y1,x2,y2,seed,alpha=.9,weight=1,amp=12)=>{
   const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1;
   const nx=-dy/L,ny=dx/L,N=7,points=[[x1,y1]];
   for(let j=1;j<N;j++){
    const u=j/N,dis=(rnd(seed*13+j)*2-1)*amp*s*Math.sin(u*Math.PI);
    points.push([x1+dx*u+nx*dis,y1+dy*u+ny*dis]);
   }
   points.push([x2,y2]);ink(points,alpha,weight);
   for(let j=2;j<N-1;j+=3){
    const point=points[j],angle=(rnd(seed*19+j)-.5)*1.6+Math.atan2(dy,dx);
    const size=(18+20*rnd(seed*17+j))*s;
    ink([point,[point[0]+Math.cos(angle+1.25)*size,point[1]+Math.sin(angle+1.25)*size]],alpha*.68,weight*.43);
   }
  };
  const ring=(x,y,r,alpha=.8,seed=1)=>{
   if(alpha<=.02||r<1)return;
   const points=[];
   for(let j=0;j<=24;j++){
    const a=j*TAU/24,rad=r*(.96+.09*rnd(seed*31+j));
    points.push([x+Math.cos(a)*rad,y+Math.sin(a)*rad*.43]);
   }
   ink(points,alpha,.60);
  };
  const burstInk=(x,y,energy,seed=1)=>{
   if(energy<=.02)return;
   for(let j=0;j<10;j++){
    const a=j*TAU/10+(rnd(seed+j)-.5)*.24;
    const r0=(8+4*rnd(seed+j*3))*s;
    const r=(25+43*energy+17*rnd(seed*2+j))*s;
    bolt(x+Math.cos(a)*r0,y+Math.sin(a)*r0*.72,
     x+Math.cos(a)*r,y+Math.sin(a)*r*.75,seed+j,
     clamp(energy)*(j%3===0?1:.79),j%3===0?.93:.59,7);
   }
   ring(x,y,(27+52*energy)*s,energy*.6,seed+40);
  };
  const charged=(x,y,amount,seed)=>{
   ring(x,y,(24+18*amount)*s,.25+amount*.45,seed);
   for(let j=0;j<5;j++){
    const a=j*TAU/5+ms*.004;
    bolt(x+Math.cos(a)*12*s,y+Math.sin(a)*14*s,
     x+Math.cos(a)*(21+20*amount)*s,
     y+Math.sin(a)*(21+20*amount)*s,seed+j,.46+amount*.4,.44,7);
   }
  };
  if(kind==='faisca'){
   if(phase<=2)charged(P[0],P[1],.32+phase*.25,11);
   if(phase>=2&&phase<=5){
    const length=phase===2?.4:phase===5?.7:1;
    const dx=B[0]-A[0],dy=B[1]-A[1];
    const x=P[0],y=P[1],len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
    for(let j=0;j<4;j++){
     const lateral=(j-1.5)*11*s;
     bolt(x-dx/len*(43+j*17)*s*length+nx*lateral,
      y-dy/len*(43+j*17)*s*length+ny*lateral,
      x+nx*lateral*.3,y+ny*lateral*.3,41+j,.55+j*.1,.68,13);
    }
   }
   if(phase===5||phase===6)burstInk(B[0],B[1],phase===5?1.2:.68,60);
   if(phase===7)charged(B[0],B[1],.12,61);
  }else if(kind==='discharge'){
   const r=(20+Math.max(0,phase-1)*34+within*24)*s;
   ring(A[0],A[1],r,.48+Math.min(phase,5)*.07,101);
   if(phase<3)charged(A[0],A[1],phase/3,103);
   if(phase>=2&&phase<=6){
    for(let j=0;j<12;j++){
     const a=j*TAU/12+ms*.0007,end=Math.min(phase,5)<3?.6:1;
     const rad=r*end*(.85+.19*rnd(104+j));
     bolt(A[0]+Math.cos(a)*17*s,A[1]+Math.sin(a)*17*s,
      A[0]+Math.cos(a)*rad,A[1]+Math.sin(a)*rad*.73,
      120+j,.64+(phase===4?.23:0),.7,15);
    }
    if(phase>=4&&phase<=6){
     burstInk(B[0],B[1],phase===5?1:.51,141);
     bolt(A[0],A[1],B[0],B[1],156,.64,.45,19);
    }
   }
  }else if(kind==='tempestade'){
   const top=Math.max(44*s,B[1]-203*s);
   if(phase<=1)ring(B[0],B[1],(26+18*phase)*s,.48,201);
   if(phase>=2&&phase<=6){
    const count=phase===5?4:phase===4?3:phase===6?1:2;
    for(let j=0;j<count;j++){
     const horizontal=(j-(count-1)/2)*38*s+(rnd(210+j)-.5)*21*s;
     const targetX=j===0||count===1?B[0]:B[0]+horizontal;
     const until=phase===6?.74:1;
     bolt(B[0]+horizontal*.7,top,B[0]+(targetX-B[0])*until,
      top+(B[1]-top)*until,220+j+phase,.66+(.12*count),phase===5?1.15:.76,22);
     if(phase!==6)burstInk(targetX,B[1],phase===5?.85:.46,230+j);
    }
   }
   if(phase===7)ring(B[0],B[1],32*s,.24,245);
  }else if(kind==='trovao'){
   const top=Math.max(35*s,B[1]-249*s);
   if(phase<=2){
    ring(B[0],B[1],(26+12*phase)*s,.55,301);
    charged(B[0],top+23*s,.26+phase*.23,302);
   }
   if(phase>=3&&phase<=6){
    const length=phase===3?.58:1;
    const alpha=phase===6?.45:1;
    const thick=phase===4||phase===5?2:1.25;
    bolt(B[0]+(rnd(320)-.5)*14*s,top,
     B[0],top+(B[1]-top)*length,321,alpha,thick,29);
    if(phase>=4&&phase<=5){
     for(let j=0;j<4;j++){
      const a=(j+1)*TAU/5;
      bolt(B[0]+Math.cos(a)*36*s,top+58*s,
       B[0]+Math.cos(a)*66*s,B[1]-65*s+(j%2)*26*s,
       330+j,.76,.83,22);
     }
     burstInk(B[0],B[1],phase===5?1.43:1.06,348);
     ring(B[0],B[1],(45+(phase-4)*39)*s,.95,349);
    }else if(phase===6)burstInk(B[0],B[1],.5,359);
   }
   if(phase===7)ring(B[0],B[1],61*s,.30,361);
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
  try{d.paint(g,fx,t,now-fx.at,s,{stamp,between,burst,clamp,ease,lerp});}
  catch(err){error=d.key+': '+err.message;console.warn('[V46 Electric]',err)}
  return true;
 }
 function diagnostics(){return {
  version:'47.0',registered:[...registered.keys()],
  ready:Object.fromEntries(names.map(n=>[n,!!images[n].naturalWidth])),
  stamps:{...counters},error
 }}
 return {add,resolve,paint,stamp,between,burst,cinematic,clamp,ease,lerp,images,diagnostics};
})();
