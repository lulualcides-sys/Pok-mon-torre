// Aurora Beam / Raio Aurora — animated aurora ribbons + spectral breakup, distinct from Ice Beam.
function drawAuroraBeam(g,f,t,now,s,low){
 const A=f.from,B=f.to,phase=now*.012,fade=C(Math.min(t*13,(1-t)*10)),head=SM(C((t-.11)/.42)),d=beamAxis(A,B);
 if(t<.28){
  glow(g,A[0],A[1],28*s,'#eafffd','#9d8bff',fade*.52);
  for(let j=0;j<3;j++)ring(g,A[0],A[1],(13+j*6)*s,['#91f9de','#9bc4ff','#eba7fa'][j],fade*.77,1.5*s,.62,phase*.4+j);
 }
 if(t>.10&&t<.88){
  // Four offset ribbons weave around one icy-white filament like the original prismatic ray.
  const colors=['#8ef6de','#83b8fb','#cb9cff','#ffc3eb'];
  for(let band=0;band<4;band++){
   const pts=[],n=low?13:25;
   for(let j=0;j<=n;j++){const u=j/n*head,p=beamTravel(A,B,u);
    const offset=(band-1.5)*3.2*s+Math.sin(u*24-phase+band*.88)*4.8*s;
    pts.push([p[0]+d.nx*offset,p[1]+d.ny*offset]);}
   line(g,pts,colors[band],(band===0?3.4:2.7)*s,fade*.72,3*s);
  }
  const core=beamTrace(A,B,head,phase,1.65*s,22,low);
  beamLayers(g,core,[['#74e4ff',9,.25,3],['#eaffff',3.3,.98,4]],fade,s);
  const count=low?8:15;
  for(let j=0;j<count;j++){
   const q=((j*.181+now*.00047)%1)*head,p=beamTravel(A,B,q),w=Math.sin(q*32+phase+j)*15*s;
   star(g,p[0]+d.nx*w,p[1]+d.ny*w,(1.8+j%3*.6)*s,colors[j%4],fade*.75);
  }
 }
 if(t>.53){
  const q=SM(C((t-.53)/.47));
  glow(g,B[0],B[1],(24+17*q)*s,'#f1ffff','#91bdfa',fade*.64);
  for(let j=0;j<5;j++)ring(g,B[0],B[1],(11+8*j+q*14)*s,['#88ffe1','#abafff','#f3afe8'][j%3],fade*(.73-j*.105),1.5*s,.65,phase*.2+j*.25);
  for(let j=0;j<(low?8:14);j++){
   const a=j*2.399+phase*.27,r=(17+23*q+j%3*4)*s;
   beamShard(g,B[0]+Math.cos(a)*r,B[1]+Math.sin(a)*r*.7,(3+j%3)*s,a,['#c8fcff','#c18efc'],fade*(1-q*.6));
  }
 }
}
registerMove('aurorabeam',['Aurora Beam','Raio Aurora','Raio da Aurora'],drawAuroraBeam,1010);
