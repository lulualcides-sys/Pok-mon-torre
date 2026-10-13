/* Brasa — quick three-to-five small ember sprites with modest impact. */
fireSpriteV41.add('brasa',{
 key:'brasa',duration:940,contact:false,
 paint(g,f,t,ms,s,K){
  const {draw,ease,lerp,clamp}=K,A=f.from,B=f.to;
  const dx=B[0]-A[0],dy=B[1]-A[1],heading=Math.atan2(dy,dx)-Math.PI/2;
  const len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
  const fade=1-ease((t-.82)/.18);
  if(t<.23){
   draw(g,'flame',0,A[0],A[1],27*s,32*s,
       {rotation:heading,alpha:1-ease((t-.17)/.06)});
  }
  for(let i=0;i<5;i++){
   const lag=i*.065,q=ease((t-.11-lag)/.48);
   if(t<.11+lag||q>=1)continue;
   const sx=i%2?-1:1,side=(i-2)*6*s+Math.sin(ms*.013+i)*3*s;
   const x=lerp(A[0],B[0],q)+nx*side;
   const y=lerp(A[1],B[1],q)+ny*side;
   const size=(20+i%3*4)*s;
   draw(g,'firebolt',Math.floor(ms/72)+i*3,x,y,
     size,size*1.12,{rotation:heading+.07*sx,alpha:fade*(.91-i*.09)});
   draw(g,'flame',0,x-sx*5*s,y+3*s,size*.52,size*.73,
      {rotation:heading,alpha:fade*.60});
  }
  const hit=ease((t-.55)/.11)*(1-ease((t-.90)/.10));
  if(hit>0){
   draw(g,'explosion',Math.floor((t-.55)*30),B[0],B[1],
      49*s,54*s,{alpha:hit*.86});
   for(let i=0;i<3;i++){
    const a=i*TAU/3+ms*.005;
    draw(g,'firebolt',Math.floor(ms/73)+i*4,
      B[0]+Math.cos(a)*18*s,B[1]+Math.sin(a)*12*s,
      20*s,24*s,{rotation:a,alpha:hit*.71});
   }
  }
 }
});
