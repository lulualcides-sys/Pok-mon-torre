/* Bicada (Peck): near-target short pointed beak-strike; visual contact.
 * No giant projectile or borrowed Air Slash. No teleport or gameplay movement.
 */
window.PokemonTorreFlyingV135?.register({
 name:'Bicada',aliases:['Peck'],frames:12,ms:1150,
 draw(g,p){
  const {t,hit,from:A,to:B,scale:s,clamp,ease,mix,path,feather,mote,detailStep}=p;
  const dx=B[0]-A[0],dy=B[1]-A[1],L=Math.hypot(dx,dy)||1;
  const ux=dx/L,uy=dy/L,nx=-uy,ny=ux,advance=ease((t-.10)/(hit-.10));
  const alpha=ease(t/.1)*(1-ease((t-.81)/.19));
  // Beak-shaped sharp compact wedge appears near target only after approach.
  const vx=mix(A[0]+ux*23*s,B[0]-ux*13*s,advance),
        vy=mix(A[1]+uy*23*s,B[1]-uy*13*s,advance);
  const size=(15+4*Math.sin(Math.PI*advance))*s;
  if(t<hit+.055){
   const tip=[vx+ux*size*1.25,vy+uy*size*1.25];
   const body=[vx-ux*size*.60,vy-uy*size*.60];
   const points=[
    tip,
    [body[0]+nx*size*.62,body[1]+ny*size*.62],
    [vx-ux*size*.08,vy-uy*size*.08],
    [body[0]-nx*size*.52,body[1]-ny*size*.52]
   ];
   g.save();g.globalAlpha*=alpha;
   g.beginPath();for(let i=0;i<points.length;i++){
    const z=points[i];if(i)g.lineTo(z[0],z[1]);else g.moveTo(z[0],z[1]);
   }g.closePath();
   g.fillStyle='#c8d7df';g.strokeStyle='#1c3144';g.lineWidth=2.6*s;g.fill();g.stroke();
   path(g,[[body[0]+nx*size*.27,body[1]+ny*size*.27],tip],
     '#efffff',1.5*s,alpha);
   // Tight contact speed lines, not long-range lightning or beam.
   for(let k=-1;k<=1;k++){
    const off=k*11*s;
    path(g,[[vx-ux*30*s+nx*off,vy-uy*30*s+ny*off],
      [vx-ux*12*s+nx*off,vy-uy*12*s+ny*off]],
      '#a5cddb',1.8*s,alpha*.71);
   }g.restore();
  }
  if(t>=hit){
   const u=clamp((t-hit)/(1-hit)),fade=1-ease(u);
   // Very small physical puncture compression and falling feather shreds.
   for(let i=0;i<3;i++){
    const ang=i*Math.PI*2/3;
    path(g,[[B[0]+Math.cos(ang)*5*s,B[1]+Math.sin(ang)*5*s],
      [B[0]+Math.cos(ang)*(13+17*u)*s,
       B[1]+Math.sin(ang)*(13+17*u)*s]],
       '#d2ecf2',1.8*s,fade);
   }
   for(let i=0;i<8;i+=detailStep){
    const a=i*2.399,rr=(6+24*ease(u))*s;
    const x=B[0]+Math.cos(a)*rr,y=B[1]+Math.sin(a)*rr*.67;
    if(i%3===0)feather(g,x,y,(4+i%3*1.3)*s,a,fade*.7);
    else mote(g,x,y,(.8+i%3*.5)*s,fade*.8,'#a4d2e3');
   }
  }
 }
});