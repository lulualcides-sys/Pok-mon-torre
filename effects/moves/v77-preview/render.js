/* Pokémon Torre V77: opt-in TRUE separated eight-frame battle sprites.
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
 const source=id=>'effects/moves/v77-preview/sprites/'+id+'.webp?v=77.0';
 const phaseNames={
   catalog_dragonclaw:['Preparo','Impacto inicial','Pausa','Garra 1','Garra 2','Garra 3','Três cortes','Dissipação'],
   catalog_cortex:['Preparo','Corte 1','Intervalo','Corte 2','Cruzamento','Impacto','Rastro','Dissipação'],
   catalog_dragonpulse:['Preparo','Carga','Disparo','Avanço','Contato','Explosão','Eco','Dissipação'],
   catalog_aurasphere:['Preparo','Concentração','Esfera','Lançamento','Trajetória','Contato','Explosão','Dissipação']
 };
 phaseNames.catalog_xscissor=phaseNames.catalog_cortex;
 let lastStage='';
 const niceName={catalog_dragonclaw:'Dragon Claw',catalog_cortex:'X-Scissor',catalog_xscissor:'X-Scissor',
  catalog_dragonpulse:'Dragon Pulse',catalog_aurasphere:'Aura Sphere'};
 function badge(){
   if(typeof document==='undefined')return null;
   let node=document.getElementById('pt-v77-preview-indicator');
   if(node)return node;
   node=document.createElement('div');node.id='pt-v77-preview-indicator';
   node.textContent='PRÉVIA V77 • Carregada • Use um dos quatro golpes';
   node.setAttribute('role','status');
   node.style.cssText='position:fixed;right:7px;bottom:7px;z-index:9998;'+
     'pointer-events:none;background:#07172de9;color:#d8eefe;'+
     'padding:5px 8px;border:1px solid #5baff2;border-radius:7px;'+
     'font:700 10px/1.4 system-ui;max-width:80vw;';
   document.body?.append(node);
   return node;
 }
 function reportStage(key,idx){
   const line=niceName[key]+' • '+(phaseNames[key]?.[idx]||'Quadro '+(idx+1))+
      ' • '+(idx+1)+'/8';
   if(lastStage!==line){lastStage=line;const el=badge();if(el)el.textContent='PRÉVIA V77 • '+line;}
 }
 if(typeof window!=='undefined'){
   window.PokemonTorreBattlePreviewV77={version:'77.0',active:true,
     phase:()=>lastStage,draws:()=>({...counts}),errors:()=>failures.slice()};
   if(typeof document!=='undefined'){
     if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',badge,{once:true});
     else badge();
   }
 }
 function install(app,f,key){
  if(!accepts(key)||!app?.stage||!f?.from||!f?.to||!window.PIXI?.Assets)return null;
  const definition=defs[key],root=new PIXI.Container(),sprite=new PIXI.Sprite(PIXI.Texture.EMPTY);
  sprite.anchor.set(.5);sprite.visible=false;root.addChild(sprite);app.stage.addChild(root);
  const item={v72:true,n:definition.asset,key,f,root,sprite,app,frames:[],ready:false,
   disposed:false,duration:f.duration||950,
   visualDuration:Math.max(250,f.duration||950)*VISUAL_SLOWDOWN};
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
    version:'77.0-preview',frames:FRAMES,visualSlowdown:VISUAL_SLOWDOWN,keys:Object.keys(defs),
    draws:{...counts},errors:failures.slice()
  })};
})();