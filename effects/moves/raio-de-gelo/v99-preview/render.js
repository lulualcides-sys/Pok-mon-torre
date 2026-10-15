/* Raio de Gelo V99: alternate narrower freezer ray; distinct from Ice Beam.
 * The historical Portuguese name refers to Ice Beam in some media.
 * Here it is a separate EQUIPPED slot, so it gets a visual variation.
 */
window.PokemonTorreIceV99.register('Raio de Gelo',12,1140,(g,x)=>{
 const a=window.PokemonTorreIceV99,{from:A,to:B,progress:t,hit:h,scale:s}=x,
  v=a.vec(A,B),T=x.time*.010,
  charge=a.smooth(a.clamp(t/.20)),
  q=a.smooth(a.clamp((t-.13)/Math.max(.15,h-.13))),
  fade=1-a.smooth((t-.83)/.17);
 if(t<.26){
  for(let i=0;i<5;i++){
   const angle=i*Math.PI*2/5+T*.19,r=(16-11*charge)*s;
   a.star(g,A[0]+Math.cos(angle)*r,A[1]+Math.sin(angle)*r,2.2*s,
    '#c9ffff',fade*.82);
  }
 }
 if(q>.01&&t<.86){
  // Twin helix around a thin freezing filament, no thick tube.
  const center=[],side=[[],[]];
  for(let j=0;j<=25;j++){
   const u=j/25*q,p=a.point(A,B,u),twist=Math.sin(u*18-T)*5*s;
   center.push(p);
   side[0].push([p[0]+v.nx*twist,p[1]+v.ny*twist]);
   side[1].push([p[0]-v.nx*twist,p[1]-v.ny*twist]);
  }
  a.line(g,center,4.4*s,'#7acbe9','#1a466c',fade);
  a.line(g,center,1.6*s,'#f7ffff',null,fade);
  a.line(g,side[0],1.75*s,'#bbefff','#386f91',fade*.86);
  a.line(g,side[1],1.5*s,'#72b9e3','#386f91',fade*.8);
  for(let k=0;k<6;k++){
   const u=(k+.7)/7*q,p=a.point(A,B,u),off=(k%2?1:-1)*7*s;
   a.shard(g,p[0]+v.nx*off,p[1]+v.ny*off,
    (2.9+k%3)*s,v.angle*.5+k,'#c6f3fc',fade*.78);
  }
 }
 if(t>=h){
  const blast=a.smooth((t-h)/Math.max(.01,1-h));
  for(let k=0;k<7;k++){
   const theta=k*Math.PI*2/7+T*.07,dist=(6+24*blast)*s;
   a.shard(g,B[0]+Math.cos(theta)*dist,
    B[1]+Math.sin(theta)*dist*.86,
    (4+8*blast+k%2*2)*s,theta,'#bfeafb',
    fade*(1-blast*.25));
  }
  a.ring(g,B[0],B[1],(8+25*blast)*s,(7+20*blast)*s,
   '#d8fcff',fade*(1-blast*.65));
 }
},.72);
