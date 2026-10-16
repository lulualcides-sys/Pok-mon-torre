/* Mud Shot: ONE cohesive high-speed mud pellet with streaming grit.
   Unlike Mud-Slap, creates a heavy compact projectile, not a face fan. */
window.PokemonTorreGroundV130?.register({
 id:'mudshot',names:['Mud Shot'],ms:1270,frames:16,
 draw(g,p){
  const {t,hit,from:A,to:B,scale:s,clamp,ease,mix,splat,crumb,ripple}=p;
  const q=ease((t-.055)/(hit-.055)),dx=B[0]-A[0],dy=B[1]-A[1];
  const length=Math.hypot(dx,dy)||1,nx=-dy/length,ny=dx/length;
  const px=mix(A[0],B[0],q),py=mix(A[1],B[1],q)-8*s*Math.sin(q*Math.PI);
  const alpha=1-ease((t-.91)/.09);
  if(t<hit){
   // Coherent dark-edged body, short directional wake with rotating grains.
   for(let k=9;k>=0;k--){
    const back=clamp(q-k*.035);
    const wake=1-k/10,x=mix(A[0],B[0],back),y=mix(A[1],B[1],back)-8*s*Math.sin(back*Math.PI);
    const w=(2.6+7.1*wake)*s;
    splat(g,x,y,w,.20+.52*wake);
   }
   splat(g,px,py,12.5*s,alpha);
   for(let i=0;i<12;i++){
    const phase=t*20+i*2.73,trail=clamp(q-(i%5+1)*.056);
    const bend=Math.sin(phase)*(4+i%3*3)*s;
    crumb(g,mix(A[0],B[0],trail)+nx*bend,
     mix(A[1],B[1],trail)+ny*bend-8*s*Math.sin(trail*Math.PI),
     (2+i%4*1.16)*s,phase*.35,'#b5854e',alpha);
   }
  }else{
   const u=clamp((t-hit)/(1-hit)),fade=1-ease(u);
   splat(g,B[0],B[1],(19+17*ease(u))*s,fade);
   for(let i=0;i<19;i++){
    const a=i*2.399,r=(12+53*ease(u))*s;
    crumb(g,B[0]+Math.cos(a)*r,B[1]+Math.sin(a)*r*.74,
      (2+i%4*1.7)*s,a,'#835431',fade);
   }
   ripple(g,B[0],B[1]+24*s,(17+28*u)*s,(5+10*u)*s,fade,'#e7c18b');
  }
 }
});