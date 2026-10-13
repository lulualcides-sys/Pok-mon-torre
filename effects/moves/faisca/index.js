/* FAÍSCA (Spark) V46 — an extremely fast ELECTRIC BODY DASH.
 * Contact dash occurs in electric-sprite-integrate.js. Original pixels only.
 */
electricSpriteV46.add('faisca',{
 key:'spark',duration:980,contact:true,contactStyle:'spark',followTarget:true,
 paint(g,f,t,ms,s,K){
  const {stamp,between,ease,lerp,clamp}=K;
  const A=f.from,B=f.to,actor=f.actor||A;
  const dx=B[0]-A[0],dy=B[1]-A[1],angle=Math.atan2(dy,dx);
  const dist=Math.hypot(dx,dy)||1,ux=dx/dist,uy=dy/dist,nx=-uy,ny=ux;
  const charge=ease(t/.17)*(1-ease((t-.22)/.08));
  if(t<.27){
   for(let i=0;i<7;i++){
    const a=i*Math.PI*2/7+ms*.011;
    stamp(g,'spark',A[0]+Math.cos(a)*24*s,A[1]+Math.sin(a)*20*s,
      (17+i%3*5)*s,(23+i%2*6)*s,{alpha:charge*(.72+.15*Math.sin(ms*.017+i)),rotation:a});
   }
  }
  if(t>.18&&t<.80){
   const glow=ease((t-.18)/.055)*(1-ease((t-.68)/.11));
   const x=actor[0],y=actor[1];
   for(let j=0;j<8;j++){
    const aa=j*Math.PI*2/8+ms*.010;
    stamp(g,j%3===0?'bolt-a':'spark',
      x+Math.cos(aa)*22*s,y+Math.sin(aa)*19*s,
      (19+j%3*7)*s,(25+j%3*9)*s,
      {alpha:glow*(.91-j*.055),rotation:aa-.5});
   }
   for(let j=0;j<5;j++){
    const tail=(j+1)*19*s;
    const px=x-ux*tail+nx*Math.sin(ms*.015+j)*7*s;
    const py=y-uy*tail+ny*Math.sin(ms*.015+j)*7*s;
    stamp(g,'arc',px,py,(39-j*4)*s,(20-j*2.3)*s,
      {rotation:angle,alpha:glow*(.61-j*.09)});
   }
  }
  if(t>.40&&t<.80){
   const hit=ease((t-.40)/.11)*(1-ease((t-.68)/.12));
   if(hit>.01){
    stamp(g,'impact',B[0],B[1],93*s,89*s,{alpha:hit*.99});
    for(let j=0;j<7;j++){
     const a=j*Math.PI*2/7+ms*.005;
     stamp(g,'spark',B[0]+Math.cos(a)*46*s,B[1]+Math.sin(a)*38*s,
       19*s,26*s,{rotation:a,alpha:hit*(.79-j*.075)});
    }
   }
  }
 }
});
