/* Pokémon Torre V83 — four separate 8-frame, transparent combat atlases.
 * Only loaded via ?battle_preview=v83. No Canvas2D, DOM video, CSS-drawn VFX.
 * PixiJS is the sole painter of the move; pixi particle emitter is optional.
 * All HP / hit registration stays with the native BattleEngine queue.
 */
var grassFourV83=(()=>{
 'use strict';
 const FRAME_W=480,FRAME_H=240,COUNT=8;
 // Per-move pacing: do not slow the large area effect or rush the lashes.
 // These multipliers control BOTH Pixi frames and the native HP impact queue.
 const definitions=Object.freeze({
  chicotedevinha:{
   name:'Chicote de Vinha',slug:'chicote-de-vinha',impactIndex:4,speed:4.25,heightScale:1,
   stages:['Preparação','Formação','Projeção','Contato','Impacto','Recuo','Dissipação','Finalização']
  },
  folhanavalha:{
   name:'Folha Navalha',slug:'folha-navalha',impactIndex:5,speed:2.95,heightScale:1,interpolate:true,
   stages:['Preparação','Lançamento','Trajetória','Cortes circulares','Golpes múltiplos','Impacto final','Dispersão','Finalização']
  },
  chicotesemarea:{
   name:'Chicotes em Área',slug:'chicotes-em-area',impactIndex:5,speed:2.25,heightScale:.67,
   stages:['Preparação','Chicotes emergem','Varredura','Golpes múltiplos','Cerco','Impacto máximo','Recuo','Dissipação']
  },
  vinewhip:{
   name:'Vine Whip',slug:'vine-whip',impactIndex:4,speed:4.15,heightScale:1,
   stages:['Preparação','Enrolamento','Chicote avança','Contato','Estalo e dano','Recuo','Dissipação','Finalização']
  }
 });
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
   .toLowerCase().replace(/[^a-z0-9]/g,'');
 const accepts=key=>Object.hasOwn(definitions,key);
 const resolve=name=>accepts(normalize(name))?normalize(name):'';
 const url=key=>{const slug=definitions[key].slug;
  return 'effects/moves/'+slug+'/v83-preview/sprites/'+slug+'.webp?v=83.0';
 };
 const leafURL='effects/moves/v83-preview/sprites/leaf.webp?v=83.0';
 const errors=[],stat={casts:0,frames:0,particleFrames:0,blendedFrames:0,lastStage:null};
 const sharedAtlasFrames=new Map();
 let leafTexturePromise=null;
 // Decode each WebP once before the first battle use. Reusing subtextures avoids
 // expensive GPU texture setup and the first-cast stalls on mobile.
 function prewarm(key){
  if(sharedAtlasFrames.has(key))return sharedAtlasFrames.get(key);
  const p=PIXI.Assets.load(url(key)).then(texture=>{
   const base=texture?.baseTexture;
   if(!base?.valid||base.width!==FRAME_W*COUNT||base.height!==FRAME_H)
    throw Error('V83: spritesheet inválido '+key);
   return Array.from({length:COUNT},(_,i)=>
    new PIXI.Texture(base,new PIXI.Rectangle(i*FRAME_W,0,FRAME_W,FRAME_H)));
  }).catch(error=>{
   sharedAtlasFrames.delete(key);
   errors.push(String(error.message||error));
   if(errors.length>12)errors.shift();
   throw error;
  });
  sharedAtlasFrames.set(key,p);
  return p;
 }
 function emitter(root,texture){
  const C=window.PIXI?.particles?.Emitter;
  if(!C||!texture)return null;
  try{
   // v5 @pixi/particle-emitter, identical behavior API to the existing game.
   return new C(root,{
    lifetime:{min:.18,max:.43},frequency:.029,spawnChance:1,
    particlesPerWave:2,maxParticles:42,emitterLifetime:-1,
    addAtBack:false,pos:{x:0,y:0},
    behaviors:[
     {type:'alpha',config:{alpha:{list:[{value:.85,time:0},{value:0,time:1}]}}},
     {type:'scale',config:{scale:{list:[{value:.23,time:0},{value:.02,time:1}]}}},
     {type:'moveSpeed',config:{speed:{list:[{value:85,time:0},{value:18,time:1}]}}},
     {type:'rotationStatic',config:{min:0,max:360}},
     {type:'spawnShape',config:{type:'torus',data:{x:0,y:0,radius:8}}},
     {type:'textureSingle',config:{texture}}
    ]
   });
  }catch(e){errors.push('ParticleEmitter: '+String(e.message||e));return null;}
 }
 function install(app,f,key){
  if(!accepts(key)||!app?.stage||!Array.isArray(f?.from)||
     !Array.isArray(f?.to)||!window.PIXI?.Assets)return null;
  const def=definitions[key];
  const root=new PIXI.Container(), sprite=new PIXI.Sprite(PIXI.Texture.EMPTY),
    blend=def.interpolate?new PIXI.Sprite(PIXI.Texture.EMPTY):null,
    particles=new PIXI.Container();
  sprite.anchor.set(.5);sprite.visible=false;
  if(blend){blend.anchor.set(.5);blend.visible=false;root.addChild(sprite,blend,particles);}
  else root.addChild(sprite,particles);
  particles.visible=false;app.stage.addChild(root);
  const visualDuration=Math.max(400,f.duration||1000)*def.speed;
  const item={v83:true,app,f,key,root,sprite,blend,particles,
    frames:[],ready:false,disposed:false,visualDuration,emitter:null,source:url(key)};
  prewarm(key).then(frames=>{
   if(item.disposed)return;
   item.frames=frames;item.ready=true;
  }).catch(e=>{errors.push(String(e.message||e));if(errors.length>12)errors.shift()});
  leafTexturePromise ||= PIXI.Assets.load(leafURL).catch(e=>{
    errors.push('Leaf emitter asset: '+String(e.message||e));return null;
  });
  leafTexturePromise.then(texture=>{
   if(!item.disposed&&texture)item.emitter=emitter(particles,texture);
  });
  stat.casts++;
  return item;
 }
 function animate(item,now,dt){
  if(!item?.v83||item.disposed||!item.ready)return;
  const f=item.f, t=Math.min(1,Math.max(0,(now-f.at)/item.visualDuration));
  const phase=t*COUNT, idx=Math.min(COUNT-1,Math.floor(phase)),def=definitions[item.key];
  const within=Math.max(0,Math.min(1,phase-idx));
  item.sprite.texture=item.frames[idx];
  item.sprite.visible=true;
  // Folha Navalha: interpolate its authored stages with a second Pixi sprite,
  // then add continuous 60-fps leaf drift. No frame duplication/Canvas draw.
  // NEVER reveal the damaging frame 6 (idx=5) before its true contact time.
  if(item.blend){
   const safeTransition=idx<COUNT-1&&idx!==def.impactIndex-1;
   const blendWeight=safeTransition?Math.max(0,Math.min(1,(within-.28)/.72)):0;
   item.blend.texture=item.frames[Math.min(COUNT-1,idx+1)];
   item.blend.visible=blendWeight>0;
   item.blend.alpha=blendWeight;
   item.sprite.alpha=1-blendWeight;
   if(blendWeight>0)stat.blendedFrames++;
  }
  const A=f.from,B=f.to;
  const dx=B[0]-A[0],dy=B[1]-A[1];
  const span=Math.hypot(dx,dy)||1;
  const width=Math.min(item.app.screen.width*1.05,Math.max(95,span*480/345));
  // Keep horizontal reach and actual collision point correct. Compress only
  // the excessive vertical spread of Chicotes em Área, not its attack range.
  const height=width*FRAME_H/FRAME_W*def.heightScale;
  const rotation=Math.atan2(dy,dx);
  const drift=def.interpolate?Math.sin(t*Math.PI*21)*2.1:0;
  const x=(A[0]+B[0])/2, y=(A[1]+B[1])/2;
  const endingOpacity=idx===7?Math.max(.08,1-(t-.875)*6.4):1;
  item.sprite.width=width;item.sprite.height=height;
  item.sprite.rotation=rotation;
  item.sprite.position.set(x+drift,y+drift*.35);
  item.sprite.alpha*=endingOpacity;
  if(item.blend){
   item.blend.width=width;item.blend.height=height;
   item.blend.rotation=rotation;
   item.blend.position.set(x+drift+Math.sin(within*Math.PI)*2,y+drift*.35);
   item.blend.alpha*=endingOpacity;
  }
  // The emitter is detail only: actual attack silhouette comes entirely from
  // eight individually rendered RGBA frames, not a dynamically drawn line.
  if(item.emitter){
   const attack=(idx>=def.impactIndex&&idx<7);
   const q=idx<=2?.12:idx===3?.65:1;
   const x=attack?B[0]:A[0]+dx*q;
   const y=attack?B[1]:A[1]+dy*q;
   item.emitter.updateOwnerPos(x,y);
   item.emitter.emit=idx>=1&&idx<7;
   item.emitter.update(Math.max(.001,Math.min(.06,dt||.016)));
   stat.particleFrames++;
  }
  item.particles.visible=true;
  stat.frames++;
  stat.lastStage={move:def.name,frame:idx+1,name:def.stages[idx],impact:idx===def.impactIndex};
 }
 function dispose(item){
  if(!item?.v83||item.disposed)return;
  item.disposed=true;item.ready=false;
  if(item.emitter){try{item.emitter.emit=false;item.emitter.cleanup();item.emitter.destroy();}catch(_e){}}
  item.emitter=null;item.frames.length=0;
 }
 const impacts={},speeds={},sizes={};
 for(const def of Object.values(definitions)){
  impacts[def.name]=def.impactIndex/COUNT;
  speeds[def.name]=def.speed;
  sizes[def.name]=def.heightScale;
 }
 // Warm all four atlases at game boot, not during the animation.
 if(typeof window!=='undefined'&&window.PIXI?.Assets){
  for(const key of Object.keys(definitions))prewarm(key).catch(()=>{});
 }
 if(typeof window!=='undefined')
  window.PokemonTorreGrassFourPreviewV83={
   version:'83.1',enabled:true,keys:Object.keys(definitions),
   timings:{speeds,contacts:impacts,sizes},
   diagnostics:()=>({...stat,errors:errors.slice(),stage:stat.lastStage})
  };
 return {accepts,resolve,install,animate,dispose,definitions,url,
  diagnostics:()=>({...stat,errors:errors.slice()})};
})();
