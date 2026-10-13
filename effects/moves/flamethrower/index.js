// Módulo isolado: Lança-Chamas. Não altera golpes vizinhos.
function drawFlame(g,f,t,now,s,low){
 const A=f.from,B=f.to,fade=C(Math.min(t*10,(1-t)*9,1)),reach=SM(C(t/.35)),dx=B[0]-A[0],dy=B[1]-A[1],len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
 for(let layer=0;layer<3;layer++){
  const color=['#d83f1e','#ff851d','#ffe48d'][layer];
  const steps=low?12:19;for(let j=0;j<steps;j++){
   const q=j/(steps-1)*reach,noise=Math.sin(q*19-now*.023+j*1.7),wide=(13+Math.sin(q*6)*8)*(1-q*.40)*s;
   const x=A[0]+dx*q+nx*noise*wide*.18,y=A[1]+dy*q+ny*noise*wide*.18;
   const upper=wide*(1-layer*.30),pts=[[x-nx*upper,y-ny*upper],[x+nx*upper,y+ny*upper]];
   line(g,pts,color,(layer===0?13:layer===1?9:4.3)*s,fade,layer===0?4*s:0);
   dot(g,x,y,(layer===0?10:layer===1?7:3.6)*s,color,fade,layer===1?4*s:0);
   if(layer===1 && j%2===0)stamp(g,'flame'+((j+Math.floor(now/100))%5),x,y,21*s,28*s,Math.atan2(dy,dx)-Math.PI/2,fade*.84);
  }
 }
 for(let i=0;i<(low?16:34);i++){
  const q=((i*.139+now*.0007)%1)*reach,drift=Math.sin(i*17.2+now*.009)*21*s*(q+.1);
  const x=M(A[0],B[0],q)+nx*drift,y=M(A[1],B[1],q)+ny*drift;
  dot(g,x,y,(1.7+i%4)*s,i%3===0?'#fff2b2':i%3===1?'#ffaf37':'#ff512b',fade*(1-q*.32),2*s);
 }
 if(t>.48){const h=C((t-.48)/.24);glow(g,B[0],B[1],(17+h*31)*s,'#fff7ce','#ef6c24',fade*.55);
  for(let i=0;i<7;i++){const a=i*TWO/7+now*.003;dot(g,B[0]+Math.cos(a)*(8+h*24)*s,B[1]+Math.sin(a)*(8+h*18)*s,(3+i%2)*s,'#ffd276',fade*.76,1*s);}}
}

registerMove('flame',['Lança-Chamas','Lanca Chamas','Flamethrower'],drawFlame,940);
