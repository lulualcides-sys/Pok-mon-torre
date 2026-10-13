/* Pokemon Torre V43 — water/status sprite renderer.
 * Source tiles isolated from ORIGINAL water images supplied by the player:
 * water_pixel_splash_sheet.png and large_water_elemental_and_waves_spritesheet.png.
 * 20 original-source pixel frames of 48x48, five columns. No procedural Canvas circles/CSS.
 */
const waterSpriteV43=(()=>{
 'use strict';
 const sprites=new Map(),counters=Object.create(null),frames=Object.create(null);
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
 const lerp=(a,b,t)=>a+(b-a)*t;
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const source=new Image(),psychic=new Image();
 source.decoding='async';
 source.src='effects/moves/water-original/water-original-v43-atlas.png?v=43.1';
 psychic.decoding='async';
 psychic.src='effects/moves/gba-assets/psychic-original-v3.png?v=water43';
 let error='';
 source.onerror=()=>{error='Failed to load player water sprite atlas';};
 psychic.onerror=()=>{error='Missing approved psychic sprite atlas for Amnesia';};
 function draw(g,id,x,y,w,h,opt={}){
  if(!g||!source.naturalWidth||!Number.isFinite(id))return false;
  const frame=Math.max(0,Math.min(19,Math.floor(id)));
  const alpha=clamp(opt.alpha===undefined?1:opt.alpha);
  if(alpha<.02||w<=0||h<=0)return false;
  g.save();g.globalAlpha=alpha;g.imageSmoothingEnabled=false;
  g.translate(x,y);g.rotate(opt.rotation||0);
  if(opt.flipX)g.scale(-1,1);
  g.drawImage(source,(frame%5)*48,Math.floor(frame/5)*48,48,48,-w/2,-h/2,w,h);
  g.restore();frames[frame]=(frames[frame]||0)+1;return true;
 }
 function mind(g,id,x,y,w,h,opt={}){
  if(!g||!psychic.naturalWidth)return false;
  const frame=((Math.floor(id)%18)+18)%18;
  const alpha=clamp(opt.alpha===undefined?1:opt.alpha);
  if(alpha<.02)return false;
  g.save();g.globalAlpha=alpha;g.imageSmoothingEnabled=false;
  g.translate(x,y);g.rotate(opt.rotation||0);
  g.drawImage(psychic,(frame%8)*72,Math.floor(frame/8)*72,72,72,-w/2,-h/2,w,h);
  g.restore();frames['psychic_'+frame]=(frames['psychic_'+frame]||0)+1;return true;
 }
 function add(name,descriptor){
  const key=norm(name);if(sprites.has(key)||typeof descriptor?.paint!=='function')throw Error('Duplicate water move '+key);
  sprites.set(key,Object.freeze(descriptor));
 }
 function resolve(fx){return sprites.get(norm(fx?.move?.name||fx?.name))||null;}
 function paint(g,fx,now,engine){
  const d=resolve(fx);if(!d)return false;
  if(!Array.isArray(fx.from)||!Array.isArray(fx.to)||!Number.isFinite(now)||now<fx.at)return true;
  const duration=Math.max(350,fx.duration||d.duration),t=clamp((now-fx.at)/duration);
  const scale=clamp((engine?.h||560)/560,.72,1.17);
  try{d.paint(g,fx,t,now-fx.at,scale,{draw,mind,clamp,ease,lerp});counters[d.key]=(counters[d.key]||0)+1;}
  catch(e){error=d.key+': '+e.message;console.warn('[Water sprite V43]',e);}
  return true;
 }
 return {add,resolve,paint,draw,mind,clamp,ease,lerp,source,psychic,
  diagnostics:()=>({version:'43.1',mode:'original sprites + isolated casts',
   waterReady:!!source.naturalWidth,psychicReady:!!psychic.naturalWidth,
   registered:[...sprites.keys()],casts:{...counters},frames:{...frames},error})};
})();
