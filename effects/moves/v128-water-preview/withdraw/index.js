/* Original Withdraw: retract into shell / raise own Defense. Status-only art. */
window.PokemonTorreWaterV128?.register({
 key:'withdraw',aliases:['retrair','retracao'],ms:1300,frames:12,
 draw(g,p){
  const {t,e,from,world,clamp,ease,ring}=p;
  const x=from[0],y=from[1],r=(e.player?.r||31)*world;
  const enter=ease(t/.27),leave=1-ease((t-.76)/.23),a=enter*leave;
  const shrink=1-.15*ease(t/.34)*(1-ease((t-.54)/.27));
  // Protective dark-edged shell facets and native-style blue gleam.
  g.save();g.translate(x,y);g.scale(shrink,shrink);g.globalAlpha*=a;
  const sides=6,R=r*1.37;
  g.beginPath();for(let j=0;j<=sides;j++){
   const ang=-Math.PI/2+j*Math.PI*2/sides;
   const vx=Math.cos(ang)*R,vy=Math.sin(ang)*R*.86;
   if(!j)g.moveTo(vx,vy);else g.lineTo(vx,vy);
  }
  g.closePath();g.fillStyle='rgba(28,134,196,.14)';g.fill();
  g.strokeStyle='#092b45';g.lineWidth=6;g.stroke();
  g.strokeStyle='#72d4ff';g.lineWidth=3;g.stroke();
  for(let j=0;j<3;j++){const rr=R*(.58+j*.15);
   g.beginPath();g.arc(0,0,rr,-Math.PI*.74,-Math.PI*.14);
   g.strokeStyle=j%2?'#effdff':'#47b9f0';g.lineWidth=2.1;g.stroke();}
  for(let j=0;j<6;j++){const ang=j*Math.PI/3+t*1.6;
   const px=Math.cos(ang)*(R+10),py=Math.sin(ang)*(R*.85+7);
   g.beginPath();g.moveTo(px-3,py);g.lineTo(px+3,py);
   g.moveTo(px,py-3);g.lineTo(px,py+3);
   g.strokeStyle='#e4ffff';g.lineWidth=1.8;g.stroke();}
  g.restore();
  g.save();g.globalAlpha*=a*.54;
  ring(g,x,y,R*(.68+.12*Math.sin(t*15)),R*.38,.72,'#95eaff',2);g.restore();
 }
});