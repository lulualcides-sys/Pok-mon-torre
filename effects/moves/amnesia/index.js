/* Amnesia — psychic STATUS effect using the already-approved original
 * purple psychic pixel sheet. Stay on the caster, no launch/no enemy damage VFX.
 */
waterSpriteV43.add('amnesia',{
 key:'amnesia',duration:1620,contact:false,status:true,selfTarget:true,
 paint(g,f,t,ms,s,K){
  const {mind,ease}=K,A=f.from,TAU=Math.PI*2;
  const appear=ease(t/.16),fade=1-ease((t-.82)/.18),alpha=appear*fade;
  if(alpha<.02)return;
  const bx=A[0],by=A[1]-14*s;
  // Three small thoughts expand/contract around the caster's head.
  for(let i=0;i<4;i++){
   const a=i*TAU/4+ms*.00165;
   const rad=(19+9*Math.sin(Math.min(1,t)*Math.PI)+i*2)*s;
   const x=bx+Math.cos(a)*rad;
   const y=by-15*s+Math.sin(a)*rad*.66;
   mind(g,[0,2,4,6][i],x,y,(27+(i%2)*5)*s,
        (27+(i%2)*5)*s,{alpha:alpha*(.83-i*.09),rotation:a*.22});
  }
  // Original hand-drawn halo frames around the user's head (not an explosion).
  const pulse=.89+.10*Math.sin(ms*.009);
  mind(g,4,bx,by-21*s,49*s*pulse,46*s*pulse,
    {alpha:alpha*.79,rotation:ms*.0008});
  if(t>.48){
   const rise=ease((t-.48)/.26);
   for(let i=0;i<3;i++){
    const x=bx+(i-1)*20*s;
    mind(g,8+(Math.floor(ms/105)+i)%6,x,
      by-29*s-(22+15*i)*rise*s,21*s,23*s,
      {alpha:alpha*.52,rotation:i*.22});
   }
  }
 }
});
