/* TEMPESTADE DE RAIOS V47 — multi-strike sky-to-ground lightning storm.
 * A dark authored pixel cloud and separately timed jagged bolts appear above
 * the opponent. NOT the same animation as a single giant Trovão.
 */
electricSpriteV46.add('tempestadederaios',{
 key:'thunderstorm',duration:2450,contact:false,storm:true,followTarget:true,
 paint(g,f,t,ms,s,K){
  const {stamp,burst,ease,clamp}=K,A=f.from,B=f.to;
  const TAU=Math.PI*2,top=Math.max(48*s,B[1]-199*s);
  const appear=ease(t/.15),fade=1-ease((t-.88)/.12);
  if(t<.95){
   const cloudDrift=Math.sin(ms*.0017)*5*s;
   stamp(g,'storm-cloud',B[0]+cloudDrift,top-19*s,
    (264+11*Math.sin(ms*.004))*s,111*s,
    {alpha:appear*fade*.91});
   for(let i=0;i<5;i++){
    const px=B[0]+(i-2)*43*s+Math.sin(ms*.006+i)*7*s;
    stamp(g,'spark',px,top+37*s,(17+i%2*7)*s,(23+i%3*6)*s,
     {alpha:appear*fade*(.32+.34*Math.max(0,Math.sin(ms*.012+i*3))),rotation:i*.6});
   }
  }
  const strikes=[
   {at:.14,x:-64,kind:'bolt-b',w:59,d:.20},
   {at:.30,x:41,kind:'bolt-fork',w:69,d:.22},
   {at:.47,x:-26,kind:'bolt-shatter',w:78,d:.24},
   {at:.64,x:66,kind:'bolt-b',w:61,d:.19},
   {at:.75,x:0,kind:'bolt-fork',w:91,d:.18}
  ];
  for(let i=0;i<strikes.length;i++){
   const z=strikes[i],p=ease((t-z.at)/.075),gone=1-ease((t-z.at-z.d)/.055);
   const alpha=clamp(p*gone)*fade;
   if(alpha<=.012)continue;
   const bx=B[0]+z.x*s+Math.sin(ms*.024+i)*4*s;
   const by=B[1]+(i%2?6:-9)*s;
   const height=(by-top+42*s)*p;
   const cy=top-29*s+height*.50;
   stamp(g,(Math.floor(ms/92)+i)%4===0?'bolt-shatter':z.kind,bx,cy,z.w*s,Math.max(4*s,height),
    {alpha:alpha*.97,flipX:i%2===0,additive:true});
   burst(g,bx,by,ms+i*83,s,alpha*.93,1.05);
   for(let j=0;j<5;j++){
    const a=j*TAU/5+ms*.005+i;
    stamp(g,'spark',bx+Math.cos(a)*47*s,by+Math.sin(a)*23*s,
     (20+j%2*5)*s,(26+j%3*4)*s,
     {alpha:alpha*(.78-j*.095),rotation:a});
   }
  }
 }
});
