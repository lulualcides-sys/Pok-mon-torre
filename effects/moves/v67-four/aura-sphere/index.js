/* V67 Aura Sphere: charging spherical aura, moving orb with spiraling shell, true collision bloom. */
(()=>{
 const {C,E,MIX,poly,stroke,oval,sparkle,swirl,fragments,seed,TAU}=fidelityFourV67.art;
 fidelityFourV67.register(['catalog_aurasphere'],'Aura Sphere',(g,f)=>{
  const {t,scale:s,from:src,to:dst,at,low}=f,charge=E(t/.26),flight=E((t-.25)/.51),impact=E((t-.72)/.23);
  const fade=C((1-t)*8),center=at(flight,Math.sin(t*21)*(1-impact)*8),
    x=center[0],y=center[1],r=(10+10*charge+2*Math.sin(t*TAU*4))*s;
  // Charge filaments curl into a compact blue aura sphere.
  for(let j=0;j<8;j++){
    const a=j*TAU/8+t*12,rr=(28-charge*12+Math.sin(t*8+j)*4)*s;
    const x0=src[0]+Math.cos(a)*rr,y0=src[1]+Math.sin(a)*rr;
    stroke(g,[[x0,y0],[src[0]+Math.cos(a+.6)*rr*.50,src[1]+Math.sin(a+.6)*rr*.50],
    [src[0],src[1]]],j%2?'#1272ed':'#40b9ff',2.8*s,(1-flight)*charge*.7,1);
  }
  const trailN=low?7:14;
  for(let j=trailN;j>=1;j--){
    const u=C(flight-j*.035),p=at(u,Math.sin(t*20-j*.7)*5*(1-impact));
    const alpha=flight*(1-j/(trailN+1))*(1-impact)*fade;
    oval(g,p[0],p[1],(r*(.75-j*.04))*.7,r*(.6-j*.026),'#135eaf',alpha,'#071329',1.5);
    if(j%3===0)sparkle(g,p[0],p[1],3*s,'#9dedff',alpha);
  }
  if(t<.93){
    g.save();g.globalAlpha*=fade*(1-impact*.25);
    // uneven dark rim rather than one flat gradient circle
    oval(g,x,y,r*1.13,r*1.12,'#052e78',1,'#020d23',4.2*s);
    oval(g,x,y,r*.88,r*.89,'#1269c9',1,'#053a88',2*s);
    oval(g,x-2.8*s,y-3*s,r*.62,r*.64,'#58c9ff',1,'#12559f',1*s);
    oval(g,x-4.5*s,y-4*s,r*.34,r*.33,'#e6ffff',1,'#68dafa',.7*s);
    swirl(g,x,y,r*1.47,t*23,['#2a9afa','#b7eeff','#2677e2'],1-impact*.3);
    for(let j=0;j<7;j++) {
      const a=j*TAU/7+t*27,r2=r*(1.2+.12*Math.sin(j*3+t*10));
      sparkle(g,x+Math.cos(a)*r2,y+Math.sin(a)*r2,2.6*s,'#8addff',.6);
    }
    g.restore();
  }
  if(t>.66){
   let p=dst,q=impact;for(let j=0;j<3;j++){
    const rr=(8+q*(41+j*16))*s;
    const pts=[];for(let i=0;i<=34;i++){
      const a=i*TAU/34,rd=rr*(1+.11*Math.sin(i*2.7+j));
      pts.push([p[0]+Math.cos(a)*rd,p[1]+Math.sin(a)*rd*.82]);}
    stroke(g,pts,['#c4ffff','#247ee3','#65d4ff'][j],(4-j)*s,(1-q)*.78+.12,2*s);
   }
   fragments(g,p[0],p[1],q,low?13:27,['#9deaff','#327bd3','#e2ffff'],69*s);
  }
 });
})();