/* WATER PULSE V45 — rotating sphere of ORIGINAL water-source sprite frames.
 * Travels as a contained circular pulse, not a horizontal water beam.
 */
waterSpriteV43.add('pulsodagua',{
 key:'waterPulse',duration:1530,contact:false,orbPulse:true,followTarget:true,
 paint(g,f,t,ms,s,K){
  const {draw,ease,lerp,clamp}=K,A=f.from,B=f.to;
  const TAU=Math.PI*2;
  const travel=ease((t-.12)/.57),build=ease(t/.14);
  const fade=1-ease((t-.86)/.13);
  const x=lerp(A[0],B[0],travel),y=lerp(A[1],B[1],travel);
  if(t<.23){
   const swell=build*(1-ease((t-.19)/.04));
   draw(g,7,A[0],A[1],43*s,42*s,{alpha:swell*.78});
  }
  if(t>.10&&t<.89){
   // Animated water core and rotating rings stamped from genuine splash frames.
   const pulse=1+.12*Math.sin(ms*.012);
   draw(g,7+(Math.floor(ms/91)%3),x,y,47*s*pulse,47*s*pulse,
    {alpha:fade*.91,rotation:ms*.0007});
   for(let ring=0;ring<2;ring++){
    const count=ring?8:10;
    const radius=(ring?37:24)*s*(.94+.11*Math.sin(ms*.010-ring*1.6));
    for(let j=0;j<count;j++){
     const a=j*TAU/count+(ring?1:-1)*ms*.0048;
     const px=x+Math.cos(a)*radius,py=y+Math.sin(a)*radius;
     const size=(ring?17:20)*s;
     draw(g,12+((j+Math.floor(ms/95)+ring*2)%7),
      px,py,size,size*(ring?1.14:1.27),
      {rotation:a+Math.PI/2,alpha:fade*(ring?.50:.70)});
    }
   }
   // Ripple wake behind the sphere. These use the same approved source tiles.
   const dx=B[0]-A[0],dy=B[1]-A[1],len=Math.hypot(dx,dy)||1;
   for(let j=1;j<=3;j++){
    const v=clamp(travel-j*.064);
    draw(g,18-j,lerp(A[0],B[0],v),lerp(A[1],B[1],v),
     (21+j*4)*s,(18+j*3)*s,{alpha:fade*(.46-j*.085),rotation:ms*.0017});
   }
  }
  if(t>.60){
   const hit=ease((t-.60)/.09)*(1-ease((t-.89)/.11));
   const r=(40+32*ease((t-.60)/.25))*s;
   for(let j=0;j<12;j++){
    const a=j*TAU/12+ms*.0022;
    draw(g,5+((j+Math.floor(ms/78))%5),
     B[0]+Math.cos(a)*r,B[1]+Math.sin(a)*r*.68,
     22*s,29*s,
     {rotation:a,alpha:hit*(.87-j*.03)});
   }
  }
 }
});
