/* X-Scissor V68: physical crossing scythes in close combat, not a neon X decal.
 * Two fast offset curved steel-edged swipes and sharp white contact burst.
 */
(()=>{
 'use strict';
 const {C,E,MIX,TAU,poly,stroke,oval,sparkle,ribbon,radial,flare,sparks,seed}=fidelityFourV68.art;
 fidelityFourV68.register(['catalog_xscissor','catalog_cortex'],'X-Scissor / Corte X',(g,f)=>{
  const {t,scale:s,from:src,to:dst,ux,ny,low}=f,fade=1-E((t-.86)/.14);
  const q1=E((t-.19)/.32),q2=E((t-.36)/.32),impact=E((t-.60)/.21);
  const x=dst[0],y=dst[1];
  // Contact wind-up: two bladed-edge wakes approach the defender.
  const reach=E((t-.03)/.27);
  for(let j=0;j<8;j++){
   const p=[MIX(src[0],x,reach*.76)-j*5*s,MIX(src[1],y,reach*.76)+Math.sin(j*.91)*10*s];
   stroke(g,[[p[0]-ux[0]*28*s+ny[0]*j*s,p[1]-ux[1]*28*s+ny[1]*j*s],
     [p[0]+ux[0]*11*s,p[1]+ux[1]*11*s]],j%2?'#b5f7e2':'#5de8bd',1.8*s,fade*.33*(1-impact),0);
  }
  // The gashes are offset sweeping Bézier ribbons, not hard straight X sticks.
  const path1=[[-82,-64],[-28,-56],[23,45],[78,67]].map(([px,py])=>[x+px*s,y+py*s]);
  const path2=[[-81,68],[-33,60],[35,-60],[85,-73]].map(([px,py])=>[x+px*s,y+py*s]);
  if(q1>.006){
    radial(g,x,y,45*s,'#58e7d3',q1*fade*.13);
    ribbon(g,...path1,q1,18*s,['#0a5b62','#93e9d9','#e9fff7'],fade);
    // Fine offset outline glints give the crossing gash a sharp layered edge.
    for(let j=0;j<5;j++){
      const q=C(q1-j*.08),p=[MIX(path1[0][0],path1[3][0],q),MIX(path1[0][1],path1[3][1],q)];
      sparkle(g,p[0]+4*s,p[1]-6*s,2.6*s,'#f8fffc',fade*(1-j*.18)*q);
    }
  }
  if(q2>.006){
    radial(g,x,y,45*s,'#b8fbff',q2*fade*.13);
    ribbon(g,...path2,q2,20*s,['#073e60','#64d6ef','#f6ffff'],fade);
    for(let j=0;j<7;j++){
      const q=C(q2-j*.060),p=[MIX(path2[0][0],path2[3][0],q),MIX(path2[0][1],path2[3][1],q)];
      const a=j*.69+t*13;
      const point=[p[0]+Math.cos(a)*6*s,p[1]+Math.sin(a)*6*s];
      sparkle(g,point[0],point[1],(1.9+j%3)*s,'#eaffff',fade*q*.75);
    }
  }
  if(impact>.005){
   const r=(8+impact*67)*s;
   radial(g,x,y,r*1.35,'#befffb',fade*(1-impact)*.45);
   flare(g,x,y,(7+impact*22)*s,'#efffff',fade*(1-impact*.6));
   // Sharp radial shards only after the blades actually cross.
   for(let j=0;j<12;j++){
     const a=j*TAU/12+.15,R=r*(.52+.45*seed(j+51));
     const from=[x+Math.cos(a)*r*.13,y+Math.sin(a)*r*.12];
     const to=[x+Math.cos(a)*R,y+Math.sin(a)*R];
     stroke(g,[from,to],j%2?'#d3ffff':'#4ab9d3',(3.7-j%3*.64)*s,fade*(1-impact*.75),1.3*s);
   }
   sparks(g,x,y,impact,low?10:25,['#f4ffff','#8ff9e0','#70cced'],79*s,t*9);
  }
 });
})();