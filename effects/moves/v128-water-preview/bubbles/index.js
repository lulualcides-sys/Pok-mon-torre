/* Original Bubble / Bolhas: many separate iridescent bubbles that pop on impact. */
window.PokemonTorreWaterV128?.register({
 key:'bolhas',aliases:['bubble','bubbles'],ms:1480,frames:16,
 draw(g,p){
  const {t,hit,from:A,to:B,world,clamp,ease,lerp,bubble,ring,droplet}=p;
  const dx=B[0]-A[0],dy=B[1]-A[1],len=Math.hypot(dx,dy)||1;
  const nx=-dy/len,ny=dx/len;
  for(let i=0;i<17;i++){
   const delay=i*.035,life=hit-delay,progress=clamp((t-delay)/Math.max(.12,life));
   if(progress<=0||progress>=1||t>hit+.12)continue;
   const q=ease(progress),side=Math.sin(i*3.72+t*11)*(8+i%3*4)*world;
   const r=(5.4+i%5*1.75)*world;
   bubble(g,lerp(A[0],B[0],q)+nx*side,
    lerp(A[1],B[1],q)+ny*side-7*Math.sin(q*Math.PI)*world,
    r,(1-ease((t-hit)/.20))*(.72+.22*Math.sin(q*Math.PI)));
  }
  if(t>=hit){
   const elapsed=clamp((t-hit)/Math.max(.1,1-hit)),fade=1-ease(elapsed);
   for(let j=0;j<12;j++){
    const angle=j*Math.PI/6,scale=world*(.5+j%4*.18);
    const radius=12+45*ease(elapsed);
    if(j%3===0)ring(g,B[0]+Math.cos(angle)*radius,B[1]+Math.sin(angle)*radius,
      3.5*scale,3*scale,fade,'#c7faff',1.5);
    else droplet(g,B[0]+Math.cos(angle)*radius,B[1]+Math.sin(angle)*radius*.73,
      3.2*scale,angle,fade);
   }
  }
 }
});