/* Impacto Glacial V99: ice collision/ram, not a beam. */
window.PokemonTorreIceV99.register('Impacto Glacial',12,1040,(g,x)=>{
 const a=window.PokemonTorreIceV99,{from:A,to:B,progress:t,hit:h,scale:s}=x,
  v=a.vec(A,B),T=x.time*.012;
 const l=a.smooth(a.clamp((t-.05)/Math.max(.10,h-.05))),
  p=a.point(A,B,l),trailOpacity=a.clamp(1-t*.87);
 if(t<h){
  // Icy motion arc follows the actual close-contact trajectory.
  for(let k=0;k<3;k++){
   const pts=[];
   for(let i=0;i<=15;i++){
    const u=l*i/15,z=a.point(A,B,u);
    const sw=(k-1)*5*s+Math.sin(u*11-T+k)*3*s;
    pts.push([z[0]+v.nx*sw,z[1]+v.ny*sw]);
   }
   a.line(g,pts,(k===1?4:2)*s,
    k===1?'#d4f6ff':'#7fc8e2','#173c58',trailOpacity*.75);
  }
  const head=a.point(A,B,l);
  for(let i=0;i<9;i++){
   const offset=(i-4)*7*s,
    behind=a.point(A,B,a.clamp(l-(.025+.012*i)));
   a.shard(g,behind[0]+v.nx*offset*.52,
    behind[1]+v.ny*offset*.52,(3+i%4)*s,T+i*1.3,
    '#b6edfa',trailOpacity*.7);
  }
  a.shard(g,head[0],head[1],11*s,v.angle+Math.PI*.5,
   '#dcfaff',trailOpacity);
 }
 if(t>=h){
  const p=a.smooth((t-h)/Math.max(.01,1-h)),fade=1-a.smooth((p-.72)/.28);
  // Split the ice floor with pointed cracks at the collision point.
  for(let i=0;i<8;i++){
   const angle=i*Math.PI*2/8+Math.sin(T)*.03,dist=(8+28*p)*s,
    xx=B[0]+Math.cos(angle)*dist*.83,
    yy=B[1]+Math.sin(angle)*dist*.54;
   a.line(g,[[B[0],B[1]+8*s],[xx,yy+7*s]],
    (1.4+i%2*.5)*s,'#c4f7fc','#366983',fade*.78);
   a.shard(g,xx,yy-(7+14*p)*s,(5+12*p+i%3*2)*s,angle,
    i%2?'#a0dff4':'#e2f9ff',fade*.95);
  }
  a.ring(g,B[0],B[1]+7*s,(11+32*p)*s,(4+11*p)*s,
   '#c7f0fa',fade*.82);
  for(let i=0;i<6;i++){
   const angle=i*2.4+T*.02,r=(8+26*p)*s;
   a.star(g,B[0]+Math.cos(angle)*r,
    B[1]+Math.sin(angle)*r*.7,1.5*s,'#edfaff',fade);
  }
 }
},.62);
