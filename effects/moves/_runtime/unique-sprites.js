/* Pokemon Torre V36.03: hand-authored sprite scenes, no geometric VFX.
   Explicit move-name override. Existing Tri Attack remains untouched. */
const uniqueMoveFX=(()=>{
 'use strict';
 const scenes=new Map(),textureCache=new Map();
 const key=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const clamp=t=>Math.min(1,Math.max(0,t));
 const smooth=t=>{t=clamp(t);return t*t*(3-2*t)};
 const lerp=(a,b,t)=>a+(b-a)*t;
 function texture(path){if(!textureCache.has(path))textureCache.set(path,PIXI.Texture.from('effects/moves/'+path));return textureCache.get(path)}
 function sprite(root,path,w,h,alpha=0){
  const s=new PIXI.Sprite(texture(path));s.anchor.set(.5);s.width=w;s.height=h;s.alpha=alpha;root.addChild(s);return s;
 }
 function preload(paths){if(!window.PIXI?.Texture)return;for(const p of paths)texture(p)}
 function register(names,fn){for(const name of names){const k=key(name);if(scenes.has(k)){if(scenes.get(k)!==fn)throw Error('Duplicated scene: '+name);continue;}scenes.set(k,fn)}}
 function create(opts){return scenes.get(key(opts?.name||opts?.f?.move?.name))?.(opts)||null}
 return {register,create,sprite,preload,key,clamp,smooth,lerp,TAU:Math.PI*2,registered:()=>[...scenes.keys()]};
})();
const previousUniqueCreate=cinematicVFX.create;
cinematicVFX.create=function(opts){return uniqueMoveFX.create(opts)||previousUniqueCreate(opts)};
window.PokemonTorreUniqueFX=()=>({version:'36.03',moves:uniqueMoveFX.registered(),sprites:true});
