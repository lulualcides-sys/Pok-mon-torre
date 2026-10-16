/* V109 — authentic pixel hit effects, no floating isolated fists/feet sourced from
 * the user's own GBA gallery and baked by Pillow to 8/12/16 WEBP frames.
 * Cross Chop preserves V107 art and shrinks 70% against original.
 * All four reuse V104 physical approach, native single hit and retreat.
 * NO geometric CSS/Canvas strokes, projectile, or replayed cinematic footage.
 */
window.PokemonTorreFightingPixelsV109=(()=>{
 'use strict';
 const moves={chute:{frames:8,hit:.59},karate:{frames:12,hit:.59},brick:{frames:16,hit:.63}};
 const imgs=new Map(),draws={},errors=[];let pixi=0,canvas=0,loads=0,last=null;
 for(const key of Object.keys(moves)){
  const img=new Image();img.decoding='async';
  img.addEventListener?.('load',()=>loads++);
  img.addEventListener?.('error',()=>errors.push('sheet missing '+key));
  img.src='effects/moves/v109-fighting/sheets/'+key+'.webp?build=v109-contact-pixel';
  imgs.set(key,img);
 }
 function render(g,a,name){
  const sp=moves[name],img=imgs.get(name);
  if(!sp||!g||!img?.complete||img.naturalWidth!==sp.frames*128||img.naturalHeight!==128)return false;
  const t=Math.max(0,Math.min(1,a.t)),frame=Math.min(sp.frames-1,Math.floor(t*sp.frames));
  const x=a.to[0],y=a.to[1],scale=Math.max(.78,Math.min(1.25,Number(a.scale)||1));
  const w=130*scale,h=130*scale,alpha=t>.88?Math.max(0,(1-t)/.12):1;
  let gpu=false;
  try{
   if(typeof pixiFX!=='undefined'&&typeof engine!=='undefined'&&pixiFX.paintFightingSheet)
    gpu=pixiFX.paintFightingSheet(engine,'v109-'+name,img,frame,{
     width:128,height:128,frames:sp.frames,x,y,displayW:w,displayH:h,
     alpha,t,hit:sp.hit
    });
  }catch(e){errors.push('Pixi '+name+': '+String(e).slice(0,90));}
  if(gpu)pixi++;
  else{
   g.save();
   try{g.globalAlpha*=alpha;g.imageSmoothingEnabled=false;
    g.drawImage(img,frame*128,0,128,128,x-w*.50,y-h*.52,w,h);
   }finally{g.restore();}
   canvas++;
  }
  draws[name]=(draws[name]||0)+1;last={name,frame:frame+1,frames:sp.frames,renderer:gpu?'PixiJS':'pixel-sprite'};
  return true;
 }
 const pairs=[['Chute','chute'],['Golpe de Karatê','karate'],['Brick Break','brick']];
 for(const [name,key] of pairs){
  if(!window.PokemonTorreFightingV104?.retexture)throw Error('V109 missing physical V104 motor');
  window.PokemonTorreFightingV104.retexture(name,(g,a)=>render(g,a,key));
 }
 return {render,diagnostics:()=>({
  version:'109.0',source:'original GBA gallery pixel sprites; Pillow nearest-neighbor',
  ready:[...imgs.entries()].filter(([k,img])=>img?.complete&&img.naturalWidth===moves[k].frames*128).map(([k])=>k),
  files:3,loads,draws:{...draws},pixiFrames:pixi,canvasFrames:canvas,last,errors:errors.slice(-10)
 })};
})();
