/* Chamas de Moltres — 100% sprites originais, recoloridos azul. */
fireSpriteV41.add('chamasdemoltres',{
 key:'moltres',duration:1540,contact:false,
 paint(g,f,t,ms,s,K){
  const {draw,ease,lerp,clamp}=K,A=f.from,B=f.to;
  const dx=B[0]-A[0],dy=B[1]-A[1],len=Math.hypot(dx,dy)||1;
  const nx=-dy/len,ny=dx/len,rotation=Math.atan2(dy,dx)-Math.PI/2;
  const fade=1-ease((t-.90)/.10),wind=ease(t/.19);
  if(t<.29){
   const a=1-ease((t-.23)/.07),size=(35+29*wind)*s;
   draw(g,'flame',0,A[0],A[1]-8*s,size,size*1.3,{blue:true,alpha:a,rotation:rotation});
   for(let j=0;j<3;j++){
    const a0=ms*.006+j*2.09;
    draw(g,'firebolt',Math.floor(ms/72)+j*4,
      A[0]+Math.cos(a0)*(12+13*wind)*s,A[1]+Math.sin(a0)*(8+10*wind)*s,
      (18+8*wind)*s,(20+8*wind)*s,{blue:true,alpha:wind*(1-t)*.9,rotation:a0});
   }
  }
  const reach=ease((t-.15)/.51);
  if(t>=.13&&t<=.91){
   // Flare plume: animated, staggered firebolt frames, not a coded beam.
   for(let ribbon=-2;ribbon<=2;ribbon++){
    for(let j=0;j<11;j++){
     const trail=j*.067+Math.abs(ribbon)*.013;
     const q=clamp(reach-trail);
     if(q<=.005)continue;
     const curl=Math.sin(ms*.014+q*12+ribbon*.95)*(7+6*q)*s;
     const side=(ribbon*9*s+curl)*Math.sin(Math.PI*q*.9);
     const x=lerp(A[0],B[0],q)+nx*side;
     const y=lerp(A[1],B[1],q)+ny*side;
     const size=(ribbon===0?41:30)*(0.85+0.35*q)*s;
     draw(g,'firebolt',Math.floor(ms/69)+j*2+ribbon*4,
       x,y,size,size*1.23,{blue:true,alpha:fade*(.79-j*.035),rotation:rotation+.07*ribbon});
     if(j%3===0)draw(g,'flame',0,x+nx*side*.2,y+ny*side*.2,
       size*.69,size,{blue:true,alpha:fade*.73,rotation:rotation+.12*ribbon});
    }
   }
  }
  const hit=ease((t-.58)/.13)*(1-ease((t-.94)/.06));
  if(hit>0){
   draw(g,'explosionBurst',Math.floor((t-.58)*30),B[0],B[1],
     (95+23*hit)*s,(98+27*hit)*s,{blue:true,alpha:hit});
   draw(g,'fireburst',Math.floor(ms/64),B[0]-19*s,B[1]+6*s,
     67*s,80*s,{blue:true,alpha:hit*.87,rotation:-.26});
   draw(g,'fireburst',Math.floor(ms/69)+4,B[0]+23*s,B[1]-8*s,
     70*s,82*s,{blue:true,alpha:hit*.85,rotation:.33,flipX:true});
   for(let j=0;j<7;j++){
    const angle=j*Math.PI*2/7+ms*.004;
    const r=(25+24*ease((t-.65)/.27))*s;
    draw(g,'firebolt',Math.floor(ms/70)+j*2,
      B[0]+Math.cos(angle)*r,B[1]+Math.sin(angle)*r*.72,
      22*s,28*s,{blue:true,alpha:hit*.81,rotation:angle});
   }
  }
 }
});
