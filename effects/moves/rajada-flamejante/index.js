/* Rajada Flamejante — jato contínuo feito só de quadros de fogo reais. */
fireSpriteV41.add('rajadaflamejante',{
 key:'rajada',duration:1230,contact:false,
 paint(g,f,t,ms,s,K){
  const {draw,ease,lerp,clamp}=K,A=f.from,B=f.to;
  const dx=B[0]-A[0],dy=B[1]-A[1],len=Math.hypot(dx,dy)||1;
  const nx=-dy/len,ny=dx/len,rot=Math.atan2(dy,dx)-Math.PI/2;
  const grow=ease((t-.09)/.22),stop=1-ease((t-.83)/.15);
  if(t<.26){
   draw(g,'flame',0,A[0],A[1],(27+22*grow)*s,(38+25*grow)*s,
    {alpha:1-ease((t-.21)/.05),rotation:rot});
  }
  if(t>=.10){
   // Continuous connected sprites alternate firebolt + hot flame frames.
   for(let lane=-2;lane<=2;lane++){
    for(let j=0;j<23;j++){
     const q=(j+.25)/23*grow;
     if(q<=0)continue;
     const width=Math.sin(q*Math.PI*.83)*(8+Math.abs(lane)*9)*s;
     const wave=Math.sin(q*22+ms*.022+lane)*(4+q*9)*s;
     const x=lerp(A[0],B[0],q)+nx*(lane*width+wave);
     const y=lerp(A[1],B[1],q)+ny*(lane*width+wave);
     const size=(lane===0?32:lane===1||lane===-1?27:22)*(0.83+q*.35)*s;
     const shade=lane===0?1:.80;
     draw(g,'firebolt',Math.floor(ms/63)+j*2+lane*3,x,y,
       size,size*1.11,{rotation:rot,alpha:stop*shade*(.85-.012*j)});
     if(j%4===0)draw(g,'flame',0,x,y-7*s,size*.77,size*1.15,
       {rotation:rot+lane*.04,alpha:stop*.7});
    }
   }
  }
  const burst=ease((t-.38)/.15)*(1-ease((t-.91)/.09));
  if(burst>0){
   draw(g,'fireburst',Math.floor(ms/65),B[0],B[1],75*s,83*s,{alpha:burst});
   draw(g,'explosion',Math.floor(ms/77)+3,B[0]-20*s,B[1]+5*s,53*s,61*s,
     {alpha:burst*.75,rotation:-.1});
   draw(g,'explosion',Math.floor(ms/80)+5,B[0]+19*s,B[1]-7*s,56*s,60*s,
     {alpha:burst*.76,rotation:.17});
  }
 }
});
