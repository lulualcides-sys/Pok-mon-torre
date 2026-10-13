/* Will-O-Wisp — ONLY spectral blue source sprites.
 * V42.1: attached to the ENEMY for the whole animation, follows enemy movement.
 * No incoming fireball, old generic overlay, orange flash or explosion.
 */
fireSpriteV41.add('willowisp',{
 key:'willOWisp',duration:3300,contact:false,status:true,stickToTarget:true,
 paint(g,f,t,ms,s,K){
  const {draw,ease}=K,B=f.to,TAU=Math.PI*2;
  const on=ease(t/.035),off=1-ease((t-.94)/.06);
  const alpha=on*off;
  if(alpha<=.001)return;
  // Central spectral fire is always above the foe, not beside the caster.
  const bob=Math.sin(ms*.005)*5*s;
  draw(g,'flame',0,B[0],B[1]-17*s+bob,39*s,54*s,
    {blue:true,alpha:alpha*.96,rotation:Math.sin(ms*.003)*.09});
  draw(g,'firebolt',Math.floor(ms/94),B[0],B[1]-30*s+bob,
    27*s,33*s,{blue:true,alpha:alpha*.83});
  // Small blue wisps stay attached to the opponent's upper body until expiry.
  for(let i=0;i<5;i++){
   const angle=(i*TAU/5)+ms*.00175;
   const spread=(22+5*Math.sin(ms*.003+i))*s;
   const x=B[0]+Math.cos(angle)*spread;
   const y=B[1]-10*s+Math.sin(angle)*spread*.45+bob*.35;
   const size=(19+(i%2)*5)*s;
   draw(g,'flame',0,x,y,size,size*1.32,
     {blue:true,alpha:alpha*(.69+.19*Math.sin(ms*.011+i)),rotation:Math.sin(ms*.004+i)*.13});
   draw(g,'firebolt',Math.floor(ms/92)+i*3,x,y-6*s,
      size*.73,size*.86,{blue:true,alpha:alpha*.69});
  }
  // Residual blue ring keeps the status anchored visually to the enemy.
  draw(g,'spinRing',Math.floor(ms/120),B[0],B[1]+15*s,62*s,27*s,
     {blue:true,alpha:alpha*.53});
 }
});
