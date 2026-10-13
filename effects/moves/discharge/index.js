/* DISCHARGE V47 — a growing radial ELECTRIC FIELD around the caster.
 * Several electric arc sprites expand at differing speeds, followed by a
 * small target crackle. Unlike Thunder, there are NO falling sky bolts.
 */
electricSpriteV46.add('discharge',{
 key:'discharge',duration:1550,contact:false,area:true,followTarget:true,
 paint(g,f,t,ms,s,K){
  const {stamp,between,burst,ease,clamp}=K,A=f.from,B=f.to;
  const TAU=Math.PI*2;
  const charge=ease(t/.17),spread=ease((t-.10)/.59);
  const fade=1-ease((t-.85)/.15);
  if(t<.31){
   for(let i=0;i<9;i++){
    const a=i*TAU/9+ms*.007;
    stamp(g,'spark',A[0]+Math.cos(a)*(23+13*charge)*s,
      A[1]+Math.sin(a)*(22+13*charge)*s,
      (18+i%3*4)*s,(22+i%2*5)*s,
      {rotation:a,alpha:(1-ease((t-.23)/.08))*charge*.83});
   }
  }
  if(t>.095&&t<.97){
   const ringR=(34+185*spread)*s;
   const forks=12;
   for(let j=0;j<forks;j++){
    const a=j*TAU/forks+(j%2?.026:-.026)*Math.sin(ms*.010+j);
    const inner=(24+35*spread)*s,outer=ringR*(.85+.15*Math.sin(ms*.004+j*2.5));
    const x1=A[0]+Math.cos(a)*inner,y1=A[1]+Math.sin(a)*inner;
    const x2=A[0]+Math.cos(a)*outer,y2=A[1]+Math.sin(a)*outer;
    between(g,(Math.floor(ms/100)+j)%5===0?'bolt-fork':'arc',x1,y1,x2,y2,(22+j%3*5)*s,
      {alpha:fade*(.86-j*.028),flipX:j%2===0});
    // A second jagged branch breaks off each alternate arc.
    if(j%2===0){
     const side=a+(.21+.15*Math.sin(ms*.007+j));
     stamp(g,'spark',x2+Math.cos(side)*12*s,y2+Math.sin(side)*13*s,
       29*s,35*s,{alpha:fade*.63,rotation:side});
    }
   }
   burst(g,A[0],A[1],ms,s,fade*(.45+.25*Math.sin(ms*.014)**2),.72);
   for(let j=0;j<8;j++){
    const a=j*TAU/8+ms*.009,rr=ringR*(.67+.07*Math.sin(ms*.008+j));
    stamp(g,'spark',A[0]+Math.cos(a)*rr,A[1]+Math.sin(a)*rr,
      (16+j%3*5)*s,(22+j%2*4)*s,{alpha:fade*.58,rotation:a});
   }
  }
  if(t>.46){
   const hit=ease((t-.46)/.12)*(1-ease((t-.82)/.18));
   burst(g,B[0],B[1]-11*s,ms,s,hit*.70,.8);
   for(let i=0;i<5;i++){
    const a=i*TAU/5+ms*.006;
    stamp(g,'spark',B[0]+Math.cos(a)*27*s,B[1]+Math.sin(a)*22*s,
     16*s,22*s,{alpha:hit*.75,rotation:a});
   }
  }
 }
});
