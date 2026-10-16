/* Original Dive: underwater disappearance and surfacing body impact.
   Game's existing one-cast mechanics are preserved; this is visual only. */
window.PokemonTorreWaterV128?.register({
 key:'mergulho',aliases:['dive'],ms:1790,frames:16,
 draw(g,p){
  const {t,hit,from:A,to:B,world,clamp,ease,ring,droplet,bubble}=p;
  const ax=A[0],ay=A[1]+18*world,bx=B[0],by=B[1]+17*world;
  const pool=(x,y,start,end,amp)=>{
   const entry=ease((t-start)/.14),exit=1-ease((t-end)/.18),al=entry*exit;
   if(al<=0)return;
   g.save();g.globalAlpha*=al;
   g.beginPath();g.ellipse(x,y,42*amp*world,13*amp*world,0,0,Math.PI*2);
   g.fillStyle='rgba(18,119,185,.34)';g.fill();
   g.strokeStyle='#092d4d';g.lineWidth=3.2;g.stroke();
   ring(g,x,y,(38+9*Math.sin(t*19))*amp*world,13*amp*world,1,'#8deaff',2.4);
   ring(g,x,y,(22+13*Math.sin(t*12))*amp*world,7*amp*world,.78,'#e9ffff',1.4);
   g.restore();
  };
  pool(ax,ay,.03,.74,1.00);
  if(t>.35)pool(bx,by,.37,.99,1.04);
  if(t<.61){
   const fade=ease(t/.18)*(1-ease((t-.51)/.11));
   for(let i=0;i<13;i++){
    const q=(i*.157+t*.85)%1,angle=i*2.399,wide=11+i%3*13;
    bubble(g,ax+Math.cos(angle)*wide*world,ay-8-q*29*world,
     (2.2+i%4*1.2)*world,fade*.9);
   }
  }
  const eruption=clamp((t-hit)/Math.max(.08,.94-hit));
  if(t>=hit){
   const fade=1-ease(eruption);
   for(let i=0;i<21;i++){
    const theta=-Math.PI+Math.PI*i/20,spread=(14+56*ease(eruption))*(.70+i%4*.11)*world;
    const x=bx+Math.cos(theta)*spread;
    const y=by-14-Math.sin(theta+Math.PI)*spread*.95;
    droplet(g,x,y,(3.6+i%5*1.4)*world,theta+Math.PI/2,fade);
   }
   ring(g,bx,by-15*world,(11+43*eruption)*world,(8+30*eruption)*world,
    fade,'#f1ffff',3.8);
  }
 }
});