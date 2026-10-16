/* Roost, original Pokémon healing move: wings settle; feathers descend to caster.
 * Absolutely no damage, heal or stat calculation here: native V359 owns it.
 */
window.PokemonTorreFlyingV135?.register({
 name:'Roost',aliases:['Pousar'],frames:12,ms:1580,
 draw(g,p){
  const {t,from:A,scale:s,clamp,ease,mix,path,feather,mote,detailStep}=p;
  const x=A[0],y=A[1]+15*s;
  const settle=ease(t/.32),out=1-ease((t-.82)/.18);
  // Two wings folding inwards as the Pokémon settles.
  for(const side of [-1,1]){
   const span=(40-21*settle)*s;
   const baseX=x+side*9*s,baseY=y-14*s;
   const pts=[];
   for(let k=0;k<=14;k++){
    const u=k/14,px=baseX+side*span*u;
    const py=baseY-18*s*Math.sin(Math.PI*u)*(1-settle*.55)
      +(14*settle+7)*s*u;
    pts.push([px,py]);
   }
   path(g,pts,'#b1dae5',3.2*s,out*.78,'#233847');
   for(let k=1;k<=3;k++){
    const u=k*.21,px=baseX+side*span*u,py=baseY+(-9+13*settle)*s*u;
    path(g,[[px,py],[px+side*7*s,py+6*s]],'#d5eef2',1.2*s,out*.62);
   }
  }
  // Low broad recovery-current at Pokémon feet; NOT a shield or a blast.
  for(let i=0;i<3;i++){
   const delay=i*.11,life=clamp((t-delay)/.88);
   if(life<=0||life>=1)continue;
   const r=(13+21*ease(life))*s,alpha=(1-ease(life))*.54*out;
   g.save();g.globalAlpha*=alpha;
   g.beginPath();g.ellipse(x,y+14*s,r,r*.27,0,0,Math.PI*2);
   g.lineWidth=2*s;g.strokeStyle='#19364a';g.stroke();
   g.beginPath();g.ellipse(x,y+14*s,r,r*.27,0,-.05*Math.PI,1.05*Math.PI);
   g.lineWidth=1.35*s;g.strokeStyle='#caedf3';g.stroke();g.restore();
  }
  // Individual soft feathers descend, oscillate gently, then fade.
  for(let i=0;i<11;i+=detailStep){
   const q=clamp((t-.08-(i%5)*.055)/.78);
   if(q<=0||q>=1)continue;
   const a=(1-ease((q-.73)/.27))*out;
   const drift=Math.sin(q*9.3+i*1.7)*(6+i%3*3)*s;
   const xx=x+(i-5)*8*s+drift;
   const yy=y-65*s+q*80*s+(i%3)*2*s;
   feather(g,xx,yy,(5.5+i%3*2.2)*s,.24+Math.sin(q*7+i)*.55,a*.68);
  }
  for(let i=0;i<8;i+=detailStep){
   const a=i*2.399+t*1.5,r=(15+18*settle)*s;
   mote(g,x+Math.cos(a)*r,y-9*s+Math.sin(a)*r*.6,
    (1.1+i%3*.5)*s,out*.55,'#d2eff2');
  }
 }
});