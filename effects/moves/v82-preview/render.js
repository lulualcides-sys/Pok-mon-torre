/* Pokémon Torre — V82 Grass Four, ONLY in ?battle_preview=v82.
   Renders four independent spritesheets authored from project's source SVGs.
   PixiJS is the painter; canvas remains only the normal arena rendering.
   The original V81/approved Chicote de Vinha art is never replaced.
 */
var equippedGrassV82=(()=>{
 'use strict';
 const W=480,H=240,N=8,VISUAL_SPEED=2.8;
 const defs=Object.freeze({
  preview_chicotedevinha:{name:'Chicote de Vinha',asset:'chicote-de-vinha',impact:5},
  preview_folhanavalha:{name:'Folha Navalha',asset:'folha-navalha',impact:5},
  preview_chicotesemarea:{name:'Chicotes em Área',asset:'chicotes-em-area',impact:5},
  preview_vinewhip:{name:'Vine Whip',asset:'vine-whip',impact:6}
 });
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[^a-z0-9]/g,'');
 const keys=Object.freeze({
   chicotedevinha:'preview_chicotedevinha',
   folhanavalha:'preview_folhanavalha',
   chicotesemarea:'preview_chicotesemarea',
   vinewhip:'preview_vinewhip'
 });
 const stages={
  preview_chicotedevinha:['Preparação','Broto','Avanço','Estalo','Contato','Impacto','Folhas','Recuo'],
  preview_folhanavalha:['Carga','Primeiras folhas','Lâminas','Segundo grupo','Trajetória','Corte','Colisão','Dissipação'],
  preview_chicotesemarea:['Carga','Chicote alto','Chicote central','Chicote baixo','Cerco','Três impactos','Folhagem','Recuo'],
  preview_vinewhip:['Preparação','Primeiro chicote','Extensão','Primeiro impacto','Recuo','Segundo chicote','Segundo impacto','Retorno']
 };
 let count=0,errors=[],stage='';
 function accepts(key){return Object.hasOwn(defs,key)}
 function resolve(name){return keys[norm(name)]||''}
 function source(id){return 'effects/moves/v82-preview/sprites/'+id+'.webp?v=82.0'}
 function install(app,f,key){
  if(!accepts(key)||!app?.stage||!f?.from||!f?.to||!window.PIXI?.Assets)return null;
  const root=new PIXI.Container(),sprite=new PIXI.Sprite(PIXI.Texture.EMPTY);
  sprite.anchor.set(.5);sprite.visible=false;root.addChild(sprite);app.stage.addChild(root);
  const item={v82:true,app,root,sprite,key,f,ready:false,frames:[],disposed:false,
   duration:f.duration||1050,visualDuration:Math.max(400,f.duration||1050)*VISUAL_SPEED};
  PIXI.Assets.load(source(defs[key].asset)).then(tex=>{
   if(item.disposed||root.destroyed)return;
   if(!tex?.baseTexture?.valid||tex.baseTexture.width!==W*N||tex.baseTexture.height!==H)
     throw Error('Spritesheet V82 inválido para '+key);
   item.frames=Array.from({length:N},(_,i)=>new PIXI.Texture(
     tex.baseTexture,new PIXI.Rectangle(i*W,0,W,H)));
   item.ready=true;
  }).catch(err=>{errors.push({key,message:String(err?.message||err)});
    if(errors.length>15)errors.shift()});
  return item;
 }
 function animate(item,now){
  if(!item?.v82||item.disposed||!item.root)return;
  if(!item.ready){item.sprite.visible=false;return}
  const f=item.f,t=Math.max(0,Math.min(1,(now-f.at)/item.visualDuration));
  const index=Math.min(N-1,Math.floor(t*N));
  item.sprite.texture=item.frames[index];item.sprite.visible=true;
  const A=f.from,B=f.to,dist=Math.hypot(B[0]-A[0],B[1]-A[1])||1;
  const width=Math.max(100,Math.min(item.app.screen.width*1.15,dist*W/350));
  item.sprite.width=width;item.sprite.height=width*H/W;
  item.sprite.rotation=Math.atan2(B[1]-A[1],B[0]-A[0]);
  item.sprite.position.set((A[0]+B[0])/2,(A[1]+B[1])/2);
  item.sprite.alpha=index===7?1-(t-.875)*3.1:1;
  const label=defs[item.key].name+' • '+stages[item.key][index]+' • '+(index+1)+'/8';
  stage=label;count++;
  const indicator=window.document?.getElementById('pt82-preview-grass');
  if(indicator&&indicator.textContent!==label)indicator.textContent=label;
 }
 function dispose(item){
  if(!item?.v82)return;
  item.ready=false;item.disposed=true;item.frames.length=0;
 }
 function tag(){
  if(typeof document==='undefined'||document.getElementById('pt82-preview-grass'))return;
  const d=document.createElement('div');
  d.id='pt82-preview-grass';d.textContent='PRÉVIA V82 • 4 golpes equipados';
  d.style.cssText='position:fixed;right:6px;bottom:6px;z-index:9998;'+
     'pointer-events:none;padding:5px 8px;border-radius:7px;'+
     'border:1px solid #72b7a0;color:#d6f9dc;background:#071d16ed;'+
     'font:700 10px/1.4 system-ui;max-width:84vw';
  document.body.append(d);
 }
 if(typeof window!=='undefined'){
  window.PokemonTorreEquippedFourPreviewV82={
   version:'82.0',enabled:true,keys:Object.keys(keys),resolve,
   stages:()=>stage,drawCount:()=>count,
   timings:{speed:VISUAL_SPEED,contacts:Object.fromEntries(
    Object.entries(defs).map(([k,v])=>[v.name,v.impact/8]))},
   errors:()=>errors.slice()
  };
  if(typeof document!=='undefined'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tag,{once:true});
    else tag();
  }
 }
 return {accepts,resolve,install,animate,dispose,source,defs,
  diagnostics:()=>({version:'82.0',frames:N,draws:count,errors:errors.slice()})};
})();
