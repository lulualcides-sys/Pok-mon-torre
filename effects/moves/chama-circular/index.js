/* Chama Circular — redemoinho + anéis do GIF fornecido. */
fireSpriteV41.add('chamacircular',{
 key:'circular',duration:1490,contact:false,
 paint(g,f,t,ms,s,K){
  const {draw,ease,lerp}=K,A=f.from,B=f.to,TAU=Math.PI*2;
  const start=ease((t-.05)/.22),active=ease((t-.18)/.15)*(1-ease((t-.85)/.15));
  if(t<.38){
   const x=lerp(A[0],B[0],start),y=lerp(A[1],B[1],start);
   draw(g,'firebolt',Math.floor(ms/85),x,y,37*s,44*s,{alpha:1-ease((t-.32)/.06)});
  }
  if(active<=0)return;
  // Original animated flame funnel stays centred over the enemy.
  draw(g,'funnel',0,B[0],B[1]-25*s,76*s,98*s,
       {alpha:active*.91,flipX:(Math.floor(ms/140)%2)===1});
  for(let ring=0;ring<4;ring++){
   const height=(ring-1.6)*22*s;
   const radius=(25+ring*6)*s;
   for(let j=0;j<9;j++){
    const a=(ms*.0065)*(ring%2?-1:1)+j*TAU/9+ring*.44;
    const x=B[0]+Math.cos(a)*radius,y=B[1]+height+Math.sin(a)*radius*.37;
    draw(g,'spinRing',Math.floor(ms/71)+j*2+ring*3,x,y,
      (27+ring*2)*s,(24+ring*2)*s,
      {alpha:active*(.84-ring*.05),rotation:a*.12});
   }
  }
  draw(g,'spinRing',Math.floor(ms/68),B[0],B[1]+27*s,75*s,41*s,{alpha:active*.91});
  const finish=ease((t-.76)/.13)*(1-ease((t-.97)/.03));
  if(finish>0)draw(g,'explosionBurst',Math.floor((t-.76)*42),B[0],B[1],
    81*s,87*s,{alpha:finish*.88});
 }
});
