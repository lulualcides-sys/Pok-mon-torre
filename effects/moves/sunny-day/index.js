/* Sunny Day — calm sustained sunshine, NO explosion frames, NO attack/projectile.
 * V42.1: the sun and its gentle rays use ONLY the approved source sprite atlas.
 */
fireSpriteV41.add('sunnyday',{
 key:'sunnyDay',duration:4800,contact:false,status:true,weather:true,
 paint(g,f,t,ms,s,K){
  const {draw,ease,lerp}=K,A=f.from,B=f.to,TAU=Math.PI*2;
  const cx=(A[0]+B[0])*.5;
  const y=Math.max(65,Math.min(A[1],B[1])-138*s);
  const start=ease(t/.16),stop=1-ease((t-.86)/.14),alpha=start*stop;
  if(alpha<=.001)return;
  const pulse=1+.038*Math.sin(ms*.0025);
  // Animated concentric SUN HALO: ring frames, never fireburst/explosion sprites.
  draw(g,'spinRing',Math.floor(ms/130),cx,y,83*s*pulse,78*s*pulse,
       {alpha:alpha*.82});
  draw(g,'spinRing',Math.floor(ms/170)+4,cx,y,60*s,55*s,
       {alpha:alpha*.83,rotation:ms*.0002});
  draw(g,'flame',0,cx,y-3*s,49*s*pulse,55*s*pulse,
       {alpha:alpha*.75});
  // Subtle sunlight rays, each a tiny original flame sprite.
  for(let i=0;i<12;i++){
   const a=i*TAU/12+ms*.00014;
   const r=(58+4*Math.sin(ms*.002+i))*s;
   draw(g,'firebolt',Math.floor(ms/125)+i*2,
        cx+Math.cos(a)*r,y+Math.sin(a)*r*.78,
        15*s,27*s,{rotation:a+Math.PI/2,alpha:alpha*.63});
  }
  // Ground shimmer follows the arena, doesn't hit a Pokémon.
  for(let i=0;i<8;i++){
   const x=lerp(A[0]-52*s,B[0]+52*s,i/7);
   const yy=Math.max(A[1],B[1])+15*s+Math.sin(ms*.002+i)*3*s;
   draw(g,'spinRing',Math.floor(ms/165)+i,x,yy,
        42*s,16*s,{alpha:alpha*.12});
  }
 }
});
