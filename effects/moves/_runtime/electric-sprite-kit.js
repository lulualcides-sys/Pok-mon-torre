/* Pokémon Torre V55 — eight animated golden cinematic electric attacks.
 * Golden-white lightning, impact debris, cloud choreography and target tracking.
 * No CSS animation, static PNG overlay or changed combat rules.
 */
const electricSpriteV46=(()=>{
 'use strict';
 const base='effects/moves/electric-original/';
 const names=['bolt-a','bolt-b','bolt-c','bolt-fork','bolt-shatter','arc','spark','impact','storm-cloud'];
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
  img.src=base+name+'.svg?v=47.0';
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
  if(o.additive)g.globalCompositeOperation='lighter';
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
 // A compact cinematic burst built exclusively from authored electric sprites.
 // Calling this method never draws a CSS animation, procedural Canvas arc or line.
 function burst(g,x,y,ms,s,alpha,power=1){
  const a=clamp(alpha);if(a<.02)return;
  const jitter=Math.sin(ms*.024)*3*s;
  stamp(g,'impact',x+jitter,y,(68+44*power)*s,(65+38*power)*s,
   {alpha:a*.83,additive:true,rotation:ms*.0004});
  for(let j=0;j<8;j++){
   const angle=j*Math.PI/4+(ms*.003),distance=(28+23*power)*s;
   stamp(g,j%2?'spark':'arc',x+Math.cos(angle)*distance,y+Math.sin(angle)*distance*.74,
    (17+j%3*6)*s,(22+j%2*7)*s,
    {alpha:a*(.66-j*.045),rotation:angle,additive:true});
  }
 }

 // V50: finished 8-frame transparent PNG assets, not procedural bolts.
 // Images are preloaded when the battle module initializes. Drawing consists
 // exclusively of image blits. This never draws lines, effects or previews.
 const spriteSets=Object.create(null);
 const moveDirs={faisca:'faisca',discharge:'discharge',
  tempestade:'tempestade-de-raios',trovao:'trovao'};
 for(const kind of Object.keys(moveDirs)){
  const dir=base.replace('electric-original/','')+moveDirs[kind]+'/';
  const frames=[],impacts=[];
  for(let index=1;index<=8;index++){
   const img=new Image();img.decoding='async';
   img.src=dir+'sprites/frame_'+String(index).padStart(2,'0')+'.png?v=57.0';
   frames.push(img);
  }
  for(let index=1;index<=4;index++){
   const img=new Image();img.decoding='async';
   img.src=dir+'impact/hit_'+String(index).padStart(2,'0')+'.png?v=57.0';
   impacts.push(img);
  }
  const arcs=[];
  if(kind==='discharge'){
   for(let index=1;index<=8;index++){
    const img=new Image();img.decoding='async';
    img.src=dir+'arcs/arc_'+String(index).padStart(2,'0')+'.png?v=57.0';
    arcs.push(img);
   }
  }
  spriteSets[kind]={frames,impacts,arcs};
 }
 function showImage(g,img,x,y,w,h,alpha=1){
  if(!img||!img.naturalWidth||!img.naturalHeight||!g)return false;
  if(!Number.isFinite(x+y+w+h)||w<=0||h<=0)return false;
  g.save();
  g.globalAlpha=clamp(alpha);
  g.imageSmoothingEnabled=true;
  g.drawImage(img,x,y,w,h);
  g.restore();
  counters['pngBlits']=(counters['pngBlits']||0)+1;
  return true;
 }
 function cinematic(g,fx,t,ms,s,kind){
  const pack=spriteSets[kind],A=fx.from,B=fx.to;
  if(!pack||!Array.isArray(A)||!Array.isArray(B))return;
  const phase=Math.min(7,Math.max(0,Math.floor(clamp(t)*8)));
  const fade=phase===7?1-clamp((t*8)-7)*.85:1;
  const scale=clamp(s,.72,1.14);
  const source=pack.frames[phase];
  let w,h,x,y;
  if(kind==='faisca'){
   w=210*scale;h=240*scale;
   const actor=fx.actor||A;
   // Charging and electric dash follow the Pokémon's actual movement.
   // Strike and residue attach to the moving enemy position.
   if(phase<=4){x=actor[0]-w*(125/280);y=actor[1]-h*(165/320);}
   else{x=B[0]-w*(196/280);y=B[1]-h*(168/320);}
  }else if(kind==='discharge'){
   // A large dynamic burst travels in every direction from the Pokémon.
   // No shield-ring illusion: the radial artwork contains branching bolts.
   w=267*scale;h=305*scale;
   x=A[0]-w*.50;y=A[1]-h*(165/320);
  }else{
   // Storm effects are bounded to the target, not an arena-sized overlay.
   w=(kind==='trovao'?218:212)*scale;
   h=(kind==='trovao'?249:242)*scale;
   x=B[0]-w*.50;y=B[1]-h*(269/320);
  }
  // The additional discharge beam is eight separate animated sprites
  // rotated from the caster to the moving target, with no Canvas strokes.
  // It grows across the battlefield and visually reaches the target.
  if(kind==='discharge'&&phase>=2&&phase<=6){
   const dx=B[0]-A[0],dy=B[1]-A[1],dist=Math.hypot(dx,dy);
   const arc=pack.arcs[phase],start=17*scale;
   if(dist>36*scale&&arc?.naturalWidth){
    const travel=[0,0,.34,.68,.97,1,.88,0][phase];
    const endDistance=Math.max(0,dist-8*scale);
    const length=Math.max(4,(endDistance-start)*travel);
    const height=(phase>=4&&phase<=5?102:82)*scale;
    g.save();
    g.translate(A[0]+dx/dist*start,A[1]+dy/dist*start);
    g.rotate(Math.atan2(dy,dx));
    g.globalAlpha=(phase===6?.53:phase===2?.65:.96)*fade;
    g.imageSmoothingEnabled=true;
    g.drawImage(arc,0,-height*.5,length,height);
    g.restore();
    counters['discharge-target-arcs']=(counters['discharge-target-arcs']||0)+1;
   }
  }
  const frameBlend=clamp((t*8-phase-.69)/.31)*.48;
  showImage(g,source,x,y,w,h,fade*(1-frameBlend));
  if(frameBlend>.001&&phase<7){
   showImage(g,pack.frames[phase+1],x,y,w,h,fade*frameBlend);
   counters['smoothTransitions']=(counters['smoothTransitions']||0)+1;
  }
  // Secondary genuine PNG impact frames, timed to animation's real impact.
  // No fake damage is applied here; the original collision engine owns HP.
  let hitProgress=-1;
  if(kind==='faisca'&&t>=.59&&t<.84)hitProgress=(t-.59)/.25;
  if(kind==='discharge'&&t>=.54&&t<.83)hitProgress=(t-.54)/.29;
  if(kind==='tempestade'&&t>=.39&&t<.87)hitProgress=((t-.39)/.16)%1;
  if(kind==='trovao'&&t>=.49&&t<.83)hitProgress=(t-.49)/.34;
  if(hitProgress>=0){
   const frame=Math.min(3,Math.floor(hitProgress*4));
   const impact=pack.impacts[frame],iw=(kind==='trovao'?108:83)*scale;
   const ih=iw*320/280;
   // The impact sheet is centered on the enemy with moderate size.
   showImage(g,impact,B[0]-iw*.5,B[1]-ih*.5,iw,ih,
    (frame===3?.6:1)*fade);
  }
  counters['cinema-'+kind]=(counters['cinema-'+kind]||0)+1;
  counters['phase-'+kind+'-'+(phase+1)]=(counters['phase-'+kind+'-'+(phase+1)]||0)+1;
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
  try{d.paint(g,fx,t,now-fx.at,s,{stamp,between,burst,cinematic,clamp,ease,lerp});}
  catch(err){error=d.key+': '+err.message;console.warn('[V46 Electric]',err)}
  return true;
 }
 function diagnostics(){return {
  version:'55.0',registered:[...registered.keys()],
  ready:Object.fromEntries(names.map(n=>[n,!!images[n].naturalWidth])),
  stamps:{...counters},arcsReady:spriteSets.discharge.arcs.filter(i=>i.naturalWidth>0).length,frames:Object.fromEntries(Object.entries(spriteSets).map(([name,p])=>[name,p.frames.filter(i=>i.naturalWidth>0).length])),impacts:Object.fromEntries(Object.entries(spriteSets).map(([name,p])=>[name,p.impacts.filter(i=>i.naturalWidth>0).length])),error
 }}
 return {add,resolve,paint,stamp,between,burst,cinematic,clamp,ease,lerp,images,diagnostics};
})();
