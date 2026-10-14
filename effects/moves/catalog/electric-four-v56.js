/* Pokémon Torre V57 art revision — four independent electric catalog effects.
 * Draws only authored, genuinely different animation frames; no CSS/Canvas
 * strokes, copied PNG illustration, generic Pixi shape, or in-game previews.
 * Shared draw / damage / cooldown logic in end.js and the battle engine remains.
 */
const catalogElectricFourV56=(()=>{
 'use strict';
 const moves=['faiscadejolteon','thunderbolt','choquedotrovao','choque'];
 const sets=new Map(),stats={painted:0,last:'',frames:Object.create(null),missing:[]};
 const clamp=n=>Math.max(0,Math.min(1,n));
 const pad=n=>String(n).padStart(2,'0');
 for(const id of moves){
  const main=[],impacts=[];
  for(let i=1;i<=8;i++){
   const img=new Image();img.decoding='async';
   img.src='effects/moves/catalog/'+id+'/sprites/frame_'+pad(i)+'.png?v=57.0';
   main.push(img);
  }
  for(let i=1;i<=4;i++){
   const img=new Image();img.decoding='async';
   img.src='effects/moves/catalog/'+id+'/impact/hit_'+pad(i)+'.png?v=57.0';
   impacts.push(img);
  }
  sets.set(id,{main,impacts});
 }
 function ready(img){return !!(img?.naturalWidth>0&&img?.naturalHeight>0);}
 function img(g,asset,x,y,w,h,alpha){
  if(!ready(asset))return false;
  if(!Number.isFinite(x+y+w+h)||w<=0||h<=0)return false;
  g.save();g.globalAlpha=clamp(alpha);g.imageSmoothingEnabled=true;
  g.drawImage(asset,x,y,w,h);g.restore();
  return true;
 }
 function accepts(k){return typeof k==='string'&&k.startsWith('catalog_')&&sets.has(k.slice(8));}
 function paint(g,f,t,now,s,low,id){
  const packet=sets.get(id),A=f?.from,B=f?.to;
  if(!packet||!g||!Array.isArray(A)||!Array.isArray(B))return false;
  const phase=Math.min(7,Math.floor(clamp(t)*8));
  const within=clamp(t*8-phase);
  const fade=phase===7?1-within*.9:1;
  const dx=B[0]-A[0],dy=B[1]-A[1];
  const dist=Math.max(1,Math.hypot(dx,dy));
  const angle=Math.atan2(dy,dx);
  const height=(id==='faiscadejolteon'?111:
     id==='thunderbolt'?108:id==='choquedotrovao'?84:66)*Math.max(.7,Math.min(s,1.18));
  const reach=Math.max(20,dist-12);
  const fromX=A[0]+dx/dist*10,fromY=A[1]+dy/dist*10;
  // The animated, transparent sprites are rotated to track real targets.
  g.save();g.translate(fromX,fromY);g.rotate(angle);
  const drawPhase=(i,opacity)=>img(g,packet.main[i],0,-height*.5,reach,height,opacity);
  const blend=Math.max(0,(within-.78)/.22)*.3;
  let drew=drawPhase(phase,fade*(1-blend));
  if(blend>0&&phase<7)drew=drawPhase(phase+1,fade*blend)||drew;
  g.restore();
  const hitStart=id==='faiscadejolteon'?.51:id==='thunderbolt'?.53:
     id==='choquedotrovao'?.52:.49;
  const hitEnd=id==='thunderbolt'?.92:.84;
  if(t>=hitStart&&t<hitEnd){
   const q=(t-hitStart)/(hitEnd-hitStart);
   const hitPhase=Math.min(3,Math.floor(q*4));
   const size=(id==='thunderbolt'?127:
     id==='faiscadejolteon'?111:id==='choquedotrovao'?84:61)*Math.max(.7,Math.min(s,1.18));
   const h=size*320/280;
   drew=img(g,packet.impacts[hitPhase],B[0]-size*.5,B[1]-h*.5,
           size,h,hitPhase===3?.53:1)||drew;
  }
  if(drew){
   stats.painted++;stats.last=id;
   const frameKey=id+'-'+(phase+1);
   stats.frames[frameKey]=(stats.frames[frameKey]||0)+1;
  }
  return drew;
 }
 function diagnostics(){
  return {version:'56.0',registered:moves.slice(),painted:stats.painted,last:stats.last,
   frames:{...stats.frames},ready:Object.fromEntries(moves.map(id=>{
    const v=sets.get(id);return [id,{main:v.main.filter(ready).length,impacts:v.impacts.filter(ready).length}];
   }))};
 }
 window.PokemonTorreCatalogElectricFourV56=diagnostics;
 return {accepts,paint,diagnostics};
})();
