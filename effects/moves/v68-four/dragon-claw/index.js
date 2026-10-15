/* Dragon Claw V68 — physical triple-taloned contact strike.
 * The claws land near the opponent; no beam or snake-shaped projectile.
 */
(()=>{
 'use strict';
 const {C,E,MIX,TAU,poly,stroke,oval,sparkle,ribbon,radial,flare,sparks,seed}=fidelityFourV68.art;
 fidelityFourV68.register(['catalog_dragonclaw'],'Dragon Claw',(g,f)=>{
  const {t,scale:s,from:src,to:dst,ux,ny,low}=f,fade=1-E((t-.86)/.14),contact=E((t-.48)/.28);
  const x=dst[0],y=dst[1],chase=E((t-.01)/.29);
  // An opening claw-shaped vortex at the attacker forms three leading talons.
  for(let j=0;j<3;j++){
   const q=E((t-.02-j*.04)/.22),off=(j-1)*12*s;
   const ax=MIX(src[0],x-64*s,chase),ay=MIX(src[1],y,chase)+off;
   if(q<=0)continue;
   radial(g,ax,ay,18*s,'#8249eb',q*fade*.23);
   const p=[[ax-18*s,ay+17*s],[ax+5*s,ay-17*s],[ax+16*s,ay-36*s],[ax+24*s,ay-41*s]];
   stroke(g,p,'#b58afa',(2.4+j*.5)*s,q*fade*.62,1*s);
   sparkle(g,ax+24*s,ay-41*s,2.3*s,'#f1dbff',q*fade);
  }
  // Three intentionally non-identical hooked claw shapes scratch across the enemy.
  for(let j=0;j<3;j++){
   const q=E((t-.23-j*.087)/.41);
   if(q<=.002)continue;
   const yy=(j-1)*22*s;
   const a=[
     [x-69*s,y-69*s+yy],
     [x-27*s,y-18*s+yy+8*s],
     [x+28*s,y+35*s+yy-9*s],
     [x+47*s,y+60*s+yy]
   ];
   ribbon(g,...a,q,(17+j%2*4)*s,
    ['#1b0b4a',j%2?'#8244de':'#a75bf4','#f2d0ff'],fade);
   // Jagged violet claw afterimage streaks (different timing and shapes per talon).
   const edgeX=MIX(a[0][0],a[3][0],q),edgeY=MIX(a[0][1],a[3][1],q);
   if(q>.18){
    const len=(8+q*24)*s;
    stroke(g,[[edgeX-len*.9,edgeY-len*.32],[edgeX-len*.32,edgeY+len*.25],[edgeX+len*.36,edgeY+len*.50]],
     j%2?'#b982ff':'#d8b4ff',2.4*s,fade*.62,1*s);
    sparkle(g,edgeX,edgeY,(3+3*q)*s,'#f7eaff',fade*(1-q*.3));
   }
  }
  if(t>.50){
    const hit=E((t-.50)/.29),radius=(9+67*hit)*s;
    radial(g,x,y,radius*1.24,'#963dff',fade*(1-hit*.50));
    if(hit<.97)flare(g,x,y,(8+19*hit)*s,'#f2ccff',fade*(1-hit*.40));
    for(let j=0;j<11;j++){
     const a=j*TAU/11+.24,spread=radius*(.36+.62*seed(j+23));
     const p=[x+Math.cos(a)*radius*.1,y+Math.sin(a)*radius*.1];
     const end=[x+Math.cos(a)*spread,y+Math.sin(a)*spread];
     stroke(g,[p,end],j%2?'#bf8aff':'#f3d3ff',(3.9-j%3*.6)*s,fade*(1-hit*.62),1.2*s);
    }
    sparks(g,x,y,hit,low?13:28,['#e6ccff','#9b69ff','#f6ecff'],80*s,t*8);
  }
 });
})();