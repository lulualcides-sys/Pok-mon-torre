// Lança-Chamas — versão V35.82: fluxo vivo de fogo, brasas móveis e impacto.
// O jato percorre A -> B e NÃO substitui a lógica de dano do motor.
function drawFlame(g,f,t,now,s,low){
 const A=f.from,B=f.to,alpha=C(Math.min(t*12,(1-t)*11)),extent=SM(C(t/.27)),beat=now*.018;
 const dx=B[0]-A[0],dy=B[1]-A[1],length=Math.hypot(dx,dy)||1,nx=-dy/length,ny=dx/length;
 // Cria um corpo contínuo e ondulante; as bordas se movem independentemente do núcleo.
 const passes=[
  {w:17,color:'#9b250d',a:.72},
  {w:13,color:'#ed4911',a:.98},
  {w:9,color:'#ff9529',a:1},
  {w:4.6,color:'#fff0a7',a:.98}
 ];
 for(let layer=0;layer<passes.length;layer++){
  const p=passes[layer],num=low?13:23,upper=[],lower=[];
  for(let j=0;j<=num;j++){
   const u=j/num*extent;
   const x=A[0]+dx*u,y=A[1]+dy*u;
   const wobble=(Math.sin(u*29-beat+layer*.34)*2.9+Math.sin(u*53+beat*.71)*1.9)*s;
   const width=p.w*s*(.72+.32*Math.sin(u*Math.PI))*(1-.12*u);
   const edge=Math.sin(u*43-beat*1.5+layer)*width*.22;
   upper.push([x+nx*(wobble+width+edge),y+ny*(wobble+width+edge)]);
   lower.push([x+nx*(wobble-width-edge),y+ny*(wobble-width-edge)]);
  }
  g.save();g.globalAlpha=alpha*p.a;g.fillStyle=p.color;
  if(layer<2){g.shadowColor=p.color;g.shadowBlur=5*s;}
  g.beginPath();g.moveTo(upper[0][0],upper[0][1]);
  for(let j=1;j<upper.length;j++)g.lineTo(upper[j][0],upper[j][1]);
  for(let j=lower.length-1;j>=0;j--)g.lineTo(lower[j][0],lower[j][1]);
  g.closePath();g.fill();g.restore();
 }
 // Línguas de fogo, sprites reais quando disponíveis e pequenas brasas em movimento.
 for(let j=0;j<(low?7:12);j++){
  const q=((j*.161+now*.00072)%1)*extent;
  const x=M(A[0],B[0],q),y=M(A[1],B[1],q),wave=Math.sin(q*38-beat+j)*8*s;
  const xx=x+nx*wave,yy=y+ny*wave;
  stamp(g,'flame'+((j+Math.floor(now/90))%5),xx,yy,(12+j%3*4)*s,(18+j%4*4)*s,Math.atan2(dy,dx)-Math.PI/2,alpha*.72);
  for(let k=0;k<2;k++){
   const dir=k?1:-1,off=(11+(j%4)*5)*s*dir;
   dot(g,xx+nx*off,yy+ny*off,(1.5+j%3)*s,k?'#ffce5e':'#ff7130',alpha*(.8-q*.2),2*s);
  }
 }
 for(let j=0;j<(low?15:29);j++){
  const q=((j*.137+now*.0011)%1)*extent,r=8+((j*7)%17);
  const x=M(A[0],B[0],q)+nx*Math.sin(beat+j*3.1)*r*s;
  const y=M(A[1],B[1],q)+ny*Math.sin(beat+j*3.1)*r*s;
  dot(g,x,y,(1+j%3)*s,j%3===0?'#fff4b7':j%3===1?'#ffd35b':'#f95824',alpha*(.92-.3*q),j%3===0?3*s:0);
 }
 if(t>.37){
  const hit=C((t-.37)/.52),x=B[0],y=B[1],strength=alpha*(1-hit*.43);
  glow(g,x,y,(27+12*Math.sin(beat*1.2))*s,'#fff8d3','#ed551b',strength*.58);
  for(let j=0;j<8;j++){
   const a=j*TWO/8+beat*.16,rr=(16+15*Math.sin(beat+j))*s;
   stamp(g,'flame'+((j+Math.floor(now/95))%5),x+Math.cos(a)*rr*.75,y+Math.sin(a)*rr*.64,18*s,27*s,a,alpha*.7);
  }
  if(t>.75){const z=C((t-.75)/.25);ring(g,x,y,(17+28*z)*s,'#ffd26d',alpha*(1-z),2.3*s,.72);}
 }
}
registerMove('flame',['Lança-Chamas','Flamethrower'],drawFlame,1100);
