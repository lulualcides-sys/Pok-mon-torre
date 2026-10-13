/* Fire Blast — original fire sprite atlas; classic five-point fiery impact. */
fireSpriteV41.add('fireblast',{
 key:'fireBlast',duration:1540,contact:false,
 paint(g,f,t,ms,s,K){
  const {draw,ease,lerp,clamp}=K,A=f.from,B=f.to;
  const dx=B[0]-A[0],dy=B[1]-A[1],len=Math.hypot(dx,dy)||1;
  const nx=-dy/len,ny=dx/len,heading=Math.atan2(dy,dx)-Math.PI/2;
  const wind=ease(t/.17),fade=1-ease((t-.93)/.07);
  // Brief ignition in front of the attacking Pokémon.
  if(t<.23){
   const p=1-ease((t-.18)/.05);
   draw(g,'flame',0,A[0]+dx/len*17,A[1]+dy/len*17,
     (42+25*wind)*s,(47+26*wind)*s,{alpha:p,rotation:heading});
   draw(g,'fireburst',Math.floor(ms/95),A[0]+dx/len*30,A[1]+dy/len*30,
     34*s,37*s,{alpha:p*.8,rotation:heading});
  }
  // Intense single fire core with trailing individual sprite frames.
  const travel=ease((t-.14)/.49);
  if(t>.12&&t<.76){
   for(let i=11;i>=0;i--){
    const q=clamp(travel-i*.056);
    if(q<=0)continue;
    const ripple=Math.sin(ms*.012+i*2.1)*(i%3)*4*s;
    const x=lerp(A[0],B[0],q)+nx*ripple,y=lerp(A[1],B[1],q)+ny*ripple;
    const size=(26+(11-i)*2.4)*s;
    draw(g,'firebolt',Math.floor(ms/70)+i*3,x,y,size,size*1.25,
      {rotation:heading,alpha:fade*(.47+(11-i)*.043)});
   }
   const hx=lerp(A[0],B[0],travel),hy=lerp(A[1],B[1],travel);
   draw(g,'fireburst',Math.floor(ms/75),hx,hy,53*s,58*s,
     {rotation:heading,alpha:fade*.96});
  }
  // Assemble the familiar "大"-like silhouette using ONLY existing cropped sprites.
  const impact=ease((t-.55)/.10)*(1-ease((t-.91)/.09));
  if(impact>.001){
   draw(g,'explosionBurst',Math.floor((t-.55)*27),B[0],B[1],
     (105+27*impact)*s,(114+25*impact)*s,{alpha:impact});
   const strokes=[
    [-.08,-.66,0],[-.42,-.36,-.65],[.42,-.36,.65],
    [-.36,.21,-.75],[.36,.21,.75],[-.57,.51,-.52],[.57,.51,.52]
   ];
   for(let i=0;i<strokes.length;i++){
    const [rx,ry,turn]=strokes[i],wobble=Math.sin(ms*.014+i)*3*s;
    const x=B[0]+rx*75*s+wobble,y=B[1]+ry*72*s;
    draw(g,'fireburst',Math.floor(ms/64)+i*2,x,y,
      (31+(i%3)*4)*s,(49+(i%2)*8)*s,
      {rotation:turn,alpha:impact*(.93-i*.055)});
   }
   for(let i=0;i<5;i++){
    const angle=i*Math.PI*2/5+ms*.003;
    draw(g,'firebolt',Math.floor(ms/78)+i*4,
      B[0]+Math.cos(angle)*62*s,B[1]+Math.sin(angle)*47*s,
      24*s,28*s,{rotation:angle,alpha:impact*.76});
   }
  }
 }
});
