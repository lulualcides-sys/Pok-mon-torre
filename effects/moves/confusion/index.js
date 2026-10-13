// Confusion — versão V35.82: ondas de confusão e vórtice que envolve o alvo.
function drawConfusion(g,f,t,now,s,low){
 const A=f.from,B=f.to,fade=C(Math.min(t*9,(1-t)*8)),beat=now*.006;
 const travel=SM(C(t/.35)),phase=C((t-.16)/.64);
 // Anéis mentais atravessam a arena, sem simular um ataque de fogo ou esfera pesada.
 for(let j=0;j<5;j++){
  const q=SM(C((t-j*.065)/.40)),x=M(A[0],B[0],q),y=M(A[1],B[1],q);
  ring(g,x,y,(8+j*3+Math.sin(beat+j)*2)*s,j%2?'#7dc6ff':'#e69fff',fade*(1-q*.36),2*s,.50,beat*1.3+j);
  if(j%2===0)stamp(g,'purple'+((j*5+Math.floor(now/80))%32),x,y,13*s,13*s,beat,fade*.55);
 }
 glow(g,B[0],B[1],(28+13*travel)*s,'#ffe2ff','#663bc9',fade*.54);
 // Espirais opostas giram na cabeça do alvo: curvas contínuas desenhadas a cada frame.
 for(let arm=0;arm<3;arm++){
  const pts=[],count=low?12:25;
  for(let i=0;i<=count;i++){
   const q=i/count,a=q*TWO*1.7+beat*(arm===1?-1:1)+arm*TWO/3;
   const r=(5+q*(21+12*phase))*s;
   pts.push([B[0]+Math.cos(a)*r,B[1]+Math.sin(a)*r*.66]);
  }
  line(g,pts,arm===0?'#fa9bff':arm===1?'#81c6ff':'#b08bff',2.3*s,fade*(.85-arm*.13),3*s);
 }
 for(let j=0;j<3;j++)ring(g,B[0],B[1],(17+j*11+Math.sin(beat*1.7+j)*4)*s,
 j%2?'#9d99ff':'#ffc4fc',fade*(.82-j*.17),1.8*s,.43,beat*(j%2?-.8:1)+j);
 const n=low?10:18;
 for(let j=0;j<n;j++){
  const a=j*2.399+beat*(j%2?1:-1),r=(16+(j%5)*7)*s;
  const x=B[0]+Math.cos(a)*r,y=B[1]+Math.sin(a)*r*.7;
  if(j%5===0)star(g,x,y,3.5*s,'#fbeaff',fade);
  else dot(g,x,y,(1.3+j%3)*s,j%3?'#d68bff':'#9fdfff',fade*.76,1.7*s);
 }
 if(t>.67){const z=SM(C((t-.67)/.33));ring(g,B[0],B[1],(19+46*z)*s,'#faf0ff',fade*(1-z),2.4*s,.55,-beat);}
}
registerMove('confusion',['Confusion','Confusão'],drawConfusion,960);
