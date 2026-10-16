/* V108 — authentic hand/foot/brick contact pixel sprites sourced from
 * the user's own GBA gallery and baked by Pillow to 8/12/16 WEBP frames.
 * Cross Chop keeps V107 art/timing and only changes visual scale.
 * All four reuse V104 physical approach, native single hit and retreat.
 * NO geometric CSS/Canvas strokes, projectile, or replayed cinematic footage.
 */
window.PokemonTorreFightingPixelsV108=(()=>{
 'use strict';
 const moves={chute:{frames:8,hit:.59},karate:{frames:12,hit:.59},brick:{frames:16,hit:.63}};
 const imgs=new Map(),draws={},errors=[];let pixi=0,canvas=0,loads=0,last=null;
 for(const key of Object.keys(moves)){
  const img=new Image();img.decoding='async';
  img.addEventListener?.('load',()=>loads++);
  img.addEventListener?.('error',()=>errors.push('sheet missing '+key));
  img.src='effects/moves/v108-fighting/sheets/'+key+'.webp?build=v108-gba-pixels';
  imgs.set(key,img);
 }
 function render(g,a,name){
  const sp=moves[name],img=imgs.get(name);
  if(!sp||!g||!img?.complete||img.naturalWidth!==sp.frames*96||img.naturalHeight!==96)return false;
  const t=Math.max(0,Math.min(1,a.t)),frame=Math.min(sp.frames-1,Math.floor(t*sp.frames));
  const x=a.to[0],y=a.to[1],scale=Math.max(.78,Math.min(1.25,Number(a.scale)||1));
  const w=98*scale,h=98*scale,alpha=t>.88?Math.max(0,(1-t)/.12):1;
  let gpu=false;
  try{
   if(typeof pixiFX!=='undefined'&&typeof engine!=='undefined'&&pixiFX.paintFightingSheet)
    gpu=pixiFX.paintFightingSheet(engine,'v108-'+name,img,frame,{
     width:96,height:96,frames:sp.frames,x,y,displayW:w,displayH:h,
     alpha,t,hit:sp.hit
    });
  }catch(e){errors.push('Pixi '+name+': '+String(e).slice(0,90));}
  if(gpu)pixi++;
  else{
   g.save();
   try{g.globalAlpha*=alpha;g.imageSmoothingEnabled=false;
    g.drawImage(img,frame*96,0,96,96,x-w*.50,y-h*.52,w,h);
   }finally{g.restore();}
   canvas++;
  }
  draws[name]=(draws[name]||0)+1;last={name,frame:frame+1,frames:sp.frames,renderer:gpu?'PixiJS':'pixel-sprite'};
  return true;
 }
 const pairs=[['Chute','chute'],['Golpe de Karatê','karate'],['Brick Break','brick']];
 for(const [name,key] of pairs){
  if(!window.PokemonTorreFightingV104?.retexture)throw Error('V108 missing physical V104 motor');
  window.PokemonTorreFightingV104.retexture(name,(g,a)=>render(g,a,key));
 }
 return {render,diagnostics:()=>({
  version:'108.0',source:'original GBA gallery pixel sprites; Pillow nearest-neighbor',
  ready:[...imgs.entries()].filter(([k,img])=>img?.complete&&img.naturalWidth===moves[k].frames*96).map(([k])=>k),
  files:3,loads,draws:{...draws},pixiFrames:pixi,canvasFrames:canvas,last,errors:errors.slice(-10)
 })};
})();
