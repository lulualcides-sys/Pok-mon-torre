/* Ice Beam V99: concentrated cryogenic lance, sharp crystalline forks. */
window.PokemonTorreIceV99.register('Ice Beam',16,1420,(g,x)=>{
 const a=window.PokemonTorreIceV99,{from:A,to:B,progress:t,hit:h,scale:s}=x;
 const v=a.vec(A,B),T=x.time*.014,
  q=a.smooth(a.clamp((t-.18)/(h-.18))),
  fade=1-a.smooth((t-.88)/.12);
 if(t<.25){
  for(let j=0;j<7;j++){
   const theta=j*Math.PI*2/7+T*.2,r=(23-16*t/.25)*s;
   a.shard(g,A[0]+Math.cos(theta)*r,A[1]+Math.sin(theta)*r,
    (3+j%3)*s,theta,'#d8f7ff',fade);
  }
 }
 if(q>.01&&t<.92){
  const pts=[],n=22;
  for(let i=0;i<=n;i++){
   const u=i/n*q,p=a.point(A,B,u),wig=Math.sin(u*27-T)*1.75*s;
   pts.push([p[0]+v.nx*wig,p[1]+v.ny*wig]);
  }
  a.line(g,pts,11*s,'#4b9ece','#173b62',fade*.90);
  a.line(g,pts,6.4*s,'#8fdcf8','#245a85',fade);
  a.line(g,pts,2.6*s,'#f1feff',null,fade);
  for(let i=0;i<9;i++){
   const u=q*(i+.5)/9,p=a.point(A,B,u),side=i%2?1:-1,dist=(9+(i%3)*5)*s;
   const pts2=[p,[p[0]+v.nx*side*dist*.6-3*s,
    p[1]+v.ny*side*dist*.6],[p[0]+v.nx*side*dist+2*s,
    p[1]+v.ny*side*dist]];
   a.line(g,pts2,1.45*s,i%2?'#a1eaff':'#e8faff','#2e5a7c',fade*.85);
  }
  const tip=a.point(A,B,q);
  a.shard(g,tip[0],tip[1],8*s,v.angle+Math.PI*.5,'#f8feff',fade);
 }
 if(t>=h){
  const impact=a.smooth((t-h)/Math.max(.01,1-h));
  for(let i=0;i<12;i++){
   const theta=i*Math.PI*2/12,r=(6+27*impact+i%3*2)*s;
   a.shard(g,B[0]+Math.cos(theta)*r,B[1]+Math.sin(theta)*r*.72,
    (4+11*impact+i%4*1.5)*s,theta,
    i%2?'#bfefff':'#75c5ed',fade*(1-impact*.48));
  }
  a.ring(g,B[0],B[1],(13+22*impact)*s,(11+13*impact)*s,
   '#c5f3fe',fade*(1-impact*.55));
 }
},.69);
