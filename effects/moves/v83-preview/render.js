/* Pokémon Torre V83 — four separate 8-frame, transparent combat atlases.
 * Only loaded via ?battle_preview=v83. No Canvas2D, DOM video, CSS-drawn VFX.
 * PixiJS is the sole painter of the move; pixi particle emitter is optional.
 * All HP / hit registration stays with the native BattleEngine queue.
 */
var grassFourV83=(()=>{
 'use strict';
 const FRAME_W=480,FRAME_H=240,COUNT=8,SPEED=3.2;
 const definitions=Object.freeze({
  chicotedevinha:{
   name:'Chicote de Vinha',slug:'chicote-de-vinha',impactIndex:4,
   stages:['Preparação','Formação','Projeção','Contato','Impacto','Recuo','Dissipação','Finalização']
  },
  folhanavalha:{
   name:'Folha Navalha',slug:'folha-navalha',impactIndex:5,
   stages:['Preparação','Lançamento','Trajetória','Cortes circulares','Golpes múltiplos','Impacto final','Dispersão','Finalização']
  },
  chicotesemarea:{
   name:'Chicotes em Área',slug:'chicotes-em-area',impactIndex:5,
   stages:['Preparação','Chicotes emergem','Varredura','Golpes múltiplos','Cerco','Impacto máximo','Recuo','Dissipação']
  },
  vinewhip:{
   name:'Vine Whip',slug:'vine-whip',impactIndex:4,
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
 const errors=[],stat={casts:0,frames:0,particleFrames:0,lastStage:null};
 let leafTexturePromise=null;
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
  const root=new PIXI.Container(), sprite=new PIXI.Sprite(PIXI.Texture.EMPTY),
    particles=new PIXI.Container();
  sprite.anchor.set(.5);sprite.visible=false;particles.visible=false;
  root.addChild(sprite,particles);app.stage.addChild(root);
  const visualDuration=Math.max(400,f.duration||1000)*SPEED;
  const item={v83:true,app,f,key,root,sprite,particles,
    frames:[],ready:false,disposed:false,visualDuration,emitter:null,source:url(key)};
  // Load asynchronously; preview loader has already required the asset before
  // battle boot. Failure is explicit; never draw a generic replacement.
  PIXI.Assets.load(url(key)).then(tex=>{
   if(item.disposed)return;
   const base=tex?.baseTexture;
   if(!base?.valid||base.width!==FRAME_W*COUNT||base.height!==FRAME_H)
     throw Error('V83: spritesheet inválido '+key);
   item.frames=Array.from({length:COUNT},(_,i)=>
     new PIXI.Texture(base,new PIXI.Rectangle(i*FRAME_W,0,FRAME_W,FRAME_H)));
   item.ready=true;
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
  const idx=Math.min(7,Math.floor(t*8)),def=definitions[item.key];
  item.sprite.texture=item.frames[idx];
  item.sprite.visible=true;
  const A=f.from,B=f.to;
  const dx=B[0]-A[0],dy=B[1]-A[1];
  const span=Math.hypot(dx,dy)||1;
  const width=Math.min(item.app.screen.width*1.05,Math.max(95,span*480/345));
  item.sprite.width=width;
  item.sprite.height=width*FRAME_H/FRAME_W;
  item.sprite.rotation=Math.atan2(dy,dx);
  item.sprite.position.set((A[0]+B[0])/2,(A[1]+B[1])/2);
  item.sprite.alpha=idx===7?Math.max(.12,1-(t-.875)*6.2):1;
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
 const impacts={};
 for(const def of Object.values(definitions))impacts[def.name]=def.impactIndex/COUNT;
 if(typeof window!=='undefined')
  window.PokemonTorreGrassFourPreviewV83={
   version:'83.0',enabled:true,keys:Object.keys(definitions),
   timings:{speed:SPEED,contacts:impacts},
   diagnostics:()=>({...stat,errors:errors.slice(),stage:stat.lastStage})
  };
 return {accepts,resolve,install,animate,dispose,definitions,url,
  diagnostics:()=>({...stat,errors:errors.slice()})};
})();
