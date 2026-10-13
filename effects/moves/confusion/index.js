// Módulo isolado: Confusion. Não altera golpes vizinhos.
function drawConfusion(g,f,t,now,s){
 const B=f.to,A=f.from,fade=C(Math.min(t*7,(1-t)*5,1)),speed=now*.0055;
 const v=SM(C((t-.04)/.29));
 for(let i=0;i<5;i++){const p=SM(C((t-i*.065)/.46));
  ring(g,M(A[0],B[0],p),M(A[1],B[1],p),(10+i*2)*s,i%2?'#c57dff':'#97a1ff',(1-p*.38)*fade,1.8*s,.55,speed+i*1.3);}
 glow(g,B[0],B[1],(30+v*24)*s,'#ffe7ff','#7934ca',fade*.7);
 for(let j=0;j<4;j++){
  const rad=(17+j*7+Math.sin(speed*2+j)*3)*s;
  ring(g,B[0],B[1],rad,'#f9aaff',fade*(.92-j*.18),2.4*s,.55,speed*(j%2?1:-1)+j);
 }
 for(let j=0;j<15;j++){
  const a=j*TWO/15+speed*(j%2?1:-1),rad=(13+(j%5)*7)*s;
  const x=B[0]+Math.cos(a)*rad,y=B[1]+Math.sin(a)*rad*.63;
  if(j%4===0)star(g,x,y,4*s,'#ffeaff',fade*.83);else dot(g,x,y,2*s,j%2?'#9e7dff':'#ff9eed',fade,.7*s);
  if(j%3===1)stamp(g,'purple'+((j*2+Math.floor(now/75))%32),x,y,13*s,13*s,a,fade*.80);
 }
 if(t>.42){const p=C((t-.42)/.51);ring(g,B[0],B[1],(20+30*p)*s,'#f6d9ff',(1-p)*.7,2*s,.63,speed);}
}

registerMove('confusion',['Confusion','Confusão'],drawConfusion,870);
