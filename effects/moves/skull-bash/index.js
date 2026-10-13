/* Skull Bash — close-range charge, head-first dash and impact.
 * This is a PHYSICAL CONTACT visual, not a water projectile or ranged beam.
 */
waterSpriteV43.add('skullbash',{
 key:'skullBash',duration:1120,contact:true,
 paint(g,f,t,ms,s,K){
  const {draw,ease,lerp,clamp}=K,A=f.from,B=f.to;
  const dx=B[0]-A[0],dy=B[1]-A[1],len=Math.hypot(dx,dy)||1;
  const dir=Math.atan2(dy,dx),ux=dx/len,uy=dy/len;
  // Short blue-white wind-up around the Pokémon's head.
  if(t<.34){
   const charge=ease(t/.32);
   draw(g,18,A[0]+ux*(12+10*charge)*s,A[1]+uy*(12+10*charge)*s,
      (18+11*charge)*s,(24+13*charge)*s,
      {rotation:dir+Math.PI/2,alpha:(1-ease((t-.25)/.09))*.71});
  }
  // Player movement is performed by the combat bridge: only trailing speed pixels here.
  if(t>.27&&t<.70){
   const dash=ease((t-.27)/.32);
   const fade=(1-ease((t-.60)/.11))*.55;
   for(let i=0;i<3;i++){
    const u=clamp(dash-i*.092);
    if(u<=0)continue;
    const x=lerp(A[0],B[0],u*.87),y=lerp(A[1],B[1],u*.87);
    draw(g,19,x-ux*(9+i*6)*s,y-uy*(9+i*6)*s,
      (19-i*3)*s,(13-i*2)*s,
      {rotation:dir-Math.PI/2,alpha:fade*(.8-i*.17)});
   }
  }
  // Tight impact only at true body-contact time; not a screenwide blast.
  if(t>.56&&t<.86){
   const hit=ease((t-.56)/.09)*(1-ease((t-.75)/.11));
   draw(g,14,B[0],B[1]-13*s,58*s,55*s,{alpha:hit*.96});
   draw(g,16,B[0],B[1]-10*s,39*s,43*s,{alpha:hit*.69});
  }
 }
});
