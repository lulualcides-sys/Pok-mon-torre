/* Pokémon Torre V107 — QUADROS DE SPRITES reais (ilustrados, pré-renderizados).
 * Fonte das imagens: spritesheets WEBP RGBA derivados dos atlases ilustrados
 * aprovados existentes no GitHub, gerados por Python/Pillow no build.
 * Render: PixiJS Sprite/Texture + @pixi/particle-emitter no WebGL.
 * Android WebGL indisponível: drawImage dos MESMOS quadros pré-renderizados.
 * PROIBIDO criar riscos, círculos, retângulos, polígonos, PNG estático ou CSS VFX.
 * Movimento/dano nativo/recuo intactos V104; não cria projétil.
 */
window.PokemonTorreFightingSpritesV107=(()=>{
 'use strict';
 const specs={
  chute:{frames:8,hit:.59},
  karate:{frames:12,hit:.59},
  cross:{frames:16,hit:.62},
  brick:{frames:16,hit:.63}
 };
 const W=256,H=192,images=new Map(),rendered={},errors=[];
 let canvasFrames=0,pixiFrames=0,loads=0,attacks=0,latest=null;
 const clamp=v=>Math.max(0,Math.min(1,v));
 const loaded=img=>!!(img&&img.complete&&img.naturalWidth>0&&img.naturalHeight>0);
 for(const key of Object.keys(specs)){
  const im=new Image();
  im.decoding='async';
  im.addEventListener?.('load',()=>loads++);
  im.addEventListener?.('error',()=>errors.push('Missing WEBP sheet: '+key));
  // Each strip is a 256×192 transparent illustrated sequence, NOT a still.
  im.src='effects/moves/v107-fighting/sheets/'+key+'.webp?build=v107-cinematic-sprites';
  images.set(key,im);
 }
 function paint(g,a,name){
  const sp=specs[name],im=images.get(name);
  if(!sp||!g)return false;
  if(!loaded(im)||im.naturalWidth!==sp.frames*W||im.naturalHeight!==H)return false;
  const t=clamp(a.t),frame=Math.min(sp.frames-1,Math.floor(t*sp.frames));
  const scale=Math.max(.78,Math.min(1.28,Number(a.scale)||1));
  const x=a.to[0],y=a.to[1]+(name==='cross'?38*scale:0); // V110 torso centre
  // A full-illustration impact, centred on the opponent, not its travel path.
  const ratio=name==='cross'?.30:1;
  const w=258*scale*ratio,h=194*scale*ratio,alpha=t>.87?clamp((1-t)/.13):1;
  let pixi=false;
  try{
   if(typeof pixiFX!=='undefined'&&typeof engine!=='undefined'&&
      pixiFX.paintFightingSheet){
    pixi=pixiFX.paintFightingSheet(engine,name,im,frame,{
     frames:sp.frames,width:W,height:H,x,y,displayW:w,displayH:h,
     alpha,t,hit:sp.hit
    });
   }
  }catch(e){errors.push('Pixi '+name+' '+String(e).slice(0,120));}
  if(pixi)pixiFrames++;
  else{
   // Safe mode is a sprite-only fallback using pre-rendered illustrated sheet.
   // No Canvas2D shapes/CSS, and the black outline is baked into every frame.
   g.save();
   try{
    g.globalAlpha*=alpha;
    g.imageSmoothingEnabled=name==='cross';
    g.drawImage(im,frame*W,0,W,H,x-w*.5,y-h*.53,w,h);
   }finally{g.restore();}
   canvasFrames++;
  }
  rendered[name]=(rendered[name]||0)+1;attacks++;
  latest={name,frame:frame+1,of:sp.frames,x,y,renderer:pixi?'PixiJS':'native-sprite-canvas'};
  return true;
 }
 // Replacing visual callbacks does NOT touch combat hit timing or movements.
 for(const [name,style] of [
  ['Chute','chute'],['Golpe de Karatê','karate'],
  ['Cross Chop','cross'],['Brick Break','brick']]){
  if(!window.PokemonTorreFightingV104?.retexture)
   throw Error('V107 Fighting requires V104 contact motor');
  window.PokemonTorreFightingV104.retexture(name,(g,a)=>paint(g,a,style));
 }
 return {paint,diagnostics:()=>({
  version:'107.0',renderer:'real-illustrated-sprite-atlas',
  moveFrames:{chute:8,karate:12,cross:16,brick:16},
  loaded:loads,total:images.size,
  ready:[...images.entries()].filter(([name,img])=>loaded(img)&&
   img.naturalWidth===specs[name].frames*W&&img.naturalHeight===H).map(([name])=>name),
  pixiFrames,canvasFrames,rendered:{...rendered},latest,
  errors:errors.slice(-12),source:'Pillow/illustrated game sprite atlases'
 })};
})();
