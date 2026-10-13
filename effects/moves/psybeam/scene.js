/* Psybeam: animated prismatic sprite sheet style, compact luminous beam. */
uniqueMoveFX.register(['Psybeam','Psy Beam'],({root,f})=>{
 const U=uniqueMoveFX,A=f.from,B=f.to,R='psybeam/assets/';
 const angle=Math.atan2(B[1]-A[1],B[0]-A[0]),len=Math.hypot(B[0]-A[0],B[1]-A[1]);
 const frames=U.frameSet(R+'frames/beam-',6);
 const rays=Array.from({length:3},()=>U.sprite(root,R+'frames/beam-0.svg',40,22));
 const sparks=Array.from({length:9},()=>U.sprite(root,R+'prism-flare.svg',18,18));
 const hit=U.sprite(root,R+'prism-impact.svg',84,81);
 rays.forEach((sp,i)=>{sp.anchor.set(0,.5);
  U.light(root,sp,{hue:i===1?0xfcd3ff:0x90eeff,shade:0x210d3d,blur:3.3,strength:.38,dx:2,dy:3});
 });
 U.light(root,hit,{hue:0xe8b9ff,shade:0x150937,blur:3.9,strength:.35});
 function draw(now,t){
  const q=U.smooth((t-.17)/.55),fade=1-U.smooth((t-.85)/.15);
  rays.forEach((sp,i)=>{U.updateFrame(sp,frames,now,i,78);sp.rotation=angle;
   sp.position.set(A[0]-Math.sin(angle)*(i-1)*4,A[1]+Math.cos(angle)*(i-1)*4);
   sp.width=Math.max(1,len*q);sp.height=[32,21,13][i]+Math.sin(now*.012+i)*2;
   sp.alpha=U.smooth((t-.17)/.14)*fade*[.92,.55,.41][i];
  });
  sparks.forEach((sp,i)=>{const p=U.clamp(q-i*.07),o=Math.sin(now*.011+i*2)*9;
   sp.position.set(U.lerp(A[0],B[0],p)-Math.sin(angle)*o,U.lerp(A[1],B[1],p)+Math.cos(angle)*o);
   sp.rotation=now*.003*(i%2?1:-1);sp.alpha=U.smooth((t-.20)/.14)*fade*.75;
  });
  const v=U.smooth((t-.64)/.28);
  hit.position.set(B[0],B[1]);hit.rotation=now*.002;
  hit.alpha=v*(1-U.smooth((t-.88)/.12))*.90;hit.scale.set(.52+.53*v);
 }
 return {draw,style:'psybeam_prismatic_sprites',assets:3};
});
uniqueMoveFX.preload(['psybeam/assets/prism-ray.svg','psybeam/assets/prism-flare.svg','psybeam/assets/prism-impact.svg']);
