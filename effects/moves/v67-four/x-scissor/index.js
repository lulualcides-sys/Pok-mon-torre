/* V67 X-Scissor / Corte X: two successive crossing scythe blades and impact shatter. */
(()=>{
 const A=fidelityFourV67.art,{C,E,MIX,poly,stroke,oval,sparkle,ribbon,fragments,seed,TAU}=A;
 fidelityFourV67.register(['catalog_xscissor','catalog_cortex'],'X-Scissor / Corte X',(g,f)=>{
  const {to:dst,t,scale:s,now,low}=f,x=dst[0],y=dst[1],q1=E((t-.09)/.39),q2=E((t-.29)/.42);
  const fade=C((1-t)*7);
  // wind-up: cutting wind rises from the striker to the target, one leaf glint at a time
  for(let i=0;i<9;i++){
   const q=C((t-.01-i*.023)/.3),x0=x-74*s+i*13*s,y0=y+50*s-i*11*s;
   if(q>0){stroke(g,[[x0-23*s*q,y0+7*s],[x0+11*s*q,y0-8*s]],i%2?'#83d733':'#d5ff6c',1.5*s,C((1-t)*2)*(.24+.40*q),0)}
  }
  const p1=[[-83,65],[-24,-74],[38,86],[89,-63]].map(p=>[x+p[0]*s,y+p[1]*s]);
  const p2=[[-80,-66],[-36,83],[50,-82],[87,71]].map(p=>[x+p[0]*s,y+p[1]*s]);
  if(t>.05){
   ribbon(g,...p1,q1,20*s,['#126535','#7ded38','#f3ffb4'],fade);
   // carbon-black outer tip and multiple separate emerald after-cuts
   if(q1>.2) for(let i=0;i<3;i++){
    const u=C(q1-i*.09),xx=x+(-71+142*u)*s,yy=y+(61-122*u)*s;
    sparkle(g,xx+(i-1)*5*s,yy,3.3*s,'#9bfd64',fade*.55);
   }
  }
  if(t>.24){
   ribbon(g,...p2,q2,23*s,['#0b542d','#97f842','#f2ffcf'],fade);
   if(q2>.35)stroke(g,[[x-46*s,y+42*s],[x+29*s,y-31*s]],'#f6fff4',1.6*s,fade*.50,0);
  }
  if(t>.46){
   const shock=E((t-.46)/.29);
   const r=(12+69*shock)*s;
   for(let a=0;a<4;a++) {
    let z=a*Math.PI/2+.42;
    stroke(g,[[x+Math.cos(z)*r*.38,y+Math.sin(z)*r*.4],
      [x+Math.cos(z)*r,y+Math.sin(z)*r*.87]],a%2?'#e0ff7b':'#40dc59',4.5*s*(1-shock*.5),fade*(1-shock*.45),2);
   }
   fragments(g,x,y,shock,low?10:23,['#dfff8e','#43e752','#c4f878','#f2ffb1'],88*s);
  }
  if(t>.8){sparkle(g,x,y,9*s,'#f8fff1',(1-t)*4)}
 });
})();