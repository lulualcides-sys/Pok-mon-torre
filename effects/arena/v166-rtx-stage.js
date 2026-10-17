/* Pokémon Torre V166 — pixel-art blue dungeon remade with Python/Pillow.
 * Independently authored 7 transparent tileset/prop textures, layered by PixiJS.
 * ONLY ?arena_lab=blue166; no CSS/PNG whole-arena trick, no edit to combat.
 * V150 remains default and untouched. PIXI WebGL fails safely to old backdrop.
 */
(()=>{
'use strict';
if(typeof BattleEngine!=='function'||window.PokemonTorreBlue153?.installed)return;
const q=new URLSearchParams(location.search),enabled=q.get('arena_lab')==='blue166'&&q.get('safe')!=='1';
const nativeBg=BattleEngine.prototype.generateBackdrop;
const nativeDraw=BattleEngine.prototype.draw;
const nativeDestroy=BattleEngine.prototype.destroy;
const instances=new WeakMap(),active=new Set();
const diagnostics={installed:true,enabled,version:'166.0',atlas:'Python/Pillow 7 original pixel-art sprites',
 mounts:0,materialLoads:0,draws:0,objects:0,lightPoints:0,failures:0,error:null,webgl:false,gpuPreset:'pending',ambientMs:0};
if(!enabled){window.PokemonTorreBlue153=Object.freeze({installed:true,enabled:false,
 diagnostics:()=>({...diagnostics})});return;}
const path='assets/arena-v165/';
const gpuPreset=q.get('gpu')==='rtx2060'?'rtx2060':'balanced';
diagnostics.gpuPreset=gpuPreset;
const ambientMs=gpuPreset==='rtx2060'?33:70;
diagnostics.ambientMs=ambientMs;
const theme={value:new URLSearchParams(location.search).get('arena_theme')==='violet'?'violet':'blue'};
const themes={blue:{floor:0xffffff,wall:0xffffff,crystal:0xffffff,glow:0xffffff,background:0x071833},
 violet:{floor:0xb5a2d5,wall:0x8e82bc,crystal:0xdfaaff,glow:0xeaabff,background:0x211234}};
const painted=[];
function repaint(){
 const pal=themes[theme.value];
 for(const item of painted)if(!item.sprite.destroyed)item.sprite.tint=pal[item.role];
 for(const inst of active){
   inst.app.renderer.background.color=pal.background;
   try{inst.app.renderer.render(inst.app.stage);}catch(_){}
 }
}

const manifest=['floor-atlas','back-wall','crystal-a','crystal-b','chest','rock','glow','magic-ring','pillar','arch'];
// Required images (7 assets + separate rune texture) are preloaded/decode-first,
// so sprite assets cannot produce a blank stage on slow Android networks.
const images=new Map();let loaded=false,loading=false;
function startLoading(){
 if(loading)return;
 loading=true;
 Promise.all(manifest.map(name=>new Promise((resolve,reject)=>{
  const im=new Image();im.decoding='async';
  im.onload=()=>{if(!im.naturalWidth||!im.naturalHeight)return reject(Error('Empty '+name));
   images.set(name,im);resolve();};
  im.onerror=()=>reject(Error('Failed to load '+name));
  im.src=path+name+'.png?asset=v154-1';
 }))).then(()=>{loaded=true;diagnostics.materialLoads++;})
 .catch(e=>{diagnostics.error='art: '+String(e?.message||e);diagnostics.failures++;});
}
startLoading();
const R=seed=>()=>((seed=Math.imul(seed,1664525)+1013904223|0)>>>0)/4294967296;
function teardown(e){
 const inst=instances.get(e);if(!inst)return;
 instances.delete(e);active.delete(inst);
 try{inst.app.destroy(true,{children:true,texture:false,baseTexture:false});}catch(_){}
 try{inst.view.remove();}catch(_){}
 // Scene sprites are local to each WebGL app; do not keep stale references.
 for(let i=painted.length-1;i>=0;i--)if(painted[i].sprite.destroyed)painted.splice(i,1);
}
function mount(e){
 if(!loaded||!e?.canvas?.isConnected||!e.w||!e.h)return null;
 const PIXI=window.PIXI;
 if(!PIXI?.Application||!PIXI?.Texture?.from||!PIXI?.utils?.isWebGLSupported?.())return null;
 let old=instances.get(e);
 if(old&&old.w===e.w&&old.h===e.h)return old;
 if(old)teardown(e);
 const host=e.canvas.parentElement;if(!host)return null;
 const w=Math.ceil(e.w),h=Math.ceil(e.h),u=w/960,H=h/u;
 let app;
 try{
  app=new PIXI.Application({width:w,height:h,antialias:false,
   backgroundColor:themes[theme.value].background,backgroundAlpha:1,resolution:1,
   autoDensity:false,powerPreference:'high-performance',autoStart:false});
  if(!app.renderer?.gl)throw Error('WebGL renderer unavailable');
  const tx={};
  for(const name of manifest){
   tx[name]=PIXI.Texture.from(images.get(name));
   tx[name].baseTexture.scaleMode=PIXI.SCALE_MODES.NEAREST;
  }
  // All scene art is 2D GPU sprites; the original 2D battle actors remain on
  // their canvas in front, with exact same coordinates, collisions, HP and FX.
  const root=new PIXI.Container();root.scale.set(u);app.stage.addChild(root);
  const add=(id,x,y,ww,hh,opts={})=>{
   const s=new PIXI.Sprite(tx[id]);s.x=x;s.y=y;s.width=ww;s.height=hh;
   if(opts.alpha!=null)s.alpha=opts.alpha;
   if(opts.tint!=null)s.tint=opts.tint;
   if(opts.blend)s.blendMode=PIXI.BLEND_MODES.ADD;
   root.addChild(s);diagnostics.objects++;painted.push({sprite:s,role:id==='back-wall'?'wall':id.startsWith('crystal')?'crystal':id==='glow'?'glow':'floor'});s.tint=themes[theme.value][id==='back-wall'?'wall':id.startsWith('crystal')?'crystal':id==='glow'?'glow':'floor'];return s;
  };
  // Video composition: flat coursed navy-blue stone wall at far end,
  // low horizon, large uninterrupted stone floor and only perimeter objects.
  const horizon=Math.max(143,Math.min(230,H*.275));
  add('back-wall',0,-3,960,horizon+10);
  // Architectural arch gives the distant wall real depth and framing.
  add('arch',336,horizon-109,290,121,{alpha:.94});
  add('pillar',36,horizon-113,96,155,{alpha:1});
  add('pillar',833,horizon-121,96,166,{alpha:1});
  // Individually drawn cut-stone slabs rather than one static background.
  // Camera-matched perspective from the user video. Tile widths converge at
  // the far end and row heights grow toward the front. Always cover the whole
  // view, including the left/right edges when the V98 camera pans.
  const tiles=16,rows=Math.max(12,Math.ceil((H-horizon)/52));
  const whole=tx['floor-atlas'],base=whole.baseTexture;
  const sub=Array.from({length:16},(_,i)=>new PIXI.Texture(base,
   new PIXI.Rectangle(i%4*128,(i/4|0)*128,128,128)));
  const floorArt=new PIXI.Container();root.addChild(floorArt);
  const floorEnd=H+24;
  const py=t=>horizon+(floorEnd-horizon)*Math.pow(t,1.30);
  for(let row=0;row<rows;row++){
   const y0=py(row/rows),y1=py((row+1)/rows);
   const sc=.68+.32*(row/rows);
   for(let col=-5;col<=tiles+5;col++){
    const x=480+(col*60-480)*sc,bw=60*sc+.55;
    const cell=new PIXI.Sprite(sub[(col*13+row*7+208)%16]);
    cell.x=x;cell.y=y0;cell.width=bw;cell.height=(y1-y0)+.5;
    floorArt.addChild(cell);cell.tint=themes[theme.value].floor;painted.push({sprite:cell,role:'floor'});
   }
  }
  // Receding bevel strips, an architectural cue rather than an extra backdrop.
  const seam=new PIXI.Graphics();
  seam.beginFill(0x050a20,.40);seam.drawRect(0,horizon-4,960,10);seam.endFill();
  root.addChild(seam);diagnostics.objects++;
  // Wall shadow covers the wall-floor seam without a thick black outline.
  add('glow',175,horizon-35,620,71,{alpha:.07,tint:0x1c3875});
  // Distant inscribed platform: an understated GPU pixel sprite behind the actors.
  add('magic-ring',340,horizon+19,280,104,{alpha:.065,blend:true});
  // Authored tall pixel crystals + cool spill light on the floor.
  const nodes=[
   {x:938,y:horizon+98,s:.84},
   {x:867,y:horizon+(H-horizon)*.70,s:.65},
   {x:101,y:horizon+(H-horizon)*.62,s:.62},
   {x:32,y:horizon+103,s:.74}
  ];
  const lights=[];
  for(let i=0;i<nodes.length;i++){
   const n=nodes[i],ww=128*n.s,hh=185*n.s;
   const foot=n.y;
   add(i%2?'crystal-b':'crystal-a',n.x-ww*.5,foot-hh,ww,hh);
   const spill=add('glow',n.x-120*n.s,foot-79*n.s,
    270*n.s,210*n.s,{alpha:.13,blend:true,tint:0x86dfff});
   const reflection=add('glow',n.x-85*n.s,foot-18,
    170*n.s,60*n.s,{alpha:.09,blend:true,tint:0x5cbefe});
   lights.push(spill,reflection);diagnostics.lightPoints+=2;
  }
  // Open central floor; frame the arena with a few noninterfering stones.
  // Centre left open: no random chest overlaid in the fight path.
  // Objects are sparse and placed at the wall/perimeter, not in front of the actors.
  const rocks=[[69,.52,25],[889,.59,30],[127,.92,23],
   [871,.91,28],[649,.80,17]];
  for(const [x,t,size] of rocks){
   const y=horizon+(H-horizon)*t;
   add('rock',x-size*.5,y-size*.54,size,size*.70);
  }
  const shadowActors=[0,1].map(()=>add('glow',-100,-100,78,20,
   {alpha:.095,tint:0x122348}));
  // RTX contact bounce: two gentle, independent lights behind the Pokemon.
  const contactSprites=[0,1].map(()=>add('glow',-100,-100,94,32,
   {alpha:.10,blend:true}));
  const motes=Array.from({length:8},(_,i)=>{
   const r=R(15445+i*301);
   const x=20+r()*910,y=horizon+5+r()*(H-horizon-28);
   const s=add('glow',x,y,5+r()*7,5+r()*7,{alpha:.22+r()*.20,blend:true});
   return {sprite:s,y,phase:r()*6.28};
  });
  // Always insert BEHIND the native battle canvas: the four approved attacks
  // and all sprites stay in their original draw order and renderer.
  const view=app.view;view.dataset.arena='blue166';
  view.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:0;max-width:none;transform-origin:top left';
  e.canvas.style.position='absolute';
  e.canvas.style.zIndex='1';
  e.canvas.style.background='transparent';
  host.insertBefore(view,e.canvas);
  const inst={app,view,w,h,u,lights,shadowActors,contactSprites,motes,frameAt:0,last:0};
  instances.set(e,inst);active.add(inst);diagnostics.mounts++;diagnostics.webgl=true;
  const transparent=document.createElement('canvas');
  transparent.width=w;transparent.height=h;
  transparent.complete=true;transparent.naturalWidth=w;transparent.naturalHeight=h;
  e.bg=transparent;
  sync(e,inst,performance.now());
  return inst;
 }catch(err){
  diagnostics.failures++;
  diagnostics.error='WebGL: '+String(err?.message||err);
  try{app?.destroy(true,{children:true,texture:false,baseTexture:false});}catch(_){}
  return null;
 }
}
function sync(e,inst,now){
 inst.view.style.width=e.canvas.style.width||'100%';
 inst.view.style.height=e.canvas.style.height||'100%';
 inst.view.style.left=e.canvas.style.left||'0px';
 inst.view.style.top=e.canvas.style.top||'0px';
 inst.view.style.transform=e.canvas.style.transform||'none';
 for(let i=0;i<2;i++){
  const actor=i?e.enemy:e.player,sp=inst.shadowActors[i];
  sp.x=actor.x/inst.u-29;sp.y=actor.y/inst.u-8;
  const light=inst.contactSprites[i];
  light.x=actor.x/inst.u-47;light.y=actor.y/inst.u-21;
  light.alpha=.09+Math.min(.045,Math.max(0,Number(actor.flash)||0)*.035);
 }
 if(now-inst.frameAt<ambientMs)return;
 inst.frameAt=now;
 const elapsed=now*.001;
 for(let i=0;i<inst.lights.length;i+=2){
  inst.lights[i].alpha=.115+.017*Math.sin(elapsed*2.5+i*1.7);
  inst.lights[i+1].alpha=.085+.013*Math.sin(elapsed*1.3+i);
 }
 for(let i=0;i<inst.motes.length;i++){
  const m=inst.motes[i];m.sprite.y=m.y+Math.sin(elapsed*.8+m.phase)*3;
  m.sprite.alpha=.13+.19*(.5+.5*Math.sin(elapsed*2+i));
 }
 try{inst.app.renderer.render(inst.app.stage);diagnostics.draws++;}
 catch(err){diagnostics.failures++;diagnostics.error='frame: '+String(err?.message||err);}
}
BattleEngine.prototype.generateBackdrop=function(){
 const result=nativeBg.apply(this,arguments);
 if(loaded)mount(this);
 return result;
};
BattleEngine.prototype.draw=function(now){
 let inst=instances.get(this);
 if(!inst){
  // The resources may finish downloading AFTER the battle object is created.
  // Keep the original backdrop until fully loaded and GPU is operational.
  if(loaded&&this.canvas?.isConnected)inst=mount(this);
 }
 if(inst)this.ctx.clearRect(0,0,this.w,this.h);
 const result=nativeDraw.apply(this,arguments);
 if(inst)sync(this,inst,Number.isFinite(now)?now:performance.now());
 return result;
};
BattleEngine.prototype.destroy=function(){
 teardown(this);
 return nativeDestroy.apply(this,arguments);
};
window.PokemonTorreBlue153=Object.freeze({installed:true,enabled:true,
 setTheme:value=>{theme.value=value==='violet'?'violet':'blue';repaint();return theme.value;},
 diagnostics:()=>({...diagnostics,ready:loaded,active:active.size,theme:theme.value})});
})();
