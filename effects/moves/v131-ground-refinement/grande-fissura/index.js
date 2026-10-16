/* Pokémon Torre V131 — Grande Fissura / Fissure: deep geological fracture.
 * Revised FROM the user's earlier approved-but-cartoon visual on explicit request.
 * Real fissure: dark deep cavity, irregular strata, soil collapse, dust and
 * sharp rocks; no bubbly outlines, neon cartoony rings, PNG, or CSS.
 * V359 performs the ONLY damage on the existing native hit frame.
 */
window.PokemonTorreGroundV130?.register({
 id:'grandefissura',names:['Grande Fissura','Fissure'],ms:1670,frames:16,
 draw(g,p){
  const {t,hit,scale:s,engine:e,to:B,ease,clamp,mix,crumb,path}=p;
  const x=Number.isFinite(e?.enemy?.x)?e.enemy.x:B[0],
        groundY=(Number.isFinite(e?.enemy?.y)?e.enemy.y:B[1]+24) + (e?.enemy?.r||33)*.48;
  const open=ease((t-.085)/Math.max(.16,hit-.085));
  const decay=1-ease((t-.89)/.11);
  const collapse=ease((t-.24)/Math.max(.2,hit-.24));
  if(open<=0||decay<=0)return;
  g.save();g.translate(x,groundY);g.scale(s,s);g.globalAlpha*=decay;
  // Fracture starts hairline-thin and widens along jagged banks.
  const count=15,extent=105*open;
  const upper=[],lower=[],innerUpper=[],innerLower=[];
  const depth=2+22*open;
  for(let i=0;i<count;i++){
   const q=i/(count-1),u=q*2-1,edge=Math.pow(Math.max(0,1-Math.pow(Math.abs(u),2)),.68);
   const cx=u*extent;
   const jag=Math.sin(i*2.17)*4+Math.sin(i*5.91)*2.2;
   const center=-13*u+Math.sin(i*.99)*3.0;
   const lip=(depth*.42*(edge+.1)+jag*.32*open);
   upper.push([cx,center-lip]);
   lower.push([cx,center+lip*.88+depth*.28*edge]);
   innerUpper.push([cx,center-lip+2.9*open]);
   innerLower.push([cx,center+lip*.88+depth*.28*edge-3*open]);
  }
  // Warm dirt shadow sits beneath the broken plateau; no graphic neon ring.
  path(g,[...upper.map(([px,py])=>[px,py-5*open]),...lower.map(([px,py])=>[px,py+7*open]).reverse()],
       'rgba(46,31,21,.29)',null);
  // Rock banks and their sides show that the fracture has real depth.
  path(g,[...upper,...innerUpper.slice().reverse()],'#80644a','#36281e',1.5);
  path(g,[...innerLower,...lower.slice().reverse()],'#94765a','#33251d',1.45);
  const cavity=[...innerUpper,...innerLower.slice().reverse()];
  path(g,cavity,'#100f0f','#2d221c',1.8);
  const deepShadow=[...innerUpper.map(([px,py],i)=>[px,py+2+Math.sin(i*1.63)*1.6]),
    ...innerLower.map(([px,py])=>[px,py-7*open]).reverse()];
  path(g,deepShadow,'#1b1715',null);
  // Narrow fractured stone strata. Muted mineral highlights, not cartoon glows.
  for(let bank=0;bank<2;bank++){
   const points=bank?lower:upper;
   g.beginPath();
   for(let i=0;i<count;i++){
    const [px,py]=points[i];
    i?g.lineTo(px,py):g.moveTo(px,py);
   }
   g.strokeStyle=bank?'#b49a73':'#9b8567';g.lineWidth=1.25;
   g.lineCap='butt';g.lineJoin='miter';g.stroke();
   for(let i=2;i<13;i+=2){
    const [px,py]=points[i];
    const spur=((bank?1:-1)*(10+7*((i*3)%4))*open);
    g.beginPath();g.moveTo(px,py);g.lineTo(px+(i%3-1)*7*open,py+spur*.44);
    g.lineTo(px+(i%3-1)*11*open,py+spur);
    g.strokeStyle='#514135';g.lineWidth=(.85+i%3*.23);g.stroke();
   }
  }
  // Deep chasm is ink-dark. Dust rises separately; not a bright yellow portal.
  const crumble=ease((t-.32)/Math.max(.13,hit-.32));
  if(crumble>0){
   for(let i=0;i<16;i++){
    const k=((i*13)%17-8)/8;
    const phase=(t-.26)*1.8+i*.043;
    const h=(8+((i*7)%9)*2.8)*clamp(phase)*crumble;
    const rx=k*84*open+Math.sin(i*1.6+t*8)*5*open;
    const ry=-Math.abs(Math.sin(i*2.1))*(11+42*crumble)-h*.22;
    const alpha=(1-ease((t-hit-.15)/.25))*(.35+i%3*.14);
    if(alpha>0)crumb(g,rx,ry,2.1+i%4*1.2,i*.4,'#695949',alpha);
   }
   // Angular falling debris and fragmented soil, with no circular blasts.
   for(let i=0;i<9;i++){
    const xi=((i*23)%15-7)*12*open;
    const yi=-6-24*collapse+18*ease((t-hit)/.27)*(i%3+1)/3;
    const alpha=(1-ease((t-.80)/.18))*.69;
    if(alpha<=0)continue;
    const r=3+i%4*1.5;
    path(g,[[xi-r,yi+r],[xi-r*.7,yi-r*.4],[xi+r*.2,yi-r*1.3],[xi+r,yi-r*.1],[xi+r*.65,yi+r]],
       i%2?'#685244':'#88715a','#2c251f',1);
   }
  }
  // Dust plumes with irregular flat silhouettes, capped near enemy's feet.
  if(t>hit-.1){
   const u=clamp((t-(hit-.1))/(1-hit+.1));
   const a=1-ease((u-.35)/.65);
   g.save();g.globalAlpha*=a*.35;
   for(let i=0;i<10;i++){
    const px=((i*7)%13-6)*11*open,py=-3-16*u-((i*17)%6)*u*3;
    const r=6+i%4*2.6;
    const cloud=[];
    for(let j=0;j<9;j++){
     const theta=j*Math.PI*2/9;
     cloud.push([px+Math.cos(theta)*r*(1+.12*Math.sin(i+j*4)),
      py+Math.sin(theta)*r*.46]);
    }
    path(g,cloud,'#776b5f',null);
   }
   g.restore();
  }
  g.restore();
 }
});