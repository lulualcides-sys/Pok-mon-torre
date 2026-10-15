/* BRICK BREAK V103 — sixteen-posed overhead downward breaking strike. */
window.PokemonTorreFightingV103.register('Brick Break',16,1160,.60,(g,a)=>{
 const {from:A,to:B,t,hit:h,scale:s,dir:v,smooth,clamp,between,path,shard,burst,slash}=a;
 const drop=smooth((t-.20)/(h-.20)),fade=1-smooth((t-.86)/.14),
  start=[A[0]+v.nx*35*s,A[1]+v.ny*35*s-37*s],
  strike=[B[0]-v.nx*17*(1-drop)*s,B[1]-v.ny*17*(1-drop)*s-34*(1-drop)*s];
 if(t<h){
  const alpha=clamp((t-.1)/.18)*fade;
  // Descending hammer chop has actual travel, not a beam.
  path(g,[start,[start[0]+v.x*15*s,start[1]+v.y*15*s],strike],
   (6+7*drop)*s,'#fcb768','#231a1d',alpha);
  path(g,[[start[0]+v.nx*8*s,start[1]+v.ny*8*s],
   [strike[0]+v.nx*2*s,strike[1]+v.ny*2*s]],
   2.2*s,'#fff2c6',null,alpha*.91);
  for(let j=0;j<4;j++){
   const q=clamp(drop-j*.13),p=between(start,B,q);
   shard(g,p[0]+v.nx*(j-1.5)*6*s,p[1]+v.ny*(j-1.5)*6*s,
    (4+j)*s,v.angle+1.2,'#f3a74f',alpha*(.8-j*.13));
  }
 }
 if(t>=h){
  const u=smooth((t-h)/(1-h)),alpha=fade*(1-u*.25);
  slash(g,B,v.angle,(57-13*u)*s,(13-4*u)*s,'#ffbc53',alpha);
  // Angular masonry that fractures outward, black-lined fragments.
  for(let j=0;j<13;j++){
   const a=(j*2.399+.41),r=(9+65*u*(.54+j%4*.16))*s,
    px=B[0]+Math.cos(a)*r,py=B[1]+Math.sin(a)*r*.72,
    size=(7+(j%4)*2.5)*(1-u*.22)*s;
   shard(g,px,py,size,a+.3,
    ['#ecc18a','#bf8e63','#6d6673','#ffdc9c'][j%4],alpha*(.90-j%3*.11),.57);
   if(j%2===0)path(g,[[B[0]+Math.cos(a)*5*s,B[1]+Math.sin(a)*5*s],
    [px,py]],1.7*s,'#ffdf9d','#392b30',alpha*.64);
  }
  burst(g,B,(9+34*u)*s,9,['#fff0c5','#ffa84f','#e87832'],alpha*.80,2);
 }
},['Quebra-Tijolo']);