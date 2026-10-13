/* Sunny Day V42.2 — quiet sun/weather sprite animation, ZERO explosion frames.
 * Uses only the user-supplied fire GIF atlas as pixel-art sprites.
 * No burst, impact, projectile, shockwave, radial expansion or damage VFX.
 */
fireSpriteV41.add('sunnyday',{
 key:'sunnyDay',duration:4800,contact:false,status:true,weather:true,
 paint(g,f,t,ms,s,K){
  const {draw,ease,lerp}=K,A=f.from,B=f.to,TAU=Math.PI*2;
  // A calm sun stays overhead instead of exploding over either Pokémon.
  const cx=(A[0]+B[0])*.5;
  const cy=Math.max(69,Math.min(A[1],B[1])-124*s);
  const alpha=ease(t/.17)*(1-ease((t-.86)/.14));
  if(alpha<=.001)return;
  const breath=1+.025*Math.sin(ms*.0017);
  // Stable solar halo: original ring GIF frames, no scaling burst.
  draw(g,'spinRing',Math.floor(ms/160),cx,cy,63*s*breath,55*s*breath,
   {alpha:alpha*.63,rotation:ms*.00012});
  draw(g,'spinRing',Math.floor(ms/190)+4,cx,cy,43*s,38*s,
   {alpha:alpha*.57});
  // A gentle, fixed solar core formed by flame sprite pixels.
  draw(g,'flame',0,cx,cy-2*s,34*s,39*s,
   {alpha:alpha*.55});
  // Delicate corona made of low-opacity flames, no projectile/explosion sprites.
  for(let i=0;i<8;i++){
   const a=i*TAU/8;
   const r=(36+Math.sin(ms*.0019+i)*2)*s;
   const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.83;
   draw(g,'flame',0,x,y,11*s,17*s,
     {rotation:a+Math.PI/2,alpha:alpha*(.28+.04*Math.sin(ms*.002+i))});
  }
  // Tiny persistent shimmer on ground; no flash on enemy.
  for(let i=0;i<5;i++){
   const x=lerp(A[0]-27*s,B[0]+27*s,i/4);
   const floorY=Math.max(A[1],B[1])+15*s;
   draw(g,'spinRing',Math.floor(ms/200)+i,x,floorY,
       27*s,10*s,{alpha:alpha*.08});
  }
 }
});
