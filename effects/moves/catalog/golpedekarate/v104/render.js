/* V104 Golpe de Karatê: mão de faca, corte presencial com 12 poses. */
window.PokemonTorreFightingV104.register('Golpe de Karatê',12,1070,.59,(g,a)=>{
 const {to:B,t,hit:h,scale:s,angle,clamp,ease,shaft,shard,star}=a;
 const dx=Math.cos(angle),dy=Math.sin(angle),nx=-dy,ny=dx,
  q=ease((t-.28)/(h-.28)),fade=1-ease((t-.84)/.16);
 if(t>.28&&t<h){
  const wrist=[B[0]-dx*36*s+nx*(15-7*q)*s,
   B[1]-dy*36*s+ny*(15-7*q)*s],
   hand=[B[0]-dx*(20-17*q)*s+nx*(12-9*q)*s,
   B[1]-dy*(20-17*q)*s+ny*(12-9*q)*s];
  shaft(g,wrist,hand,8*s,'#ddb6fc','#261930',q*fade);
  shaft(g,hand,[hand[0]+dx*11*s,hand[1]+dy*11*s],3*s,
   '#fff0ff','#513466',q*fade);
  shard(g,hand[0]+nx*6*s,hand[1]+ny*6*s,7*s,angle+.35,
   '#be85ff',q*fade);
 }
 if(t>=h){
  const u=ease((t-h)/.25),alpha=fade*(1-u*.45),
   rot=angle-.64,ax=Math.cos(rot),ay=Math.sin(rot);
  shaft(g,[B[0]-ax*(27-8*u)*s,B[1]-ay*(27-8*u)*s],
   [B[0]+ax*(31-9*u)*s,B[1]+ay*(31-9*u)*s],8*s,
   '#a968e9','#2a133f',alpha);
  shaft(g,[B[0]-ax*12*s,B[1]-ay*12*s],
   [B[0]+ax*20*s,B[1]+ay*20*s],2.2*s,'#fcf0ff',null,alpha);
  star(g,B[0],B[1],(8+20*u)*s,'#f9d5ff',alpha*.68);
  for(let k=0;k<5;k++){
   const th=rot+.65+k*1.23,rr=(9+30*u+k%2*5)*s;
   shard(g,B[0]+Math.cos(th)*rr,B[1]+Math.sin(th)*rr*.8,
    (3+k%2*4)*s,th,'#b277e9',alpha*.8);
  }
 }
},['Karate Chop']);