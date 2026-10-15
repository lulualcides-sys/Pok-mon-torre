/* V104 Cross Chop: 16 poses, DOIS braços, X somente no contato. */
window.PokemonTorreFightingV104.register('Cross Chop',16,1170,.62,(g,a)=>{
 const {to:B,t,hit:h,scale:s,angle,clamp,ease,shaft,shard,star}=a,
  dx=Math.cos(angle),dy=Math.sin(angle),nx=-dy,ny=dx,
  q=ease((t-.25)/(h-.25)),fade=1-ease((t-.87)/.13);
 if(t>.25&&t<h){
  for(const side of [-1,1]){
   const start=[B[0]-dx*(40-19*q)*s+nx*side*18*s,
    B[1]-dy*(40-19*q)*s+ny*side*18*s],
    end=[B[0]-dx*(21-14*q)*s+nx*side*(15-11*q)*s,
    B[1]-dy*(21-14*q)*s+ny*side*(15-11*q)*s];
   shaft(g,start,end,8*s,side===1?'#fe6688':'#fbc6cb',
    '#31131c',q*fade);
  }
 }
 if(t>=h){
  const u=ease((t-h)/.28),alpha=fade*(1-u*.43);
  for(const sign of [-1,1]){
   const th=angle+sign*.78,vx=Math.cos(th),vy=Math.sin(th),R=(36-11*u)*s;
   shaft(g,[B[0]-vx*R,B[1]-vy*R],
    [B[0]+vx*R,B[1]+vy*R],8*s,
    sign>0?'#f12b59':'#ff97a4','#270d20',alpha);
   shaft(g,[B[0]-vx*R*.65,B[1]-vy*R*.65],
    [B[0]+vx*R*.70,B[1]+vy*R*.70],2*s,'#fff0f0',null,alpha*.84);
  }
  star(g,B[0],B[1],(7+19*u)*s,'#fff0ec',alpha);
  for(let i=0;i<9;i++){
   const th=i*2*Math.PI/9+.18,rr=(8+32*u+i%3*4)*s;
   shard(g,B[0]+Math.cos(th)*rr,B[1]+Math.sin(th)*rr*.84,
    (4+i%3*2)*s,th,'#f44b71',alpha*.76);
  }
 }
},['Soco Cruzado']);