/* Will-O-Wisp — independent spectral-blue wisps; status, not an explosion. */
fireSpriteV41.add('willowisp',{
 key:'willOWisp',duration:1980,contact:false,status:true,
 paint(g,f,t,ms,s,K){
  const {draw,ease,lerp,clamp}=K,A=f.from,B=f.to;
  const warm=ease(t/.15),travel=ease((t-.10)/.53);
  const fade=1-ease((t-.91)/.09);
  const TAU=Math.PI*2;
  // Five independent blue flames weave towards the target, not a fire beam.
  for(let i=0;i<5;i++){
   const lag=i*.038,q=clamp((travel-lag)/(1-lag));
   const orbit=i*TAU/5+ms*.0036;
   const spread=(1-q)*20*s+Math.sin(q*Math.PI)*12*s;
   const x=lerp(A[0],B[0],q)+Math.cos(orbit)*spread;
   const y=lerp(A[1],B[1],q)+Math.sin(orbit)*spread*.74-10*s;
   const flicker=.86+Math.sin(ms*.016+i*2.2)*.12;
   const size=(26+(i%2)*7)*s*flicker;
   draw(g,'flame',0,x,y,size,size*1.31,
     {blue:true,alpha:fade*warm*.85,rotation:Math.sin(ms*.004+i)*.17});
   draw(g,'firebolt',Math.floor(ms/89)+i*3,x+Math.sin(orbit)*6*s,y-9*s,
     19*s,22*s,{blue:true,alpha:fade*warm*.71,rotation:orbit*.15});
  }
  // Burn-like spectral aura remains around the target; no burst damage visual.
  if(t>.51){
   const burn=ease((t-.51)/.13)*(1-ease((t-.91)/.09));
   for(let i=0;i<6;i++){
    const a=i*TAU/6+ms*.0035,rad=(24+Math.sin(ms*.007+i)*5)*s;
    draw(g,'flame',0,B[0]+Math.cos(a)*rad,B[1]+Math.sin(a)*rad*.69,
      (22+i%2*6)*s,(30+i%2*7)*s,
      {blue:true,alpha:burn*(.72+.15*Math.sin(ms*.012+i)),rotation:a*.20});
   }
   draw(g,'spinRing',Math.floor(ms/90),B[0],B[1]+21*s,65*s,30*s,
     {blue:true,alpha:burn*.68});
  }
 }
});
