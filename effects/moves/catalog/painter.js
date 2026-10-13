/* Pokemon Torre V35.84: procedurally animated catalog moves.
   Called only by each move's isolated index.js registration. Original damage, cooldown,
   distance and saved/approved effects remain owned by the main battle engine. */
const CATALOG_COLORS={
 normal:['#e5edf4','#fffefa','#91a8c4'],
 fire:['#f76d29','#fff0a1','#c32f25'],
 water:['#3aaff7','#e2fbff','#3573e7'],
 electric:['#ffe65b','#fffde2','#d7a92b'],
 grass:['#64cb77','#f4ffb0','#358f58'],
 ice:['#79dffa','#f6feff','#4c9ed6'],
 psychic:['#c582f8','#fbe6ff','#8648c6'],
 ghost:['#8c7ce8','#e5d8ff','#3c3f8d'],
 dark:['#7365a3','#dac9f8','#2b2550'],
 dragon:['#8d8cf9','#edecff','#5553c5'],
 fighting:['#e59566','#ffecbb','#ad473f'],
 flying:['#94daf4','#f5fdff','#6b90c4'],
 poison:['#bd67d0','#f4cafb','#78428b'],
 rock:['#c5b38e','#fff1d0','#72624c'],
 ground:['#c8a66a','#ffe6b2','#81613d'],
 bug:['#91d46b','#f4ffc9','#55873c'],
 steel:['#a4cadd','#ffffff','#617e99'],
 fairy:['#ef99cf','#fff0fa','#b96da9']
};
function catalogShape(g,x,y,r,type,phase,alpha,seed){
 const theme=CATALOG_COLORS[type]||CATALOG_COLORS.normal;
 if(type==='ice'){beamShard(g,x,y,r*1.35,phase,[theme[1],theme[0]],alpha);return;}
 if(type==='grass'||type==='bug'){if(type==='grass')stamp(g,'leaf'+(seed%4),x,y,r*3.2,r*2.3,phase,alpha*.85);
  else {beamShard(g,x,y,r,phase,[theme[0],theme[1]],alpha);return;}}
 if(type==='fire'){stamp(g,'flame'+(seed%5),x,y,r*2.5,r*4,phase,alpha*.75);}
 if(type==='psychic'){stamp(g,'purple'+(seed%32),x,y,r*3,r*3,phase,alpha*.68);}
 if(type==='ghost'||type==='dark'){stamp(g,'shadow'+(seed%6),x,y,r*3,r*3,phase,alpha*.38);}
 if(type==='rock'||type==='ground'){stamp(g,'rock'+(seed%4),x,y,r*3,r*2.8,phase,alpha*.65);}
 if(type==='water'){ring(g,x,y,r*1.4,theme[1],alpha*.75,1.3,.83);}
 if(type==='fairy'||type==='electric'){star(g,x,y,r*1.8,theme[1],alpha);return;}
 dot(g,x,y,Math.max(.7,r*.47),theme[0],alpha,1.1);
}
function catalogArc(g,x,y,r,start,span,color,w,alpha){
 g.save();g.globalAlpha=C(alpha);g.strokeStyle=color;g.lineWidth=w;g.lineCap='round';
 g.beginPath();g.arc(x,y,Math.max(.1,r),start,start+span);g.stroke();g.restore();
}
function catalogBolt(g,A,B,t,now,s,low,type,seed,isPierce,isElectric){
 const colors=CATALOG_COLORS[type]||CATALOG_COLORS.normal,phase=now*.011+seed*.73;
 const head=SM(C((t-.06)/.67)),fade=C(Math.min(t*10,(1-t)*10));
 const dx=B[0]-A[0],dy=B[1]-A[1],length=Math.hypot(dx,dy)||1,nx=-dy/length,ny=dx/length;
 const p=beamTravel(A,B,head);const wobble=Math.sin(phase*1.8+head*13)*7*s;
 const x=p[0]+nx*wobble,y=p[1]+ny*wobble;
 for(let j=(low?4:7);j>=1;j--){
  const q=C(head-j*.044),pt=beamTravel(A,B,q);
  glow(g,pt[0],pt[1],(8+j*1.5)*s,colors[1],colors[0],fade*(.26-j*.027));
 }
 if(isElectric){
  const pts=[],count=low?9:16;
  for(let j=0;j<=count;j++){const u=j/count*head,pt=beamTravel(A,B,u);
   const q=(j===0||j===count)?0:Math.sin(j*13.4+seed)*8*s;
   pts.push([pt[0]+nx*q,pt[1]+ny*q]);}
  line(g,pts,colors[0],6*s,fade*.62,7*s);line(g,pts,colors[1],2.8*s,fade,6*s);
 }else if(type==='water'){
  const q=beamTrace(A,B,head,phase,2*s,29,low);
  beamLayers(g,q,[[colors[2],10,.26,3],[colors[0],5,.78,2],[colors[1],1.9,1,2]],fade,s);
 }else if(isPierce){
  const q=beamTrace(A,B,head,phase,1*s,24,low);
  beamLayers(g,q,[[colors[0],6,.4,2],[colors[1],1.7,.85,1]],fade,s);
 }
 glow(g,x,y,(isPierce?13:20)*s,colors[1],colors[2],fade*.75);
 if(isPierce)beamShard(g,x,y,11*s,Math.atan2(dy,dx)+Math.PI/2,[colors[1],colors[0]],fade);
 else {dot(g,x,y,7.8*s,colors[0],fade,4*s);dot(g,x,y,3*s,colors[1],fade,4*s);}
 for(let j=0;j<(low?5:9);j++){
  const q=C(head-(j*.055+((now*.0008+seed*.071)%0.08))),pt=beamTravel(A,B,q),spread=Math.sin(j*2.61+phase)*13*s;
  catalogShape(g,pt[0]+nx*spread,pt[1]+ny*spread,(1.8+j%3)*s,type,phase+j,fade*(.75-j*.043),seed+j);
 }
 if(t>.58){const hit=SM(C((t-.58)/.42));beamBurst(g,B[0],B[1],hit,s,colors[1],colors[0],low?7:11);}
}
function catalogBeam(g,A,B,t,now,s,low,type,seed,thunderSky){
 const col=CATALOG_COLORS[type]||CATALOG_COLORS.normal,phase=now*.016+seed*1.14,fade=C(Math.min(t*11,(1-t)*10));
 const S=thunderSky?[B[0]+Math.sin(seed)*40*s,Math.min(A[1],B[1])-170*s]:A;
 const head=SM(C((t-.19)/.30)),charging=C(t/.25);
 if(t<.34){
  glow(g,S[0],S[1],(22+20*charging)*s,col[1],col[0],fade*.76);
  for(let j=0;j<3;j++)ring(g,S[0],S[1],(28-j*7-charging*13)*s,j%2?col[0]:col[1],fade*.75,1.8*s,.66,phase*.2+j);
 }
 if(t>.18&&t<.89){
  const q=beamTrace(S,B,head,phase,2.6*s,29,low);
  beamLayers(g,q,[[col[2],16,.34,4],[col[0],9,.72,4],[col[1],3.7,.96,5]],fade,s);
  const ax=beamAxis(S,B);
  for(let arm=0;arm<2;arm++){
   const pts=[],n=low?12:22;
   for(let j=0;j<=n;j++){const u=j/n*head,p=beamTravel(S,B,u),w=Math.sin(u*31-phase+arm*Math.PI)*8*s;
    pts.push([p[0]+ax.nx*w,p[1]+ax.ny*w]);}
   line(g,pts,arm?col[0]:col[1],1.5*s,fade*.68,1.8*s);
  }
  for(let j=0;j<(low?5:9);j++){const u=((j*.173+now*.00043)%1)*head,p=beamTravel(S,B,u);
   catalogShape(g,p[0]+ax.nx*Math.sin(phase+j*3)*10*s,p[1]+ax.ny*Math.sin(phase+j*3)*10*s,(2+j%3)*s,type,phase+j,fade*.77,seed+j);}
 }
 if(t>.64)beamBurst(g,B[0],B[1],SM(C((t-.64)/.36)),s,col[1],col[0],low?8:14);
}
function catalogImpact(g,A,B,t,now,s,low,type,kind,seed){
 const col=CATALOG_COLORS[type]||CATALOG_COLORS.normal;
 const q=SM(C((t-.18)/.72)),fade=C(Math.min(t*11,(1-t)*10)),cx=B[0],cy=B[1],phase=now*.008+seed;
 const contact=kind==='dash'||kind==='contact'||kind==='physical';
 const radius=(contact?11:19)+q*(contact?37:48);
 glow(g,cx,cy,(24+18*q)*s,col[1],col[0],fade*.43);
 for(let arm=0;arm<(contact?3:4);arm++){
  const angle=phase*.2+arm*TWO/(contact?3:4);
  catalogArc(g,cx,cy,(10+q*(15+arm*9))*s,angle,contact?1.3:2.1,col[arm%2?0:1],(contact?3.5:2)*s,fade*(.85-arm*.14));
 }
 if(type==='ground'||type==='rock'){
  for(let j=0;j<(low?5:9);j++){const a=j*TWO/9+seed,r=(13+q*(23+j%3*6))*s,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.47;
    stamp(g,'crack'+(j%8),x,y,20*s,29*s,0,fade*.52);
    stamp(g,'rock'+(j%4),x,y-10*q*s,13*s,14*s,a,fade*.73);}
 }else{
  for(let j=0;j<(low?8:15);j++){const a=j*2.399+phase*.25,r=(10+radius*(.4+j%4*.13))*s;
   catalogShape(g,cx+Math.cos(a)*r,cy+Math.sin(a)*r*.72,(2.3+j%4)*s,type,a,fade*(.9-j*.026),seed+j);}
 }
 if(contact&&t<.7){
  const a=beamAxis(A,B),x=M(A[0],B[0],q*.8),y=M(A[1],B[1],q*.8);
  for(let j=0;j<3;j++){
   const off=(j-1)*8*s;
   line(g,[[x-a.nx*11*s+off*a.nx,y-a.ny*11*s+off*a.ny],[cx+a.nx*(j-1)*12*s,cy+a.ny*(j-1)*12*s]],col[j%2?1:0],(2.3+j*.7)*s,fade*.35,2*s);
  }
 }
}
function catalogArea(g,A,B,t,now,s,low,type,seed,isHazard){
 const c=CATALOG_COLORS[type]||CATALOG_COLORS.normal,q=SM(C((t-.09)/.73)),fade=C(Math.min(t*11,(1-t)*9));
 const cx=B[0],cy=B[1],beat=now*.009+seed*.38;
 glow(g,cx,cy,(30+38*q)*s,c[1],c[0],fade*.40);
 for(let i=0;i<3;i++){
  const p=C((q-i*.12)/(.74+i*.10));if(!p)continue;
  ring(g,cx,cy,(12+p*(isHazard?48:75))*s,i%2?c[2]:c[1],fade*(1-p*.42),2.4*s,isHazard?.26:.65,beat*.12);
 }
 for(let i=0;i<(low?11:21);i++){
  const a=i*2.399+beat*(i%2?-.07:.08),radius=(12+q*(29+(i%6)*9))*s,fall=isHazard?0:Math.sin(Math.PI*t)*14*s;
  catalogShape(g,cx+Math.cos(a)*radius,cy+Math.sin(a)*radius*.67-fall,(2.8+i%4)*s,type,a,fade*(.87-i*.015),seed+i);
 }
 if(type==='ice'||type==='water'){
  for(let j=0;j<(low?4:8);j++){const x=cx+(j-3.5)*19*s,y=cy-64*s+((now*.11+j*41)%(90*s));
   catalogShape(g,x,y,(2.8+j%3)*s,type,beat,fade*.7,seed+j);}
 }
}
function catalogStatus(g,A,B,t,now,s,low,type,kind,name,seed){
 const col=CATALOG_COLORS[type]||CATALOG_COLORS.normal,phase=now*.007+seed*.31;
 const debuff=/toxic|poison|paralis|confus|hypnosis|sleep|stun|leechseed|seed|tailwhip|growl|leer|stringshot|supersonic|sandattack|charm|maldicao|maldi|rugido|encanto|atras|nevoa|po/.test(name)&&!(/poder|poten/.test(name));
 const x=debuff?B[0]:A[0],y=debuff?B[1]:A[1];
 const fade=C(Math.min(t*12,(1-t)*9)),q=SM(C(t/.66)),heal=/recover|cura|rest|heal|synthesis|wish|roost|luadalua|luzdalua/.test(name);
 glow(g,x,y,(35+19*q)*s,col[1],col[0],fade*.55);
 for(let j=0;j<4;j++){
  const r=(13+j*11+q*10)*s,dy=(j-2)*7*s;
  ring(g,x,y+dy,r,j%2?col[1]:col[0],fade*(.87-j*.15),2*s,.33,phase*(j%2?1:-1));
 }
 for(let j=0;j<(low?9:18);j++){
  const angle=j*2.399+phase*(j%3?1:-1),r=(17+j%5*8)*s;
  const xx=x+Math.cos(angle)*r,yy=y+Math.sin(angle)*r*.8-13*s*q;
  if(heal||j%3===0)star(g,xx,yy,(2.2+j%3)*s,col[1],fade*.76);
  else catalogShape(g,xx,yy,(2+j%3)*s,type,angle,fade*.77,seed+j);
 }
 if(heal){for(let j=0;j<3;j++)line(g,[[x+(j-1)*10*s,y+23*s],[x+(j-1)*10*s,y-15*s]],col[1],1.6*s,fade*.4,3*s);}
 if(kind==='weather'){for(let j=0;j<(low?5:10);j++){const px=x+(j-5)*18*s,py=y-54*s+((now*.09+j*17)%(72*s));
  dot(g,px,py,2.1*s,col[0],fade*.74,1*s);}}
}
function drawCatalogMove(g,f,t,now,s,low,profile){
 if(!g||!Array.isArray(f.from)||!Array.isArray(f.to))return;
 const A=f.from,B=f.to,move=f.move||{},type=CATALOG_COLORS[move.type]?move.type:profile.type;
 const kind=move.kind||profile.kind||'bolt',key=String(profile.id||'');
 g.save();
 const status=move.cat==='status'||['status','guard','shield','recover','weather','buff'].includes(kind)||profile.cat==='status';
 if(status){catalogStatus(g,A,B,t,now,s,low,type,kind,key,profile.seed);}
 else if(kind==='beam'){catalogBeam(g,A,B,t,now,s,low,type,profile.seed,/^(thunder|trovao)$/.test(key));}
 else if(kind==='area'||kind==='quake'||kind==='hazard'){catalogArea(g,A,B,t,now,s,low,type,profile.seed,kind==='hazard');}
 else if(kind==='dash'||kind==='contact'||kind==='physical'){catalogImpact(g,A,B,t,now,s,low,type,kind,profile.seed);}
 else {catalogBolt(g,A,B,t,now,s,low,type,profile.seed,kind==='pierce',type==='electric'||/^(thunderbolt|raio|volt|trovao)/.test(key));}
 g.restore();
}
