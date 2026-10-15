/* V104 Brick Break: 16 poses de martelada próxima, rachadura + recuo. */
window.PokemonTorreFightingV104.register('Brick Break',16,1220,.63,(g,a)=>{
 const {to:B,t,hit:h,scale:s,angle,clamp,ease,shaft,shard,star}=a;
 const dx=Math.cos(angle),dy=Math.sin(angle),nx=-dy,ny=dx,
  q=ease((t-.28)/(h-.28)),fade=1-ease((t-.87)/.13);
 if(t>.28&&t<h){
  const elbow=[B[0]-dx*31*s+nx*(20-5*q)*s,
   B[1]-dy*31*s+ny*(20-5*q)*s-10*s],
   fist=[B[0]-dx*(23-18*q)*s+nx*(12-10*q)*s,
    B[1]-dy*(23-18*q)*s+ny*(12-10*q)*s];
  shaft(g,[elbow[0]-dx*13*s,elbow[1]-dy*13*s-9*s],
   elbow,8*s,'#ffd7a3','#2d2126',q*fade);
  shaft(g,elbow,fist,10*s,'#f3a95f','#251a25',q*fade);
  shard(g,fist[0],fist[1],8*s,angle+.3,'#fff4ca',q*fade);
 }
 if(t>=h){
  const u=ease((t-h)/.27),alpha=fade*(1-u*.42);
  // Blocks shatter outward ONLY after fist-to-body contact. No flying rock.
  for(let i=0;i<10;i++){
   const th=i*2.399+.3,dist=(8+31*u+i%3*5)*s,
    size=(5.5+i%4*1.6)*(1-u*.26)*s;
   shard(g,B[0]+Math.cos(th)*dist,B[1]+Math.sin(th)*dist*.8,
    size,th,['#e7b785','#c58d67','#8a7480','#ffdbaf'][i%4],alpha*.86);
  }
  for(let i=0;i<5;i++){
   const th=i*Math.PI*2/5+.12,vx=Math.cos(th),vy=Math.sin(th);
   shaft(g,[B[0]+vx*5*s,B[1]+vy*5*s],
    [B[0]+vx*(17+22*u)*s,B[1]+vy*(17+22*u)*s],
    1.8*s,'#ffd697','#362a30',alpha*.72);
  }
  star(g,B[0],B[1],(7+19*u)*s,'#fff1c3',alpha*.75);
 }
},['Quebra-Tijolo']);