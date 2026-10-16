/* Osso (Bone Club): one hefty bone club SWING, never a bone boomerang.
   Impact happens at the exact V359 native hit clock; no duplicate damage. */
window.PokemonTorreGroundV130?.register({
 id:'osso',names:['Osso'],ms:1390,frames:16,
 draw(g,p){
  const {t,hit,from:A,to:B,scale:s,clamp,ease,mix,path,crumb,ripple,shock}=p;
  const approach=ease((t-.10)/(hit-.10));
  const x=mix(A[0]+12*s,B[0]-28*s,approach),y=mix(A[1]-20*s,B[1]-27*s,approach)-24*s*Math.sin(approach*Math.PI);
  const angle=-.72+approach*7.25;
  const fade=ease(t/.12)*(1-ease((t-.88)/.12));
  // Brush-painted curved swoosh that narrows into the hit.
  g.save();g.globalAlpha*=fade;
  for(let j=0;j<3;j++){
   const rr=(30+j*7)*s,alpha=(.25-j*.06);
   g.save();g.globalAlpha*=alpha;g.beginPath();
   g.arc(x,y,rr,angle-.82,angle+.25);
   g.strokeStyle=j===0?'#34241a':j===1?'#f5c981':'#fff4cc';
   g.lineWidth=(10-j*3)*s;g.lineCap='round';g.stroke();g.restore();
  }
  // Thick outlined bone with two-lobed cartilage ends; drawn each frame.
  g.save();g.translate(x,y);g.rotate(angle);g.scale(s,s);
  const L=62,W=8;
  path(g,[[-L/2+6,-W],[L/2-7,-W],[L/2-7,W],[-L/2+6,W]],
   '#f6dfb0','#291f18',3);
  for(const side of [-1,1]){
   const ex=side*(L/2-5);
   for(const sign of [-1,1]){
    g.beginPath();g.arc(ex,sign*8,8.4,0,Math.PI*2);
    g.fillStyle='#f2dfbf';g.lineWidth=3.0;g.strokeStyle='#32291d';g.fill();g.stroke();
   }
  }
  g.beginPath();g.moveTo(-21,-3);g.lineTo(17,-3);
  g.strokeStyle='#fff8df';g.lineWidth=3.4;g.stroke();
  g.beginPath();g.moveTo(8,1);g.lineTo(15,4);g.lineTo(19,1);
  g.strokeStyle='#bca57b';g.lineWidth=1.9;g.stroke();
  g.restore();g.restore();
  if(t>=hit){
   const u=clamp((t-hit)/(1-hit)),fadeHit=1-ease(u);
   shock(g,B[0],B[1],(13+37*ease(u))*s,fadeHit);
   ripple(g,B[0],B[1]+24*s,(18+39*u)*s,(6+14*u)*s,fadeHit);
   for(let i=0;i<17;i++){
    const theta=i*2.399,rr=(15+48*ease(u))*s;
    crumb(g,B[0]+Math.cos(theta)*rr,B[1]+Math.sin(theta)*rr*.73,
      (2.6+i%5*1.5)*s,theta,'#9b7853',fadeHit);
   }
  }
 }
});