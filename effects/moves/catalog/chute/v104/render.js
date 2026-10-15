/* V104 Chute: oito poses de contato, perna estendida + choque. */
window.PokemonTorreFightingV104.register('Chute',8,940,.59,(g,a)=>{
 const {to:B,t,hit:h,scale:s,angle,clamp,ease,shaft,shard,star}=a;
 const dx=Math.cos(angle),dy=Math.sin(angle),nx=-dy,ny=dx;
 const ready=ease(clamp((t-.29)/(h-.29))),fade=1-ease((t-.82)/.18);
 if(t>.29&&t<h){
  const foot=[B[0]-dx*(46-30*ready)*s+nx*9*s,
   B[1]-dy*(46-30*ready)*s+ny*9*s];
  const knee=[foot[0]-dx*16*s+nx*11*s,foot[1]-dy*16*s+ny*11*s];
  shaft(g,[knee[0]-dx*10*s,knee[1]-dy*10*s],knee,7*s,
   '#ee9b64','#292031',fade*ready);
  shaft(g,knee,foot,9*s,'#ffd18b','#251923',fade*ready);
  shard(g,foot[0],foot[1],8*s,angle,'#fff3c5',fade*ready);
 }
 if(t>=h){
  const q=ease((t-h)/.23),alpha=fade*(1-q*.60);
  // Burst stays around the contacted Pokémon, NEVER flies toward it.
  star(g,B[0],B[1],(10+16*q)*s,'#fff1b1',alpha);
  for(let i=0;i<8;i++){
   const a0=i*Math.PI/4+.16,dist=(10+26*q+i%2*4)*s;
   shard(g,B[0]+Math.cos(a0)*dist,B[1]+Math.sin(a0)*dist*.7,
    (4+i%3*2)*s,a0,i%2?'#ff9c4c':'#ffe0a0',alpha*.86);
  }
  shaft(g,[B[0]-dx*19*s-nx*10*s,B[1]-dy*19*s-ny*10*s],
   [B[0]+dx*9*s+nx*10*s,B[1]+dy*9*s+ny*10*s],
   5*s,'#ffb465','#2b1a24',alpha);
 }
},[]);