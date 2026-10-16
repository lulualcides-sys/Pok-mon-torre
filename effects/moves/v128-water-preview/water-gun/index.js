/* Original Water Gun: thin sustained jet, not Hydro Pump or a PNG strip. */
window.PokemonTorreWaterV128?.register({
 key:'watergun',aliases:['pistoladagua','pistola d’água','pistola d\'agua','jatodagua','jato de agua'],ms:1410,frames:16,
 draw(g,p){
  const {t,hit,world,from:A,to:B,ease,clamp,lerp,droplet,ring}=p;
  const dx=B[0]-A[0],dy=B[1]-A[1],len=Math.hypot(dx,dy)||1;
  const nx=-dy/len,ny=dx/len,progress=ease((t-.10)/(hit-.10));
  const fromX=A[0]+dx/len*15*world,fromY=A[1]+dy/len*15*world;
  const toX=lerp(fromX,B[0],progress),toY=lerp(fromY,B[1],progress);
  const alive=ease(t/.12)*(1-ease((t-.82)/.18));
  const jet=(width,color,alpha)=>{
   g.save();g.globalAlpha*=alive*alpha;g.beginPath();
   for(let j=0;j<=24;j++){
    const u=j/24,x=lerp(fromX,toX,u),y=lerp(fromY,toY,u);
    const wobble=Math.sin(u*19-t*30)*2.6*world*(Math.sin(u*Math.PI)*.8+.2);
    if(j===0)g.moveTo(x+nx*wobble,y+ny*wobble);
    else g.lineTo(x+nx*wobble,y+ny*wobble);
   }
   g.strokeStyle=color;g.lineWidth=width*world;g.lineCap='round';g.lineJoin='round';g.stroke();g.restore();
  };
  jet(14,'#0b2e49',1);jet(10,'#1f8ec9',1);jet(6.1,'#62d6fb',1);jet(2,'#efffff',.9);
  for(let i=0;i<10;i++){
   const u=((t*2.7+i*.172)%1)*progress;
   const wob=Math.sin(i*2.7+t*26)*9*world;
   droplet(g,lerp(fromX,toX,u)+nx*wob,lerp(fromY,toY,u)+ny*wob,
    (1.9+i%3*.75)*world,.3+i*.2,alive*.7);
  }
  const hitLife=clamp((t-hit)/(.94-hit));
  if(t>=hit&&hitLife<=1){const fade=1-ease(hitLife);
   ring(g,B[0],B[1],(13+31*hitLife)*world,(8+18*hitLife)*world,fade,'#d8faff',2.6);
   for(let i=0;i<13;i++){
    const angle=i*2.399+t*3.1,r=(9+38*ease(hitLife))*world;
    droplet(g,B[0]+Math.cos(angle)*r,B[1]+Math.sin(angle)*r*.68,
     (2.5+i%4)*world,angle,fade);
   }
  }
 }
});