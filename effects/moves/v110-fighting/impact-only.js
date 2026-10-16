/* Pokémon Torre V110 — ONLY gallery sprite contact hits for 3 Fighting moves.
 * Original GBA pixel textures are pre-baked with Pillow, 8/12/16 unique frames.
 * No Canvas drawing/CSS, projectile, detached hands/feet, video or pre-hit FX.
 * V104 remains sole owner of movement, damage, contact and recoil.
 */
window.PokemonTorreFightingContactV110=(()=>{
 'use strict';
 const defs={chute:{frames:8,hit:.59},karate:{frames:12,hit:.59},brick:{frames:16,hit:.63}};
 const images=new Map(),draws={},errors=[];
 let loaded=0,pixiFrames=0,canvasFrames=0,last=null;
 for(const name of Object.keys(defs)){
  const img=new Image();img.decoding='async';
  img.addEventListener?.('load',()=>loaded++);
  img.addEventListener?.('error',()=>errors.push('Missing GBA impact sprites: '+name));
  img.src='effects/moves/v110-fighting/sheets/'+name+'.webp?build=v110-impacts-only';
  images.set(name,img);
 }
 function paint(g,a,name){
  const spec=defs[name],img=images.get(name);
  if(!g||!spec||!img?.complete||img.naturalWidth!==spec.frames*96||img.naturalHeight!==96)return false;
  const t=Math.max(0,Math.min(1,Number(a.t)||0));
  const frame=Math.min(spec.frames-1,Math.floor(t*spec.frames));
  const scale=Math.max(.7,Math.min(1.35,Number(a.scale)||1));
  // The physical body centre, not the old above-the-head contact anchor.
  const x=a.to[0],y=a.to[1]+38*scale,w=110*scale,h=110*scale;
  const alpha=t>.89?Math.max(0,(1-t)/.11):1;
  let pixi=false;
  try{
   if(typeof pixiFX!=='undefined'&&typeof engine!=='undefined'&&pixiFX.paintFightingSheet)
    pixi=pixiFX.paintFightingSheet(engine,'v110-'+name,img,frame,{
     width:96,height:96,frames:spec.frames,x,y,displayW:w,displayH:h,
     alpha,t,hit:spec.hit
    });
  }catch(e){errors.push(String(e).slice(0,140));}
  if(pixi)pixiFrames++;
  else{
   g.save();
   try{g.globalAlpha*=alpha;g.imageSmoothingEnabled=false;
    g.drawImage(img,frame*96,0,96,96,x-w*.5,y-h*.5,w,h);
   }finally{g.restore();}
   canvasFrames++;
  }
  draws[name]=(draws[name]||0)+1;
  last={name,frame:frame+1,x,y,renderer:pixi?'PixiJS':'sprite'};
  return true;
 }
 for(const [name,key] of [['Chute','chute'],['Golpe de Karatê','karate'],['Brick Break','brick']]){
  if(!window.PokemonTorreFightingV104?.retexture)throw Error('V110 needs physical V104 motor');
  window.PokemonTorreFightingV104.retexture(name,(g,a)=>paint(g,a,key));
 }
 return {paint,diagnostics:()=>({
  version:'110.0',purpose:'impact only, no pre-strike graphics',
  loaded,ready:[...images.entries()].filter(([k,v])=>v?.complete&&v.naturalWidth===defs[k].frames*96).map(([k])=>k),
  draws:{...draws},canvasFrames,pixiFrames,last,errors:errors.slice(-10)
 })};
})();
