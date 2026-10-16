/* Soco de Terra: rocky close-range punch motion and short angular impacts.
 * Not a loose projectile ball: compact packed-earth knuckle, fast lunge,
 * then low-radius debris. No gameplay reposition and no extra HP hit.
 */
window.PokemonTorreGroundV133?.register({
 name:'Soco de Terra',aliases:[],ms:1290,frames:16,
 draw(g,p){
  const {t,hit,from:A,to:B,scale:s,clamp,ease,mix,poly,shard,grain,crack}=p;
  const dx=B[0]-A[0],dy=B[1]-A[1],L=Math.hypot(dx,dy)||1;
  const ux=dx/L,uy=dy/L,nx=-uy,ny=ux,
        q=ease((t-.12)/(hit-.12)),
        fade=1-ease((t-.84)/.16);
  // Firm forearm/clenched mass enters the contact zone with weighted anticipation.
  const cx=mix(A[0]+ux*21*s,B[0]-ux*11*s,q),
        cy=mix(A[1]+uy*21*s,B[1]-uy*10*s,q)-8*s*Math.sin(q*Math.PI);
  const theta=Math.atan2(dy,dx);
  if(t<hit+.10){
   g.save();g.translate(cx,cy);g.rotate(theta);g.scale(s,s);g.globalAlpha*=fade;
   // Jagged stone fist silhouette (no cartoon emoji fist).
   poly(g,[[-23,-9],[-18,-15],[-7,-19],[4,-16],[13,-19],[20,-11],
     [23,-3],[22,11],[11,15],[-5,14],[-17,11]],
     '#8f7357','#211d1a',3.2);
   poly(g,[[-15,-11],[-5,-16],[6,-13],[3,-5],[-8,-3]],'#c5ad86',null);
   poly(g,[[5,-12],[15,-13],[20,-7],[17,-1],[9,-4]],'#69523f',null);
   for(let k=0;k<3;k++){
    g.beginPath();g.moveTo(-3+k*7,2);g.lineTo(-1+k*6,11);
    g.strokeStyle='#362b21';g.lineWidth=1.6;g.stroke();
   }
   g.restore();
   // Low-density gritty drag behind the punch, almost invisible at end.
   for(let i=0;i<8;i++){
    const u=clamp(q-i*.095),w=5+i%3*2.5;
    const tx=mix(A[0],B[0],u)+nx*Math.sin(i*2.2)*w*s;
    const ty=mix(A[1],B[1],u)+ny*Math.sin(i*2.2)*w*s;
    grain(g,tx,ty,(1.0+i%4*.45)*s,fade*.45,'#90765c');
   }
  }
  if(t>=hit){
   const u=clamp((t-hit)/(1-hit)),alpha=1-ease(u);
   // Dry broken stone/soil fragments and a very short surface fracture.
   for(let j=0;j<17;j++){
    const a=j*2.399,r=(8+33*ease(u))*(.85+j%3*.13)*s;
    shard(g,B[0]+Math.cos(a)*r,B[1]+Math.sin(a)*r*.7,
     (2+j%4*1.35)*s,a,alpha*(.86-j*.027),j%2?'#897056':'#ad9270');
   }
   crack(g,[[B[0]-25*s,B[1]+16*s],[B[0]-9*s,B[1]+21*s],
     [B[0]+7*s,B[1]+17*s],[B[0]+22*s,B[1]+20*s]],1.2*s,alpha*.7);
  }
 }
});