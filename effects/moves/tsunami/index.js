/* Tsunami — a tall approaching wall of genuine wave pixels from the player's
 * large_water_elemental_and_waves_spritesheet.png. No generic water circles.
 */
waterSpriteV43.add('tsunami',{
 key:'tsunami',duration:1780,contact:false,area:true,
 paint(g,f,t,ms,s,K){
  const {draw,clamp,ease,lerp}=K,A=f.from,B=f.to;
  const dx=B[0]-A[0],dy=B[1]-A[1];
  const len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
  // Crest develops out of a shallow advancing tide.
  const progress=ease((t-.09)/.58);
  const rise=ease((t-.02)/.30);
  const release=1-ease((t-.84)/.15);
  if(t<.16)draw(g,0,A[0]+dx*.10,A[1]+dy*.10,70*s,35*s,
                    {alpha:(1-ease((t-.10)/.06))*.78});
  if(progress>.01&&t<.94){
   const x=lerp(A[0],B[0],progress),y=lerp(A[1],B[1],progress);
   const frame=Math.min(4,Math.floor(progress*5));
   const tall=(76+55*rise)*s,wide=(144+48*rise)*s;
   // Layered water depth/crest: actual pixel-art frames 0–4 (wave rise).
   draw(g,frame,x,y-25*s,wide,tall,{alpha:release*.94});
   draw(g,Math.min(4,frame+1),x+nx*22*s,y+ny*22*s-7*s,
     wide*.77,tall*.81,{alpha:release*.75});
   draw(g,Math.max(1,frame),x-nx*25*s,y-ny*25*s+8*s,
     wide*.66,tall*.58,{alpha:release*.53,flipX:true});
   // Whitewater at the leading edge, still taken from source splash sheet.
   for(let i=0;i<5;i++){
    const off=(i-2)*29*s;
    draw(g,12+((Math.floor(ms/92)+i)%6),
      x+nx*off+dx/len*24*s,y+ny*off+dy/len*20*s+7*s,
      32*s,31*s,{alpha:release*(.49+rise*.31)});
   }
  }
  // After wave reaches foe, splash rises and water retreats.
  if(t>.62){
   const strike=ease((t-.62)/.13)*(1-ease((t-.91)/.09));
   if(strike>.02){
    for(let i=0;i<5;i++){
     const off=(i-2)*25*s;
     draw(g,12+((Math.floor(ms/95)+i)%7),B[0]+nx*off,
      B[1]+ny*off-14*s,48*s,56*s,{alpha:strike*(.95-i*.08)});
    }
    draw(g,4,B[0],B[1]+32*s,139*s,53*s,{alpha:strike*.67});
   }
  }
 }
});
