/* V67 Dragon Claw: three staggered contact swipes, not a purple generic projectile. */
(()=>{
 const {C,E,MIX,poly,stroke,oval,sparkle,ribbon,fragments,seed,TAU}=fidelityFourV67.art;
 fidelityFourV67.register(['catalog_dragonclaw'],'Dragon Claw',(g,f)=>{
  const {t,scale:s,to:dst,from:src,low}=f,fade=C((1-t)*8),x=dst[0],y=dst[1];
  const n=3;
  // wind-up draconic talon glyph that flows forward then tears three grooves
  for(let j=0;j<6;j++){let a=j*TAU/6+t*5;
   const rad=(10+28*E(t/.3))*s,p=[src[0]+Math.cos(a)*rad,src[1]+Math.sin(a)*rad*.66];
   sparkle(g,p[0],p[1],2.4*s,'#b28afa',(1-E((t-.22)/.2))*.7);
  }
  for(let j=0;j<n;j++){
   const q=E((t-.17-j*.10)/.47),offset=(j-1)*27*s;
   if(q<=0)continue;
   const x0=x-70*s+offset*.33,x1=x+56*s+offset*.33,top=y-70*s+offset,bot=y+62*s+offset;
   const p0=[x0,top],p1=[x-18*s,y+53*s+offset*.31],
     p2=[x+48*s,y-53*s+offset*.27],p3=[x1,bot];
   ribbon(g,p0,p1,p2,p3,q,(17+j*2.5)*s,
     ['#331063',j%2?'#8b50ed':'#a36bf8','#f3dfff'],fade);
   if(q>.48){let xx=x0+(x1-x0)*q,yy=top+(bot-top)*q;
     for(let k=0;k<3;k++){
       const rad=(7+k*8)*s;
       sparkle(g,xx+(k-1)*7*s,yy-7*s,rad*.24,'#f2dafa',fade*(1-q*.4));
     }
   }
  }
  if(t>.47){
   let q=E((t-.47)/.39);
   fragments(g,x,y,q,low?12:29,['#b787ff','#d0edff','#5b36ab','#ebdeff'],76*s);
   for(let j=0;j<5;j++){
    const angle=j*TAU/5+.6,rad=(10+q*53)*s;
    const from=[x+Math.cos(angle)*rad*.3,y+Math.sin(angle)*rad*.25];
    const to=[x+Math.cos(angle)*rad,y+Math.sin(angle)*rad];
    stroke(g,[from,to],j%2?'#975df2':'#d5b3ff',(5-j*.45)*s,fade*(1-q*.4),2*s);
   }
  }
 });
})();