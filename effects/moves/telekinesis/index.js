// Telecinese — versão V35.82: onda inicial, coluna de levitação, anéis e rochas.
function drawTelekinesis(g,f,t,now,s,low){
 const A=f.from,B=f.to,fade=C(Math.min(t*9,(1-t)*9)),lift=SM(C((t-.16)/.62)),beat=now*.0049;
 // Pulso de ativação do usuário até o oponente.
 for(let j=0;j<4;j++){
  const u=SM(C((t-j*.045)/.27));
  const x=M(A[0],B[0],u),y=M(A[1],B[1],u);
  ring(g,x,y,(9+j*2)*s,j%2?'#b6a3ff':'#f2b5ff',fade*(1-u*.35),1.7*s,.50,beat+j);
 }
 const x=B[0],y=B[1]-lift*14*s,appear=C(t/.26);
 glow(g,x,y,56*s,'#f6e5ff','#8135de',fade*.56);
 // Os anéis saem do chão e acompanham o alvo levitando.
 for(let j=0;j<5;j++){
  const yy=y+(j-2)*12*s+Math.sin(beat*2+j)*3*s;
  const r=(21+j*6+Math.sin(beat*2+j)*3)*s;
  ring(g,x,yy,r,j%2?'#c18bff':'#f7baff',fade*appear*(.94-j*.12),2.1*s,.30,beat*(j%2?-1:1));
 }
 // Coluna de energia suave com feixes animados e núcleo iluminado.
 for(let j=0;j<5;j++){
  const xx=x+(j-2)*9*s+Math.sin(beat*3+j)*3*s;
  line(g,[[xx,y+31*s],[xx+Math.sin(beat*1.7+j)*5*s,y-35*s]],j%2?'#d499ff':'#f2d4ff',1.4*s,fade*.35,2*s);
 }
 // Pedras flutuam ao redor do alvo. A ordem de render varia com a órbita, não é PNG parado.
 for(let j=0;j<(low?7:11);j++){
  const a=j*2.399+beat*(j%2?1:-1),radius=(21+j%4*9)*s;
  const bob=Math.sin(beat*2.1+j*1.7)*6*s-lift*9*s;
  const px=x+Math.cos(a)*radius,py=y+Math.sin(a)*radius*.60+bob;
  stone(g,px,py,(2.5+j%3*1.5)*s,a*.66,fade*.88);
  if(j%2===0)stamp(g,'purple'+((j*3+Math.floor(now/95))%32),px,py,11*s,11*s,a,fade*.58);
 }
 for(let j=0;j<(low?7:13);j++){
  const a=j*TWO/13+beat*1.4,rr=(19+j%4*9)*s;
  const xx=x+Math.cos(a)*rr,yy=y+Math.sin(a)*rr*.9;
  if(j%3===0)star(g,xx,yy,3.2*s,'#fff0ff',fade);
  else dot(g,xx,yy,2*s,'#efa4ff',fade*.84,2*s);
 }
 if(t>.72){
  const z=SM(C((t-.72)/.28));
  ring(g,x,y,(17+37*z)*s,'#fcdeff',fade*(1-z),2.5*s,.58,beat);
  glow(g,x,y,(21+25*z)*s,'#fff0ff','#a542ea',fade*(1-z)*.50);
 }
}
registerMove('telekinesis',['Telecinese','Telekinesis'],drawTelekinesis,1250);
