// Módulo isolado: Psíquico. Não altera golpes vizinhos.
function drawPsychic(g,f,t,now,s){
 const A=f.from,B=f.to,u=SM(C((t-.06)/.68));const x=M(A[0],B[0],u),y=M(A[1],B[1],u);
 const fade=C(Math.min(t*9,(1-t)*6,1)),hit=C((t-.67)/.26),r=(13+8*Math.sin(t*10))*s;
 glow(g,x,y,r*3.2,'#fffbff','#a93bfa',fade*.88);dot(g,x,y,r,'#c655ff',fade,.0);dot(g,x,y,r*.54,'#ffdeff',fade,4);
 stamp(g,'purple'+(Math.floor(now/70)%32),x,y,24*s,24*s,t*8,fade*.90);
 for(let i=0;i<4;i++){
  const q=C((t-i*.055)/.70),ox=M(A[0],B[0],SM(q)),oy=M(A[1],B[1],SM(q));
  ring(g,ox,oy,(11+i*3)*s,'#e8a9ff',fade*(.70-i*.11),1.5*s,.46,now*.004+i*.9);
 }
 for(let j=0;j<12;j++){
  const th=j*TWO/12+now*.009,rr=(19+j%3*7)*s;
  dot(g,x+Math.cos(th)*rr,y+Math.sin(th)*rr*.7,(1.5+j%3)*s,j%3?'#fa85f5':'#ffffff',fade*.86,2*s);
  if(j%2===0)stamp(g,'purple'+((j*4+Math.floor(now/65))%32),x+Math.cos(th)*rr,y+Math.sin(th)*rr*.7,11*s,11*s,th,fade*.73);
 }
 if(hit>0){glow(g,B[0],B[1],(28+hit*25)*s,'#ffebff','#8e39ef',(1-hit)*.8);
  for(let j=0;j<3;j++)ring(g,B[0],B[1],(13+hit*(24+j*14))*s,'#efadff',(1-hit)*(.9-j*.20),2*s,.6,now*.002+j);
  for(let j=0;j<7;j++){const a=j*TWO/7;star(g,B[0]+Math.cos(a)*(14+hit*42)*s,B[1]+Math.sin(a)*(10+hit*34)*s,3.2*s,'#f8d9ff',fade*(1-hit));}}
}

registerMove('psychic',['Psíquico','Psychic'],drawPsychic,960);
