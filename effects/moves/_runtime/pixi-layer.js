/* V35.85 | PixiJS WebGL + @pixi/particle-emitter. Reuses actual DS sprite atlas.
   LibreSprite PNG sources can replace atlas frames without changing gameplay. */
const pixiFX=(()=>{
 const themes={normal:[0xf9d997,0xffffff,0xa1886b],fire:[0xff602b,0xfff2b0,0xdf3725],water:[0x36aef9,0xffffff,0x386de1],grass:[0x8be566,0xffffff,0x3b9c67],ice:[0x80e7ff,0xffffff,0x528de4],electric:[0xffe75d,0xffffff,0xe59e2b],psychic:[0xd68cff,0xffffff,0x8354da],ghost:[0x8f7ddc,0xdecaff,0x30346e],dark:[0x8c75a8,0xd6c8f2,0x302247],fighting:[0xe9a17c,0xffe9c2,0xb64e39],rock:[0xbda27d,0xffecd0,0x796044],ground:[0xcfa970,0xffead6,0x81613e],steel:[0x9ac5df,0xffffff,0x607e99],bug:[0x9cce64,0xf7ffd5,0x557f38],flying:[0xa7dfff,0xffffff,0x5b83bd],dragon:[0x9884e9,0xffe2fa,0x4f49ba],poison:[0xb875d9,0xffd7ff,0x813f91],fairy:[0xf79ed8,0xffffff,0xc16b9d]};
 const effects=new Map(),drawn=Object.create(null);
 let app=null,owner=null,atlas=null,cache=new Map(),frames=0,emitterCount=0,error='',lastRect='';
 // V84.1: at most ONE preview cast can own the four-attack Pixi layer.
 // Old v359/v3580 visual objects may coexist while the engine cleans up;
 // they must never create an effect on top of a newer cast.
 let activeV84=null,castSerialV84=0,clearedV84=0;
 const clamp=v=>Math.min(1,Math.max(0,v)),mix=(a,b,u)=>a+(b-a)*u;
 // Particle library is optional. A blocked emitter must not disable our sprite effects.
 const hasGPU=()=>!!(window.PIXI?.Application&&window.PIXI?.utils?.isWebGLSupported?.());
 function tex(key){
  if(cache.has(key))return cache.get(key);
  const area=typeof spriteFrames3511!=='undefined'&&spriteFrames3511[key];
  if(!area||!atlas)return null;
  const t=new PIXI.Texture(atlas,new PIXI.Rectangle(area[0],area[1],area[2],area[3]));
  cache.set(key,t);return t;
 }
 function sequence(kind,typ,key){
  const n=norm(key);
  let names;
  if(typ==='fire'||/flame|chama|fogo|fireblast/.test(n))names=Array.from({length:5},(_,i)=>'flame'+i);
  else if(typ==='grass')names=['leaf0','leaf1','leaf2','leaf3','plant0','plant1'];
  else if(typ==='ghost'||typ==='dark')names=['shadow0','shadow1','shadow2','shadow3','ghost0','ghost1'];
  else if(typ==='rock'||typ==='ground')names=['rock0','rock1','rock2','rock3','crack0','crack1'];
  else if(typ==='psychic'||typ==='fairy')names=Array.from({length:32},(_,i)=>'purple'+i);
  else if(typ==='ice')names=['purple1','purple5','purple9','purple13','purple17','purple21','purple25','purple29'];
  else if(typ==='water')names=['purple2','purple6','purple10','purple14','purple18','purple22'];
  else if(typ==='electric')names=['fireball0','fireball1','purple3','purple7'];
  else names=['purple0','purple4','purple8','purple12','purple16','purple20'];
  return names.map(tex).filter(Boolean);
 }
 function clip(root,seq,x,y,w,h,tint,alpha=.85){
  if(!seq.length)return null;
  const sp=new PIXI.AnimatedSprite(seq);sp.anchor.set(.5);
  sp.position.set(x,y);sp.width=w;sp.height=h;sp.alpha=alpha;sp.tint=tint;
  sp.blendMode=PIXI.BLEND_MODES.ADD;sp.animationSpeed=.20;sp.play();root.addChild(sp);return sp;
 }
 function particles(root,texture,color,burst){
  if(!texture||!window.PIXI?.particles?.Emitter)return null;
  const hex=n=>n.toString(16).padStart(6,'0');
  try{
   const em=new PIXI.particles.Emitter(root,{
    lifetime:{min:burst?.21:.20,max:burst?.46:.39},
    frequency:burst?.018:.028,
    spawnChance:1,particlesPerWave:burst?3:2,emitterLifetime:-1,
    maxParticles:burst?66:48,pos:{x:0,y:0},addAtBack:false,
    behaviors:[
     {type:'alpha',config:{alpha:{list:[{value:.95,time:0},{value:.45,time:.54},{value:0,time:1}]}}},
     {type:'scale',config:{scale:{list:[{value:burst?1.65:1.12,time:0},{value:.12,time:1}]}}},
     {type:'color',config:{color:{list:[{value:hex(color[1]),time:0},{value:hex(color[0]),time:.5},{value:hex(color[2]),time:1}]}}},
     {type:'moveSpeed',config:{speed:{list:[{value:burst?130:58,time:0},{value:burst?30:10,time:1}],isStepped:false}}},
     {type:'rotationStatic',config:{min:0,max:360}},
     {type:'spawnShape',config:{type:'torus',data:{x:0,y:0,radius:burst?18:6}}},
     {type:'textureSingle',config:{texture}}
    ]});
   em.emit=!burst;emitterCount++;return em;
  }catch(e){error='Particle Emitter: '+e.message;return null;}
 }
 function dispose(fx){
  if(fx?.v84&&typeof grassFourV84!=='undefined')grassFourV84.dispose(fx);
  if(fx?.v83&&typeof grassFourV83!=='undefined')grassFourV83.dispose(fx);
  if(fx?.v82&&typeof equippedGrassV82!=='undefined')equippedGrassV82.dispose(fx);
  if(fx?.v72&&typeof battleFourV72!=='undefined')battleFourV72.dispose(fx);
  for(const em of [fx?.trail,fx?.burst])if(em){try{em.emit=false;em.cleanup();em.destroy();}catch(e){}}
  fx?.root?.destroy({children:true});
 }
 function reset(){
  activeV84=null;
  for(const fx of effects.values())dispose(fx);effects.clear();
  if(app){try{app.destroy(true,{children:true,texture:false,baseTexture:false});}catch(e){}}
  app=null;atlas=null;owner=null;cache=new Map();lastRect='';
 }
 function position(engine){
  if(!app||!owner?.canvas?.isConnected)return;
  const r=engine.canvas.getBoundingClientRect(),css=[r.left,r.top,r.width,r.height].map(x=>x.toFixed(1)).join(',');
  if(lastRect!==css){
   const v=app.view;v.style.left=r.left+'px';v.style.top=r.top+'px';
   v.style.width=r.width+'px';v.style.height=r.height+'px';lastRect=css;
  }
  if(app.screen.width!==engine.w||app.screen.height!==engine.h)app.renderer.resize(engine.w,engine.h);
  app.view.style.display=r.width>10&&r.height>10?'block':'none';
 }
 function ensure(engine){
  if(!battle?.active||!engine?.canvas){if(app)reset();return false;}
  if(owner&&owner!==engine){reset();}
  if(app){position(engine);if(!app.ticker.started)app.ticker.start();return true;}
  if(!hasGPU()){error='PixiJS/WebGL/ParticleEmitter indisponível';return false;}
  try{
   app=new PIXI.Application({width:engine.w,height:engine.h,backgroundAlpha:0,transparent:true,antialias:true,resolution:1,
    powerPreference:'high-performance',forceCanvas:false});
   app.view.style.cssText='position:fixed;pointer-events:none;touch-action:none;z-index:9000;max-width:none';
   document.body.appendChild(app.view);owner=engine;
   if(typeof spriteAtlas3511!=='undefined'&&spriteAtlas3511.naturalWidth)atlas=PIXI.BaseTexture.from(spriteAtlas3511);
   app.ticker.add(tick);position(engine);TriAttackVFX?.preload?.();return true;
  }catch(e){error='PixiJS: '+e.message;reset();return false;}
 }
 function install(f,kind){
  // The game has multiple painters. Resolve by the ACTUAL move name, not
  // the caller's catalog/semantic key: never fall back to generic sprites.
  if(typeof grassFourV84!=='undefined'){
   const named=grassFourV84.resolve(f?.move?.name||f?.name);
   if(named){
    if(!activeV84||activeV84.f!==f||activeV84.key!==named||
      activeV84.battle!==battle)return null;
    kind=named;
   }
  }
  if(effects.has(f))return effects.get(f);
  // V84: new isolated approval-only sprites, never substitute older effects.
  if(typeof grassFourV84!=='undefined'&&grassFourV84.accepts(kind)){
   const fresh=grassFourV84.install(app,f,kind);
   if(fresh){effects.set(f,fresh);return fresh;}
  }
  // V83: isolated FOUR grass previews, sharing the existing battle Pixi overlay.
  if(typeof grassFourV83!=='undefined'&&grassFourV83.accepts(kind)){
   const preview=grassFourV83.install(app,f,kind);
   if(preview){effects.set(f,preview);return preview;}
  }
  // V82: use the existing GPU overlay, never create a second Pixi canvas.
  if(typeof equippedGrassV82!=='undefined'&&equippedGrassV82.accepts(kind)){
   const grass=equippedGrassV82.install(app,f,kind);
   if(grass){effects.set(f,grass);return grass;}
  }
  // V72 approved raster sequences share this existing PixiJS overlay. No second GPU canvas.
  if(typeof battleFourV72!=='undefined'&&battleFourV72.accepts(kind)){
   const authored=battleFourV72.install(app,f,kind);
   if(authored){effects.set(f,authored);return authored;}
  }
  // Geometry-based semantic effects work even while the legacy DS sprite atlas loads.
  const m=f.move||{},typ=m.type||'normal',col=themes[typ]||themes.normal;
  // Use each move name before the type: every catalog move gets a semantic WebGL scene.
  const root=new PIXI.Container();app.stage.addChild(root);
  // Cinematic shader scenes are the primary graphics; old geometric scenes
  // are only a compatibility fallback if a device cannot create the GPU scene.
  let sem=null;
  try{sem=cinematicVFX.create({app,root,f,name:m.name||f.name||'',type:typ,
    kind:m.kind||f.kind,cat:m.cat,tex,particles});}
  catch(exc){error='Cinematic startup: '+exc.message;sem=null;}
  if(!sem)sem=semanticVFX.create({app,root,f,name:m.name||f.name||'',type:typ,
    kind:m.kind||f.kind,cat:m.cat,tex,particles});
  if(sem){
   const o={f,root,semantic:sem,trail:sem.trail,burst:sem.burst,started:performance.now(),
    duration:f.duration||registry.get(kind)?.duration||1000,n:norm(m.name||f.name||'')};
   effects.set(f,o);return o;
  }
  root.destroy({children:true});
  if(!atlas)return null;
  const seq=sequence(m.kind,typ,m.name||f.name);
  if(!seq.length)return null;
  if(effects.size>=16){const first=effects.keys().next().value;dispose(effects.get(first));effects.delete(first);}

  const A=f.from,B=f.to,angle=Math.atan2(B[1]-A[1],B[0]-A[0]),n=norm(m.name||f.name);
  const k=m.kind||f.kind||'bolt';
  const mode=m.cat==='status'||['status','shield','guard','recover','weather','illusion'].includes(k)?'status':
     k==='beam'||/beam|raiosolar|hiperraio|aurora/.test(n)?'beam':
     ['area','quake','hazard'].includes(k)?'area':k==='dash'||k==='contact'?'contact':'projectile';
  const charge=clip(root,seq,A[0],A[1],40,45,col[1],.9);
  const head=clip(root,seq,A[0],A[1],36,38,col[0],.9);
  const streaks=[],impact=[];
  const amount=mode==='beam'?20:mode==='projectile'?10:mode==='status'?10:14;
  for(let i=0;i<amount;i++)streaks.push(clip(root,seq,A[0],A[1],19+i%4*3,24+i%3*6,
    i%4===0?col[1]:i%4===1?col[2]:col[0],.8));
  for(let i=0;i<12;i++)impact.push(clip(root,seq,B[0],B[1],21+i%3*6,25+i%3*7,i%3===0?col[1]:col[0],0));
  const trailContainer=new PIXI.Container(),burstContainer=new PIXI.Container();
  root.addChild(trailContainer,burstContainer);
  const trail=particles(trailContainer,seq[0],col,false);
  const burst=particles(burstContainer,seq[seq.length-1],col,true);
  const item={f,root,typ,mode,n,A,B,angle,charge,head,streaks,impact,trail,burst,started:performance.now(),duration:f.duration||registry.get(kind)?.duration||1000};
  effects.set(f,item);return item;
 }
 function animate(item,now,dt){
  if(item.v84){grassFourV84.animate(item,now,dt);frames++;return;}
  if(item.v83){grassFourV83.animate(item,now,dt);frames++;return;}
  if(item.v82){equippedGrassV82.animate(item,now);frames++;return;}
  if(item.v72){battleFourV72.animate(item,now);frames++;return;}
  if(item.semantic){
   const t=clamp((now-item.f.at)/(item.f.duration||item.duration));
   item.semantic.draw(now,t,dt);drawn[item.n]=(drawn[item.n]||0)+1;frames++;return;
  }
  const {f,A,B,mode}=item,t=clamp((now-f.at)/(f.duration||item.duration));
  const u0=clamp((t-.14)/.55),u=u0*u0*(3-2*u0),impact=clamp((t-.65)/.35),beat=now*.017;
  const dx=B[0]-A[0],dy=B[1]-A[1],nx=-Math.sin(item.angle),ny=Math.cos(item.angle);
  const x=mix(A[0],B[0],u),y=mix(A[1],B[1],u);
  if(item.charge){item.charge.visible=t<.28;item.charge.position.set(A[0],A[1]);
   item.charge.alpha=clamp((.30-t)*3);item.charge.rotation=beat*.28;}
  if(item.head){item.head.visible=t>.12&&t<.89;item.head.position.set(mode==='area'?B[0]:mode==='status'?A[0]:x,
    mode==='area'?B[1]:mode==='status'?A[1]:y);item.head.rotation=beat*.21;item.head.alpha=clamp(Math.min(t*9,(1-t)*9));}
  for(let i=0;i<item.streaks.length;i++){
   const sp=item.streaks[i];if(!sp)continue;
   const q=(i+.4)/item.streaks.length,a=i*2.399+beat*.4;
   if(mode==='beam'){
    const v=u*q,off=Math.sin(beat+i*1.4)*8+Math.cos(v*34-beat)*3;
    sp.position.set(A[0]+dx*v+nx*off,A[1]+dy*v+ny*off);sp.rotation=item.angle-Math.PI/2+Math.sin(beat+i)*.3;
    sp.alpha=t>.16&&t<.89?.72:0;
   }else if(mode==='projectile'){
    const v=clamp(u-q*.38),off=Math.sin(beat+i*1.2)*12;
    sp.position.set(A[0]+dx*v+nx*off,A[1]+dy*v+ny*off);sp.rotation=beat*.3+i;sp.alpha=t<.88?.78-q*.3:0;
   }else{
    const center=mode==='status'?A:B,r=12+35*t+i%4*4;
    sp.position.set(center[0]+Math.cos(a)*r,center[1]+Math.sin(a)*r*.63);sp.rotation=a+beat*.2;sp.alpha=.75;
   }
  }
  for(let i=0;i<item.impact.length;i++){
   const sp=item.impact[i];if(!sp)continue;
   const a=i*2*Math.PI/item.impact.length+beat*.08,r=12+impact*(32+i%3*7);
   sp.position.set(B[0]+Math.cos(a)*r,B[1]+Math.sin(a)*r*.70);
   sp.rotation=a+beat*.22;sp.alpha=impact?1-impact*.70:0;
  }
  if(item.trail){
   item.trail.updateOwnerPos(mode==='status'?A[0]:mode==='area'?B[0]:x,mode==='status'?A[1]:mode==='area'?B[1]:y);
   item.trail.emit=t>.10&&t<.84;item.trail.update(dt);
  }
  if(item.burst){item.burst.updateOwnerPos(B[0],B[1]);item.burst.emit=t>.63&&t<.80;item.burst.update(dt);}
  drawn[item.n]=(drawn[item.n]||0)+1;frames++;
 }
 function tick(){
  if(!owner?.canvas?.isConnected||!battle?.active){reset();return;}
  const now=performance.now(),dt=Math.min(.05,Math.max(.001,app.ticker.deltaMS/1000));position(owner);
  for(const [f,e] of effects){
   // V75: only the four cinematic sprite sequences outlive their original
   // game attack animation. Hit/damage, cooldown and battle queues stay intact.
   const lifetime=(e.v84||e.v83||e.v82||e.v72)?e.visualDuration:(f.duration||e.duration);
   if((f.battle&&f.battle!==battle)||now-f.at>lifetime+240){
    dispose(e);effects.delete(f);continue;
   }
   try{animate(e,now,dt);}catch(ex){error='VFX: '+ex.message;dispose(e);effects.delete(f);}
  }
  // Mobile: PIXI's transparent WebGL canvas must not keep running alongside
  // the battle renderer when the last GPU effect has finished. Restart on
  // demand in ensure(), preserving existing graphics and particle behavior.
  if(!effects.size){app.ticker.stop();app.view.style.display='none';}
 }
 function paint(f,engine,key){
  if(typeof grassFourV84!=='undefined'){
   const named=grassFourV84.resolve(f?.move?.name||f?.name);
   if(named){
    if(!activeV84||activeV84.f!==f||activeV84.key!==named||
      activeV84.battle!==battle)return false;
    key=named;
   }
  }
  if(!ensure(engine))return false;
  if(!atlas&&typeof spriteAtlas3511!=='undefined'&&spriteAtlas3511.naturalWidth)atlas=PIXI.BaseTexture.from(spriteAtlas3511);
  return !!install(f,key);
 }
 // Start a preview only from the NEW native cast, not by rescanning all
 // old v359Attacks and v3580Visuals every frame.
 function clearV84(){
  let removed=0;
  for(const [f,item] of effects){
   // Dispose previously spawned generic/semantic FX for these SAME FOUR
   // moves too; otherwise old vines overlap the new separate WebP atlas.
   const belongs=typeof grassFourV84!=='undefined'&&
    grassFourV84.resolve(f?.move?.name||f?.name);
   if(!item?.v84&&!belongs)continue;
   dispose(item);effects.delete(f);removed++;
  }
  if(removed)clearedV84+=removed;
  activeV84=null;
 }
 function beginV84(engine,f,key){
  if(typeof grassFourV84==='undefined'||!grassFourV84.accepts(key)||
    !f||!Array.isArray(f.from)||!Array.isArray(f.to))return false;
  // Clear previous owned effect IMMEDIATELY on a new successful cast:
  // single Vine and Chicote may not share the old Area roots/particles.
  clearV84();
  // ensure() may reset an old GPU owner. Create it BEFORE assigning cast
  // ownership so reset() cannot erase the new cast.
  if(!ensure(engine))return false;
  const id=++castSerialV84;
  activeV84={id,f,key,battle};
  if(!install(f,key)){
   clearV84();return false;
  }
  return true;
 }
 function frameV84(now,engine){
  if(typeof grassFourV84==='undefined'||!battle?.active)return false;
  const a=activeV84;
  if(!a||a.battle!==battle){
   if(a)clearV84();
   return false;
  }
  if(engine&&owner&&owner!==engine){clearV84();return false;}
  const item=effects.get(a.f);
  if(!item?.v84||item.key!==a.key){clearV84();return false;}
  const when=Number.isFinite(now)?now:performance.now();
  if(when-a.f.at>item.visualDuration+160){
   clearV84();return false;
  }
  try{
   grassFourV84.animate(item,when,.016);frames++;
   app.view.style.display='block';
   app.renderer.render(app.stage);
   return true;
  }catch(e){
   error='V84 live frame: '+e.message;
   clearV84();return false;
  }
 }
 return {ensure,paint,beginV84,clearV84,frameV84,diagnostics:()=>({version:'35.85',gpu:hasGPU(),ready:!!app,
  sprites:!!atlas,active:effects.size,registered:registry.size,
  emitterInstances:emitterCount,frames,activePreview:activeV84?{key:activeV84.key,id:activeV84.id,source:grassFourV84.source(activeV84.key)}:null,previewEffectCount:[...effects.values()].filter(e=>e?.v84).length,clearedV84,rendered:{...drawn},error})};
})();
