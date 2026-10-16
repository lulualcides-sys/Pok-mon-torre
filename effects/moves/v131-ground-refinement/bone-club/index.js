/* Pokémon Torre V131 — bone club reduced to 47% of its V130 silhouette.
 * True bone club, no cartoon oversized sweep; no PNG / CSS effects.
 * Scoped solely to move "Osso" when ?ground131=preview.
 */
window.PokemonTorreGroundV130?.register({
 id:'osso',names:['Osso'],ms:1390,frames:16,
 draw(g,p){
  const {t,hit,from:A,to:B,scale:s,ease,mix,path,crumb,ripple,shock,clamp}=p;
  const q=ease((t-.10)/(hit-.10));
  const x=mix(A[0]+12*s,B[0]-18*s,q),
        y=mix(A[1]-14*s,B[1]-16*s,q)-11*s*Math.sin(Math.PI*q);
  const angle=-.72+q*7.25;
  const fade=ease(t/.12)*(1-ease((t-.88)/.12));
  const size=clamp(s*.47,.32,.56); // 53% smaller than the V130 artwork.
  g.save();g.globalAlpha*=fade;
  // Short narrow motion stroke, not a screen-sized golden ring.
  for(let j=0;j<3;j++){
   const rr=(31+j*6)*size;
   g.save();g.globalAlpha*=.22-j*.055;
   g.beginPath();g.arc(x,y,rr,angle-.75,angle+.13);
   g.strokeStyle=j===0?'#261e19':j===1?'#b28b59':'#d0b58e';
   g.lineWidth=(6-j*1.4)*size;g.lineCap='round';g.stroke();g.restore();
  }
  // Exactly the user's approved-shaped bone, rescaled as a whole.
  g.save();g.translate(x,y);g.rotate(angle);g.scale(size,size);
  const L=62,W=8;
  path(g,[[-L/2+6,-W],[L/2-7,-W],[L/2-7,W],[-L/2+6,W]],
   '#e4cfa8','#231c17',3);
  for(const side of [-1,1]){
   const ex=side*(L/2-5);
   for(const sign of [-1,1]){
    g.beginPath();g.arc(ex,sign*8,8.4,0,Math.PI*2);
    g.fillStyle='#e9dabb';g.lineWidth=3;g.strokeStyle='#29211a';g.fill();g.stroke();
   }
  }
  g.beginPath();g.moveTo(-21,-3);g.lineTo(17,-3);
  g.strokeStyle='#fff5df';g.lineWidth=3.4;g.stroke();
  g.beginPath();g.moveTo(8,1);g.lineTo(15,4);g.lineTo(19,1);
  g.strokeStyle='#bca57b';g.lineWidth=1.9;g.stroke();
  g.restore();g.restore();
  if(t>=hit){
   const u=clamp((t-hit)/(1-hit)),alpha=1-ease(u);
   // Compact physical impact, proportionate to the small bone.
   shock(g,B[0],B[1],(7+17*ease(u))*s,alpha*.79);
   ripple(g,B[0],B[1]+17*s,(9+22*u)*s,(3+7*u)*s,alpha*.72,'#b79b76');
   for(let i=0;i<9;i++){
    const a=i*2.399,r=(7+24*ease(u))*s;
    crumb(g,B[0]+Math.cos(a)*r,B[1]+Math.sin(a)*r*.71,
      (1.5+i%3*.8)*s,a,'#886b52',alpha*.78);
   }
  }
 }
});