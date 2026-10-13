// Módulo isolado: Telecinese. Não altera golpes vizinhos.
function drawTelekinesis(g,f,t,now,s){
 const B=f.to,fade=C(Math.min(t*8,(1-t)*6,1)),rise=SM(C(t/.70)),pulse=Math.sin(now*.013);
 const x=B[0],y=B[1]-rise*17*s;
 glow(g,x,y,62*s,'#ead2ff','#8636dd',fade*.54);
 for(let i=0;i<5;i++){
  const yy=y+(i-2)*13*s;
  const rad=(24+i*5+Math.sin(now*.011+i)*3)*s;
  ring(g,x,yy,rad,'#e9a5ff',fade*(.9-i*.1),2.1*s,.31,now*.002*(i%2?1:-1));
 }
 for(let j=0;j<11;j++){
  const a=j*2.399+now*.003,rad=(14+(j%4)*12)*s,lev=Math.sin(now*.008+j)*10*s;
  stone(g,x+Math.cos(a)*rad,y+Math.sin(a)*rad*.61+lev,2.4*s+(j%3)*1.2*s,a*.7,fade*(.85-j*.035));
  if(j%2===0)stamp(g,'purple'+((j*3+Math.floor(now/90))%32),x+Math.cos(a)*rad,y+Math.sin(a)*rad*.61+lev,13*s,13*s,a,fade*.70);
 }
 for(let j=0;j<9;j++){
  const a=j*TWO/9+now*.004,rad=(22+j%3*14)*s;
  if(j%2===0)star(g,x+Math.cos(a)*rad,y+Math.sin(a)*rad*.85,3.1*s,'#ffe8ff',fade*.75);
  else dot(g,x+Math.cos(a)*rad,y+Math.sin(a)*rad*.85,2*s,'#ffafff',fade,1*s);
 }
 if(t>.70){const p=C((t-.70)/.30);ring(g,x,y,(16+p*38)*s,'#f7ddff',fade*(1-p),2.5*s,.50);}
}

registerMove('telekinesis',['Telecinese','Telekinesis'],drawTelekinesis,1080);
