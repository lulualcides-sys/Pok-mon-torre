/* Air Slash - Pokémon canon: sharp crescent of compressed air cuts target.
 * Two concentric razor edges, travel and shattering air-ribbons. Not Gust.
 */
window.PokemonTorreFlyingV135?.register({
 name:'Air Slash',aliases:['Airslash','Corte Aéreo'],frames:16,ms:1510,
 draw(g,p){
  const {t,hit,from:A,to:B,scale:s,clamp,ease,mix,path,cut,mote,detailStep}=p;
  const dx=B[0]-A[0],dy=B[1]-A[1],L=Math.hypot(dx,dy)||1,
        ux=dx/L,uy=dy/L,nx=-uy,ny=ux;
  const q=ease((t-.1)/(hit-.1)),alive=ease(t/.11)*(1-ease((t-.86)/.14));
  const x=mix(A[0]+ux*13*s,B[0]-ux*4*s,q);
  const y=mix(A[1]+uy*13*s,B[1]-uy*4*s,q);
  const theta=Math.atan2(dy,dx)+.12;
  if(t<hit+.035){
   // Two razor crescent blades, offset to show compression, not pasted images.
   cut(g,x,y,28*s,theta,alive);
   const x2=x-ux*15*s+nx*7*s,y2=y-uy*15*s+ny*7*s;
   cut(g,x2,y2,17*s,theta,alive*.64);
   // Twin streaming fracture lines behind cutting front.
   for(let i=0;i<3;i++){
    const shift=(i-1)*10*s;
    const pts=[];
    for(let j=0;j<=12;j++){
     const u=j/12,back=u*(35+i*8)*s;
     pts.push([x-ux*back+nx*(shift+Math.sin(u*9+t*17)*4*s),
       y-uy*back+ny*(shift+Math.sin(u*9+t*17)*4*s)]);
    }
    path(g,pts,i===1?'#efffff':'#8bc9e2',(i===1?2.2:1.5)*s,alive*.66);
   }
  }
  if(t>=hit){
   const u=clamp((t-hit)/(1-hit)),fade=1-ease(u);
   // Compact slash impression across target + separated air chips.
   for(let k=0;k<2;k++){
    const off=(k-.5)*16*s,r=(17+24*ease(u))*s;
    const pts=[];
    for(let j=0;j<=13;j++){
     const v=j/13,ang=(-.32+v*.66)*Math.PI;
     pts.push([B[0]+nx*off+Math.cos(ang)*r,
       B[1]+ny*off+Math.sin(ang)*r*.7]);
    }
    path(g,pts,k?'#e6fcff':'#9bd6e8',2.2*s,fade*.9);
   }
   for(let i=0;i<15;i+=detailStep){
    const a=i*2.4,rr=(7+47*ease(u))*(.7+i%3*.17)*s;
    mote(g,B[0]+Math.cos(a)*rr,B[1]+Math.sin(a)*rr*.7,
      (1.1+i%3*.6)*s,fade*.78);
   }
  }
 }
});