// Psíquico — versão V35.82: carga, projétil helicoidal e impacto radial.
// Isolado: nenhuma alteração no comportamento dos demais golpes.
function drawPsychic(g,f,t,now,s,low){
 const A=f.from,B=f.to,beat=now*.009,alpha=C(Math.min(t*9,(1-t)*10));
 const travel=SM(C((t-.13)/.61)),x=M(A[0],B[0],travel),y=M(A[1],B[1],travel);
 const charging=C((.27-t)/.25),impact=SM(C((t-.70)/.29));
 if(charging>0){
  glow(g,A[0],A[1],42*s,'#fff4ff','#8c2be3',charging*.74);
  for(let j=0;j<3;j++)ring(g,A[0],A[1],(9+16*(1-charging)+j*7)*s,j%2?'#c94fff':'#f7c8ff',charging*.76,2*s,.52,beat*(j%2?1:-1));
  for(let j=0;j<8;j++){const a=j*TWO/8+beat,rr=(16+11*(1-charging))*s;star(g,A[0]+Math.cos(a)*rr,A[1]+Math.sin(a)*rr*.67,2.2*s,'#ebb8ff',alpha*charging);}
 }
 if(t<.82){
  const n=low?9:16;
  for(let ribbon=0;ribbon<3;ribbon++){
   const pts=[];
   for(let j=0;j<=n;j++){
    const q=C(travel-j/(n*2.9)),phase=q*23-beat*1.2+ribbon*TWO/3;
    pts.push([M(A[0],B[0],q)+Math.cos(phase)*9*s*(.35+q),M(A[1],B[1],q)+Math.sin(phase)*9*s*(.35+q)]);
   }
   line(g,pts,ribbon===0?'#e4a4ff':ribbon===1?'#8c6aff':'#fa69da',(ribbon===0?2.4:1.5)*s,alpha*.55,3*s);
  }
  glow(g,x,y,34*s,'#fff6ff','#8d27ef',alpha*.90);
  ring(g,x,y,19*s,'#ff9eef',alpha,2.5*s,.66,beat);
  ring(g,x,y,15*s,'#b0a1ff',alpha,2*s,.76,-beat*.76);
  dot(g,x,y,10*s,'#a947ff',alpha,5*s);
  dot(g,x,y,5.5*s,'#fff3ff',alpha,7*s);
  stamp(g,'purple'+(Math.floor(now/75)%32),x,y,21*s,21*s,beat,alpha*.90);
  for(let j=0;j<(low?7:11);j++){
   const a=j*2.399+beat*1.3,rr=(15+(j%3)*6)*s;
   dot(g,x+Math.cos(a)*rr,y+Math.sin(a)*rr,(1.2+j%2)*s,j%2?'#e9b6ff':'#ffffff',alpha*.9,3*s);
  }
 }
 if(impact>0){
  const fade=1-impact,tx=B[0],ty=B[1];
  glow(g,tx,ty,(25+33*impact)*s,'#fff9ff','#a231ee',fade*.92);
  for(let j=0;j<3;j++)ring(g,tx,ty,(10+impact*(25+j*17))*s,j%2?'#fd79f6':'#e7c6ff',fade*(.95-j*.17),2.4*s,.66,beat*.4+j);
  for(let j=0;j<14;j++){const a=j*TWO/14,rr=(12+43*impact)*s;
   line(g,[[tx+Math.cos(a)*rr*.4,ty+Math.sin(a)*rr*.4],[tx+Math.cos(a)*rr,ty+Math.sin(a)*rr]],j%2?'#f7a3ff':'#ffffff',(j%2?1.6:2.6)*s,fade*.82,2*s);
   if(j%3===0)star(g,tx+Math.cos(a)*rr,ty+Math.sin(a)*rr,3*s,'#fff1ff',fade);
  }
 }
}
registerMove('psychic',['Psíquico','Psychic'],drawPsychic,1050);
