/* Aura Sphere V68 — concentrated, homing blue aura sphere with turbulent shell.
 * There is NO detached beam or oversized flat disk.
 */
(()=>{
 'use strict';
 const {C,E,MIX,TAU,poly,stroke,oval,sparkle,radial,flare,beam,halo,sparks,spinRing,seed}=fidelityFourV68.art;
 fidelityFourV68.register(['catalog_aurasphere'],'Aura Sphere',(g,f)=>{
  const {t,scale:s,from:src,to:dst,at,ny,ux,low}=f;
  const focus=E(t/.25),travel=E((t-.25)/.53),impact=E((t-.72)/.18),fade=1-E((t-.88)/.12);
  const head=at(travel,Math.sin(t*19)*8*s*(1-impact)),x=head[0],y=head[1],r=(9+10*focus)*s;
  // Energy is pulled into the sphere rather than popping in as a prefabricated icon.
  for(let j=0;j<10;j++){
    const a=j*TAU/10+t*6,rr=(36-20*focus+Math.sin(j*2.1+t*24)*5)*s;
    const p=[src[0]+Math.cos(a)*rr,src[1]+Math.sin(a)*rr];
    radial(g,p[0],p[1],7*s,j%2?'#148ff4':'#95e9ff',focus*.29*(1-travel));
    stroke(g,[p,[src[0]+Math.cos(a+.32)*rr*.51,src[1]+Math.sin(a+.32)*rr*.51]],
           j%2?'#0c65cc':'#74cfff',2.4*s,focus*(1-travel)*.75,1);
  }
  if(travel>.04){
   for(let j=(low?8:17);j>0;j--){
    const q=C(travel-j*.04);
    if(q<=0)continue;
    const a=at(q,Math.sin(t*19-j*.41)*9*s);
    let w=(14-j*.44)*s,alpha=(.5-j*.023)*fade*(1-impact*.4);
    radial(g,a[0],a[1],w*1.7,j%2?'#1262ec':'#399eff',alpha*.45);
    oval(g,a[0],a[1],Math.max(1,w*.34),Math.max(1,w*.24),'#70d9ff',alpha*.66,'',0);
   }
   for(let j=0;j<7;j++){
    const q=C(travel-j*.10),p=at(q,Math.sin(t*17+j*1.5)*12*s);
    sparkle(g,p[0],p[1],(2+seed(j+3)*4)*s,'#b5f8ff',fade*(1-j*.1));
   }
  }
  if(t<.93){
   radial(g,x,y,r*3.4,'#007bff',(.6-impact*.35)*fade);
   radial(g,x,y,r*2,'#46d7ff',(.48-impact*.22)*fade);
   // Protective dark outer aura silhouette and layered bright plasma core.
   oval(g,x,y,r*1.12,r*1.12,'#082f86',fade*(1-impact*.23),'#020f36',2.4*s);
   oval(g,x-1.5*s,y-1.1*s,r*.96,r*.95,'#087bd3',fade*(1-impact*.19),'#08295d',1*s);
   oval(g,x-3*s,y-2*s,r*.66,r*.68,'#80ddff',fade*(1-impact*.12),'',0);
   oval(g,x-4*s,y-4*s,r*.37,r*.34,'#f6ffff',fade,'',0);
   // Jagged luminous swirl around ball: orbit edges, four independent arcs.
   for(let j=0;j<4;j++){
    let angle=t*17+j*TAU/4,rr=r*(1.35+.15*Math.sin(j*4+t*32));
    const pts=[];
    for(let k=0;k<=14;k++){
      const a=angle+(k/14)*Math.PI*.88;
      pts.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr*.86]);
    }
    stroke(g,pts,j%2?'#1da6ff':'#9beeff',(1.3+j%2)*s,fade*.85,1.4*s);
    sparkle(g,pts[14][0],pts[14][1],2.8*s,'#deffff',fade*.85);
   }
   for(let j=0;j<9;j++){
    const a=j*TAU/9+t*22,R=r*(1.4+.20*Math.sin(j*3+t*23));
    let px=x+Math.cos(a)*R,py=y+Math.sin(a)*R;
    radial(g,px,py,(2+j%3*1.2)*s,j%2?'#7cdaff':'#e2ffff',fade*.5);
   }
  }
  if(t>.66){
   radial(g,dst[0],dst[1],(16+67*impact)*s,'#159eff',fade*(.6-impact*.33));
   for(let j=0;j<3;j++)halo(g,dst[0],dst[1],(10+impact*(28+j*18))*s,fade*(1-impact*.65),j%2?'#3ac7ff':'#c9ffff',.79);
   if(impact<.9)flare(g,dst[0],dst[1],(6+16*impact)*s,'#e9ffff',fade*(1-impact*.4));
   sparks(g,dst[0],dst[1],impact,low?12:25,['#d6ffff','#48c8ff','#1b82ff'],72*s,t*11);
  }
 });
})();