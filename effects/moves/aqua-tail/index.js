/* AQUA TAIL V45 — physical sweeping water-tail arc at actual body contact.
 * Original pixel water crests + splash frames, never a remote projectile.
 */
waterSpriteV43.add('caudadeagua',{
 key:'aquaTail',duration:1330,contact:true,contactStyle:'tail',followTarget:true,
 paint(g,f,t,ms,s,K){
  const {draw,ease,clamp}=K,A=f.from,B=f.to,TAU=Math.PI*2;
  const vx=B[0]-A[0],vy=B[1]-A[1],dir=Math.atan2(vy,vx);
  const ax=(f.actor||A)[0],ay=(f.actor||A)[1];
  if(t<.31){
   const c=ease(t/.26)*(1-ease((t-.26)/.05));
   for(let i=0;i<4;i++){
    const angle=ms*.007+i*TAU/4;
    draw(g,14+((Math.floor(ms/106)+i)%4),
     ax+Math.cos(angle)*22*s,ay+Math.sin(angle)*18*s,
     21*s,27*s,{alpha:c*.70,rotation:angle});
   }
  }
  // Tail starts behind actor and sweeps THROUGH target in a tight broad arc.
  if(t>.35&&t<.84){
   const sweep=ease((t-.35)/.28);
   const fade=ease((t-.35)/.05)*(1-ease((t-.72)/.12));
   const centerX=B[0]-Math.cos(dir)*18*s;
   const centerY=B[1]-Math.sin(dir)*18*s;
   const start=-2.1+sweep*2.45;
   for(let i=0;i<13;i++){
    const p=i/12;
    const a=start-p*1.65+dir;
    const radius=(47+18*p)*s;
    // Each curved sprite stamp uses a genuine animated WATER CREST.
    draw(g,(i+Math.floor(ms/87))%5,
     centerX+Math.cos(a)*radius,centerY+Math.sin(a)*radius,
     (40+12*(1-p))*s,(22+5*(1-p))*s,
     {alpha:fade*(.90-.30*p),rotation:a+Math.PI/2});
    if(i%2===0)draw(g,5+((i+Math.floor(ms/94))%5),
     centerX+Math.cos(a)*(radius+8*s),
     centerY+Math.sin(a)*(radius+8*s),
     (26+7*(1-p))*s,31*s,
     {alpha:fade*(.71-.23*p),rotation:a});
   }
  }
  if(t>.48&&t<.82){
   const hit=ease((t-.48)/.11)*(1-ease((t-.70)/.12));
   for(let i=0;i<6;i++){
    const a=dir+i*TAU/6;
    draw(g,7+(i+Math.floor(ms/92))%3,
     B[0]+Math.cos(a)*27*s,B[1]+Math.sin(a)*20*s,
     (34+i%2*7)*s,(42+i%3*5)*s,
     {alpha:hit*(.91-i*.10),rotation:a+.30});
   }
  }
 }
});
