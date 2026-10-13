/* Pokemon Torre V46 — independent electric pixel-sprite rendering kit.
 * Every actual stroke is a reusable authored SVG sprite, never a Canvas path,
 * CSS lightning rectangle, gradient, or other move's approved animation.
 */
const electricSpriteV46=(()=>{
 'use strict';
 const base='effects/moves/electric-original/';
 const names=['bolt-a','bolt-b','bolt-c','arc','spark','impact','storm-cloud'];
 const images=Object.create(null),registered=new Map(),counters=Object.create(null);
 const clamp=(v,lo=0,hi=1)=>Math.max(lo,Math.min(hi,v));
 const ease=v=>{const t=clamp(v);return t*t*(3-2*t)};
 const lerp=(a,b,t)=>a+(b-a)*t;
 const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/[^a-z0-9]/g,'');
 let error='';
 for(const name of names){
  const img=new Image();
  img.decoding='async';
  img.onerror=()=>{error='Electric sprite could not be loaded: '+name;};
  img.src=base+name+'.svg?v=46.0';
  images[name]=img;
 }
 function stamp(g,name,x,y,w,h,o={}){
  const src=images[name];
  if(!src?.naturalWidth||!g||!Number.isFinite(x)||!Number.isFinite(y))return false;
  const alpha=clamp(o.alpha===undefined?1:o.alpha);
  if(alpha<.015||w<=0||h<=0)return false;
  g.save();g.translate(x,y);g.rotate(o.rotation||0);
  if(o.flipX)g.scale(-1,1);
  g.globalAlpha=alpha;g.imageSmoothingEnabled=false;
  g.drawImage(src,-w/2,-h/2,w,h);
  g.restore();
  counters[name]=(counters[name]||0)+1;
  return true;
 }
 function between(g,name,x1,y1,x2,y2,height,options={}){
  const dx=x2-x1,dy=y2-y1,length=Math.hypot(dx,dy);
  if(length<2)return false;
  return stamp(g,name,(x1+x2)/2,(y1+y2)/2,length,
   height,{...options,rotation:Math.atan2(dy,dx)});
 }
 function add(name,desc){
  const id=norm(name);
  if(!id||typeof desc?.paint!=='function'||registered.has(id))
   throw Error('Duplicate or invalid V46 electric effect '+id);
  registered.set(id,Object.freeze(desc));
 }
 function resolve(f){
  const raw=f?.move?.name||f?.name||f?.skill?.name||f?.moveName||'';
  const k=norm(raw);
  return registered.get(k)||null;
 }
 function paint(g,fx,now,e){
  const d=resolve(fx);if(!d)return false;
  if(!Array.isArray(fx.from)||!Array.isArray(fx.to)||now<fx.at)return true;
  const t=clamp((now-fx.at)/(fx.duration||d.duration)),s=clamp((e?.h||560)/560,.72,1.16);
  try{d.paint(g,fx,t,now-fx.at,s,{stamp,between,clamp,ease,lerp});}
  catch(err){error=d.key+': '+err.message;console.warn('[V46 Electric]',err)}
  return true;
 }
 function diagnostics(){return {
  version:'46.0',registered:[...registered.keys()],
  ready:Object.fromEntries(names.map(n=>[n,!!images[n].naturalWidth])),
  stamps:{...counters},error
 }}
 return {add,resolve,paint,stamp,between,clamp,ease,lerp,images,diagnostics};
})();
