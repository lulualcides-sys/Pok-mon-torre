/* Pokémon Torre V76 PREVIEW ONLY, opt-in battle test of four sequential animations.
 * V71 art -> V72 transparent 8-frame atlas -> ONE existing PixiJS overlay.
 * Does not implement damage, change move timing, or intercept protected moves.
 * Canvas is NOT used to paint these attacks; the legacy Canvas API still owns
 * the battlefield, Pokémon sprites, HP, hit registration and user input.
 */
var battleFourV72=(()=>{
 'use strict';
 const FRAMES=8, FW=480,FH=240;
 // V75: slower playback for artwork only. The hit/cooldown timeline remains unchanged.
 const VISUAL_SLOWDOWN=1.8;

 // Each phase has its OWN reveal window. The mask prevents the existing
 // approved drawing from displaying every scratch at the same instant.
 const phases={
  catalog_dragonclaw:[
    [.12,'preparacao',0,'all',.28],[.23,'impacto',5,'impact',1],
    [.31,'pausa',7,'all',.05],[.44,'garra-1',4,'band0',1],
    [.50,'intervalo-1',7,'all',.08],[.63,'garra-2',4,'band1',1],
    [.69,'intervalo-2',7,'all',.08],[.83,'garra-3',4,'band2',1],
    [.93,'rastro',6,'all',.87],[1,'dissipacao',7,'all',.43]],
  catalog_cortex:[
    [.16,'preparacao',0,'all',.38],[.28,'avanco',1,'all',.8],
    [.43,'corte-1',1,'upper',1],[.50,'pausa',7,'all',.09],
    [.66,'corte-2',2,'lower',1],[.79,'cruzamento',3,'all',1],
    [.91,'impacto',4,'all',1],[1,'dissipacao',7,'all',.33]],
  catalog_dragonpulse:[
    [.15,'preparacao',0,'all',.66],[.30,'carga',1,'all',1],
    [.43,'disparo',2,'all',1],[.60,'avanco',3,'all',1],
    [.73,'contato',4,'all',1],[.89,'explosao',5,'all',1],
    [.95,'eco',6,'all',.67],[1,'dissipacao',7,'all',.33]],
  catalog_aurasphere:[
    [.15,'preparacao',0,'all',.66],[.29,'concentracao',1,'all',1],
    [.40,'esfera',2,'all',1],[.53,'lancamento',3,'all',1],
    [.66,'trajetoria',4,'all',1],[.78,'contato',5,'all',1],
    [.92,'explosao',6,'all',1],[1,'dissipacao',7,'all',.33]]
 };
 phases.catalog_xscissor=phases.catalog_cortex;
 const phaseAt=(key,t)=>(phases[key]||phases.catalog_aurasphere).find(p=>t<p[0])||
   (phases[key]||phases.catalog_aurasphere).slice(-1)[0];

 const defs=Object.freeze({
  catalog_dragonpulse:{asset:'dragon-pulse',mode:'ranged'},
  catalog_aurasphere:{asset:'aura-sphere',mode:'ranged'},
  catalog_cortex:{asset:'x-scissor',mode:'contact'},
  catalog_xscissor:{asset:'x-scissor',mode:'contact'},
  catalog_dragonclaw:{asset:'dragon-claw',mode:'contact'}
 });
 const forbidden=['catalog_thunder','catalog_discharge','catalog_thunderwave',
  'catalog_trovao','catalog_descarga','catalog_volttackle','catalog_nevasca',
  'catalog_stunspore','catalog_leechseed','catalog_esporos'];
 const counts=Object.create(null),failures=[];
 const accepts=key=>Object.hasOwn(defs,key);
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 const source=id=>'effects/moves/v72-battle/sprites/'+id+'.webp?v=72.1';
 function install(app,f,key){
  if(!accepts(key)||!app?.stage||!f?.from||!f?.to||!window.PIXI?.Assets)return null;
  const definition=defs[key],root=new PIXI.Container(),sprite=new PIXI.Sprite(PIXI.Texture.EMPTY);
  sprite.anchor.set(.5);sprite.visible=false;root.addChild(sprite);app.stage.addChild(root);
  const item={v72:true,n:definition.asset,key,f,root,sprite,app,frames:[],ready:false,
   disposed:false,duration:f.duration||950,
   visualDuration:Math.max(250,f.duration||950)*VISUAL_SLOWDOWN};
  // A Graphics stencil only CLIPS the real Pixi sprite. It never draws VFX.
  const mask=new PIXI.Graphics();root.addChild(mask);sprite.mask=mask;item.mask=mask;
  // Assets.load shares the existing PixiJS texture cache across repeated casts.
  PIXI.Assets.load(source(definition.asset)).then(sheet=>{
   if(item.disposed||root.destroyed)return;
   if(!sheet?.baseTexture?.valid)throw Error('Atlas Pixi incompleto '+definition.asset);
   if(sheet.baseTexture.width!==FRAMES*FW||sheet.baseTexture.height!==FH)
     throw Error('Tamanho inválido '+definition.asset);
   item.frames=Array.from({length:FRAMES},(_,i)=>new PIXI.Texture(
    sheet.baseTexture,new PIXI.Rectangle(i*FW,0,FW,FH)));
   item.ready=true;
  }).catch(err=>{item.failed=String(err?.message||err);failures.push({name:item.n,error:item.failed});
    if(failures.length>12)failures.shift();});
  return item;
 }
 function animate(item,now){
  if(!item?.v72||item.disposed||!item.root||!item.app)return;
  const f=item.f,t=clamp((now-f.at)/(item.visualDuration||item.duration));
  if(!item.ready){item.sprite.visible=false;return;}
  const phase=phaseAt(item.key,t),idx=phase[2];
  item.sprite.texture=item.frames[idx];item.sprite.visible=true;
  const A=f.from,B=f.to,dx=B[0]-A[0],dy=B[1]-A[1],
   dist=Math.hypot(dx,dy)||1,ux=dx/dist,uy=dy/dist,
   contact=defs[item.key].mode==='contact',
   ew=item.app.screen.width,eh=item.app.screen.height;
  // V74: extra-compact artwork. Approx. 45-50% smaller than V73 in
  // common arenas; never scales up in smaller viewports. Only rendering size
  // and target-offset change, not hit detection, move frames or timing.
  const width=contact?
   clamp(Math.min(ew*.20,eh*.38),Math.min(62,ew*.11),Math.max(76,ew*.25)):
   clamp(dist*.56,Math.min(100,ew*.18),ew*.41);
  const height=width*FH/FW;
  item.sprite.width=width;item.sprite.height=height;
  item.sprite.rotation=Math.atan2(dy,dx);
  const destinationOffset=contact?.10*width:0;
  item.sprite.position.set(
   contact?B[0]-ux*destinationOffset:(A[0]+B[0])*.5,
   contact?B[1]-uy*destinationOffset:(A[1]+B[1])*.5
  );
  item.sprite.alpha=phase[4];
  // Screen-aligned stencil reveals the three Dragon Claw nails one by one.
  const m=item.mask;m.clear();m.beginFill(0xffffff,1);
  m.position.set(item.sprite.position.x,item.sprite.position.y);
  m.rotation=item.sprite.rotation;
  const selector=phase[3],row=selector.startsWith('band')?Number(selector.slice(-1)):0;
  if(selector==='impact')m.drawCircle(width*.22,0,Math.max(9,width*.21));
  else if(selector.startsWith('band'))m.drawRect(-width*.5,-height*.5+row*height/3,width,height/3+3);
  else if(selector==='upper')m.drawRect(-width*.5,-height*.5,width,height*.53);
  else if(selector==='lower')m.drawRect(-width*.5,-height*.03,width,height*.53);
  else m.drawRect(-width*.5,-height*.5,width,height);
  m.endFill();
  item.phase=phase[1];
  counts[item.key]=(counts[item.key]||0)+1;
 }
 function dispose(item){
  if(!item?.v72)return;
  item.disposed=true;item.ready=false;item.frames.length=0;
  // The globally cached BaseTexture belongs to Pixi Assets and is reused.
 }
 return {accepts,install,animate,dispose,source,phaseAt,
  specs:defs,forbidden,diagnostics:()=>({
    version:'76.0-preview',frames:FRAMES,visualSlowdown:VISUAL_SLOWDOWN,keys:Object.keys(defs),
    draws:{...counts},errors:failures.slice()
  })};
})();