/* Vine Whip: illustrated, bending organic vines and scattered leaves. */
uniqueMoveFX.register(['Chicote de Vinha','Vine Whip'],({root,f})=>{
 const U=uniqueMoveFX,A=f.from,B=f.to,R='chicote-de-vinha/assets/';
 const angle=Math.atan2(B[1]-A[1],B[0]-A[0]),len=Math.hypot(B[0]-A[0],B[1]-A[1]);
 const nx=-Math.sin(angle),ny=Math.cos(angle);
 const whips=Array.from({length:2},()=>U.sprite(root,R+'vine-whip.svg',35,45));
 const leaves=Array.from({length:9},()=>U.sprite(root,R+'vine-leaf.svg',20,18));
 const hit=U.sprite(root,R+'vine-impact.svg',83,78);
 whips.forEach(sp=>sp.anchor.set(0,.5));
 function draw(now,t){
  whips.forEach((sp,i)=>{const start=.12+i*.22,q=U.smooth((t-start)/.39),fade=1-U.smooth((t-start-.45)/.17),off=i?10:-10;
   sp.position.set(A[0]+nx*off,A[1]+ny*off);
   sp.rotation=angle+(i?.055:-.06)+Math.sin(now*.009+i)*.028;
   sp.width=Math.max(1,len*q);sp.height=42+Math.sin(now*.012+i)*4;
   sp.alpha=U.smooth((t-start)/.10)*fade*.95;
  });
  const impact=U.smooth((t-.55)/.30),fade=1-U.smooth((t-.86)/.14);
  hit.position.set(B[0],B[1]);hit.rotation=angle;
  hit.alpha=impact*fade*.94;hit.scale.set(.50+impact*.55);
  leaves.forEach((sp,i)=>{const a=i*2.399+now*.003,r=10+impact*(14+i%4*6);
   sp.position.set(B[0]+Math.cos(a)*r,B[1]+Math.sin(a)*r*.75);
   sp.rotation=a;sp.alpha=impact*fade*.79;
  });
 }
 return {draw,style:'organic_vine_whip',assets:3};
});
uniqueMoveFX.preload(['chicote-de-vinha/assets/vine-whip.svg','chicote-de-vinha/assets/vine-leaf.svg','chicote-de-vinha/assets/vine-impact.svg']);
