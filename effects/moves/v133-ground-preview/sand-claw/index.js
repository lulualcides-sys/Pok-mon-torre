/* Garra de Areia: three sand-clad oblique claw cuts at the target.
 * Multiple thin mineral scratches; no flat sticker, square slash PNG or giant claws.
 */
window.PokemonTorreGroundV133?.register({
 name:'Garra de Areia',aliases:[],ms:1420,frames:16,
 draw(g,p){
  const {t,hit,from:A,to:B,scale:s,ease,clamp,mix,poly,shard,grain}=p;
  const tGrow=ease((t-.07)/.29),die=1-ease((t-.89)/.11);
  const x=B[0],y=B[1],dx=B[0]-A[0],dy=B[1]-A[1],L=Math.hypot(dx,dy)||1;
  const dir=dx/L,sidy=-dy/L;
  // Dirt gathers around the attacker's leading claw; earth follows the swing.
  for(let i=0;i<19;i++){
   const u=((i*11)%23)/23,angle=i*2.399;
   const px=mix(A[0]+dir*12*s,x-19*s,tGrow*.65)+Math.cos(angle)*u*18*s;
   const py=mix(A[1],y+10*s,tGrow*.65)+Math.sin(angle)*u*12*s;
   grain(g,px,py,(.8+i%3*.54)*s,die*(.30+.40*(1-u)),i%2?'#a58d6f':'#76614c');
  }
  // Distinct successive cuts, with sliced mineral edges, NOT a glowing X.
  for(let i=0;i<3;i++){
   const start=.21+i*.115,span=Math.max(.17,hit+.11-start),
         progress=clamp((t-start)/span);
   if(progress<=0)continue;
   const q=ease(progress),alpha=ease(progress/.18)*(1-ease((progress-.78)/.22))*die;
   const ox=(i-1)*12*s,oy=(i-1)*(-7*s);
   const x1=x-24*s+ox,y1=y+27*s+oy,x2=x+25*s+ox,y2=y-27*s+oy;
   const endX=mix(x1,x2,q),endY=mix(y1,y2,q);
   g.save();g.globalAlpha*=alpha;
   poly(g,[[x1-4*s,y1+4*s],[endX-3*s,endY+4*s],[endX+3*s,endY-4*s],
       [x1+4*s,y1-4*s]],'#9d8264','#211d1b',2.4*s);
   g.beginPath();g.moveTo(x1-1*s,y1);g.lineTo(endX-1*s,endY);
   g.lineWidth=1.7*s;g.strokeStyle='#dac5a2';g.stroke();
   // Flakes travel tangentially along the gouge, then drop as real grains.
   for(let j=0;j<8;j++){
    const u=clamp((j*.137+.07)*q),hx=mix(x1,endX,u),
     hy=mix(y1,endY,u),offset=Math.sin(j*4.2+i*3)*7*s;
    shard(g,hx+offset,hy+(j%3-1)*5*s,(1.7+j%3*.9)*s,j*.61,
      alpha*(1-.06*j),j%2?'#7e6046':'#b6a07f');
   }
   g.restore();
  }
  if(t>=hit){
   const u=clamp((t-hit)/(1-hit)),alpha=(1-ease(u))*die;
   // Small blunt-edged dust impact, not a cartoon starburst.
   for(let k=0;k<17;k++){
    const a=k*2.399,rr=(9+29*ease(u))*(.6+k%4*.13)*s;
    grain(g,x+Math.cos(a)*rr,y+Math.sin(a)*rr*.7,
      (.9+k%4*.6)*s,alpha*.65,k%2?'#70543f':'#aa8c66');
   }
  }
 }
});