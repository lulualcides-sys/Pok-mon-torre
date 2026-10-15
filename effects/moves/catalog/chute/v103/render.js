/* CHUTE V103 — eight distinct authored combat poses. */
window.PokemonTorreFightingV103.register('Chute',8,900,.56,(g,a)=>{
 const {from:A,to:B,t,hit:h,scale:s,dir:v,smooth,clamp,between,path,shard,burst,slash}=a;
 const contact=smooth((t-.15)/(h-.15)),fade=1-smooth((t-.83)/.17),
  foot=between(A,B,contact*.91),angle=v.angle,normal=[v.nx,v.ny];
 // Preparation: leg loads behind the fighter, in front of the sprite.
 if(t<h){
  const lift=between(A,B,.16);
  path(g,[[lift[0]-v.x*15*s,lift[1]+v.ny*13*s],
   [lift[0]+v.x*12*s,lift[1]-v.ny*19*s],
   [foot[0],foot[1]]],5.5*s,'#eaa16c','#181a25',fade*.80);
  const dashAlpha=clamp((t-.19)/.13)*fade;
  for(let j=0;j<4;j++){
   const u=clamp(contact-(j+1)*.12),p=between(A,B,u),
    offset=(j-1.5)*7*s;
   path(g,[[p[0]-v.x*(13+j*4)*s+normal[0]*offset,
     p[1]-v.y*(13+j*4)*s+normal[1]*offset],
    [p[0]+normal[0]*offset,p[1]+normal[1]*offset]],
    (1.3+j%2)*s,j%2?'#ffb76e':'#fff0b9','#2c1d29',dashAlpha*(.65-j*.11));
  }
  slash(g,foot,angle,22*s,7*s,'#ff9353',dashAlpha);
 }
 if(t>=h){
  const u=smooth((t-h)/(1-h)),alpha=fade*(1-u*.60);
  burst(g,B,(10+30*u)*s,10,['#fff6cd','#ffc061','#f57447'],alpha,3);
  slash(g,B,angle,(41-9*u)*s,12*s,'#ffae55',alpha);
  shard(g,B[0]+normal[0]*20*u*s,B[1]+normal[1]*18*u*s,
   11*s,angle+.7,'#fff2bb',alpha);
 }
});