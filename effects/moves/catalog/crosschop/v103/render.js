/* CROSS CHOP V103 — sixteen X-slash frames, dual opposed arms. */
window.PokemonTorreFightingV103.register('Cross Chop',16,1230,.61,(g,a)=>{
 const {from:A,to:B,t,hit:h,scale:s,dir:v,smooth,clamp,between,path,shard,burst,slash}=a;
 const advance=smooth((t-.20)/(h-.20)),fade=1-smooth((t-.88)/.12),
  pos=between(A,B,advance),dx=v.x,dy=v.y,nx=v.nx,ny=v.ny;
 if(t<h){
  const prep=clamp((t-.09)/.19);
  for(const sign of [-1,1]){
   const src=[A[0]+nx*sign*23*s,A[1]+ny*sign*23*s],
    dst=[pos[0]+nx*sign*(27-advance*27)*s,
      pos[1]+ny*sign*(27-advance*27)*s];
   path(g,[src,dst],(7+advance*5)*s,sign<0?'#ff567b':'#ff7391',
    '#240b22',prep*fade);
   path(g,[[src[0]-dx*4*s,src[1]-dy*4*s],dst],
    (2+advance*2)*s,'#fff2f2',null,prep*fade*.75);
  }
  for(let j=0;j<7;j++){
   const q=clamp(advance-j*.11),p=between(A,B,q);
   shard(g,p[0]+nx*(j%2?1:-1)*14*s,p[1]+ny*(j%2?1:-1)*14*s,
    (4+j%3*3)*s,v.angle+(j%2?1:-1)*.7,'#f44c74',prep*fade*.74);
  }
 }
 if(t>=h){
  const u=smooth((t-h)/(1-h)),alpha=fade*(1-u*.41);
  // Opposing blades form a CLEAN X, not a generic ball.
  slash(g,B,v.angle+Math.PI*.25,(104-16*u)*s,11*s,'#e92253',alpha);
  slash(g,B,v.angle-Math.PI*.25,(104-16*u)*s,11*s,'#ff4266',alpha);
  path(g,[[B[0]-dx*19*s,B[1]-dy*19*s],B,
   [B[0]+dx*(21+21*u)*s,B[1]+dy*(21+21*u)*s]],
   2.6*s,'#fff0ff','#49142e',alpha);
  burst(g,B,(12+47*u)*s,14,['#fff4ed','#fc3766','#b50c42'],alpha,7);
 }
},['Soco Cruzado']);