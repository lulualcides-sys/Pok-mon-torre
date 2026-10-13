// Solar Beam / Raio Solar — gathers sunlight, then fires a green-gold continuous beam.
function drawSolarBeam(g,f,t,now,s,low){
 const A=f.from,B=f.to,phase=now*.014,fade=C(Math.min(t*11,(1-t)*11)),charge=SM(C(t/.30));
 const head=SM(C((t-.29)/.25)),release=C((t-.28)/.08),d=beamAxis(A,B);
 if(t<.42){
  glow(g,A[0],A[1],(27+21*charge)*s,'#fffbdc','#b7dc47',fade*.8);
  for(let j=0;j<3;j++)ring(g,A[0],A[1],(37-j*9-charge*18)*s,j%2?'#b8ff87':'#ffe489',fade*.79,2.2*s,.68,phase*.15);
  for(let j=0;j<(low?8:16);j++){const a=j*TWO/16+phase*.15,r=(33-23*charge)*s;
   line(g,[[A[0]+Math.cos(a)*r,A[1]+Math.sin(a)*r],[A[0]+Math.cos(a)*(r+7*s),A[1]+Math.sin(a)*(r+7*s)]],
      j%2?'#fff3a1':'#b3f56d',2*s,fade*.8,3*s);}
 }
 if(release>0&&t<.92){
  const pts=beamTrace(A,B,head,phase,2.6*s,32,low);
  beamLayers(g,pts,[['#287747',22,.26,4],['#6fc357',13,.70,4],['#c2ed7d',8.4,.93,5],['#fff5b3',3.7,.99,8]],fade*release,s);
  for(let arm=0;arm<2;arm++){const trail=[],n=low?13:24;
   for(let j=0;j<=n;j++){const u=j/n*head,p=beamTravel(A,B,u),w=Math.sin(u*33-phase+arm*Math.PI)*10*s;
    trail.push([p[0]+d.nx*w,p[1]+d.ny*w]);}
   line(g,trail,arm?'#d9ff88':'#fbe989',1.7*s,fade*.75,2*s);
  }
  for(let j=0;j<(low?7:14);j++){
   const q=((j*.147+now*.00054)%1)*head,p=beamTravel(A,B,q),w=Math.sin(q*33-phase+j)*16*s;
   const x=p[0]+d.nx*w,y=p[1]+d.ny*w;
   if(j%3===0)stamp(g,'leaf'+(j%4),x,y,(12+j%3*3)*s,(11+j%3*2)*s,d.angle+j*.6,fade*.73);
   else dot(g,x,y,(1.7+j%3)*s,j%2?'#fff7b9':'#b8ff7b',fade*.82,2*s);
  }
 }
 if(t>.69){
  const hit=SM(C((t-.69)/.31));
  beamBurst(g,B[0],B[1],hit,s,'#fbffd3','#7acb55',low?8:14);
  for(let j=0;j<(low?6:12);j++){
   const a=j*TWO/12+phase*.14,r=(13+43*hit)*s;
   stamp(g,'leaf'+(j%4),B[0]+Math.cos(a)*r,B[1]+Math.sin(a)*r*.74,(13+j%3*3)*s,(10+j%3*3)*s,a,fade*(1-hit*.62));
  }
 }
}
registerMove('solarbeam',['Solar Beam','Raio Solar'],drawSolarBeam,1370);
