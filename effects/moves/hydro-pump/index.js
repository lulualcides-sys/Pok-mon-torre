/* Hydro Pump — a sustained high-pressure stream from the caster to the target.
 * Exclusively uses the original user's wave/splash PNG atlas, not CSS/lines.
 */
waterSpriteV43.add('hydropump',{
 key:'hydroPump',duration:1420,contact:false,beam:true,
 paint(g,f,t,ms,s,K){
  const {draw,ease,lerp,clamp}=K,A=f.from,B=f.to;
  const dx=B[0]-A[0],dy=B[1]-A[1],len=Math.hypot(dx,dy)||1;
  const ux=dx/len,uy=dy/len,nx=-uy,ny=ux,angle=Math.atan2(dy,dx)-Math.PI/2;
  const warm=ease(t/.16),head=ease((t-.12)/.35);
  const fade=1-ease((t-.89)/.11);
  if(t<.29)draw(g,12,A[0]+ux*12*s,A[1]+uy*12*s,
     (26+22*warm)*s,(30+22*warm)*s,{alpha:(1-ease((t-.20)/.09))*.91,rotation:angle});
  if(t>.11&&t<.94){
   // Several successive authentic foamy tiles create one continuous jet.
   const segments=11;
   for(let i=0;i<segments;i++){
    const u=(i+.45)/segments;
    if(u>head)continue;
    const x=lerp(A[0],B[0],u),y=lerp(A[1],B[1],u);
    const wobble=Math.sin(ms*.014+i*2.1)*2*s;
    const tip=(u>.85?1.25:1),alpha=fade*warm*(.78+.16*Math.sin(i+ms*.008));
    draw(g,7+(i+Math.floor(ms/95))%3,x+nx*wobble,y+ny*wobble,
      43*s*tip,30*s*tip,{alpha,rotation:angle});
    // Fast-forward droplets support the water jet rather than giant rings.
    if(i%2===0)draw(g,18,x+nx*9*s,y+ny*9*s,22*s,33*s,
      {alpha:alpha*.61,rotation:angle});
   }
  }
  if(t>.44){
   const hit=ease((t-.44)/.15)*(1-ease((t-.89)/.10));
   for(let i=0;i<4;i++){
    const u=(i+.2)/4,side=(i-1.5)*17*s;
    draw(g,13+(Math.floor(ms/91)+i)%6,
      B[0]+nx*side+ux*u*7*s,
      B[1]+ny*side+uy*u*7*s-9*s,
      (49+i%2*7)*s,(53+i%2*5)*s,
      {alpha:hit*(.89-i*.12)});
   }
   draw(g,4,B[0],B[1]+23*s,101*s,43*s,{alpha:hit*.55});
  }
 }
});
