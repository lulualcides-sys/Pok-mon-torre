/* Fire Blast — classic Pokémon 大 (dai) silhouette, constructed ONLY with the user's fire GIF sprites.
 * V42.2: compact and thicker animated flaming glyph travels as one shape. No generic spherical explosion.
 */
fireSpriteV41.add('fireblast',{
 key:'fireBlast',duration:1580,contact:false,
 paint(g,f,t,ms,s,K){
  const {draw,ease,lerp,clamp}=K,A=f.from,B=f.to;
  const dx=B[0]-A[0],dy=B[1]-A[1],dir=Math.atan2(dy,dx)-Math.PI/2;
  // Four brushstrokes reproduce the original giant "大": crossbar, center, left/right legs.
  // All strokes are stamped from animated ORIGINAL fire sprites, never Canvas paths.
  const strokes=[
   [[-.51,-.26],[.51,-.26]],
   [[0,-.64],[0,-.11]],
   [[0,-.12],[-.48,.60]],
   [[0,-.12],[.48,.60]]
  ];
  function glyph(cx,cy,growth,alpha,phase){
   if(alpha<=.008)return;
   const w=91*s*growth,h=98*s*growth;
   for(let k=0;k<strokes.length;k++){
    const [a,b]=strokes[k],vx=b[0]-a[0],vy=b[1]-a[1];
    const count=k===0?12:k===1?9:12;
    const angle=Math.atan2(vy*h,vx*w)-Math.PI/2;
    for(let j=0;j<=count;j++){
     const p=j/count,rx=lerp(a[0],b[0],p),ry=lerp(a[1],b[1],p);
     const x=cx+rx*w,y=cy+ry*h;
     // Stagger frame timing for animated blazing strokes; stable glyph outline.
     const frame=Math.floor(ms/76)+k*3+j*2;
     const bw=(35+(k===0?5:3))*s*growth,bh=43*s*growth;
     draw(g,'firebolt',frame,x,y,bw,bh,
      {alpha:alpha*(.82+.12*Math.sin(ms*.012+j)),rotation:angle});
     if(j%2===0)draw(g,'flame',0,x,y-4*s*growth,
      (17+(j%3)*2)*s*growth,28*s*growth,
      {alpha:alpha*.82,rotation:angle+.12*Math.sin(ms*.007+k)});
    }
   }
   // Fire core belongs to the glyph's junction, not a circular explosion.
   draw(g,'fireburst',Math.floor(ms/86),cx,cy-10*s*growth,
       28*s*growth,34*s*growth,{alpha:alpha*.76});
  }
  const charging=ease(t/.13);
  if(t<.17)draw(g,'flame',0,A[0]+dx*.025,A[1]+dy*.025,
       (27+17*charging)*s,(37+16*charging)*s,
       {rotation:dir,alpha:1-ease((t-.12)/.05)});
  // The actual Fire Blast travels AS the original kanji-shaped flame.
  if(t>=.12&&t<.62){
   const progress=ease((t-.12)/.48),x=lerp(A[0],B[0],progress),y=lerp(A[1],B[1],progress);
   glyph(x,y,.49+.24*progress,1-ease((t-.58)/.04)*.12,'travel');
   for(let j=1;j<=4;j++){
    const trail=clamp(progress-j*.082);
    if(trail<=0)continue;
    draw(g,'firebolt',Math.floor(ms/82)+j*4,
        lerp(A[0],B[0],trail),lerp(A[1],B[1],trail),
        (17+j*2)*s,(24+j*2)*s,{rotation:dir,alpha:.44-j*.07});
   }
  }
  // On contact the glyph grows, remains recognizable, then disperses.
  if(t>=.58){
   const enter=ease((t-.58)/.12),fade=1-ease((t-.86)/.13);
   const impact=clamp(enter*fade);
   glyph(B[0],B[1],.69+.17*enter,impact,'impact');
   if(t>.77&&t<.96){
    const scatter=ease((t-.77)/.18);
    const tips=[[-.43,-.23],[.43,-.23],[-.43,.49],[.43,.49],[0,-.52]];
    for(let i=0;i<tips.length;i++){
     const [px,py]=tips[i];
     draw(g,'firebolt',Math.floor(ms/69)+i*3,
         B[0]+px*(51+18*scatter)*s,
         B[1]+py*(57+17*scatter)*s,
         (20+9*scatter)*s,(26+10*scatter)*s,
         {alpha:fade*(.50-.08*scatter),rotation:dir+px});
    }
   }
  }
 }
});
