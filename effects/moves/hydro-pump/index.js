/* HYDRO PUMP V44.2 — TWO MATCHING THIN JETS that visibly JOIN before impact.
 * The water is drawn solely by repeated ORIGINAL-style pixel-art sprite frames,
 * with animated water flecks from the user's source water atlas. Never a line,
 * gradient, CSS laser, thick single beam or unrelated bubble cloud.
 * Damage, cooldowns and enemy AI remain controlled by the battle engine.
 */
const hydroJetV442=new Image();
hydroJetV442.decoding='async';
hydroJetV442.src='effects/moves/hydro-pump/jet.svg?v=44.2';
waterSpriteV43.add('hydropump',{
 key:'hydroPump',duration:1610,beam:true,contact:false,
 twinStream:true,followTarget:true,pressureStream:true,
 paint(g,f,t,ms,s,K){
  const {draw,ease,lerp,clamp}=K,A=f.from,B=f.to;
  const dx=B[0]-A[0],dy=B[1]-A[1],distance=Math.hypot(dx,dy)||1;
  const ux=dx/distance,uy=dy/distance,nx=-uy,ny=ux;
  const head=ease((t-.09)/.40);
  const fade=1-ease((t-.86)/.14);
  const TAU=Math.PI*2,joinAt=.84;
  const thickness=(16+1.6*Math.sin(ms*.012))*s;
  if(!hydroJetV442.naturalWidth)return;
  // Symmetric start points around the attacking Pokemon; both jets are
  // IDENTICAL size. Their separation decreases smoothly to ZERO at joinAt.
  function point(u,side){
   const converge=1-ease((u-.47)/(.84-.47));
   const sway=Math.sin(ms*.014-u*TAU*2.1)*2.7*s;
   const offset=side*converge*(19*s+sway);
   return [lerp(A[0],B[0],u)+nx*offset,
           lerp(A[1],B[1],u)+ny*offset];
  }
  function stampSegment(a,b,width,alpha,phase){
   const vx=b[0]-a[0],vy=b[1]-a[1],len=Math.hypot(vx,vy);
   if(len<.25)return;
   g.save();
   g.translate(a[0],a[1]);
   g.rotate(Math.atan2(vy,vx));
   g.imageSmoothingEnabled=false;
   g.globalAlpha=clamp(alpha);
   const sx=(Math.floor(phase)+160)%32;
   // Each sprite strip overlaps the next, so each jet is CONTINUOUS.
   g.drawImage(hydroJetV442,sx,0,128,58,
     -2*s,-width*.5,len+4*s,width);
   g.restore();
  }
  if(t<.25){
   const pulse=ease(t/.16)*(1-ease((t-.19)/.06));
   for(const side of [-1,1]){
    const p=point(0,side);
    draw(g,7,p[0],p[1],(23+12*pulse)*s,(26+9*pulse)*s,
      {alpha:pulse*.70,rotation:Math.atan2(dy,dx)+.7});
   }
  }
  if(t>.09&&t<.98){
   const ends=Math.min(joinAt,head);
   const sections=13;
   // TWO separate thin streams, mirrored but synchronized, that CONVERGE.
   for(const side of [-1,1]){
    for(let i=0;i<sections;i++){
     const a=joinAt*i/sections,b=Math.min(joinAt*(i+1)/sections,ends);
     if(a>=ends||b<=a)break;
     const p0=point(a,side),p1=point(b,side);
     const alpha=fade*(.91+.07*Math.sin(ms*.014-i));
     stampSegment(p0,p1,thickness,alpha,ms*.12+i*19);
    }
    // Tiny source-sheet water flecks travel ALONG each individual stream.
    for(let j=0;j<4;j++){
     const u=((ms*.00055+j*.25)%1)*ends;
     const p=point(u,side);
     draw(g,13+((Math.floor(ms/105)+j)%5),p[0],p[1],
       11*s,15*s,{alpha:fade*.43,rotation:Math.atan2(dy,dx)});
    }
   }
   // From the connection point to the enemy they form ONE short shared jet.
   // There is no duplicated thick beam across the battlefield.
   if(head>joinAt){
    const common=point(joinAt,1),end=point(head,1);
    stampSegment(common,end,(19+2*Math.sin(ms*.009))*s,
      fade*.96,ms*.15+47);
    draw(g,7,common[0],common[1],23*s,23*s,
      {alpha:fade*.75,rotation:Math.atan2(dy,dx)});
   }
  }
  // Shared water collision at the enemy. Never fire/explosion art.
  if(t>.48){
   const impact=ease((t-.48)/.12)*(1-ease((t-.88)/.12));
   if(impact>.01){
    draw(g,7,B[0],B[1]-11*s,76*s,79*s,
      {alpha:impact*.90,rotation:Math.atan2(dy,dx)+.5});
    for(let j=0;j<5;j++){
     const spread=(j-2)*17*s;
     draw(g,5+((Math.floor(ms/83)+j)%5),
       B[0]+nx*spread,B[1]+ny*spread-10*s-(j%2)*11*s,
       (34+j%2*11)*s,(42+j%2*10)*s,
       {alpha:impact*(.78-j*.10),flipX:j%2===0});
    }
   }
  }
 }
});
