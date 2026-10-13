/* Pokemon Torre V36.03: hand-authored sprite scenes, no geometric VFX.
   Explicit move-name override. Existing Tri Attack remains untouched. */
const uniqueMoveFX=(()=>{
 'use strict';
 const scenes=new Map(),textureCache=new Map();
 const key=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const clamp=t=>Math.min(1,Math.max(0,t));
 const smooth=t=>{t=clamp(t);return t*t*(3-2*t)};
 const lerp=(a,b,t)=>a+(b-a)*t;
 function texture(path){if(!textureCache.has(path))textureCache.set(path,PIXI.Texture.from('effects/moves/'+path+'?build=v3605'));return textureCache.get(path)}
 function sprite(root,path,w,h,alpha=0){
  const s=new PIXI.Sprite(texture(path));s.anchor.set(.5);s.width=w;s.height=h;s.alpha=alpha;root.addChild(s);return s;
 }
 function preload(paths){if(!window.PIXI?.Texture)return;for(const p of paths)texture(p)}
 function register(names,fn){for(const name of names){const k=key(name);if(scenes.has(k)){if(scenes.get(k)!==fn)throw Error('Duplicated scene: '+name);continue;}scenes.set(k,fn)}}
 // Clone the ORIGINAL illustrated sprite silhouette: one dark blurred depth
 // layer below and one restrained tinted bloom above. Never draw a generic
 // circle, polygon or transparent shader rectangle as a replacement attack.
 function light(root,sp,{hue=0xcaa4ef,shade=0x160b34,blur=3.2,strength=.40,dx=3,dy=4}={}){
  const back=new PIXI.Sprite(sp.texture);
  back.anchor.copyFrom(sp.anchor);back.tint=shade;back.alpha=0;
  const bloom=new PIXI.Sprite(sp.texture);
  bloom.anchor.copyFrom(sp.anchor);bloom.tint=hue;bloom.alpha=0;
  bloom.blendMode=PIXI.BLEND_MODES.ADD;
  const index=root.getChildIndex(sp);
  root.addChildAt(back,index);root.addChildAt(bloom,index+1);
  // A crisp BLACK rim follows the real sprite silhouette instead of drawing
  // an abstract shape. Four copies surround the original alpha mask.
  const rimOffsets=[[-1.7,0],[1.7,0],[0,-1.7],[0,1.7]];
  const outlines=rimOffsets.map(()=>{
   const ink=new PIXI.Sprite(sp.texture);ink.tint=0x03070c;ink.alpha=0;
   ink.anchor.copyFrom(sp.anchor);
   root.addChildAt(ink,root.getChildIndex(sp));
   return ink;
  });
  const Filter=PIXI.BlurFilter||PIXI.filters?.BlurFilter;
  if(Filter){back.filters=[new Filter(blur)];bloom.filters=[new Filter(blur*1.16)];}
  (root.__ptDepth||=[]).push({sp,back,bloom,outlines,rimOffsets,strength,dx,dy});
  return sp;
 }
 function sync(root){
  for(const {sp,back,bloom,outlines,rimOffsets,strength,dx,dy} of root.__ptDepth||[]){
   for(const e of [back,bloom,...outlines]){
    if(e.texture!==sp.texture)e.texture=sp.texture;
    e.anchor.copyFrom(sp.anchor);
    e.rotation=sp.rotation;
    e.scale.copyFrom(sp.scale);
   }
   outlines.forEach((ink,i)=>{
    ink.position.set(sp.position.x+rimOffsets[i][0],sp.position.y+rimOffsets[i][1]);
    ink.alpha=Math.min(.95,Math.max(0,sp.alpha*.94));
   });
   back.position.set(sp.position.x+dx,sp.position.y+dy);
   back.alpha=Math.min(.8,Math.max(0,sp.alpha*.61));
   bloom.position.copyFrom(sp.position);
   bloom.alpha=Math.min(.50,Math.max(0,sp.alpha*strength));
  }
 }
 function frameSet(prefix,count){
  const paths=Array.from({length:count},(_,i)=>prefix+i+'.svg');
  return paths.map(texture);
 }
 function updateFrame(sp,frames,clock,shift=0,period=86){
  if(!frames?.length)return;
  const idx=(Math.floor(clock/period)+shift)%frames.length;
  if(sp.texture!==frames[idx])sp.texture=frames[idx];
 }
 function create(opts){
  const fn=scenes.get(key(opts?.name||opts?.f?.move?.name));
  if(!fn)return null;
  const scene=fn(opts);
  if(scene&&typeof scene.draw==='function'){
   const draw=scene.draw;
   scene.draw=function(now,t,dt){draw(now,t,dt);sync(opts.root);};
  }
  return scene;
 }
 return {register,create,sprite,preload,light,frameSet,updateFrame,key,clamp,smooth,lerp,TAU:Math.PI*2,registered:()=>[...scenes.keys()]};
})();
const previousUniqueCreate=cinematicVFX.create;
cinematicVFX.create=function(opts){return uniqueMoveFX.create(opts)||previousUniqueCreate(opts)};
window.PokemonTorreUniqueFX=()=>({version:'36.03',moves:uniqueMoveFX.registered(),sprites:true});
