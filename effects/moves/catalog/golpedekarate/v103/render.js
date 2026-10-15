/* GOLPE DE KARATÊ V103 — twelve-posed knife-hand martial slash. */
window.PokemonTorreFightingV103.register('Golpe de Karatê',12,1080,.59,(g,a)=>{
 const {from:A,to:B,t,hit:h,scale:s,dir:v,smooth,clamp,between,path,shard,burst,slash}=a;
 const spin=smooth(clamp((t-.19)/(h-.19))),fade=1-smooth((t-.86)/.14),
  contact=between(A,B,spin),theta=v.angle-.72+spin*1.12;
 if(t<h){
  const start=between(A,B,.19);
  path(g,[[start[0]-v.x*18*s,start[1]-v.y*18*s],
   [start[0]+v.nx*13*s,start[1]+v.ny*13*s],
   contact],6*s,'#f6cdca','#24142e',fade*.78);
  for(let j=0;j<3;j++){
   const q=clamp(spin-j*.12),p=between(A,B,q),offset=j*11*s;
   const len=(19+q*39-j*6)*s;
   slash(g,[p[0]-v.x*offset,p[1]-v.y*offset],theta-j*.09,
    len,(5-j*.9)*s,j===1?'#d77ffb':'#ac49e6',
    fade*(.79-j*.17)*clamp((t-.11)/.2));
  }
  for(let j=0;j<5;j++){const q=clamp(spin-j*.18),p=between(A,B,q);
   shard(g,p[0]+v.nx*Math.sin(j*2)*12*s,
    p[1]+v.ny*Math.sin(j*2)*12*s,(4+j%2*3)*s,theta+j,
    j%2?'#fbe4ff':'#b968e5',fade*.80);
  }
 }
 if(t>=h){
  const u=smooth((t-h)/(1-h)),alpha=fade*(1-u*.45);
  slash(g,[B[0]-v.x*9*u*s,B[1]-v.y*9*u*s],
   v.angle+.42,(66-16*u)*s,11*s,'#b05bf0',alpha);
  burst(g,B,(13+39*u)*s,10,['#f9eaff','#e6a3fa','#8c3fb9'],alpha,5);
  for(let j=0;j<3;j++)path(g,[[B[0]+v.nx*(j-1)*12*s-v.x*15*s,
   B[1]+v.ny*(j-1)*12*s-v.y*15*s],
   [B[0]+v.nx*(j-1)*17*s+v.x*(10+18*u)*s,
   B[1]+v.ny*(j-1)*17*s+v.y*(10+18*u)*s]],
   2*s,'#ffe5ff','#361c49',alpha*.75);
 }
},['Karate Chop']);