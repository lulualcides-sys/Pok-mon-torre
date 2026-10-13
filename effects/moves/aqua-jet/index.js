/* AQUA JET V45 — real body-contact, fast original-water sprite dash.
 * Rendering is independent from every previously approved water/fire move.
 */
waterSpriteV43.add('aquajet',{
 key:'aquaJet',duration:1120,contact:true,contactStyle:'surge',followTarget:true,
 paint(g,f,t,ms,s,K){
  const {draw,ease,lerp,clamp}=K,A=f.from,B=f.to;
  const dx=B[0]-A[0],dy=B[1]-A[1],len=Math.hypot(dx,dy)||1;
  const ux=dx/len,uy=dy/len,nx=-uy,ny=ux,angle=Math.atan2(dy,dx);
  const actor=f.actor||A;
  // Charge: the authentic blue splash wraps around the attacking Pokemon.
  if(t<.28){
   const c=ease(t/.20)*(1-ease((t-.23)/.05));
   for(let j=0;j<4;j++){
    const a=ms*.006+j*Math.PI/2;
    draw(g,13+((j+Math.floor(ms/93))%5),
     A[0]+Math.cos(a)*19*s,A[1]+Math.sin(a)*17*s,
     22*s,26*s,{alpha:c*.78,rotation:a});
   }
  }
  // Body dash: the actual Pokemon moves in the battle bridge.
  if(t>.18&&t<.81){
   const fade=ease((t-.18)/.08)*(1-ease((t-.72)/.09));
   for(let j=0;j<7;j++){
    const behind=(13+j*15)*s;
    const side=Math.sin(ms*.014-j*.84)*(5+j*1.3)*s;
    draw(g,5+((j+Math.floor(ms/73))%5),
     actor[0]-ux*behind+nx*side,actor[1]-uy*behind+ny*side,
     (30-j*1.8)*s,(36-j*2.1)*s,
     {alpha:fade*(.85-j*.095),rotation:angle+.65});
   }
   // Tight coat of moving water on the attacking Pokemon, not a projectile.
   draw(g,7,actor[0]+ux*7*s,actor[1]+uy*7*s,56*s,53*s,
    {alpha:fade*.73,rotation:angle+.25});
  }
  // Only one sharp contact splash.
  if(t>.43&&t<.72){
   const hit=ease((t-.43)/.09)*(1-ease((t-.61)/.11));
   for(let j=0;j<5;j++){
    const a=(-.8+j*.40)+angle;
    draw(g,6+((j+Math.floor(ms/80))%4),
     B[0]+Math.cos(a)*21*s,B[1]+Math.sin(a)*19*s,
     (33+j%2*9)*s,(36+j%3*6)*s,
     {rotation:a,alpha:hit*(.94-j*.11)});
   }
  }
 }
});
