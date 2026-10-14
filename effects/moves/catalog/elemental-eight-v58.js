/* Pokemon Torre V58: eight independently authored water/ice frame atlases.
   Transparent sprites drawn from generator tools/build_elemental_v58.py.
   Effects-only: damage, misses, PP/energy and collision stay in battle engine.
   Water V45 and prior approved modules remain untouched.
*/
const elementalEightV58=(()=>{
 'use strict';
 const ROOT='effects/elements/';
 const categories={
  kraken:'water',waterball:'water','water-drop':'water',
  'water-hurricane':'water',geyser:'water',
  'ice-crystal':'ice','ice-spike':'ice',snowflake:'ice'
 };
 const assets=Object.create(null),drawn=Object.create(null);
 for(const [name,element] of Object.entries(categories)){
  const image=new Image();
  image.decoding='async';
  image.src=ROOT+element+'/'+name+'/atlas.png?v=58.0';
  assets[name]=image;
 }
 // Catalog moves are registered by existing individual files. Only the
 // following keys swap their generic VFX for V58 sprites.
 const profiles={
  catalog_blizzard:['water-hurricane','snowflake','ice-spike'],
  catalog_nevasca:['water-hurricane','snowflake','ice-crystal'],
  catalog_nevascaemarea:['snowflake','water-hurricane','ice-spike'],
  catalog_avalanche:['ice-spike','ice-crystal'],
  catalog_cacodegelo:['ice-crystal'],
  catalog_campogelado:['ice-crystal','snowflake'],
  catalog_estilhacosdegelo:['ice-spike'],
  catalog_fragmentosdegelo:['ice-crystal','ice-spike'],
  catalog_iceshard:['ice-spike'],
  catalog_impactoglacial:['ice-spike','ice-crystal'],
  catalog_geadapersistente:['snowflake','ice-crystal'],
  catalog_podegelo:['snowflake'],
  catalog_soprocongelante:['snowflake','ice-crystal'],
  catalog_ventogelado:['water-hurricane','snowflake'],
  catalog_jatodagua:['waterball','water-drop'],
  catalog_jatodeagua:['waterball','water-drop'],
  catalog_pistoladagua:['waterball','water-drop'],
  catalog_pulsodagua:['waterball','water-drop'],
  catalog_pulsodeagua:['waterball','water-drop'],
  catalog_bubblebeam:['waterball','water-drop'],
  catalog_bolhas:['waterball','water-drop'],
  catalog_ondadebolhas:['waterball','water-drop'],
  catalog_ondagigante:['water-hurricane','geyser'],
  catalog_raiocongelante:['ice-crystal','snowflake'],
  catalog_salpicar:['water-drop'],
  catalog_kraken:['kraken','water-drop'],
  catalog_geyser:['geyser','water-drop'],
  catalog_waterhurricane:['water-hurricane','water-drop'],
  catalog_whirlpool:['water-hurricane','waterball'],
  catalog_surf:['water-hurricane','geyser']
 };
 const names={'tempestadedeneve':['snowflake','water-hurricane','ice-spike']};
 const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/[^a-z0-9]/g,'');
 const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
 function accepts(key){return Object.prototype.hasOwnProperty.call(profiles,key);}
 function supportsName(raw){return Object.prototype.hasOwnProperty.call(names,norm(raw));}
 function stageOf(kind){return ['waterball','ice-crystal'].includes(kind)?'projectile':
  kind==='kraken'||kind==='water-hurricane'||kind==='snowflake'?'area':'target';}
 function stamp(g,kind,phase,x,y,w,h,alpha){
  const im=assets[kind];
  if(!im?.naturalWidth||!im.naturalHeight||!Number.isFinite(x+y+w+h)||w<=0||h<=0)return false;
  const index=clamp(Math.floor(phase),0,7);
  g.save();g.imageSmoothingEnabled=true;g.globalAlpha=clamp(alpha);
  g.drawImage(im,index*144,0,144,144,x-w*.5,y-h*.5,w,h);
  g.restore();
  drawn[kind]=(drawn[kind]||0)+1;
  return true;
 }
 function render(g,fx,t,now,s,low,layers){
  if(!g||!Array.isArray(fx?.from)||!Array.isArray(fx?.to))return false;
  const A=fx.from,B=fx.to,phase=Math.min(7,Math.floor(clamp(t)*8));
  const dx=B[0]-A[0],dy=B[1]-A[1],zoom=clamp(s,.70,1.17);
  const fade=phase===7?clamp((1-t)*7):1;
  let painted=false;
  for(let i=0;i<layers.length;i++){
   const kind=layers[i],stage=stageOf(kind);
   const offset=(i===0?0:i*.105);
   const local=clamp((t-offset)/(1-offset));
   if(t<offset)continue;
   let x=B[0],y=B[1],w=94,h=94;
   if(stage==='projectile'){
    const travel=clamp((local-.07)/.65);
    x=A[0]+dx*travel;y=A[1]+dy*travel;
    w=kind==='waterball'?49:61;h=w;
   }else if(stage==='area'){
    w=kind==='kraken'?146:kind==='water-hurricane'?148:118;
    h=kind==='kraken'?132:kind==='water-hurricane'?154:120;
   }else if(kind==='geyser'){w=114;h=167;y=B[1]-37*zoom;}
   else if(kind==='ice-spike'){w=117;h=131;y=B[1]-12*zoom;}
   else if(kind==='water-drop'){w=103;h=100;}
   else if(kind==='snowflake'){w=113;h=113;}
   if(stage==='projectile'&&local>.72){
    // Freeze projectile at target, then allow impact sprite to finish.
    x=B[0];y=B[1];
   }
   const alpha=fade*(i===0?1:.88);
   painted=stamp(g,kind,Math.floor(local*8),x,y,w*zoom,h*zoom,alpha)||painted;
  }
  return painted;
 }
 function paint(g,fx,t,now,s,low,key){
  const list=profiles[key];if(!list)return false;
  return render(g,fx,t,now,s,low,list);
 }
 function paintNamed(g,fx,now,e){
  const raw=fx?.move?.name||fx?.name||'',layers=names[norm(raw)];
  if(!layers)return false;
  const duration=Math.max(400,fx?.duration||1100);
  const t=clamp((now-(fx?.at||now))/duration);
  const s=clamp((e?.h||420)/430,.70,1.17);
  return render(g,fx,t,now,s,false,layers);
 }
 function diagnostics(){
  return {version:'58.0',atlases:Object.fromEntries(Object.entries(assets)
     .map(([name,img])=>[name,!!img.naturalWidth])),
    catalogMoves:Object.keys(profiles).length,
    namedMoves:Object.keys(names),frames:{...drawn}};
 }
 window.PokemonTorreElementalV58=diagnostics;
 return {accepts,supportsName,paint,paintNamed,diagnostics};
})();
