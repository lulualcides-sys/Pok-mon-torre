/* Pokémon Torre V60 — ONLY the four explicitly requested animations.
 * Visual-only: no gameplay damage, accuracy, collision, status, cooldown, or
 * energy writes. Previous approvals and the existing V58/V59 atlases remain.
 */
const cinematicFourV60=(()=>{
 'use strict';
 const VERSION='61.0',DIR='effects/moves/v60-four/';
 const specs={
  catalog_nevasca:{id:'nevasca',kind:'ice'},
  catalog_faiscadopikachu:{id:'faisca-do-pikachu',kind:'contact'},
  catalog_volttackle:{id:'volt-tackle',kind:'contact'}
 };
 const specialNames={'tempestadedeneve':'tempestade-de-neve'};
 const ids=['tempestade-de-neve','nevasca','faisca-do-pikachu','volt-tackle'];
 const pictures=Object.create(null),draws=Object.create(null),errors=[];
 const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/[^a-z0-9]/g,'');
 for(const id of ids){
  const image=new Image();image.decoding='async';
  image.onerror=()=>errors.push('Could not load '+id);
  image.src=DIR+id+'/atlas.png?v='+VERSION;
  pictures[id]=image;
 }
 const clip=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const ease=t=>{t=clip(t);return t*t*(3-2*t);};
 const accepts=k=>Object.prototype.hasOwnProperty.call(specs,k);
 const supportsName=name=>Object.prototype.hasOwnProperty.call(specialNames,norm(name));
 function draw(g,fx,t,size,id,kind){
  const im=pictures[id];
  if(!g||!im||im.naturalWidth!==2048||im.naturalHeight!==256
      ||!Array.isArray(fx?.from)||!Array.isArray(fx?.to))return false;
  const A=fx.from,B=fx.to;
  if(!A.every(Number.isFinite)||!B.every(Number.isFinite))return false;
  const time=clip(t),frame=Math.min(7,Math.floor(time*8));
  const zoom=clip(size,.67,1.15);
  let x=B[0],y=B[1],w=177,h=177,alpha=1;
  if(kind==='ice'){
    if(id==='tempestade-de-neve'){w=198;h=180;y-=5*zoom;}
    else {w=210;h=195;y-=8*zoom;}
  }else {
    // The visual surge tracks the moving attack from user -> enemy. The
    // ORIGINAL engine remains solely responsible for actual collision/damage.
    const progress=ease((time-.10)/.64);
    x=A[0]+(B[0]-A[0])*progress;
    y=A[1]+(B[1]-A[1])*progress;
    if(id==='faisca-do-pikachu'){w=144;h=142;}
    else {w=182;h=167;}
    if(time>.72){x=B[0];y=B[1];w*=1.18;h*=1.18;}
    // No rotation of atlas: directional motion comes from position tracking.
  }
  if(frame===7)alpha=1-clip((time*8-7)*.80);
  g.save();g.imageSmoothingEnabled=true;g.globalAlpha=alpha;
  g.drawImage(im,frame*256,0,256,256,x-w*.5*zoom,y-h*.5*zoom,w*zoom,h*zoom);
  g.restore();
  draws[id]=(draws[id]||0)+1;
  return true;
 }
 function paint(g,fx,t,now,size,low,key){
  const s=specs[key];return s?draw(g,fx,t,size,s.id,s.kind):false;
 }
 function paintNamed(g,fx,now,engine){
  const raw=fx?.move?.name||fx?.name;
  const id=specialNames[norm(raw)];if(!id)return false;
  const duration=Math.max(300,fx?.duration||1250);
  const t=clip((now-(fx?.at??now))/duration);
  return draw(g,fx,t,clip((engine?.h||420)/430,.67,1.15),id,'ice');
 }
 function diagnostic(){
  return {version:VERSION,
   ready:Object.fromEntries(ids.map(id=>[id,pictures[id].naturalWidth===2048])),
   frames:{...draws},errors:errors.slice(),catalogMoves:Object.keys(specs),
   namedMoves:Object.keys(specialNames),protectedOtherMoves:true};
 }
 window.PokemonTorreFourFXV60=diagnostic;
 return {accepts,supportsName,paint,paintNamed,diagnostic};
})();
