/* WATER GUN / JATO D'AGUA V45 — small, continuous water stream.
 * One slim original-style sprite, clearly weaker than the approved twin
 * Hydro Pump. Entirely separate VFX and no new Canvas/CSS beams.
 */
const waterGunJetV45=new Image();
waterGunJetV45.decoding='async';
waterGunJetV45.src='effects/moves/hydro-pump/jet.svg?v=water-gun-45';
waterSpriteV43.add('jatodagua',{
 key:'waterGun',duration:1060,contact:false,stream:true,followTarget:true,
 paint(g,f,t,ms,s,K){
  const {draw,ease,lerp,clamp}=K,A=f.from,B=f.to;
  const dx=B[0]-A[0],dy=B[1]-A[1],len=Math.hypot(dx,dy)||1;
  const ux=dx/len,uy=dy/len,nx=-uy,ny=ux,angle=Math.atan2(dy,dx);
  const head=ease((t-.08)/.46);
  const fade=1-ease((t-.86)/.14);
  if(t<.24){
   const c=ease(t/.13)*(1-ease((t-.18)/.06));
   draw(g,7,A[0]+ux*15*s,A[1]+uy*15*s,27*s,25*s,
    {alpha:c*.85,rotation:angle});
  }
  if(t>.08&&t<.97&&waterGunJetV45.naturalWidth){
   const start=18*s,distance=Math.max(1,len-start);
   const width=(13+1.7*Math.sin(ms*.012))*s;
   g.save();
   g.translate(A[0]+ux*start,A[1]+uy*start);
   g.rotate(angle);
   g.imageSmoothingEnabled=false;
   g.globalAlpha=fade*.94;
   // A single thin animated strip with a moving tip.
   g.drawImage(waterGunJetV45,0,0,Math.max(1,160*head),58,
     0,-width*.5,Math.max(1,distance*head),width);
   g.restore();
   for(let i=0;i<4;i++){
    const u=((ms*.00115+i*.25)%1)*head;
    const side=Math.sin(ms*.015+i*2.1)*(8+i)*s;
    draw(g,14+((Math.floor(ms/86)+i)%4),
     lerp(A[0],B[0],u)+nx*side,lerp(A[1],B[1],u)+ny*side,
     (10+i%2*4)*s,(13+i%2*3)*s,
     {alpha:fade*(.50-i*.065),rotation:angle});
   }
  }
  if(t>.57){
   const hit=ease((t-.57)/.09)*(1-ease((t-.86)/.12));
   draw(g,7,B[0],B[1]-7*s,41*s,47*s,{alpha:hit*.88,rotation:angle});
   for(let i=0;i<4;i++){
    const a=i*Math.PI/2+ms*.003;
    draw(g,5+((i+Math.floor(ms/96))%4),
     B[0]+Math.cos(a)*17*s,B[1]+Math.sin(a)*16*s,
     20*s,25*s,{alpha:hit*.62,rotation:a});
   }
  }
 }
});
