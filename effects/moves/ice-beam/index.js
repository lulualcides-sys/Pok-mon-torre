// Ice Beam / Raio de Gelo — sharply focused cyan bolt, animated crystalline forks and ice eruption.
function drawIceBeam(g,f,t,now,s,low){
 const A=f.from,B=f.to,phase=now*.020,fade=C(Math.min(t*12,(1-t)*10)),d=beamAxis(A,B);
 const head=SM(C((t-.17)/.37)),charge=C(t/.23);
 if(t<.35){
  glow(g,A[0],A[1],29*s,'#f5feff','#5fccef',fade*.7);
  for(let j=0;j<6;j++){const a=j*TWO/6+phase*.25,r=(23-15*charge)*s;
   beamShard(g,A[0]+Math.cos(a)*r,A[1]+Math.sin(a)*r,(4+j%3)*s,a,['#cdf7ff','#69dfff'],fade*.87);}
 }
 if(t>.15&&t<.89){
  const pts=beamTrace(A,B,head,phase,2.0*s,27,low);
  beamLayers(g,pts,[['#27609f',16,.29,5],['#5bbde8',10,.80,5],['#c1f4ff',5.5,.96,4],['#ffffff',2.4,1,6]],fade,s);
  // Lightning-like ice fissures grow sideways from the traveling core.
  for(let j=0;j<(low?5:9);j++){
   const u=(.10+j*.103)*head,p=beamTravel(A,B,u),side=j%2?-1:1;
   const height=(10+(j%3)*5)*s;
   const pts2=[p,[p[0]+d.nx*side*height*.53-4*s,p[1]+d.ny*side*height*.53],[p[0]+d.nx*side*height+2*s,p[1]+d.ny*side*height]];
   line(g,pts2,j%2?'#a2edff':'#e6fcff',1.9*s,fade*(.67+head*.20),2*s);
   if(j%2===0)beamShard(g,pts2[2][0],pts2[2][1],3.5*s,phase*.2+j,['#c4f5ff','#70b4f7'],fade*.65);
  }
  const tip=beamTravel(A,B,head);
  glow(g,tip[0],tip[1],12*s,'#fff','#87e4ff',fade*.75);
 }
 if(t>.52){
  const grow=SM(C((t-.52)/.29)),melt=C((t-.81)/.19),a=fade*(1-melt*.7);
  glow(g,B[0],B[1],(24+27*grow)*s,'#e6fcff','#63b9fa',a*.70);
  for(let j=0;j<(low?7:12);j++){
   const th=j*TWO/12+Math.PI/12,len=(14+28*grow+(j%3)*6)*s;
   const x=B[0]+Math.cos(th)*len*.56,y=B[1]+Math.sin(th)*len*.50;
   beamShard(g,x,y,(6+19*grow+(j%4)*3)*s,th+Math.PI/2,
      [j%2?'#9bdfff':'#d6f9ff','#68bde9'],a*(.9-j*.025));
  }
  for(let j=0;j<3;j++)ring(g,B[0],B[1],(11+grow*(21+j*12))*s,'#d5fbff',a*(.7-j*.17),1.8*s,.72);
 }
}
registerMove('icebeam',['Ice Beam','Raio de Gelo'],drawIceBeam,1130);
