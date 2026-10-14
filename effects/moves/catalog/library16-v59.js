/* Pokémon Torre V59 — 16 isolated original 8-frame cinematic sprite effects.
 * The historical approved moves are NOT in this opt-in allowlist. Never
 * change battle rules, hitboxes, damage, movement, status or cooldown.
 * Atlas generator: tools/build_library16_v59.py
 */
const library16V59=(()=>{
 'use strict';
 const VERSION='59.0',BASE='effects/elements/v59/';
 // Visual-only allowlist. Each is an EXISTING catalog move, not a new ability.
 // No legacy V45 water, V42 fire, approved V55/V57 electric or protected GBA.
 const map={
  catalog_brasaviva:{id:'fire_attack',mode:'projectile'},
  catalog_firespin:{id:'firewall',mode:'target'},
  catalog_explosion:{id:'explosion',mode:'target'},
  catalog_sunnyday:{id:'sun_strike',mode:'self'},
  catalog_raio:{id:'lightning',mode:'target'},
  catalog_ondaeletrica:{id:'lightning',mode:'target'},
  catalog_choquemagnetico:{id:'lightning_ball',mode:'projectile'},
  catalog_ventocortante:{id:'tornado',mode:'target'},
  catalog_ondadebolhas:{id:'water_attack',mode:'projectile'},
  catalog_bolhas:{id:'water_attack',mode:'projectile'},
  catalog_pedraafiada:{id:'spikes',mode:'target'},
  catalog_pedrasemarea:{id:'spikes',mode:'target'},
  catalog_protect:{id:'shield',mode:'self'},
  catalog_barreirapsiquica:{id:'shield',mode:'self'},
  catalog_esferaescura:{id:'black_hole',mode:'target'},
  catalog_sombranoturna:{id:'black_hole',mode:'target'},
  catalog_hypnosis:{id:'hypnosis',mode:'target'},
  catalog_raioencantado:{id:'magic_arrow',mode:'projectile'},
  catalog_orbemistico:{id:'magic_arrow',mode:'projectile'},
  catalog_brilhomagico:{id:'midas_touch',mode:'target'},
  catalog_vozencantadora:{id:'midas_touch',mode:'target'},
  catalog_nevoatoxica:{id:'cloud',mode:'target'},
  catalog_nevoavenenosa:{id:'cloud',mode:'target'},
  catalog_futuresight:{id:'time',mode:'target'},
  catalog_premonicao:{id:'time',mode:'target'},
  catalog_agility:{id:'time',mode:'self'}
 };
 const families=['fire_attack','firewall','explosion','sun_strike','lightning',
  'lightning_ball','tornado','water_attack','spikes','shield','black_hole',
  'hypnosis','magic_arrow','midas_touch','cloud','time'];
 const sources=new Map(),hits=Object.create(null),faults=[];
 for(const id of families){
  const image=new Image();image.decoding='async';
  image.onerror=()=>{faults.push(id+' atlas not found');};
  image.src=BASE+id+'/atlas.png?v='+VERSION;
  sources.set(id,image);
 }
 const clamp=(t,a=0,b=1)=>Math.max(a,Math.min(b,t));
 const ease=t=>{t=clamp(t);return t*t*(3-2*t);};
 function accepts(k){return Object.prototype.hasOwnProperty.call(map,k);}
 function stamp(g,asset,phase,x,y,w,h,alpha,angle=0){
  if(!asset?.naturalWidth||asset.naturalWidth!==1280||asset.naturalHeight!==160)return false;
  if(!Number.isFinite(x+y+w+h+alpha+angle)||w<=0||h<=0)return false;
  g.save();
  g.translate(x,y);g.rotate(angle);
  g.globalAlpha=clamp(alpha);g.imageSmoothingEnabled=true;
  g.drawImage(asset,Math.floor(clamp(phase,0,7))*160,0,160,160,
   -w*.5,-h*.5,w,h);
  g.restore();
  return true;
 }
 function paint(g,f,t,now,s,low,key){
  const profile=map[key];if(!profile||!g||!Array.isArray(f?.from)||!Array.isArray(f?.to))return false;
  const asset=sources.get(profile.id);
  if(!asset?.naturalWidth)return false; // transparent fallback to existing painter
  const A=f.from,B=f.to;
  const p=clamp(t),step=Math.min(7,Math.floor(p*8));
  const alpha=step===7?1-clamp((p*8-7)*.84):1;
  const scale=clamp(s,.67,1.15);
  let x=B[0],y=B[1],width=116,height=116,rotation=0;
  if(profile.mode==='self'){x=A[0];y=A[1];}
  if(profile.mode==='projectile'){
   const q=ease((p-.11)/.69);
   x=A[0]+(B[0]-A[0])*q;y=A[1]+(B[1]-A[1])*q;
   width=94;height=94;
   if(profile.id==='magic_arrow'){
    width=103;height=103;
    rotation=Math.atan2(B[1]-A[1],B[0]-A[0])+.48;
   }else if(profile.id==='lightning_ball'){width=88;height=88;}
   else if(profile.id==='fire_attack'){width=97;height=97;}
  }
  if(profile.id==='firewall'){width=167;height=141;y+=16*scale;}
  if(profile.id==='explosion'){width=137;height=137;}
  if(profile.id==='sun_strike'){width=117;height=158;y-=15*scale;}
  if(profile.id==='lightning'){width=132;height=173;y-=22*scale;}
  if(profile.id==='tornado'){width=149;height=151;y-=10*scale;}
  if(profile.id==='water_attack'){width=111;height=100;}
  if(profile.id==='spikes'){width=146;height=113;y+=22*scale;}
  if(profile.id==='shield'){width=148;height=148;}
  if(profile.id==='black_hole'){width=150;height=133;}
  if(profile.id==='hypnosis'){width=138;height=138;}
  if(profile.id==='midas_touch'){width=127;height=127;}
  if(profile.id==='cloud'){width=156;height=134;}
  if(profile.id==='time'){width=138;height=138;}
  const ok=stamp(g,asset,step,x,y,width*scale,height*scale,alpha,rotation);
  if(ok){hits[profile.id]=(hits[profile.id]||0)+1;}
  return ok;
 }
 function diagnostics(){
  return {version:VERSION,registeredEffects:families.slice(),assignedMoves:Object.keys(map).length,
   ready:Object.fromEntries(families.map(id=>[id,sources.get(id).naturalWidth===1280])),
   rendered:{...hits},errors:faults.slice()};
 }
 window.PokemonTorreLibrary16V59=diagnostics;
 return {accepts,paint,diagnostics};
})();
