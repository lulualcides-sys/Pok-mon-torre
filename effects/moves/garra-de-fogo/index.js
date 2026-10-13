/* Garra de Fogo — contato real, três cortes com sprite de punho/chamas. */
fireSpriteV41.add('garradefogo',{
 key:'garra',duration:1060,contact:true,
 paint(g,f,t,ms,s,K){
  const {draw,ease,lerp}=K,A=f.from,B=f.to;
  const dx=B[0]-A[0],dy=B[1]-A[1],rot=Math.atan2(dy,dx)-Math.PI/2;
  const reach=ease((t-.09)/.32);
  if(t<.49){
   const x=lerp(A[0],B[0],reach*.80);
   const y=lerp(A[1],B[1],reach*.80);
   draw(g,'punchFlame',Math.floor(ms/68),x,y,32*s,40*s,
       {alpha:1-ease((t-.46)/.03),rotation:rot});
  }
  const strike=ease((t-.40)/.09)*(1-ease((t-.76)/.15));
  if(strike>.005){
   for(let i=0;i<3;i++){
    const lag=i*.066;
    const strength=ease((t-.40-lag)/.07)*(1-ease((t-.60-lag)/.13));
    const x=B[0]+(i-1)*12*s,y=B[1]+(i-1)*8*s;
    if(strength>0){
     draw(g,'punch',Math.floor((t-.40-lag)*35),
         x,y,68*s,64*s,{rotation:(i-1)*.36-.30,alpha:strength});
     draw(g,'punchFlame',Math.floor(ms/63)+i*2,
         x+8*s,y-8*s,37*s,44*s,{rotation:rot+(i-1)*.35,alpha:strength*.92});
    }
   }
   draw(g,'explosion',Math.floor(ms/72),B[0],B[1],
     61*s,62*s,{alpha:strike*.77});
  }
  if(t>.58&&t<.92){
   draw(g,'fireburst',Math.floor(ms/79),B[0],B[1]-7*s,
    37*s,46*s,{alpha:(1-ease((t-.83)/.09))*.67});
  }
 }
});
