/* Dragon Pulse V68 — reference: purple/magenta continuous energy lance.
 * Separate charging core, travelled beam, pink helical waves and luminous impact.
 * Never draw a snake, dragon head or static polygon as the projectile.
 */
(()=>{
 'use strict';
 const {C,E,MIX,TAU,poly,stroke,oval,sparkle,radial,flare,beam,halo,sparks,spinRing,seed}=fidelityFourV68.art;
 fidelityFourV68.register(['catalog_dragonpulse'],'Dragon Pulse',(g,f)=>{
  const {t,scale:s,from:src,to:dst,at,ux,ny,low}=f;
  const charge=E(t/.27),extend=E((t-.24)/.48),contact=E((t-.70)/.16),fade=1-E((t-.86)/.14);
  // The pulsing launcher stays dark-violet, surrounded by magenta star rays.
  const launch=[src[0]+ux[0]*9*s,src[1]+ux[1]*9*s];
  radial(g,launch[0],launch[1],(21+charge*24)*s,'#7c19ef',(.3+charge*.35)*fade);
  for(let k=0;k<8;k++){
   const a=k*TAU/8+t*4.3,R=(11+12*charge+Math.sin(t*22+k)*3)*s;
   const p=[launch[0]+Math.cos(a)*R,launch[1]+Math.sin(a)*R];
   stroke(g,[p,[launch[0]+Math.cos(a+.20)*R*.27,launch[1]+Math.sin(a+.20)*R*.27]],
        k%2?'#cc5dff':'#f4bcff',1.65*s,charge*fade*.85,0);
  }
  oval(g,launch[0],launch[1],(4+charge*10)*s,(4+charge*10)*s,'#180530',(.55+charge*.40)*fade,'#07021d',2.2*s);
  if(charge>.35){
    flare(g,launch[0],launch[1],(4+charge*8)*s,'#f7a7ff',charge*fade*.87);
  }
  // One persistent, clean shaft: do not turn a special attack into a cartoon animal.
  if(extend>.002){
   const traveled=C(extend),stop=at(traveled);
   const a=[src[0]+ux[0]*13*s,src[1]+ux[1]*13*s];
   const width=(7.7+2.1*Math.sin(t*33))*s;
   beam(g,a,stop,width,['#6211d4','#df4bff','#fff4ff'],fade*(1-contact*.45));
   // Flame-like plasma filaments hug the edges and travel along the shaft.
   for(let j=0;j<(low?12:23);j++){
    const q=(j+.3)/24,reach=traveled-q*.04;if(reach<=0||reach>=traveled+.1)continue;
    const p=at(reach);
    const wobble=(8.5+5*seed(j+17))*Math.sin(t*42+j*2.9)*s;
    const pp=[p[0]+ny[0]*wobble,p[1]+ny[1]*wobble];
    radial(g,pp[0],pp[1],(4.6+4*seed(j+41))*s,j%3?'#ca36ff':'#ef9afe',.22*fade);
    const r=2+3*seed(j*13+2);
    sparkle(g,pp[0],pp[1],r*s,j%2?'#e7b6ff':'#fcddff',fade*.69);
   }
   // Multiple staggered perspective coils form the moving concentric pulses from reference.
   for(let j=0;j<5;j++){
    let position=traveled-.085-j*.135;
    if(position<=0||position>traveled)continue;
    let p=at(position),sz=(16+7*Math.sin(t*TAU*4+j*1.4))*s;
    radial(g,p[0],p[1],sz*1.6,'#ad27ff',fade*.16);
    spinRing(g,p,ux,sz,t*16+j*.9,fade*(.8-j*.10),j%2?'#fdadff':'#db46ff');
   }
   // Fine serpentine electric tendrils ONLY around the beam, not a dragon-shaped blob.
   for(let side of [-1,1]){
     const pts=[];
     for(let j=0;j<=24;j++){
      const q=traveled*j/24,p=at(q),off=side*(8+5.0*Math.sin(q*27-t*37))*s;
      pts.push([p[0]+ny[0]*off,p[1]+ny[1]*off]);
     }
     stroke(g,pts,side>0?'#f176ff':'#a74bff',1.55*s,fade*.67,0);
   }
   const tip=stop;
   radial(g,tip[0],tip[1],(14+8*Math.sin(t*26)**2)*s,'#ee7cff',fade*.72);
   flare(g,tip[0],tip[1],5.2*s,'#f9c4ff',fade*.8);
  }
  if(t>.68){
   const hit=E((t-.68)/.20);
   // Point of collision blossoms in several light planes, not just a white circle.
   radial(g,dst[0],dst[1],(16+65*hit)*s,'#c322ff',(.67-.34*hit)*fade);
   radial(g,dst[0],dst[1],(5+23*hit)*s,'#ffb4ff',(.74-.20*hit)*fade);
   if(hit<.94)flare(g,dst[0],dst[1],(8+22*hit)*s,'#ffe6ff',(1-hit*.48)*fade);
   for(let j=0;j<3;j++){
    const r=(13+hit*(22+j*14))*s;
    halo(g,dst[0],dst[1],r,(1-hit*.45)*fade*.80,j%2?'#e06eff':'#ffcaff',.65+j*.09);
   }
   sparks(g,dst[0],dst[1],hit,low?14:34,['#f2a3ff','#e348ff','#fff1ff','#8d55ff'],82*s,t*9);
  }
 });
})();