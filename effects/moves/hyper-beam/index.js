// Hyper Beam / Hiper Raio — amber-magenta supercharged beam; slim core and explosive impact.
function drawHyperBeam(g,f,t,now,s,low){
 const A=f.from,B=f.to,phase=now*.022,fade=C(Math.min(t*12,(1-t)*12));
 const charge=C(t/.27),release=SM(C((t-.22)/.12)),head=SM(C((t-.25)/.24));
 if(t<.38){
  glow(g,A[0],A[1],(23+19*charge)*s,'#fffbea','#f16c26',(.22+.65*charge)*fade);
  for(let j=0;j<3;j++)ring(g,A[0],A[1],(31-j*7-charge*19)*s,j%2?'#ff73bd':'#ffe57c',fade*(.6+charge*.28),2*s,.76,phase*.18+j);
  for(let j=0;j<(low?7:13);j++){const a=j*TWO/13+phase*.3,r=(33-22*charge+(j%3)*4)*s;
   dot(g,A[0]+Math.cos(a)*r,A[1]+Math.sin(a)*r,(1.8+j%3)*s,j%2?'#ff6fab':'#ffeda4',fade*.85,2*s);}
 }
 if(release>0&&t<.90){
  const base=beamTrace(A,B,head,phase,2.8*s,36,low);
  beamLayers(g,base,[['#7d2159',22,.32,5],['#e3536c',14,.75,4],['#ffb24c',9,.96,5],['#fff4c2',4.3,1,7]],fade*release,s);
  // Two narrow twisting filaments travel WITH the beam, never as a wide rectangle.
  const d=beamAxis(A,B);
  for(let arm=0;arm<2;arm++){const pts=[],num=low?12:22;
   for(let i=0;i<=num;i++){const u=i/num*head,p=beamTravel(A,B,u),w=Math.sin(u*43-phase+arm*Math.PI)*9*s;
    pts.push([p[0]+d.nx*w,p[1]+d.ny*w]);}
   line(g,pts,arm?'#ff88de':'#f9ca6b',1.65*s,fade*.67,2*s);
  }
  for(let j=0;j<(low?8:16);j++){const q=((j*.173+now*.00063)%1)*head,p=beamTravel(A,B,q),angle=q*39-phase+j*2.1;
   const off=Math.sin(angle)*11*s;
   dot(g,p[0]+d.nx*off,p[1]+d.ny*off,(1+j%3)*s,j%3?'#fff1c7':'#f075b9',fade*(.7+.2*release),2*s);
  }
  glow(g,B[0]*head+A[0]*(1-head),B[1]*head+A[1]*(1-head),16*s,'#fffce7','#ff9e6d',fade*.75);
 }
 if(t>.67){
  const q=SM(C((t-.67)/.33));
  beamBurst(g,B[0],B[1],q,s,'#fff0ae','#df4c96',low?9:16);
  for(let j=0;j<(low?6:11);j++){const a=j*2.4+phase*.2,r=(13+40*q)*s;
   star(g,B[0]+Math.cos(a)*r,B[1]+Math.sin(a)*r*.77,(2.3+j%2)*s,j%2?'#fff7dd':'#ff94ba',(1-q)*fade);
  }
 }
}
registerMove('hyperbeam',['Hyper Beam','Hiper Raio'],drawHyperBeam,1230);
