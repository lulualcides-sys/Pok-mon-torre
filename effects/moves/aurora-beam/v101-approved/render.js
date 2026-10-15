/* Aurora Beam V101: rainbow ribbons, NOT an ordinary blue Ice Beam. */
window.PokemonTorreIceV101.register('Aurora Beam',16,1320,(g,x)=>{
 const a=window.PokemonTorreIceV101,{from:A,to:B,progress:t,hit:h,scale:s}=x;
 const v=a.vec(A,B),q=a.smooth(a.clamp((t-.14)/(h-.14))),
  fade=1-a.smooth((t-.85)/.15),T=x.time*.006;
 if(t<.22){
  for(let j=0;j<5;j++){
   const angle=j*Math.PI*2/5+T,rr=(19-12*t/.22)*s;
   a.star(g,A[0]+Math.cos(angle)*rr,A[1]+Math.sin(angle)*rr,
    2.1*s,['#9bf8dc','#c7b6ff','#ffd9ed'][j%3],.7);
  }
 }
 if(t>.12&&fade>.005){
  const colors=['#8ff2dd','#8dbfff','#d1acff','#ffb5df','#f8f7d5'];
  for(let band=0;band<5;band++){
   const pts=[],steps=24,w=(band-2)*3.6*s;
   for(let j=0;j<=steps;j++){
    const u=j/steps*q,p=a.point(A,B,u);
    const wave=Math.sin(u*19-T*1.8+band*.83)*4.0*s;
    pts.push([p[0]+v.nx*(w+wave),p[1]+v.ny*(w+wave)]);
   }
   a.line(g,pts,band===2?2.8*s:2.1*s,colors[band],'#1e3a57',fade*.82);
  }
  const tip=a.point(A,B,q);
  a.star(g,tip[0],tip[1],4*s,'#effdff',fade);
  for(let j=0;j<12;j++){
   const u=a.clamp(q-((j*.083+T*.012)% .41)),p=a.point(A,B,u);
   const side=Math.sin(j*2.41+T)*11*s;
   a.star(g,p[0]+v.nx*side,p[1]+v.ny*side,
    (1.1+j%3*.52)*s,colors[j%colors.length],fade*.60);
  }
 }
 if(t>=h){
  const burst=a.smooth(a.clamp((t-h)/Math.max(.01,1-h)));
  for(let j=0;j<9;j++){
   const theta=j*Math.PI*2/9+(T*.10),r=(7+21*burst)*s;
   a.shard(g,B[0]+Math.cos(theta)*r,B[1]+Math.sin(theta)*r*.70,
    (3+j%3+7*burst)*s,theta,
    ['#c7f8f0','#d5c1ff','#edbded'][j%3],fade*(1-burst*.25));
  }
  a.ring(g,B[0],B[1],(10+30*burst)*s,(7+19*burst)*s,
   '#ccdcff',fade*(1-burst*.6));
 }
},.68);
