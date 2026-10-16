/* Poder Terrestre (Earth Power): pressure rises BELOW target.
   Ring fractures, escalating shards, dirt geysers, then a ground shockwave. */
window.PokemonTorreGroundV130?.register({
 id:'earthpower',names:['Poder Terrestre'],ms:1530,frames:16,
 draw(g,p){
  const {t,hit,to:B,scale:s,clamp,ease,path,crumb,ripple,shock}=p;
  const bx=B[0],by=(p.engine?.enemy?.y||B[1]+28*s)-(p.engine?.enemy?.r||33)*.08;
  const awaken=ease(t/.23),burst=ease((t-.24)/(hit-.24));
  const settle=1-ease((t-.86)/.14);
  g.save();g.globalAlpha*=settle;
  // Surface fractures radiate while energy brightens and destabilizes ground.
  for(let i=0;i<10;i++){
   const angle=i*Math.PI/5+.17,dirx=Math.cos(angle),diry=Math.sin(angle);
   const length=(17+51*awaken)*s, x=bx+dirx*length,y=by+diry*length*.4;
   g.beginPath();g.moveTo(bx+dirx*6*s,by+diry*2*s);
   g.lineTo(bx+dirx*length*.39-diry*6*s,by+diry*length*.15);
   g.lineTo(x,y);
   g.lineWidth=(3.7-i%3*.55)*s;g.strokeStyle='#29201b';g.stroke();
   g.beginPath();g.moveTo(bx+dirx*6*s,by+diry*2*s);
   g.lineTo(bx+dirx*length*.39-diry*6*s,by+diry*length*.15);
   g.lineTo(x,y);
   g.lineWidth=(1.8-i%3*.22)*s;g.strokeStyle='#ffc679';g.stroke();
  }
  ripple(g,bx,by,(16+40*awaken)*s,(6+18*awaken)*s,.48+awaken*.35,'#edb65e');
  // Distinct angular spikes, erupt sequentially from below feet.
  for(let i=0;i<7;i++){
   const phase=clamp((t-.13-i*.045)/.24),raise=ease(phase),fall=ease((t-hit-.12)/.28);
   const life=raise*(1-fall);if(life<=0)continue;
   const off=(i-3)*19*s + Math.sin(i*2.6)*9*s;
   const h=(26+i%3*15+burst*19)*life*s,wide=(8+i%3*4)*s;
   const x=bx+off,y=by+(i%2)*4*s;
   path(g,[[x-wide,y+4*s],[x-wide*.74,y-h*.39],[x+Math.sin(i*9)*wide*.27,y-h],[x+wide*.81,y-h*.2],[x+wide,y+4*s]],
     i%2?'#806044':'#a07748','#2c231a',2.5*s);
   g.beginPath();g.moveTo(x+Math.sin(i*9)*wide*.27,y-h);
   g.lineTo(x+wide*.3,y-h*.24);
   g.strokeStyle='#ffd18b';g.lineWidth=2*s;g.stroke();
  }
  if(t>=hit){
   const u=clamp((t-hit)/(1-hit)),fade=1-ease(u);
   shock(g,bx,by-17*s,(9+47*ease(u))*s,fade);
   ripple(g,bx,by,(25+65*ease(u))*s,(11+27*ease(u))*s,fade,'#fff0b8');
   for(let i=0;i<21;i++){
    const angle=i*2.399,spread=(9+72*ease(u))*s;
    crumb(g,bx+Math.cos(angle)*spread,by-6*s+Math.sin(angle)*spread*.65-22*s*(1-u),
      (3+i%5*1.5)*s,angle,'#aa8559',fade);
   }
  }
  g.restore();
 }
});