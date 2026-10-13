/* Pokémon Torre — Four authentic sprite effects, revision 2026-10-13 v2.
 * Real pixels isolated from original images supplied by the user:
 * 1000981117.png (GBA rings / Psybeam), 1000981123.jpg (Pokémon vines),
 * 1000981187.gif (magenta psychic storm).
 * No abstract circles/lines/CSS/filtered 500px rectangles.
 * Original alpha masks and black sprite outline, nearest-neighbor rendering.
 * No effect on approved Tri Attack. 
 */
const originalGbaFX=(()=>{
 'use strict';
 const ATLAS='effects/moves/gba-assets/user-original-four-atlas.png?v=original4v2';
 const sheet=new Image();sheet.decoding='async';sheet.src=ATLAS;
 const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const aliases={confusion:'confusion',confusao:'confusion',
  tempestadepsiquica:'storm',psybeam:'psybeam',psibeam:'psybeam',
  chicotedevinha:'vine',vinewhip:'vine'};
 const state={casts:{},errors:[],source:'user-supplied authentic pixel sprites',build:'original4v2'};
 const groups={
  confusion:[0,1,2,3,4,5],psybeam:[6,7,8,9,10],
  storm:[11,12,13,14,15,16,17,18],vine:[19,20,21,22,23,24,25,26]
 };
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
 const lerp=(a,b,t)=>a+(b-a)*t;
 const TAU=Math.PI*2;
 sheet.onerror=()=>state.errors.push('Original PNG atlas could not load');
 const resolve=fx=>aliases[norm(fx?.move?.name||fx?.name)]||null;
 function sprite(g,frame,x,y,w,h,alpha=1,angle=0,mirror=false){
  if(!sheet.complete||!sheet.naturalWidth||alpha<=.02||w<=0||h<=0)return false;
  if(frame<0||frame>=27)return false;
  const sx=(frame%8)*44,sy=Math.floor(frame/8)*44;
  g.save();g.imageSmoothingEnabled=false;g.globalAlpha=clamp(alpha);
  g.translate(x,y);g.rotate(angle);if(mirror)g.scale(-1,1);
  g.drawImage(sheet,sx,sy,44,44,-w/2,-h/2,w,h);
  g.restore();return true;
 }
 function paint(g,fx,now,engine){
  const kind=resolve(fx);if(!kind)return false;
  // We own these four attacks exclusively, including before the image loads.
  // Do NOT draw the old generic fallback underneath!
  if(!sheet.complete||!sheet.naturalWidth)return true;
  if(!g||!Array.isArray(fx?.from)||!Array.isArray(fx?.to))return true;
  const A=fx.from,B=fx.to,dx=B[0]-A[0],dy=B[1]-A[1],
   ang=Math.atan2(dy,dx),distance=Math.hypot(dx,dy),
   duration=Math.max(450,fx.duration||1050),
   t=clamp((now-fx.at)/duration),fade=1-ease((t-.86)/.14),
   sideX=-Math.sin(ang),sideY=Math.cos(ang),scale=clamp((engine?.h||420)/420,.80,1.05);
  // Graphics stay small even on wide screens; no 500px stretched art.
  const draw=(id,x,y,w,h,a=1,rot=0,flip=false)=>sprite(g,id,x,y,w*scale,h*scale,a,rot,flip);
  g.save();g.imageSmoothingEnabled=false;
  if(kind==='confusion'){
   // Three authentic GBA telekinetic ring pulses travel toward the target.
   const charge=1-ease((t-.13)/.13);
   draw(0,A[0]+Math.cos(ang)*14,A[1]+Math.sin(ang)*14,21,21,charge*.88);
   for(let i=0;i<3;i++){
    const p=ease((t-.15-i*.070)/.43),start=.15+i*.07;
    if(t<start)continue;
    const wobble=Math.sin(now*.012+i*2.3)*7;
    const x=lerp(A[0],B[0],p)+sideX*wobble,y=lerp(A[1],B[1],p)+sideY*wobble;
    const vanishing=1-ease((t-start-.45)/.18);
    draw(i%3,x,y,27,27,fade*vanishing*.94,Math.sin(now*.004+i)*.09);
   }
   const q=ease((t-.57)/.18);
   draw(2,B[0],B[1],37,37,q*fade*.98);
   draw(1,B[0]+7,B[1]-4,21,21,q*fade*.73);
  }else if(kind==='storm'){
   // Distinct artist-supplied violet bursts, orbiting and striking in waves.
   const power=ease((t-.08)/.24),impact=ease((t-.38)/.29);
   for(let i=0;i<7;i++){
    const phase=i*TAU/7+now*.0024*(i%2?1:-1),
     r=(15+i%3*7)+13*Math.sin(Math.PI*clamp(t)),
     x=B[0]+Math.cos(phase)*r,y=B[1]+Math.sin(phase)*r*.73;
    const id=groups.storm[(Math.floor((now-fx.at)/90)+i)%8];
    draw(id,x,y,29+(i%3)*3,29+(i%3)*3,power*fade*(.59+i%3*.11),phase*.16);
   }
   const core=groups.storm[Math.floor((now-fx.at)/102)%8];
   draw(core,B[0],B[1],50,48,impact*fade*.93);
   if(impact>.55&&engine)engine.shake=Math.max(engine.shake||0,1.0);
  }else if(kind==='psybeam'){
   // Five real GBA Psybeam projectile silhouettes: animated shot, NOT a
   // raster plane scaled to the length of the battle arena.
   const travel=ease((t-.11)/.62),head=groups.psybeam;
   for(let i=0;i<8;i++){
    const p=travel-i*.083;if(p<=0)continue;
    const shift=Math.sin(now*.013+i*2.4)*4.5;
    const x=lerp(A[0],B[0],clamp(p))+sideX*shift;
    const y=lerp(A[1],B[1],clamp(p))+sideY*shift;
    const id=head[(Math.floor((now-fx.at)/68)+i)%5];
    // Original arrowheads point left: rotate 180 degrees to face target.
    draw(id,x,y,30,29,fade*(.90-i*.055),ang+Math.PI);
   }
   const q=ease((t-.66)/.19);
   draw(head[Math.floor(now/80)%5],B[0],B[1],36,36,q*fade*.98,ang+Math.PI);
  }else if(kind==='vine'){
   // The green GBA Whip frames are linked into TWO curved physical lashes;
   // each independent short piece preserves its unmodified pixel identity.
   for(let attack=0;attack<2;attack++){
    const begin=.10+attack*.28;
    if(t<begin)continue;
    const reach=ease((t-begin)/.34),vanish=1-ease((t-begin-.39)/.17);
    const visible=distance*reach,steps=Math.min(25,Math.ceil(visible/19));
    for(let j=0;j<steps;j++){
     const u=(j+.5)/Math.max(1,steps)*reach,
      bend=Math.sin(u*TAU*1.25+(now-fx.at)*.011+attack)*10*(1-u*.35),
      offset=(attack?1:-1)*11+bend,
      x=lerp(A[0],B[0],u)+sideX*offset,y=lerp(A[1],B[1],u)+sideY*offset;
     const id=groups.vine[(j+Math.floor((now-fx.at)/95)+attack*3)%8];
     draw(id,x,y,26,28,fade*vanish*(.88-.09*u),ang,attack===1);
    }
   }
   const q=ease((t-.66)/.16);
   draw(21,B[0]-6,B[1]-2,29,27,q*fade*.96,ang);
   draw(24,B[0]+7,B[1]+4,25,24,q*fade*.88,-ang,true);
   if(q>.55&&engine)engine.shake=Math.max(engine.shake||0,1.2);
  }
  g.restore();
  state.casts[kind]=(state.casts[kind]||0)+1;
  return true;
 }
 return {handles:fx=>!!resolve(fx),paint,diagnostics:()=>({
  version:state.build,source:state.source,loaded:!!sheet.naturalWidth,
  atlas:[sheet.naturalWidth||0,sheet.naturalHeight||0],frames:27,
  moves:['Confusion','Tempestade Psíquica','Psybeam','Chicote de Vinha'],
  counts:{...state.casts},errors:[...state.errors]})};
})();
window.PokemonTorreOriginalGBAFX=()=>originalGbaFX.diagnostics();
