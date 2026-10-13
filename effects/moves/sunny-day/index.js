/* Sunny Day — genuine fire-sprite sunlight above the arena; never a projectile. */
fireSpriteV41.add('sunnyday',{
 key:'sunnyDay',duration:4800,contact:false,status:true,weather:true,
 paint(g,f,t,ms,s,K){
  const {draw,ease,lerp}=K,A=f.from,B=f.to,TAU=Math.PI*2;
  const cx=(A[0]+B[0])*.5,top=Math.max(58,Math.min(A[1],B[1])-145*s);
  const appear=ease(t/.14),fade=1-ease((t-.83)/.17),alpha=appear*fade;
  if(alpha<=0)return;
  const swell=1+.08*Math.sin(ms*.0027),r=70*s*swell;
  // An expanding sun built by original fiery sprites, not Canvas circles/gradients.
  draw(g,'fireburst',Math.floor(ms/110),cx,top,
    110*s*swell,105*s*swell,{alpha:alpha*.96});
  draw(g,'explosion',Math.floor(ms/140),cx,top,
    80*s*swell,82*s*swell,{alpha:alpha*.67});
  for(let i=0;i<12;i++){
   const angle=i*TAU/12+ms*.00026;
   const ray=80*s+Math.sin(ms*.002+i*1.7)*8*s;
   const x=cx+Math.cos(angle)*ray,y=top+Math.sin(angle)*ray*.70;
   draw(g,'firebolt',Math.floor(ms/95)+i*2,x,y,
     (20+i%3*3)*s,(31+i%3*4)*s,
     {rotation:angle+Math.PI/2,alpha:alpha*(.70+.17*Math.sin(ms*.003+i))});
  }
  // Sunlight columns drifting across the actual battlefield.
  for(let i=0;i<11;i++){
   const q=i/10,x=lerp(A[0]-72*s,B[0]+72*s,q);
   const flicker=Math.sin(ms*.003+i*2.23);
   const y=lerp(A[1],B[1],q)-48*s+(flicker*11*s);
   draw(g,'flame',0,x,y,(15+i%3*4)*s,(24+i%3*4)*s,
      {rotation:Math.sin(ms*.002+i)*.23,alpha:alpha*(.25+.1*flicker)});
  }
  // Soft fire-ring flare across the field; source PNG only.
  for(let j=0;j<3;j++){
   const x=lerp(A[0],B[0],(.23+j*.27)),y=Math.max(A[1],B[1])+26*s;
   draw(g,'spinRing',Math.floor(ms/150)+j*3,x,y,
      (74+j*9)*s,(27+j*3)*s,{alpha:alpha*.22});
  }
 }
});
