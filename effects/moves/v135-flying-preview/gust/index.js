/* Rajada (Gust): streamlined layered cyclonic air with turbulence.
 * No generic giant rotating circle / PNG. Broad gust pushed towards target.
 * Original locally edited Rajada stays unchanged until preview approved.
 */
window.PokemonTorreFlyingV135?.register({
 name:'Rajada',aliases:['Gust'],frames:16,ms:1390,
 draw(g,p){
  const {t,hit,from:A,to:B,scale:s,clamp,ease,mix,path,mote,detailStep}=p;
  const dx=B[0]-A[0],dy=B[1]-A[1],length=Math.hypot(dx,dy)||1;
  const nx=-dy/length,ny=dx/length;
  const q=ease((t-.07)/(hit-.07)),life=ease(t/.14)*(1-ease((t-.85)/.15));
  const windLen=Math.min(125,length*.48)*s;
  // Several staggered helical air-stream ribbons, visible and directionally flowing.
  for(let i=0;i<5;i++){
   const offset=i*.115,travel=clamp((q-offset)/(1-offset));
   if(travel<=0)continue;
   const rootX=mix(A[0],B[0],travel),
         rootY=mix(A[1],B[1],travel);
   const side=(i-2)*8.2*s;
   const shape=[];
   for(let j=0;j<=20;j++){
    const u=j/20,back=windLen*u,
       wave=Math.sin(u*12.0+t*23+i*1.9)*(6+5*(1-u))*s;
    shape.push([rootX-dx/length*back+nx*(side+wave),
       rootY-dy/length*back+ny*(side+wave)]);
   }
   path(g,shape,i%2?'#91cce6':'#d2eff5',(2.3+i%2)*s,life*(.63+(1-travel)*.23),'#193147');
  }
  // Near-target air compression folds into two swept narrow arcs.
  if(t>=hit-.09){
   const u=clamp((t-(hit-.09))/(1-hit+.09)),out=1-ease(u);
   for(let k=0;k<3;k++){
    const radius=(13+26*ease(u)+k*7)*s;
    const pts=[];
    for(let j=0;j<=16;j++){
     const a=(-.68+j/16*1.32)*Math.PI;
     pts.push([B[0]+Math.cos(a)*radius,B[1]+Math.sin(a)*radius*.73]);
    }
    path(g,pts,k%2?'#d8f2fa':'#80c7e6',2.0*s,out*.62,'#26384a');
   }
  }
  // Wisps move with airflow. Reduce just these under mobile frame pressure.
  for(let i=0;i<18;i+=detailStep){
   const travel=clamp(q-(i%6)*.12);if(travel<=0)continue;
   const angle=i*2.3+t*17;
   const px=mix(A[0],B[0],travel)+nx*Math.sin(angle)*17*s;
   const py=mix(A[1],B[1],travel)+ny*Math.sin(angle)*17*s;
   mote(g,px,py,(.65+i%3*.6)*s,life*.54,'#d6f3f8');
  }
 }
});