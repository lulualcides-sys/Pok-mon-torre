/* Pokémon Torre V81: four user-approved battle animations, synchronized damage.
 * V71 art -> V72 transparent 8-frame atlas -> ONE existing PixiJS overlay.
 * Does not implement damage, change move timing, or intercept protected moves.
 * Canvas is NOT used to paint these attacks; the legacy Canvas API still owns
 * the battlefield, Pokémon sprites, HP, hit registration and user input.
 */
var battleFourV72=(()=>{
 'use strict';
 const FRAMES=8, FW=480,FH=240;
 // Contact animations are approved at the V77 timing; only the two newly staged
 // ranged previews get a longer visual timeline (no changes to hit/cooldown).
 const VISUAL_SLOWDOWN=1.8;
 const RANGED_SLOWDOWN=3.4;
 const visualFactor=key=>key==='catalog_dragonpulse'||key==='catalog_aurasphere'?RANGED_SLOWDOWN:VISUAL_SLOWDOWN;
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
 const source=id=>['dragon-claw','x-scissor'].includes(id)?
  'effects/moves/v77-preview/sprites/'+id+'.webp?v=77.0':
  'effects/moves/v78-preview/sprites/'+id+'.webp?v=78.0';
 const phaseNames={
   catalog_dragonclaw:['Preparo','Impacto inicial','Pausa','Garra 1','Garra 2','Garra 3','Três cortes','Dissipação'],
   catalog_cortex:['Preparo','Corte 1','Intervalo','Corte 2','Cruzamento','Impacto','Rastro','Dissipação'],
   catalog_dragonpulse:['Antecipação','Carga','Feixe nasce','Feixe avança','Alcança o alvo','Impacto separado','Explosão dracônica','Eco'],
   catalog_aurasphere:['Esfera pequena','Carga','Esfera completa','Lançamento','Travessia','Impacto','Explosão azul','Dissipação']
 };
 phaseNames.catalog_xscissor=phaseNames.catalog_cortex;
 let lastStage='';
 const niceName={catalog_dragonclaw:'Dragon Claw',catalog_cortex:'X-Scissor',catalog_xscissor:'X-Scissor',
  catalog_dragonpulse:'Dragon Pulse',catalog_aurasphere:'Aura Sphere'};
 // Approved visuals stay quiet: no debug badge or in-game Atelier.
 function reportStage(key,idx){
   const name=phaseNames[key]?.[idx]||'Quadro '+(idx+1);
   lastStage=niceName[key]+' • '+name+' • '+(idx+1)+'/8';
 }
 if(typeof window!=='undefined'){
   window.PokemonTorreBattleArtV81={
     version:'81.0',approved:true,
     synchronization:{impactFrame:5,impactFraction:5/FRAMES,rangedSlowdown:RANGED_SLOWDOWN},
     phase:()=>lastStage,draws:()=>({...counts}),errors:()=>failures.slice()
   };
 }
 function install(app,f,key){
  if(!accepts(key)||!app?.stage||!f?.from||!f?.to||!window.PIXI?.Assets)return null;
  const definition=defs[key],root=new PIXI.Container(),sprite=new PIXI.Sprite(PIXI.Texture.EMPTY);
  sprite.anchor.set(.5);sprite.visible=false;root.addChild(sprite);app.stage.addChild(root);
  const item={v72:true,n:definition.asset,key,f,root,sprite,app,frames:[],ready:false,
   disposed:false,duration:f.duration||950,
   visualDuration:Math.max(250,f.duration||950)*visualFactor(key)};
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
  const idx=Math.min(FRAMES-1,Math.floor(t*FRAMES));
  item.sprite.texture=item.frames[idx];item.sprite.visible=true;
  reportStage(item.key,idx);
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
  item.sprite.alpha=1;
  counts[item.key]=(counts[item.key]||0)+1;
 }
 function dispose(item){
  if(!item?.v72)return;
  item.disposed=true;item.ready=false;item.frames.length=0;
  // The globally cached BaseTexture belongs to Pixi Assets and is reused.
 }
 return {accepts,install,animate,dispose,source,
  specs:defs,forbidden,diagnostics:()=>({
    version:'81.0-approved',frames:FRAMES,visualSlowdown:VISUAL_SLOWDOWN,
    rangedVisualSlowdown:RANGED_SLOWDOWN,keys:Object.keys(defs),
    draws:{...counts},errors:failures.slice()
  })};
})();