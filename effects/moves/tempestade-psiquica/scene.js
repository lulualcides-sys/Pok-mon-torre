/* Psychic Storm: whirling psychic ribbons and crystal blades around the target. */
uniqueMoveFX.register(['Tempestade Psíquica'],({root,f})=>{
 const U=uniqueMoveFX,B=f.to,R='tempestade-psiquica/assets/';
 const bands=Array.from({length:5},()=>U.sprite(root,R+'storm-ribbon.svg',88,38));
 const shards=Array.from({length:14},()=>U.sprite(root,R+'storm-shard.svg',23,27));
 const hit=U.sprite(root,R+'storm-impact.svg',118,115);
 function draw(now,t){
  const power=U.smooth((t-.09)/.55),fade=1-U.smooth((t-.83)/.17);
  bands.forEach((sp,i)=>{const a=i*U.TAU/5+now*.003*(i%2?1:-1),r=21+power*20+(i%2)*8;
   sp.position.set(B[0]+Math.cos(a)*r,B[1]+Math.sin(a)*r*.68);
   sp.rotation=a;sp.alpha=power*fade*.76;
  });
  shards.forEach((sp,i)=>{const a=i*U.TAU/14+now*.004*(i%2?-1:1),r=18+i%5*11;
   sp.position.set(B[0]+Math.cos(a)*r,B[1]+Math.sin(a)*r*.74);
   sp.rotation=a+now*.001;sp.alpha=power*fade*.83;sp.scale.set(.55+power*.65);
  });
  hit.position.set(B[0],B[1]);hit.rotation=now*.002;
  hit.alpha=U.smooth((t-.37)/.36)*fade*.67;hit.scale.set(.43+power*.55);
 }
 return {draw,style:'psychic_storm_blades',assets:3};
});
uniqueMoveFX.preload(['tempestade-psiquica/assets/storm-ribbon.svg','tempestade-psiquica/assets/storm-shard.svg','tempestade-psiquica/assets/storm-impact.svg']);
