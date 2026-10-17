/* V35.85 | PixiJS WebGL + @pixi/particle-emitter. Reuses actual DS sprite atlas.
   LibreSprite PNG sources can replace atlas frames without changing gameplay. */
const pixiFX=(()=>{
 const themes={normal:[0xf9d997,0xffffff,0xa1886b],fire:[0xff602b,0xfff2b0,0xdf3725],water:[0x36aef9,0xffffff,0x386de1],grass:[0x8be566,0xffffff,0x3b9c67],ice:[0x80e7ff,0xffffff,0x528de4],electric:[0xffe75d,0xffffff,0xe59e2b],psychic:[0xd68cff,0xffffff,0x8354da],ghost:[0x8f7ddc,0xdecaff,0x30346e],dark:[0x8c75a8,0xd6c8f2,0x302247],fighting:[0xe9a17c,0xffe9c2,0xb64e39],rock:[0xbda27d,0xffecd0,0x796044],ground:[0xcfa970,0xffead6,0x81613e],steel:[0x9ac5df,0xffffff,0x607e99],bug:[0x9cce64,0xf7ffd5,0x557f38],flying:[0xa7dfff,0xffffff,0x5b83bd],dragon:[0x9884e9,0xffe2fa,0x4f49ba],poison:[0xb875d9,0xffd7ff,0x813f91],fairy:[0xf79ed8,0xffffff,0xc16b9d]};
 const effects=new Map(),drawn=Object.create(null);
 // V136: GPU-only pixel-art spritesheet battle casts; reuse the SAME WebGL Pixi application.
 const pixelFlying=new Map(),pixelAtlasCache=new WeakMap();
 let pixelFlyingFrames=0,pixelFlyingStarts=0,pixelFlyingFailures=0,pixelFlyingLastIssue='';
 // V89: missing old V72/V78 WebP must fall back to existing catalog art.
 const missingLegacyAtlasesV89=new Set();
 let app=null,owner=null,atlas=null,cache=new Map(),frames=0,emitterCount=0,error='',lastRect='';
 let combatSheet=null,lastCombatSheetFrame=0,combatFrames=0,combatEmitterCount=0;
 // V84.1: at most ONE preview cast can own the four-attack Pixi layer.
 // Old v359/v3580 visual objects may coexist while the engine cleans up;
 // they must never create an effect on top of a newer cast.
 let activeV84=null,castSerialV84=0,clearedV84=0;
 // Opt-in Haze status; independent root in the existing WebGL scene.
 let hazeActiveV85=null;
 let activeV86=null,v86Swaps=0,lastV86RenderAt=0,contextLostV94=false;
 const clamp=v=>Math.min(1,Math.max(0,v)),mix=(a,b,u)=>a+(b-a)*u;
 // Particle library is optional. A blocked emitter must not disable our sprite effects.
 // Legacy isWebGLSupported may be absent or inaccurate in mobile PixiJS.
 // Forced WebGL renderer creation is the authoritative test (never Canvas).
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
 // The Pixi canvas sits at z-index 9000 during combat; it must be removed
 // synchronously when a result/menu replaces #battleCanvas, including when
 // the Pixi ticker is STOPPED (common for long plant sprite previews).
 function battleViewReady(engine=owner){
  if(!battle?.active||!engine?.canvas?.isConnected)return false;
  const modal=document.getElementById('modal');
  const backdrop=document.getElementById('backdrop');
  return !!(modal?.classList.contains('combatModal')&&
   !backdrop?.classList.contains('hide')&&
   document.getElementById('battleCanvas')===engine.canvas);
 }
 function onBattleUiChange(){
  if(!battleViewReady()&&(app||activeV84||activeV86||hazeActiveV85||effects.size||pixelFlying.size))
   reset();
 }

 // V142: 256px layered transparent Flying frames, retaining all other approved FX.
 // Existing pixiFX app owns the GPU ticker and battle-scoped WebGL overlay.
 function destroyPixelFlying(fx){
  const o=pixelFlying.get(fx);if(!o)return;
  pixelFlying.delete(fx);
  try{if(o.emitter){o.emitter.emit=false;o.emitter.cleanup();o.emitter.destroy();}}catch(e){}
  try{o.root?.destroy({children:true});}catch(e){}
 }
 function mountPixelFlying(engine,fx,spec){
  if(!fx||!spec?.image?.naturalWidth||!window.PIXI){
   pixelFlyingLastIssue='Pixel Flying: PixiJS ou textura indisponível';
   return false;
  }
  if(pixelFlying.has(fx))return true;
  if(!ensure(engine,true)){
   pixelFlyingLastIssue=error||'GPU stage ainda não inicializado';
   return false;
  }
  // Suppress any previous Pixi semantic effect attached to this same cast.
  if(effects.has(fx)){dispose(effects.get(fx));effects.delete(fx);}
  try{
   let entry=pixelAtlasCache.get(spec.image);
   if(!entry){
    const base=PIXI.BaseTexture.from(spec.image);
    base.scaleMode=(spec.flying144||spec.flying145)?PIXI.SCALE_MODES.NEAREST:PIXI.SCALE_MODES.LINEAR;
    if(!base.valid){
     pixelFlyingLastIssue='PixiJS BaseTexture ainda inválida: '+spec.name;
     return false;
    }
    const frames=[];
    for(let i=0;i<spec.frames;i++){
     const size=spec.frameSize||256;
     const atlasFrame=(spec.frameStart||0)+i;
     const rect=new PIXI.Rectangle((atlasFrame%8)*size,Math.floor(atlasFrame/8)*size,size,size);
     frames.push(new PIXI.Texture(base,rect));
    }
    entry={base,frames};pixelAtlasCache.set(spec.image,entry);
   }
   const root=new PIXI.Container(),sprite=new PIXI.Sprite(entry.frames[0]);
   // V143: requested 80% reduction of the WHOLE Flying V142 artwork,
   // including its particles; unrelated Pixi effects keep their original size.
   root.scale.set((spec.flying144||spec.flying145)?1:.20);
   sprite.anchor.set(.5);sprite.roundPixels=false;
   // V141: colored crisp pixel atlases with warm gold/healing and pearlescent wind.
   // White tint preserves the authored palette and the one-pixel dark outline.
   sprite.tint=0xffffff;
   sprite.alpha=1;
   sprite.scale.set(spec.scale||.72);
   root.addChild(sprite);app.stage.addChild(root);
   // The emitter uses a 1x1 nearest-neighbour PIXI pixel, never Canvas.
   // Low density, no second ticker/RAF, same Particle Emitter V5 already used.
   let emitter=null;
   if(spec.particles&&window.PIXI?.particles?.Emitter){
    try{
     const healing=spec.name==='Roost';
     emitter=new PIXI.particles.Emitter(root,{
      lifetime:{min:.13,max:.31},frequency:.085,spawnChance:1,
      particlesPerWave:1,emitterLifetime:-1,maxParticles:10,
      pos:{x:0,y:0},addAtBack:true,
      behaviors:[
       {type:'alpha',config:{alpha:{list:[{value:.75,time:0},{value:0,time:1}]}}},
       {type:'scale',config:{scale:{list:[{value:2.3,time:0},{value:.8,time:1}]}}},
       // Pixel points inherit the attack's palette: golden cure or ivory air.
       {type:'color',config:{color:{list:[
        {value:healing?'f9da83':'f4fcf9',time:0},
        {value:healing?'d9eeb9':'75bbce',time:1}
       ],isStepped:false}}},
       {type:'moveSpeed',config:{speed:{list:[{value:48,time:0},{value:10,time:1}],isStepped:false}}},
       {type:'rotationStatic',config:{min:0,max:360}},
       {type:'spawnShape',config:{type:'point',data:{x:0,y:0}}},
       {type:'textureSingle',config:{texture:PIXI.Texture.WHITE}}
      ]
     });
     emitter.emit=false;
    }catch(e){emitter=null;}
   }
   pixelFlying.set(fx,{fx,spec,root,sprite,frames:entry.frames,emitter,engine,battle});
   pixelFlyingStarts++;
   pixelFlyingLastIssue='';
   if(!app.ticker.started)app.ticker.start();
   app.view.style.display='block';
   return true;
  }catch(e){
   pixelFlyingFailures++;
   error='Flying WebGL V142: '+String(e?.message||e);
   pixelFlyingLastIssue=error;
   return false;
  }
 }
 function updatePixelFlying(now,dt){
  if(!pixelFlying.size)return;
  for(const [fx,o] of pixelFlying){
   if(!battle?.active||o.battle!==battle||!o.engine?.canvas?.isConnected||
       now>=fx.end||now<fx.at-40){destroyPixelFlying(fx);continue;}
   const t=Math.min(1,Math.max(0,(now-fx.at)/Math.max(1,fx.duration||o.spec.ms)));
   const frame=Math.min(o.frames.length-1,Math.floor(t*o.frames.length));
   o.sprite.texture=o.frames[frame];
   const A=fx.from||[o.engine.player.x,o.engine.player.y],
         B=fx.to||[o.engine.enemy.x,o.engine.enemy.y];
   // All motion uses the existing GPU stage. No path/stroke/arc/Canvas2D.
   const u=Math.min(1,Math.max(0,(t-.10)/.57));
   const smooth=u*u*(3-2*u);
   const key=o.spec.name;
   let x=A[0]+(B[0]-A[0])*smooth,y=A[1]+(B[1]-A[1])*smooth;
   if(key==='Roost'){x=A[0];y=A[1]+4-7*Math.sin(Math.PI*t);}
   if(key==='Bicada'){const v=Math.min(1,Math.max(0,(t-.17)/.47));x=A[0]+(B[0]-A[0])*v;y=A[1]+(B[1]-A[1])*v;}
   if((o.spec.flying144||o.spec.flying145)&&o.spec.effectKind==='area'){
    x=B[0]+Math.sin(t*Math.PI*5)*3;y=B[1]-Math.sin(t*Math.PI)*11;
   }
   if((o.spec.flying144||o.spec.flying145)&&o.spec.effectKind==='contact'){
    const v=Math.min(1,Math.max(0,(t-.08)/.59));const dash=v*v*(3-2*v);
    x=A[0]+(B[0]-A[0])*dash;y=A[1]+(B[1]-A[1])*dash;
   }
   o.root.position.set(Math.round(x),Math.round(y));
   // V141: illuminated real sprite pixels, retaining sharp 1px navy outline.
   // Fade only the first and final 50ms, no glow/blur filter.
   o.sprite.alpha=Math.min(1,t*20,Math.max(0,(1-t)*20));
   o.sprite.rotation=key==='Roost'?0:Math.atan2(B[1]-A[1],B[0]-A[0])*.16;
   if(o.emitter){
    // Following its parent root; no particle resources survive after the cast.
    o.emitter.emit=t>.26&&t<.70;
    o.emitter.update(dt);
   }
   pixelFlyingFrames++;
  }
 }

 
 // V146: cinematic 2.5D lighting inside the existing Pixi/WebGL battle overlay.
 // A reusable glow kernel is NOT Pokémon art; all sprites, map tiles and attacks are unchanged.
 let lighting146=null,lighting146Texture=null,lighting146Frames=0,lighting146Failures=0;
 function lightTexture146(){
  if(lighting146Texture)return lighting146Texture;
  const N=64,rgba=new Uint8Array(N*N*4);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){
   const a=(x+.5-N/2)/(N/2),b=(y+.5-N/2)/(N/2);
   const d=Math.min(1,Math.sqrt(a*a+b*b)),s=1-d,k=(y*N+x)*4;
   rgba[k]=rgba[k+1]=rgba[k+2]=255;
   rgba[k+3]=Math.round(255*s*s*(3-2*s));
  }
  lighting146Texture=PIXI.Texture.fromBuffer(rgba,N,N,{scaleMode:PIXI.SCALE_MODES.LINEAR});
  return lighting146Texture;
 }
 function destroyLighting146(){
  if(!lighting146)return;
  try{lighting146.root.destroy({children:true,texture:false,baseTexture:false});}catch(_){}
  lighting146=null;
 }
 function glow146(root,tex,x,y,w,h,tint,alpha,blend=PIXI.BLEND_MODES.ADD){
  const s=new PIXI.Sprite(tex);s.anchor.set(.5);s.position.set(x,y);
  s.width=w;s.height=h;s.tint=tint;s.alpha=alpha;s.blendMode=blend;
  root.addChild(s);return s;
 }
 function createLighting146(engine){
  if(!app?.renderer?.gl||!app.stage)return false;
  destroyLighting146();
  const w=engine.w,h=engine.h,u=w/960,root=new PIXI.Container();
  root.interactiveChildren=false;
  const dim=new PIXI.Graphics();
  const baked147=!!(window.PokemonTorreArenaV151?.enabled||window.PokemonTorreArenaV148?.enabled||window.PokemonTorreLightmapV147?.enabled);
  // Navy environment: the V98 tiled stadium remains recognizable and sharp.
  dim.beginFill(0x08162c,baked147?.045:.28);dim.drawRect(0,0,w,h);dim.endFill();
  // Contact occlusion under existing North/South walls and side columns.
  dim.beginFill(0x081327,baked147?.03:.19);dim.drawRect(0,0,w,158*u);
  dim.drawRect(0,Math.max(0,h-68*u),w,68*u);dim.endFill();
  dim.beginFill(0x0c1a30,baked147?.02:.13);dim.drawRect(0,170*u,26*u,Math.max(0,h-280*u));
  dim.drawRect(Math.max(0,w-26*u),170*u,26*u,Math.max(0,h-280*u));dim.endFill();
  root.addChild(dim);
  const tex=lightTexture146();
  // World coordinates map to the same positions used by stadium-arena-v97.js.
  const lamps=[
   glow146(root,tex,110*u,191*u,470*u,420*u,0xffdfa4,.47),
   glow146(root,tex,850*u,h-142*u,470*u,420*u,0xffdea2,.44),
   glow146(root,tex,45*u,h*.51,290*u,530*u,0x65c5ff,.32),
   glow146(root,tex,918*u,h*.51,290*u,530*u,0x6ed0ff,.30),
   glow146(root,tex,480*u,105*u,350*u,280*u,0xff727c,.25)
  ];
  if(baked147)for(const lamp of lamps)lamp.alpha*=window.PokemonTorreArenaV148?.enabled?.035:.16;
  // V150: reuse these exact FIVE GPU lights for crystal and torch flicker.
  // Different palettes and positions; zero additional sprites or frame loops.
  const chamber150=window.PokemonTorreArenaV148?.version==='150.0';
  const chamber151=window.PokemonTorreArenaV151?.enabled===true;
  if(chamber151){
   const hot=window.PokemonTorreArenaV151.theme==='lava';
   const logicalH=h/u,back=Math.max(143,Math.min(196,logicalH*.235));
   const layout=hot?[[295,back+80],[745,back+22],[120,logicalH*.54],[843,logicalH*.56],[480,back+15]]:
                     [[115,back+110],[852,back+100],[166,logicalH*.74],[830,logicalH*.72],[480,back+24]];
   lamps.forEach((a,i)=>{
    a.position.set(layout[i][0]*u,layout[i][1]*u);
    a.tint=hot?0xff7b30:0x90dfff;
    a.width=(i===4?290:175)*u;
    a.height=(i===4?175:240)*u;
    a.alpha=hot?(i<2?.15:.04):(i<2?.10:.07);
   });
  }
  if(chamber150){
   const hot=window.PokemonTorreArenaV148.theme==='lava';
   const logicalTop=Math.min(193,Math.max(138,h/u*.21));
   lamps[0].position.set(106*u,(logicalTop+(hot?2:127))*u);
   lamps[1].position.set(843*u,(logicalTop+(hot?2:153))*u);
   lamps[2].position.set(180*u,h*.58);
   lamps[3].position.set(790*u,h*.78);
   lamps[4].position.set(480*u,(logicalTop-55)*u);
   for(const light of lamps){
    light.tint=hot?0xff8938:0x8ce7ff;
    light.alpha=hot?.105:.074;
   }
   lamps[4].alpha=hot?.05:.07;
  }
  const seams=new PIXI.Graphics();
  seams.lineStyle(Math.max(1,2.1*u),0x9dddff,.42);
  seams.moveTo(0,150*u);seams.lineTo(w,150*u);
  seams.lineStyle(Math.max(1,1.8*u),0x9dddff,.26);
  seams.moveTo(0,Math.max(0,h-69*u));seams.lineTo(w,Math.max(0,h-69*u));
  seams.moveTo(24*u,207*u);seams.lineTo(24*u,h-168*u);
  seams.moveTo(w-24*u,207*u);seams.lineTo(w-24*u,h-168*u);
  root.addChild(seams);
  // Grounding the actors: contact shadows, NOT circles behind Pokémon icons.
  const shadow=[0,1].map(()=>glow146(root,tex,-120,-120,91*u,26*u,0x06101a,.39,PIXI.BLEND_MODES.NORMAL));
  const attack=glow146(root,tex,-120,-120,360*u,300*u,0xffa766,0);
  app.stage.addChildAt(root,0);lighting146={root,engine,w,h,u,lamps,shadow,attack,last:0,frames:0};
  return true;
 }
 function updateLighting146(now){
  const a=lighting146;if(!a||!owner||!battleViewReady(owner))return;
  if(owner.w!==a.w||owner.h!==a.h){createLighting146(owner);return;}
  if(now-a.last<33)return; // Light position/tint costs capped at 30 Hz.
  a.last=now;
  const baked147=!!(window.PokemonTorreArenaV151?.enabled||window.PokemonTorreArenaV148?.enabled||window.PokemonTorreLightmapV147?.enabled);
  a.lamps[0].alpha=(window.PokemonTorreArenaV148?.enabled?.025:(baked147?.09:.45))+.015*Math.sin(now*.0018);
  a.lamps[1].alpha=(window.PokemonTorreArenaV148?.enabled?.025:(baked147?.09:.43))+.015*Math.cos(now*.0014);
  if(window.PokemonTorreArenaV151?.enabled){
   const hot=window.PokemonTorreArenaV151.theme==='lava';
   // Ambient light flickers in the already-existing Pixi stage; no new canvas.
   a.lamps[0].alpha=(hot?.14:.10)+.025*Math.sin(now*.0034);
   a.lamps[1].alpha=(hot?.14:.10)+.021*Math.sin(now*.0029+1.3);
   a.lamps[2].alpha=(hot?.042:.072)+.009*Math.sin(now*.0023);
   a.lamps[3].alpha=(hot?.042:.071)+.009*Math.cos(now*.0027);
   a.lamps[4].alpha=(hot?.025:.055)+.007*Math.sin(now*.0014);
  }
  if(window.PokemonTorreArenaV148?.version==='150.0'){
   const hot=window.PokemonTorreArenaV148.theme==='lava';
   // Gentle stone bounce and flame flicker, calibrated not to wash out sprites.
   a.lamps[0].alpha=(hot?.115:.073)+.017*Math.sin(now*.0029);
   a.lamps[1].alpha=(hot?.113:.073)+.014*Math.sin(now*.0023+1.4);
   a.lamps[2].alpha=(hot?.068:.054)+.009*Math.sin(now*.0017);
   a.lamps[3].alpha=(hot?.067:.053)+.008*Math.cos(now*.0019);
   a.lamps[4].alpha=(hot?.044:.065)+.011*Math.sin(now*.0011);
  }
  const actors=[owner.player,owner.enemy];
  for(let i=0;i<2;i++){
   const shadow=a.shadow[i],actor=actors[i];
   shadow.visible=!!actor;
   if(actor)shadow.position.set(actor.x,(actor.y||0)+8*a.u);
  }
  const casts=owner.v359Attacks||[],fx=casts[casts.length-1];
  const age=fx?now-fx.at:999999,total=fx?.duration||1100;
  if(fx&&age>=0&&age<total&&Array.isArray(fx.to)){
   const name=String(fx.move?.type||fx.move?.name||'').toLowerCase();
   a.attack.tint=/fire|fogo|chama|burn/.test(name)?0xff853e:
    /ice|gelo|congel|blizzard/.test(name)?0x91e8ff:
    /electric|raio|trov|thunder/.test(name)?0xffeb7c:
    /grass|planta|folha/.test(name)?0x8adf97:
    /psychic|psiq/.test(name)?0xc490ff:0x97caff;
   a.attack.position.set(fx.to[0],fx.to[1]);
   a.attack.alpha=.59*Math.sin(Math.PI*Math.min(1,age/total));
  }else a.attack.alpha=0;
  a.frames++;lighting146Frames++;
 }
 function frameLighting146(engine){
  if(!window.PokemonTorreLightingV146Active||!engine?.canvas?.isConnected)return false;
  if(!battleViewReady(engine))return false;
  if(lighting146&&lighting146.engine===engine&&lighting146.w===engine.w&&lighting146.h===engine.h){
   if(app&&!app.ticker.started)app.ticker.start();
   return true;
  }
  try{
   if(!ensure(engine,true))return false;
   return createLighting146(engine);
  }catch(e){lighting146Failures++;error='Lighting V146: '+String(e?.message||e);return false;}
 }

 function reset(){
  destroyLighting146();
  for(const fx of [...pixelFlying.keys()])destroyPixelFlying(fx);
  if(combatSheet){
   try{combatSheet.emitter?.destroy();combatSheet.root.destroy({children:true})}catch(e){}
   combatSheet=null;
  }
  lastCombatSheetFrame=0;
  if(activeV86&&typeof referenceFourV86!=='undefined')referenceFourV86.destroy(activeV86);
  activeV86=null;lastV86RenderAt=0;
  if(hazeActiveV85&&typeof hazeV85!=='undefined')hazeV85.destroy(hazeActiveV85);
  hazeActiveV85=null;
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
  // V98 sideways-scrolling stadium is wider than its visible parent.
  // Clip the GPU effects to the REAL arena viewport, otherwise projectiles
  // could appear on top of the HUD, buttons or outside the battle panel.
  if(engine._stadiumV98&&engine.canvas.parentElement?.getBoundingClientRect){
   const arena=engine.canvas.parentElement.getBoundingClientRect();
   const left=Math.max(0,arena.left-r.left),right=Math.max(0,r.right-arena.right);
   const top=Math.max(0,arena.top-r.top),bottom=Math.max(0,r.bottom-arena.bottom);
   app.view.style.clipPath='inset('+top.toFixed(1)+'px '+right.toFixed(1)+
    'px '+bottom.toFixed(1)+'px '+left.toFixed(1)+'px)';
  }else app.view.style.clipPath='none';
  app.view.style.display=r.width>10&&r.height>10?'block':'none';
 }
 function ensure(engine,requirePixelWebGL=false){
  if(!battleViewReady(engine)){onBattleUiChange();return false;}
  if(owner&&owner!==engine){reset();}
  if(app){
   if(requirePixelWebGL&&!app.renderer?.gl){
    error='PixiJS atual não tem WebGL para sprites pixel';
    return false;
   }
   if(app.renderer?.gl?.isContextLost?.()||contextLostV94){reset();}
   else {position(engine);if(!app.ticker.started)app.ticker.start();return true;}
  }
  // Do NOT modify V84/V90 or other approved Pixi behavior. The mobile
  // helper bypass applies only to the 4 pixel Flying spells.
  if(!hasGPU()&&!(requirePixelWebGL&&window.PIXI?.Application)){
   error='PixiJS/WebGL/ParticleEmitter indisponível';return false;
  }
  try{
   app=new PIXI.Application({width:engine.w,height:engine.h,backgroundAlpha:0,transparent:true,antialias:false,resolution:1,
    powerPreference:'high-performance',forceCanvas:false});
   if(requirePixelWebGL&&!app.renderer?.gl)throw Error('WebGL não está disponível neste navegador');
   app.view.style.cssText='position:fixed;pointer-events:none;touch-action:none;z-index:9000;max-width:none';
   document.body.appendChild(app.view);owner=engine;contextLostV94=false;
   // Chrome on Android can lose WebGL after prolonged use. No stale
   // readiness flag may disable the Canvas safety effects afterward.
   app.view.addEventListener?.('webglcontextlost',event=>{
    event.preventDefault?.();contextLostV94=true;
    lastV86RenderAt=0;error='WebGL context lost — using native Canvas';
   },false);
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
  if(!battleViewReady()){reset();return;}
  const now=performance.now(),dt=Math.min(.05,Math.max(.001,app.ticker.deltaMS/1000));position(owner);
  updatePixelFlying(now,dt);
  updateLighting146(now);
  for(const [f,e] of effects){
   if(e.v72&&e.failed){
    missingLegacyAtlasesV89.add(e.key||'');
    dispose(e);effects.delete(f);continue;
   }
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
  if(combatSheet&&performance.now()-lastCombatSheetFrame>140){
   try{combatSheet.emitter?.destroy();combatSheet.root.destroy({children:true})}catch(e){}
   combatSheet=null;
  }
  if(!effects.size&&!pixelFlying.size&&!combatSheet&&!activeV84&&!activeV86&&!hazeActiveV85&&!lighting146){app.ticker.stop();app.view.style.display='none';}
 }
 function paint(f,engine,key){
  // V137: a pixel-only Flying move must NEVER produce semantic/legacy effects,
  // even if its spritesheet is still downloading on the first game frame.
  if(pixelFlying.has(f)||window.PokemonTorreFlyingPixelV136?.hasMove?.(f?.move?.name||f?.name)||
     window.PokemonTorreFlyingOriginalV144?.hasMove?.(f?.move?.name||f?.name)||
     window.PokemonTorreFlyingLibreV145?.hasMove?.(f?.move?.name||f?.name))return true;
  // The named V86 cast already renders a single authored WebGL layer.
  // Never create a legacy ice/grassy bolt underneath, even from stale queues.
  if(typeof referenceFourV86!=='undefined'&&
     referenceFourV86.resolve(f?.move?.name||f?.name))return true;
  // Haze's status cast owns its own Pixi fog layer. Old catalog painter
  // must not create a second ice halo or fallback generic projectile.
  if(typeof hazeV85!=='undefined'&&norm(f?.move?.name||f?.name)==='haze')
   return !!hazeActiveV85;
  if(typeof grassFourV84!=='undefined'){
   const named=grassFourV84.resolve(f?.move?.name||f?.name);
   if(named){
    if(!activeV84||activeV84.f!==f||activeV84.key!==named||
      activeV84.battle!==battle)return false;
    key=named;
   }
  }
  if(missingLegacyAtlasesV89.has(key))return false;
  if(!ensure(engine))return false;
  if(!atlas&&typeof spriteAtlas3511!=='undefined'&&spriteAtlas3511.naturalWidth)atlas=PIXI.BaseTexture.from(spriteAtlas3511);
  const item=install(f,key);
  if(item?.v72&&item.failed){
   missingLegacyAtlasesV89.add(key);
   dispose(item);effects.delete(f);
   return false; // V72 original catalog painter owns visual fallback
  }
  return !!item;
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
  // IMPORTANT: a diagnostic lookup must never break a successful cast.
  // Older code called grassFourV84.source() unconditionally and threw
  // when V89 switched from URL atlases to generated GPU frames.
  return true;
 }
 function frameV84(now,engine){
  if(typeof grassFourV84==='undefined')return false;
  if(!battleViewReady(engine||owner)){onBattleUiChange();return false;}
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
 function beginHazeV85(engine,now){
  if(typeof hazeV85==='undefined'||!battle?.active)return false;
  if(hazeActiveV85)hazeV85.destroy(hazeActiveV85);
  hazeActiveV85=null;
  if(!ensure(engine))return false;
  hazeActiveV85=hazeV85.cast(app,engine,now);
  return !!hazeActiveV85;
 }
 function frameHazeV85(now,engine){
  if(typeof hazeV85==='undefined')return false;
  if(!battleViewReady(engine||owner)){onBattleUiChange();return false;}
  if(!hazeActiveV85)return false;
  if(!battle?.active||owner!==engine||!engine?.canvas?.isConnected){
   hazeV85.destroy(hazeActiveV85);hazeActiveV85=null;return false;
  }
  const t=Number.isFinite(now)?now:performance.now();
  const alive=hazeV85.animate(hazeActiveV85,t);
  if(!alive&&t-hazeActiveV85.started>=hazeV85.LIFE){
   hazeV85.destroy(hazeActiveV85);hazeActiveV85=null;
   if(!effects.size)app.view.style.display='none';
   return false;
  }
  if(hazeActiveV85.ready){
   position(engine);app.view.style.display='block';
   app.renderer.render(app.stage);
  }
  return true;
 }
 function beginV86(engine,move,now,hitAt){
  if(typeof referenceFourV86==='undefined'||!battle?.active)return false;
  const key=referenceFourV86.resolve(move?.name);
  if(!key)return false;
  if(activeV86){referenceFourV86.destroy(activeV86);activeV86=null;v86Swaps++;}
  lastV86RenderAt=0;
  if(!ensure(engine))return false;
  activeV86=referenceFourV86.cast(app,engine,
   [engine.player.x,engine.player.y-engine.h*.13],
   [engine.enemy.x,engine.enemy.y-engine.h*.12],
   move.name,now,hitAt);
  return !!activeV86;
 }
 function frameV86(now,engine){
  if(typeof referenceFourV86==='undefined'||!activeV86)return false;
  if(!battleViewReady(engine||owner)){onBattleUiChange();return false;}
  const fx=activeV86;
  if(!battle?.active||owner!==engine||!engine?.canvas?.isConnected){
   referenceFourV86.destroy(fx);activeV86=null;return false;
  }
  const t=Number.isFinite(now)?now:performance.now();
  try{
   if(contextLostV94||app?.renderer?.gl?.isContextLost?.())
    throw Error('WebGL context lost');
   const alive=referenceFourV86.animate(fx,t);
   if(!alive&&t-fx.started>=fx.duration){
    referenceFourV86.destroy(fx);activeV86=null;
    lastV86RenderAt=0;
    if(!effects.size&&!hazeActiveV85)app.view.style.display='none';
    return false;
   }
   if(fx.ready){
    position(engine);app.view.style.display='block';
    app.renderer.render(app.stage);
    lastV86RenderAt=performance.now(); // only a SUCCESSFUL GPU draw counts
   }
   return true;
  }catch(e){
   error='V94 Pixi recovered: '+String(e?.message||e);
   lastV86RenderAt=0;contextLostV94=true;
   reset(); // no app-frame exception: native Canvas fallback resumes
   return false;
  }
 }
 // V107: decoded REAL illustrated WebP sprite frames displayed on PixiJS.
 // No Canvas/HTML geometric effects or flying shot, only impact-area atlas.
 function paintFightingSheet(engine,id,img,frame,info){
  if(!img?.complete||!img.naturalWidth||!engine)return false;
  if(!battleViewReady(engine)){onBattleUiChange();return false;}
  if(!ensure(engine)||!app||app.renderer?.gl?.isContextLost?.())return false;
  try{
   if(!combatSheet||combatSheet.image!==img||combatSheet.engine!==engine||combatSheet.id!==id){
    if(combatSheet){combatSheet.emitter?.destroy();combatSheet.root.destroy({children:true});}
    const base=PIXI.BaseTexture.from(img),textures=Array.from({length:info.frames},(_,i)=>
     new PIXI.Texture(base,new PIXI.Rectangle(i*info.width,0,info.width,info.height)));
    const root=new PIXI.Container(),sp=new PIXI.Sprite(textures[0]);
    sp.anchor.set(.5);root.addChild(sp);app.stage.addChild(root);
    combatSheet={image:img,id,engine,root,sp,textures,emitter:null};
   }
   const item=combatSheet;
   item.sp.texture=item.textures[Math.max(0,Math.min(item.textures.length-1,frame))];
   item.sp.position.set(info.x,info.y);
   item.sp.width=info.displayW;item.sp.height=info.displayH;
   item.sp.alpha=info.alpha;
   item.sp.blendMode=PIXI.BLEND_MODES.NORMAL;
   if(info.t>=info.hit&&info.t<info.hit+.18){
    if(!item.emitter&&window.PIXI?.particles?.Emitter){
     // A 12×12 piece of the ORIGINAL illuminated atlas becomes the GPU
     // particle, never a duplicated 256×192 attack filling the entire arena.
     const impactFrame=Math.min(info.frames-1,Math.floor(info.frames*info.hit));
     const sparkle=new PIXI.Texture(item.textures[0].baseTexture,
      new PIXI.Rectangle(impactFrame*info.width+info.width*.5-6,
       info.height*.5-6,12,12));
     item.emitter=particles(item.root,sparkle,
      [0xffaa77,0xffe5b2,0x49273b],true);
     if(item.emitter)combatEmitterCount++;
    }
    if(item.emitter){item.emitter.updateOwnerPos(info.x,info.y);item.emitter.emit=true;item.emitter.update(.016);}
   }else if(item.emitter){item.emitter.emit=false;item.emitter.update(.016);}
   position(engine);lastCombatSheetFrame=performance.now();combatFrames++;
   app.view.style.display='block';app.renderer.render(app.stage);
   return true;
  }catch(e){error='V107 Pixi illustrated sprite '+String(e?.message||e);return false;}
 }
 return {ensure,paint,paintFightingSheet,clearAll:reset,onBattleUiChange,isBattleViewReady:battleViewReady,
  mountPixelFlying,frameLighting146,
  beginV84,clearV84,frameV84,beginHazeV85,frameHazeV85,
  beginV86,frameV86,diagnostics:()=>({version:'35.85',gpu:hasGPU()||!!app?.renderer?.gl,ready:!!app,
  sprites:!!atlas,active:effects.size,registered:typeof registry==='undefined'?0:registry.size,pixelFlyingLastIssue,
  emitterInstances:emitterCount,frames,pixelFlyingActive:pixelFlying.size,pixelFlyingFrames,pixelFlyingStarts,pixelFlyingFailures,lighting146Active:!!lighting146,lighting146Frames,lighting146Failures,combatSprites:combatFrames,combatEmitterInstances:combatEmitterCount,combatSpriteActive:!!combatSheet,activePreview:activeV84?{key:activeV84.key,id:activeV84.id,source:typeof grassFourV84?.source==='function'?grassFourV84.source(activeV84.key):'gpu-generated'}:null,previewEffectCount:[...effects.values()].filter(e=>e?.v84).length,
  hazeActive:!!hazeActiveV85,hazeReady:!!hazeActiveV85?.ready,
  v86Active:!!activeV86,v86Name:activeV86?.spec?.name||null,
  v86Ready:!!activeV86?.ready,
  v86RenderAgeMs:lastV86RenderAt>0?Math.max(0,performance.now()-lastV86RenderAt):null,
  v86ContextLost:contextLostV94||!!app?.renderer?.gl?.isContextLost?.(),
  v86Recent:!!app&&lastV86RenderAt>0&&
   performance.now()-lastV86RenderAt<350&&!contextLostV94&&
   !app?.renderer?.gl?.isContextLost?.(),
  v86Swaps,
  clearedV84,rendered:{...drawn},error})};
})();
window.PokemonTorrePixelFlyingBridge=Object.freeze({
 mountPixelFlying:pixiFX.mountPixelFlying,
 frameLighting146:pixiFX.frameLighting146,
 diagnostics:pixiFX.diagnostics
});
