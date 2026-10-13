/* HYDRO PUMP V44.1 — a SINGLE uninterrupted high-pressure water cannon.
 * The central stream is a crisp pixel-art sprite, NOT disconnected water
 * circles. Splash animations come from the user's actual original water sheet.
 */
const hydroJetV441=new Image();
hydroJetV441.decoding='async';
hydroJetV441.src='effects/moves/hydro-pump/jet.svg?v=44.1';
waterSpriteV43.add('hydropump',{
 key:'hydroPump',duration:1610,beam:true,contact:false,pressureStream:true,
 paint(g,f,t,ms,s,K){
  const {draw,ease,lerp,clamp}=K,A=f.from,B=f.to;
  const dx=B[0]-A[0],dy=B[1]-A[1],dist=Math.hypot(dx,dy)||1;
  const ux=dx/dist,uy=dy/dist,nx=-uy,ny=ux;
  const angle=Math.atan2(dy,dx),head=ease((t-.10)/.38);
  const fade=1-ease((t-.86)/.13);
  // Pressure gathers at the attacker's muzzle.
  if(t<.25){
   const warm=ease(t/.15)*(1-ease((t-.19)/.06));
   draw(g,7,A[0]+ux*16*s,A[1]+uy*16*s,
        (31+17*warm)*s,(36+12*warm)*s,
        {alpha:warm*.88,rotation:angle+.7});
  }
  if(t>.10&&t<.97&&hydroJetV441.naturalWidth){
   const offset=24*s,total=Math.max(1,dist-offset);
   const reach=total*head;
   const width=(49+5*Math.sin(ms*.016))*s;
   const waterA=[A[0]+ux*offset,A[1]+uy*offset];
   g.save();
   g.translate(waterA[0],waterA[1]);
   g.rotate(angle);
   g.imageSmoothingEnabled=false;
   g.globalAlpha=fade*.98;
   // Crop the sprite in sync with travel, so the tip actually advances.
   g.drawImage(hydroJetV441,0,0,Math.max(1,160*head),58,
     0,-width*.5,Math.max(1,reach),width);
   g.restore();
   // Tiny original-source droplets run in the SAME direction as the flow.
   for(let j=0;j<5;j++){
    const u=((ms*.00077+j*.20)%1)*head;
    const x=waterA[0]+ux*total*u,y=waterA[1]+uy*total*u;
    const side=(j%2?1:-1)*(22+5*Math.sin(ms*.012+j))*s;
    draw(g,13+((Math.floor(ms/103)+j)%5),
      x+nx*side,y+ny*side,
      (16+j%2*4)*s,(23+j%2*5)*s,
      {alpha:fade*.57,rotation:angle});
   }
   draw(g,6,waterA[0],waterA[1],
     43*s,43*s,{alpha:fade*.76,rotation:angle});
  }
  // Impact spreads around the TARGET, not all across the screen.
  if(t>.46){
   const impact=ease((t-.46)/.14)*(1-ease((t-.88)/.12));
   if(impact>.012){
    draw(g,7,B[0],B[1]-16*s,112*s,112*s,
      {alpha:impact*.97,rotation:angle+.75});
    for(let j=0;j<5;j++){
     const across=(j-2)*21*s;
     draw(g,5+((Math.floor(ms/92)+j)%5),
       B[0]+nx*across+ux*(j%2*7)*s,
       B[1]+ny*across-(18+(j%2)*12)*s,
       (43+j%2*11)*s,(49+j%3*9)*s,
       {alpha:impact*(.84-j*.10),flipX:j%2===1});
    }
   }
  }
 }
});
