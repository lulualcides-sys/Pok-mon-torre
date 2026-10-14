/* Pokemon Torre V63 — FOUR user-approved Grass status animations.
 * Stun Spore / Pó do Sono / Leech Seed / Esporos.
 * The legacy catalog status VFX is replaced, NOT layered underneath.
 * Drawing only; HP, status application, energy, cooldown and hits stay in engine.
 * Other saved/approved effects (incl. V60/61 ice/electric) are untouched.
 */
const plantFourV63=(()=>{
 'use strict';
 const ROOT='effects/moves/v63-plant/',VERSION='63.0';
 const profiles=Object.freeze({
  catalog_stunspore:{id:'stun-spore',width:131,height:127},
  catalog_podosono:{id:'po-do-sono',width:148,height:137},
  catalog_leechseed:{id:'leech-seed',width:145,height:135},
  catalog_esporos:{id:'esporos',width:165,height:146}
 });
 const ids=['stun-spore','po-do-sono','leech-seed','esporos'];
 const src=Object.create(null),frames=Object.create(null);
 const drawn=Object.create(null),errors=[];
 for(const id of ids){
  const img=new Image();img.decoding='async';
  img.onerror=()=>errors.push('Failed to load '+id);
  img.onload=()=>{
   if(img.naturalWidth!==1536||img.naturalHeight!==192)return;
   if(typeof createImageBitmap!=='function')return;
   Promise.all(Array.from({length:8},(_,i)=>
     createImageBitmap(img,i*192,0,192,192))).then(parts=>{frames[id]=parts;})
    .catch(()=>{ /* Original atlas remains available as fallback. */ });
  };
  img.src=ROOT+id+'/atlas.png?v='+VERSION;
  src[id]=img;
 }
 const clamp=(x,lo=0,hi=1)=>Math.max(lo,Math.min(hi,x));
 const accepts=key=>Object.prototype.hasOwnProperty.call(profiles,key);
 function paint(g,fx,t,now,s,low,key){
  const profile=profiles[key];
  if(!profile)return false;
  // Always consume the four new statuses even before an atlas loads, so that
  // the old catalog/semantic FX can never be drawn on top of approved sprites.
  if(!g||!Array.isArray(fx?.to))return true;
  const im=src[profile.id];
  if(im?.naturalWidth!==1536||im.naturalHeight!==192)return true;
  const phase=clamp(t),frame=Math.min(7,Math.floor(phase*8));
  const scale=clamp(s,.7,1.16);
  const [x,y]=fx.to;
  if(!Number.isFinite(x)||!Number.isFinite(y))return true;
  const fade=frame===7?clamp((1-phase)*8):1;
  const w=profile.width*scale,h=profile.height*scale;
  g.save();g.imageSmoothingEnabled=true;g.globalAlpha=fade;
  const bitmap=frames[profile.id]?.[frame];
  if(bitmap)g.drawImage(bitmap,x-w*.5,y-h*.57,w,h);
  else g.drawImage(im,frame*192,0,192,192,x-w*.5,y-h*.57,w,h);
  g.restore();
  drawn[profile.id]=(drawn[profile.id]||0)+1;
  return true;
 }
 const diagnostics=()=>({
  version:VERSION,moves:Object.keys(profiles),art:ids.slice(),
  ready:Object.fromEntries(ids.map(id=>[id,src[id].naturalWidth===1536])),
  predecoded:Object.fromEntries(ids.map(id=>[id,frames[id]?.length||0])),
  framesDrawn:{...drawn},errors:errors.slice(),legacyVisualsReplaced:true
 });
 window.PokemonTorrePlantFourV63=diagnostics;
 return {accepts,paint,diagnostics};
})();
