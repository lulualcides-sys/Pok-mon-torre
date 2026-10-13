/* Confusion: mental rune spiral instead of a generic projectile. */
uniqueMoveFX.register(['Confusion'],({root,f})=>{
 const U=uniqueMoveFX,A=f.from,B=f.to,R='confusion/assets/';
 const frames=U.frameSet(R+'frames/ripple-',6);
 const pulse=Array.from({length:3},()=>U.sprite(root,R+'frames/ripple-0.svg',95,86));
 const motes=Array.from({length:9},()=>U.sprite(root,R+'thought-fragment.svg',20,20));
 const hit=U.sprite(root,R+'mind-impact.svg',96,88);
 pulse.forEach((sp,i)=>U.light(root,sp,{hue:i%2?0x9fbfff:0xf6aaff,shade:0x150b37,blur:3,strength:.36}));
 U.light(root,hit,{hue:0xe3a7ff,shade:0x1c0d3e,blur:4,strength:.30});
 function draw(now,t){
  const phase=U.smooth((t-.21)/.31),fade=1-U.smooth((t-.82)/.18);
  pulse.forEach((sp,i)=>{
   U.updateFrame(sp,frames,now,i*2,95);
   const q=U.smooth((t-i*.088)/.49);sp.position.set(U.lerp(A[0],B[0],q),U.lerp(A[1],B[1],q));
   sp.rotation=now*.0018*(i%2?1:-1);sp.scale.set(.46+q*.58);
   sp.alpha=fade*(1-U.smooth((t-i*.09-.52)/.31))*.78;
  });
  motes.forEach((sp,i)=>{const a=i*U.TAU/9+now*.0032*(i%2?1:-1),r=20+i%3*8;
   sp.position.set(B[0]+Math.cos(a)*r,B[1]+Math.sin(a)*r*.65);
   sp.rotation=a;sp.alpha=phase*fade*.76;
  });
  hit.position.set(B[0],B[1]);hit.rotation=now*.002;
  hit.alpha=phase*fade*.80;hit.scale.set(.49+phase*.51);
 }
 return {draw,style:'confusion_animated_runes',assets:3};
});
uniqueMoveFX.preload(['confusion/assets/mind-ripple.svg','confusion/assets/thought-fragment.svg','confusion/assets/mind-impact.svg']);
