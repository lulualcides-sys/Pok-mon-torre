/* Tapa de Lama (Mud-Slap): a sharp flick of mud, then eye-height splash.
   Reference: thrown mud obscures opponent's accuracy. Status logic unchanged. */
window.PokemonTorreGroundV130?.register({
 id:'mudslap',names:['Tapa de Lama'],ms:1130,frames:12,
 draw(g,p){
  const {t,hit,from:A,to:B,scale:s,clamp,ease,mix,crumb,splat,ripple}=p;
  const q=ease((t-.05)/(hit-.05)),tail=1-ease((t-.87)/.13);
  const ax=A[0]+9*s,ay=A[1]-3*s,tx=B[0],ty=B[1]-3*s;
  const vx=tx-ax,vy=ty-ay;
  // Winding mud "slap": a fan of off-axis clods, not a laser stream.
  if(t<hit+.025)for(let i=0;i<9;i++){
    const d=clamp((t-.06-i*.023)/(hit-.06-i*.023));
    if(d<=0||d>=1)continue;
    const lift=-19*Math.sin(d*Math.PI)*s;
    const off=Math.sin(i*2.7+d*9.5)*(4+i%3*3)*s;
    const x=mix(ax,tx,d)+off,y=mix(ay,ty,d)+lift+Math.sin(i*4)*3*s;
    crumb(g,x,y,(2.7+i%4*1.7)*s,i*.61+d*.7,'#986038',tail);
  }
  const head=Math.min(q,.985),hx=mix(ax,tx,head),hy=mix(ay,ty,head)-19*Math.sin(head*Math.PI)*s;
  if(t<hit){splat(g,hx,hy,(6+5*Math.sin(q*Math.PI))*s,.93*tail);}
  else{
   const u=clamp((t-hit)/(1-hit)),fade=1-ease(u);
   // Thick impact blot; fluid lobes and secondary eye-level droplets.
   splat(g,tx,ty,(15+15*ease(u/.48))*s,fade*.94);
   for(let i=0;i<16;i++){
     const theta=i*2.4,spread=(12+39*ease(u))*s,rad=(2.3+i%4*1.25)*s;
     crumb(g,tx+Math.cos(theta)*spread,ty+Math.sin(theta)*spread*.78,
       rad,theta*.25,'#9e633a',fade);
   }
   ripple(g,tx,ty+14*s,(12+27*u)*s,(4+13*u)*s,fade*.57,'#e3be84');
  }
 }
});