/* TSUNAMI V44 — wall of ORIGINAL ocean crest and splash sprites.
 * Nothing is drawn with generic Canvas ellipses, gradients, lines or CSS.
 * The wave grows from the caster, rises HIGH, crosses the field and crashes.
 */
waterSpriteV43.add('tsunami',{
 key:'tsunami',duration:1940,area:true,contact:false,waterWall:true,
 paint(g,f,t,ms,s,K){
  const {draw,ease,clamp,lerp}=K,A=f.from,B=f.to;
  const dx=B[0]-A[0],dy=B[1]-A[1],distance=Math.hypot(dx,dy)||1;
  const ux=dx/distance,uy=dy/distance,nx=-uy,ny=ux;
  // Rising swell at the launch location, not a little ball of water.
  if(t<.24){
   const p=ease(t/.22),fade=1-ease((t-.18)/.06);
   draw(g,2,A[0]+dx*.06,A[1]+dy*.06+19*s,
     (115+90*p)*s,(30+48*p)*s,{alpha:fade*.91});
   draw(g,6,A[0]+dx*.09,A[1]+dy*.09-9*s,
     (59+49*p)*s,(48+53*p)*s,{alpha:fade*.72});
  }
  // The crest spans most of the combat width, with a true vertically filled
  // water body made from animated source splash pixels below it.
  if(t>.10&&t<.91){
   const advance=ease((t-.10)/.62);
   const grow=ease((t-.04)/.32);
   const vanish=1-ease((t-.81)/.10);
   const x=lerp(A[0],B[0],advance),y=lerp(A[1],B[1],advance);
   const width=(185+114*grow)*s;
   const height=(105+105*grow)*s;
   const crestY=y-height*.45;
   const baseY=y+height*.30;
   // Pixel-rich water mass: overlapping 6/7/8/9 original splash tiles.
   for(let j=0;j<3;j++){
    const side=(j-1)*width*.275;
    const ripple=Math.sin(ms*.004+j*1.9)*6*s;
    const ox=nx*side,oy=ny*side;
    const waveFrame=5+((Math.floor(ms/125)+j)%5);
    draw(g,waveFrame,x+ox+ux*ripple,baseY+oy-31*s,
      width*.47,height*.91,
      {alpha:vanish*(.73-j*.045),flipX:j===2});
    draw(g,5+((Math.floor(ms/165)+j+2)%5),x+ox-ux*12*s,
      baseY+oy+9*s,width*.43,height*.61,
      {alpha:vanish*.69,flipX:j===1});
   }
   // Broad curved crest is drawn ABOVE the body (not a thin floor stripe).
   draw(g,Math.min(4,Math.floor(advance*5)),x,crestY,
     width,height*.58,{alpha:vanish*.98});
   draw(g,(Math.floor(ms/155)%3)+2,
     x+nx*width*.14-ux*18*s,crestY+9*s,
     width*.71,height*.40,{alpha:vanish*.77,flipX:true});
   // The spray rolls down the breaking front of the tidal wave.
   for(let j=0;j<7;j++){
    const q=(j-3)/3,spin=Math.floor(ms/88+j*3);
    draw(g,12+(spin%7),
     x+nx*q*width*.45+ux*(18+6*Math.sin(ms*.006+j))*s,
     crestY+height*(.16+.22*(j%3)/2)+ny*q*width*.26,
     (25+j%3*5)*s,(39+j%3*7)*s,
     {alpha:vanish*(.53+.2*grow),rotation:(j-3)*.13});
   }
  }
  // Wide crash around the opponent, then the sea drains instead of exploding.
  if(t>.59){
   const crash=ease((t-.59)/.12)*(1-ease((t-.87)/.12));
   if(crash>.015){
    for(let j=0;j<7;j++){
     const side=(j-3)*34*s;
     draw(g,5+((Math.floor(ms/78)+j)%5),
      B[0]+nx*side,B[1]+ny*side-(13+j%3*10)*s,
      (68+j%2*21)*s,(78+j%3*18)*s,
      {alpha:crash*(.96-j*.065),flipX:j%2===0});
    }
    draw(g,3,B[0],B[1]+31*s,255*s,67*s,{alpha:crash*.85});
   }
  }
 }
});
