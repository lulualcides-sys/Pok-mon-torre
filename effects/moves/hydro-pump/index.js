/* HYDRO PUMP V44 — continuous, large, pressurized ORIGINAL water pixels.
 * Not a line of floating bubbles: dense overlapping wave crests make ONE jet.
 * Existing damage/hit logic remains in the original BattleEngine.
 */
waterSpriteV43.add('hydropump',{
 key:'hydroPump',duration:1610,beam:true,contact:false,pressureStream:true,
 paint(g,f,t,ms,s,K){
  const {draw,ease,lerp,clamp}=K,A=f.from,B=f.to;
  const dx=B[0]-A[0],dy=B[1]-A[1],length=Math.hypot(dx,dy)||1;
  const ux=dx/length,uy=dy/length,nx=-uy,ny=ux,angle=Math.atan2(dy,dx);
  const charge=ease(t/.13);
  const head=ease((t-.10)/.43);
  const release=1-ease((t-.85)/.15);
  // Mouth nozzle uses splash artwork, not a circular projectile.
  if(t<.27){
   const alpha=(1-ease((t-.20)/.07))*.96;
   draw(g,8,A[0]+ux*14*s,A[1]+uy*14*s,39*s,42*s,
    {alpha:alpha*charge,rotation:angle+.68});
  }
  if(t>.095&&t<.97){
   // Source frames 0..4 are ORIGINAL horizontal wave crests. Each section
   // overlaps its neighbors by >50%, making a single thick flowing cylinder.
   const count=16;
   const pulse=1+.045*Math.sin(ms*.013);
   for(let i=0;i<count;i++){
    const u=(i+.5)/count;
    if(u>head+.02)continue;
    const x=lerp(A[0],B[0],u),y=lerp(A[1],B[1],u);
    const oscillation=Math.sin(ms*.020-i*1.9)*2.8*s;
    const radius=(23+6*Math.sin(u*Math.PI))*s*pulse;
    const body=(86+8*Math.sin(u*Math.PI))*s;
    const alpha=release*(.88+.08*Math.sin(ms*.011+i));
    draw(g,(i+Math.floor(ms/100))%5,
      x+nx*oscillation,y+ny*oscillation,
      body,radius*2.30,{alpha,rotation:angle});
    // Foamy highlights are made from the same water crest, no CSS beams.
    if(i%2===0)draw(g,(i+Math.floor(ms/72)+2)%5,
      x+nx*radius*.26,y+ny*radius*.26,
      body*.72,radius*1.20,
      {alpha:alpha*.63,rotation:angle,flipX:true});
    // Genuine long splash pixels make high-pressure streaks run along jet.
    if(i%3===1)draw(g,7+(i+Math.floor(ms/81))%3,
      x-nx*radius*.28,y-ny*radius*.28,
      (52+5*(i%2))*s,(33+3*(i%2))*s,
      {alpha:alpha*.64,rotation:angle+.76});
   }
   // Active nozzle lets the jet appear emitted by the attacking Pokémon.
   draw(g,6,A[0]+ux*29*s,A[1]+uy*29*s,
     (50+9*charge)*s,(47+8*charge)*s,
     {alpha:release*.77,rotation:angle});
  }
  // Powerful but localized WATER splash at the actual target.
  if(t>.47){
   const impact=ease((t-.47)/.10)*(1-ease((t-.89)/.11));
   if(impact>.01){
    draw(g,7,B[0],B[1]-22*s,
      (106+8*impact)*s,(102+12*impact)*s,
      {alpha:impact*.98,rotation:angle+.28});
    for(let j=0;j<6;j++){
     const side=(j-2.5)*21*s,front=(j%3)*11*s;
     draw(g,5+((Math.floor(ms/82)+j)%5),
       B[0]+nx*side+ux*front,B[1]+ny*side+uy*front-(9+j%2*13)*s,
       (39+j%2*13)*s,(56+j%3*8)*s,
       {alpha:impact*(.82-j*.064),rotation:(j-2.5)*.20});
    }
    draw(g,3,B[0]+ux*6*s,B[1]+31*s,116*s,37*s,
      {alpha:impact*.64});
   }
  }
 }
});
