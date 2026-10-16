/* Lança de Areia: one high-speed sharpened lance of densely bound sand.
 * Point-first, tapering body, streaming granular wake, brittle fracture at impact.
 */
window.PokemonTorreGroundV133?.register({
 name:'Lança de Areia',aliases:[],ms:1630,frames:16,
 draw(g,p){
  const {t,hit,from:A,to:B,scale:s,clamp,ease,mix,poly,grain,shard,detailStep=1}=p;
  const dx=B[0]-A[0],dy=B[1]-A[1],length=Math.hypot(dx,dy)||1,
    ux=dx/length,uy=dy/length,nx=-uy,ny=ux;
  const progress=ease((t-.10)/(hit-.10)),live=ease(t/.12)*(1-ease((t-.83)/.17));
  // Power gathers as layered striations, then consolidates into a sharp point.
  for(let j=0;j<14;j+=detailStep){
   const v=(j*.173+t*.26)%1;
   grain(g,A[0]+ux*(9+24*v)*s+nx*Math.sin(j*1.7+t*13)*10*s,
    A[1]+uy*(9+24*v)*s+ny*Math.sin(j*1.7+t*13)*10*s,
    (1+j%4*.55)*s,live*(1-progress*.72),j%2?'#846b51':'#c4a786');
  }
  if(t<hit){
   const lengthSpear=(27+35*ease(progress/.7))*s;
   const fx=mix(A[0]+ux*10*s,B[0],progress),fy=mix(A[1]+uy*10*s,B[1],progress);
   const baseX=fx-ux*lengthSpear,baseY=fy-uy*lengthSpear;
   g.save();g.globalAlpha*=live;
   // Aggressively pointed silhouette, split into dark crust and pale grains.
   poly(g,[[fx,fy],[baseX+nx*8*s,baseY+ny*8*s],
     [baseX-ux*8*s+nx*5*s,baseY-uy*8*s+ny*5*s],
     [baseX-ux*11*s-nx*5*s,baseY-uy*11*s-ny*5*s],
     [baseX-nx*8*s,baseY-ny*8*s]],
     '#9e8465','#211b16',2.6*s);
   poly(g,[[fx,fy],[baseX+nx*7*s,baseY+ny*7*s],
     [baseX-ux*9*s,baseY-uy*9*s]],'#dbc4a0',null);
   // Mineral ribs along the length instead of a solid smooth cartoon dart.
   for(let j=0;j<5;j++){
    const u=j/5+.1,x=mix(fx,baseX,u),y=mix(fy,baseY,u);
    g.beginPath();g.moveTo(x+nx*7*s,y+ny*7*s);
    g.lineTo(x-nx*4.5*s-ux*4*s,y-ny*4.5*s-uy*4*s);
    g.lineWidth=1.25*s;g.strokeStyle='#4d3b2b';g.stroke();
   }
   g.restore();
   // Loose sand grains leave the point's tail, not a magic flame trail.
   for(let j=0;j<18;j+=detailStep){
    const behind=clamp(progress-(j+1)*.035);
    if(behind<=0)continue;
    const x=mix(A[0]+ux*12*s,B[0],behind),
      y=mix(A[1]+uy*12*s,B[1],behind),
      side=Math.sin(j*2.1+t*17)*(4+j%3*2.4)*s;
    grain(g,x+nx*side,y+ny*side,
      (1+j%3*.45)*s,live*(.53-.02*j),j%2?'#bda07b':'#715840');
   }
  }else{
   const u=clamp((t-hit)/(1-hit)),alpha=1-ease(u);
   // The spear shatters on a single synchronized contact.
   for(let i=0;i<23;i+=detailStep){
    const theta=i*2.399,rr=(6+50*ease(u))*(.73+i%5*.08)*s;
    const x=B[0]+Math.cos(theta)*rr,y=B[1]+Math.sin(theta)*rr*.76;
    if(i%3===0)shard(g,x,y,(2+i%4*.9)*s,theta,alpha,'#887155');
    else grain(g,x,y,(1.1+i%4*.55)*s,alpha*.81,i%2?'#c5af8d':'#725944');
   }
  }
 }
});