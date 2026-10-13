/* TROVÃO V47 — cinematic ONE colossal sky bolt landing on the target.
 * Crisp white-hot yellow core with branches and bright target explosion
 * (electrical impact sprite, never circular Canvas primitives).
 */
electricSpriteV46.add('trovao',{
 key:'thunder',duration:2100,contact:false,giantBolt:true,followTarget:true,
 paint(g,f,t,ms,s,K){
  const {stamp,burst,ease,clamp}=K,B=f.to,TAU=Math.PI*2;
  const top=Math.max(40*s,B[1]-248*s);
  const charge=ease(t/.24),fade=1-ease((t-.88)/.12);
  if(t<.97){
   stamp(g,'storm-cloud',B[0],top-18*s,(230+18*charge)*s,97*s,
    {alpha:charge*fade*(.66+.10*Math.sin(ms*.011))});
   for(let j=0;j<6;j++){
    const a=j*TAU/6+ms*.0022,rr=(27+6*charge)*s;
    stamp(g,'spark',B[0]+Math.cos(a)*rr,top+31*s+Math.sin(a)*15*s,
     (19+j%2*5)*s,(27+j%3*4)*s,
     {alpha:charge*fade*(.35+.31*Math.sin(ms*.013+j)**2),rotation:a});
   }
  }
  if(t>.26&&t<.91){
   const strike=ease((t-.26)/.11)*(1-ease((t-.70)/.17));
   const jitter=Math.sin(ms*.039)*4*s;
   const lightningHeight=(B[1]-top+53*s)*ease((t-.26)/.16);
   const y=top-8*s+lightningHeight*.5;
   // Every 70ms the main bolt switches to a DIFFERENT authored sprite frame.
   // The lightning really animates; it is not a static CSS/PNG silhouette.
   const frames=['bolt-a','bolt-fork','bolt-shatter','bolt-b'];
   const frame=frames[Math.floor(ms/70)%frames.length];
   stamp(g,frame,B[0]+jitter,y,116*s,lightningHeight,
    {alpha:strike*.98,additive:true});
   stamp(g,Math.floor(ms/88)%2?'bolt-c':'bolt-fork',B[0]+12*s-jitter*.5,y,73*s,lightningHeight*.95,
    {alpha:strike*.78,flipX:true,additive:true});
   for(let j=0;j<3;j++){
    const horizontal=(j-1)*59*s;
    const px=B[0]+horizontal,py=top+(j+1)*45*s;
    stamp(g,'arc',px,py,(54+j*10)*s,(22+j%2*6)*s,
     {rotation:(j-1)*.59,alpha:strike*(.48+j*.13)});
   }
   burst(g,B[0],B[1],ms,s,strike*.98,1.55);
   for(let j=0;j<11;j++){
    const a=j*TAU/11+ms*.0042,rad=(47+j%4*8)*s;
    stamp(g,'spark',B[0]+Math.cos(a)*rad,B[1]+Math.sin(a)*rad*.64,
     (17+j%3*5)*s,(23+j%2*8)*s,
     {alpha:strike*(.90-j*.041),rotation:a});
   }
  }
  if(t>.77){
   const residue=ease((t-.77)/.10)*(1-ease((t-.91)/.09));
   for(let j=0;j<7;j++){
    const a=j*TAU/7-ms*.002;
    stamp(g,'spark',B[0]+Math.cos(a)*53*s,B[1]+Math.sin(a)*36*s,
     (19+j%2*5)*s,(24+j%3*6)*s,{alpha:residue*.62,rotation:a});
   }
  }
 }
});
