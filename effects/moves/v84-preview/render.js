/* Pokemon Torre V84 - opt-in ONLY (?battle_preview=v84).
 * Four distinct preauthored 8-frame RGBA atlases, PixiJS WebGL sprites,
 * live per-leaf motion (Folha Navalha), and Pixi Particle Emitter.
 * Never paints attacks in CSS/Canvas2D, and never triggers HP directly.
 */
var grassFourV84=(()=>{
 'use strict';
 const W=480,H=240,N=8;
 const specs=Object.freeze({
  chicotedevinha:{name:'Chicote de Vinha',asset:'chicote-de-vinha',impact:4,speed:5.0,scale:.94,thickness:.92},
  folhanavalha:{name:'Folha Navalha',asset:'folha-navalha',impact:5,speed:3.35,scale:.96,thickness:.88,leaves:true},
  chicotesemarea:{name:'Chicotes em Área',asset:'chicotes-em-area',impact:5,speed:1.85,scale:.82,thickness:.61},
  vinewhip:{name:'Vine Whip',asset:'vine-whip',impact:4,speed:4.95,scale:.94,thickness:.92}
 });
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
   .toLowerCase().replace(/[^a-z0-9]/g,'');
 const accepts=k=>Object.hasOwn(specs,k);
 const resolve=n=>accepts(norm(n))?norm(n):'';
 const source=key=>{
  const id=specs[key].asset;
  return 'effects/moves/'+id+'/v83-preview/sprites/'+id+'.webp?v=84.1';
 };
 const leafPath='effects/moves/v83-preview/sprites/leaf.webp?v=84.1';
 const loaded=new Map(),errors=[];
 let leafRequest=null;
 const counters={casts:0,draws:0,stages:0,leafMotion:0,particles:0,last:null,perMove:{}};
 function atlas(key){
  if(loaded.has(key))return loaded.get(key);
  const p=PIXI.Assets.load(source(key)).then(texture=>{
   const base=texture?.baseTexture;
   if(!base?.valid||base.width!==W*N||base.height!==H)throw Error('V84 atlas '+key);
   return Array.from({length:N},(_,i)=>
    new PIXI.Texture(base,new PIXI.Rectangle(i*W,0,W,H)));
  }).catch(e=>{loaded.delete(key);errors.push(String(e.message||e));throw e});
  loaded.set(key,p);return p;
 }
 function makeEmitter(root,texture){
  if(!window.PIXI?.particles?.Emitter)return null;
  try{
   const e=new PIXI.particles.Emitter(root,{
    lifetime:{min:.20,max:.53},frequency:.035,maxParticles:24,
    particlesPerWave:2,emitterLifetime:-1,addAtBack:false,pos:{x:0,y:0},
    behaviors:[
     {type:'alpha',config:{alpha:{list:[{value:.86,time:0},{value:0,time:1}]}}},
     {type:'scale',config:{scale:{list:[{value:.23,time:0},{value:.04,time:1}]}}},
     {type:'moveSpeed',config:{speed:{list:[{value:82,time:0},{value:19,time:1}]}}},
     {type:'rotationStatic',config:{min:0,max:360}},
     {type:'spawnShape',config:{type:'torus',data:{x:0,y:0,radius:8}}},
     {type:'textureSingle',config:{texture}}
    ]
   });
   e.emit=false;return e;
  }catch(e){errors.push('Emitter '+String(e.message||e));return null}
 }
 function install(app,f,key){
  if(!accepts(key)||!app?.stage||!Array.isArray(f?.from)||
     !Array.isArray(f?.to)||!window.PIXI?.Assets)return null;
  const spec=specs[key],root=new PIXI.Container(),
    sprite=new PIXI.Sprite(PIXI.Texture.EMPTY),
    fade=new PIXI.Sprite(PIXI.Texture.EMPTY),
    motes=new PIXI.Container(),leafRoot=new PIXI.Container();
  sprite.anchor.set(.5);fade.anchor.set(.5);
  sprite.visible=false;fade.visible=false;
  root.addChild(sprite,fade,leafRoot,motes);
  app.stage.addChild(root);
  const item={v84:true,key,f,app,root,sprite,fade,motes,leafRoot,
   spec,frames:[],leafSprites:[],emitter:null,ready:false,disposed:false,
   visualDuration:Math.max(400,f.duration||1000)*spec.speed,seen:-1};
  atlas(key).then(frames=>{
   if(item.disposed)return;
   item.frames=frames;item.ready=true;
  }).catch(e=>{errors.push('Loading '+String(e.message||e))});
  if(!leafRequest)leafRequest=PIXI.Assets.load(leafPath).catch(e=>{
   errors.push('Leaf asset '+String(e.message||e));return null;
  });
  leafRequest.then(tex=>{
   if(item.disposed||!tex)return;
   item.emitter=makeEmitter(motes,tex);
   if(spec.leaves){
    // Real individual leaves travelling on curved paths every Pixi ticker
    // frame. The 8 preauthored frames remain underneath as visual stages.
    for(let i=0;i<14;i++){
     const leaf=new PIXI.Sprite(tex);
     leaf.anchor.set(.5);leaf.visible=false;
     leafRoot.addChild(leaf);item.leafSprites.push(leaf);
    }
   }
  });
  counters.casts++;
  const record=counters.perMove[spec.name]||(counters.perMove[spec.name]={
    casts:0,draws:0,framesMask:0,lastFrame:0,width:0,height:0
  });
  record.casts++;
  return item;
 }
 const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));
 function animate(item,now,dt){
  if(!item?.v84||item.disposed||!item.ready)return;
  const {f,spec}=item,t=clamp((now-f.at)/item.visualDuration);
  const p=t*N,index=Math.min(7,Math.floor(p)),fraction=clamp(p-index);
  item.sprite.texture=item.frames[index];
  item.sprite.visible=true;
  // Blend between normal stages, but never reveal the damaging frame early.
  const safe=index<7&&index!==spec.impact-1;
  const alpha=safe?clamp((fraction-.20)/.8):0;
  item.fade.texture=item.frames[Math.min(7,index+1)];
  item.fade.visible=alpha>.001;
  const A=f.from,B=f.to,dx=B[0]-A[0],dy=B[1]-A[1],
   reach=Math.hypot(dx,dy)||1;
  const width=Math.min(item.app.screen.width*1.04,
    Math.max(85,reach*W/345))*spec.scale;
  // Compact in area without breaking horizontal battle reach.
  const height=width*H/W*spec.thickness;
  const angle=Math.atan2(dy,dx),cx=(A[0]+B[0])/2,cy=(A[1]+B[1])/2;
  const hide=index===7?clamp((1-t)*8):1;
  for(const sp of [item.sprite,item.fade]){
   sp.width=width;sp.height=height;sp.rotation=angle;
   sp.position.set(cx,cy);
  }
  item.sprite.alpha=(1-alpha)*hide;
  item.fade.alpha=alpha*hide;
  // Folha Navalha travels every RAF; independent kinetic leaf blades prevent
  // "8 still screenshots" judder even on slower devices.
  if(item.leafSprites.length){
   const travel=clamp((t-.06)/.64);
   for(let i=0;i<item.leafSprites.length;i++){
    const leaf=item.leafSprites[i];
    const trail=i%7*.045+Math.floor(i/7)*.09;
    const q=clamp((travel-trail)/Math.max(.12,1-trail));
    const flying=t>.04&&t<spec.impact/N&&q>.015;
    leaf.visible=flying;
    if(!flying)continue;
    const band=(i%7-3)*9,arc=Math.sin(q*Math.PI*(2+(i%3)))*12;
    leaf.position.set(A[0]+dx*q-Math.sin(angle)*(band+arc),
      A[1]+dy*q+Math.cos(angle)*(band+arc));
    leaf.rotation=angle+(i%3-1)*.36+q*5;
    leaf.width=(11+i%4*3)*(.85+.14*Math.sin(now*.012+i));
    leaf.height=leaf.width*.72;
    leaf.alpha=clamp(Math.min(q*9,(spec.impact/N-t)*20));
    counters.leafMotion++;
   }
  }
  if(item.emitter){
   const impact=index>=spec.impact&&index<7;
   const q=clamp((t-.06)/(.60));
   item.emitter.updateOwnerPos(impact?B[0]:A[0]+dx*q,
     impact?B[1]:A[1]+dy*q);
   item.emitter.emit=index>0&&index<7;
   item.emitter.update(clamp(dt||.016,.001,.05));
   counters.particles++;
  }
  if(item.seen!==index){item.seen=index;counters.stages++;}
  counters.draws++;
  const tracked=counters.perMove[spec.name];
  if(tracked){
   tracked.draws++;tracked.framesMask|=1<<index;
   tracked.lastFrame=index+1;
   tracked.width=Math.round(width);tracked.height=Math.round(height);
  }
  counters.last={move:spec.name,frame:index+1,draws:counters.draws,
   width:Math.round(width),height:Math.round(height),
   speed:spec.speed,impact:index===spec.impact};
 }
 function dispose(item){
  if(!item?.v84||item.disposed)return;
  item.disposed=true;item.ready=false;
  if(item.emitter){try{item.emitter.emit=false;item.emitter.cleanup();item.emitter.destroy()}catch(_e){}}
  item.emitter=null;
  item.frames.length=0;item.leafSprites.length=0;
 }
 const speeds={},contacts={},sizes={};
 for(const v of Object.values(specs)){
  speeds[v.name]=v.speed;
  contacts[v.name]=v.impact/N;
  sizes[v.name]={width:v.scale,height:v.thickness};
 }
 function diagnostic(){return {
  version:'84.1',...counters,errors:errors.slice(-6),atlases:loaded.size,
  timings:{speeds,contacts,sizes}
 }}
 if(typeof window!=='undefined'){
  window.PokemonTorreGrassFourPreviewV84={version:'84.1',enabled:true,
    diagnostics:diagnostic,timings:{speeds,contacts,sizes}};
  if(window.PIXI?.Assets){
   for(const k of Object.keys(specs))atlas(k).catch(()=>{});
  }
  // Minimal version marker, only in the isolated preview (NOT an Atelier).
  if(typeof document!=='undefined'){
   const tag=()=>{
    if(document.getElementById('pokemon-v84-mark'))return;
    const e=document.createElement('div');e.id='pokemon-v84-mark';
    e.textContent='PRÉVIA V84.1 · ISOLADA';
    e.style.cssText='position:fixed;bottom:6px;left:6px;z-index:9999;'+
      'font:700 10px system-ui;color:#dcffd4;background:#103a24e8;'+
      'padding:5px 8px;border:1px solid #6bd778;border-radius:6px;'+
      'pointer-events:none';
    document.body.appendChild(e);
   };
   if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tag,{once:true});
   else tag();
  }
 }
 return {accepts,resolve,install,animate,dispose,specs,source,diagnostic};
})();
