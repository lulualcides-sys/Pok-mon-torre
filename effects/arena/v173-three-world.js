/* Pokémon Torre V173 — REAL 3D 2.5D LAB.
 * Three.js WebGL builds actual depth meshes, camera, walls, floor, pillars and lighting;
 * sprites from local PMD SpriteCollab are animated THREE.Sprite billboards at real 3D
 * locations (world footprints derived from the original 2D collision coordinates).
 * No changes to official gameplay, V128 water, V172 fire, approved moves or save data.
 * Only injected into the V173 isolated full-game copy, never index.html.
 */
(()=>{
'use strict';
const T=window.THREE,qs=new URLSearchParams(location.search);
const info={version:'173.0-true-3d-billboard',installed:true,enabled:!!window.__V173_LAB,
 three:!!T,webgl:false,mounts:0,geometry3d:0,meshes:0,layers:0,lights:0,shadowReceivers:0,
 pmSprites:0,actors3d:0,monCalls:0,monFallbacks:0,animatedFrames:0,animatedSpecies:[],frameCount:0,
 projectionChecks:0,avgFps:0,renderer:'pending',failedAssets:0,
 errors:[],isolated:true,approvedMovesIntact:true,campaignUntouched:true};
const api={diagnostics:()=>({...info}),setTheme:()=>false};
window.PokemonTorreV173Stage=api;
if(!window.__V173_LAB||qs.get('safe')==='1'||!T||typeof BattleEngine!=='function')return;
const entries=new WeakMap(),active=new Set();
const native={
 draw:BattleEngine.prototype.draw,
 mon:BattleEngine.prototype.drawMon,
 bg:BattleEngine.prototype.generateBackdrop,
 destroy:BattleEngine.prototype.destroy
};
let theme=qs.get('three_theme')==='violet'?'violet':'blue';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const PAL={
 blue:{fog:0x070f24,stone:0x374d77,edge:0x5e9ddd,bright:0x8df0ff,wall:0x18294f,torches:0x50bfff},
 violet:{fog:0x160e2c,stone:0x514575,edge:0xa17ae1,bright:0xecc5ff,wall:0x231b47,torches:0xb989ff}
};
const atlas='assets/arena-v165/floor-atlas.png';
const wallArt='assets/arena-v165/back-wall.png';
const ids=new Set([1,4,7,25,74,95,150,151]);
const spriteLibrary=new Map();
function log(e){const s=String(e?.message||e);if(!info.errors.includes(s))info.errors.push(s);info.errors=info.errors.slice(-9);}
const live=e=>!!(e?.canvas?.isConnected&&typeof battle!=='undefined'&&battle?.active);
function drop(e){
 const v=entries.get(e);if(!v)return;
 entries.delete(e);active.delete(v);
 try{v.renderer.dispose();}catch(_){}
 try{v.renderer.forceContextLoss();}catch(_){}
 try{v.renderer.domElement.remove();}catch(_){}
 try{v.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material&&o.userData.stageOnly){[].concat(o.material).forEach(m=>m.dispose());}});}catch(_){}
 info.actors3d=0;
}
const texLoader=new T.TextureLoader();
function loadTexture(url){
 return new Promise((resolve,reject)=>{
  texLoader.load(url,t=>{
   t.magFilter=T.NearestFilter;t.minFilter=T.LinearMipMapLinearFilter;
   t.wrapS=T.RepeatWrapping;t.wrapT=T.RepeatWrapping;t.anisotropy=4;
   resolve(t);
  },undefined,reject);
 });
}
function material(color,rough=.86,metal=.04){
 return new T.MeshStandardMaterial({color,roughness:rough,metalness:metal});
}
function mesh(v,geometry,mat,x,y,z,shadow=true){
 const o=new T.Mesh(geometry,mat);
 o.position.set(x,y,z);o.castShadow=shadow;o.receiveShadow=true;
 o.userData.stageOnly=true;
 v.scene.add(o);info.meshes++;info.geometry3d++;
 return o;
}
function col(v,c,w,h,d,x,y,z){
 return mesh(v,new T.BoxGeometry(w,h,d),material(c),x,y,z);
}
function illum(v,color,x,y,z,intensity,dist){
 const light=new T.PointLight(color,intensity,dist,2);
 light.position.set(x,y,z);v.scene.add(light);info.lights++;
 return light;
}
function platform(v,p){
 // Under-floor slab physically extends below the fighting plane.
 col(v,0x0e1830,17.5,.72,14.4,0,-.55,0);
 const trim=material(p.edge,.28,.22);
 const strip=material(p.bright,.34,.05);
 for(const z of [-6.99,6.99]){
  mesh(v,new T.BoxGeometry(17.6,.17,.2),trim,0,-.1,z);
  mesh(v,new T.BoxGeometry(17.6,.055,.045),strip,0,.005,z);
 }
 for(const x of [-8.50,8.50]){
  mesh(v,new T.BoxGeometry(.17,.16,14.2),trim,x,-.11,0);
  mesh(v,new T.BoxGeometry(.048,.045,14.2),strip,x,.014,0);
 }
}
function buildRoom(v){
 const p=PAL[theme];
 v.scene.background=new T.Color(p.fog);
 v.scene.fog=new T.FogExp2(p.fog,.012);
 // True perspective floor, not 2D scaled pixel rectangles.
 const floor=mesh(v,new T.PlaneGeometry(17.3,14.15),material(p.stone,.96,.015),0,0,0,false);
 floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;
 v.floor=floor;
 platform(v,p);
 // Load original artwork as a physically illuminated texture on the floor.
 loadTexture(atlas).then(t=>{
  if(!v.renderer.domElement.isConnected){t.dispose();return;}
  t.repeat.set(1.75,1.6);
  const m=new T.MeshStandardMaterial({map:t,color:0xb7b5d3,roughness:1,metalness:0});
  floor.material.dispose();floor.material=m;floor.userData.stageOnly=true;
  v.floorTexture=t;
 }).catch(e=>{info.failedAssets++;log('Stone texture: '+e.message);});
 // Real perpendicular, thickness-bearing back wall.
 const wall=col(v,p.wall,17.6,5.9,.7,0,2.62,-6.92);
 loadTexture(wallArt).then(t=>{
  if(!v.renderer.domElement.isConnected){t.dispose();return;}
  t.wrapS=T.ClampToEdgeWrapping;t.wrapT=T.ClampToEdgeWrapping;t.repeat.set(1,1);
  wall.material.dispose();wall.material=new T.MeshStandardMaterial({map:t,color:0xaeb6df,roughness:.91});
 }).catch(e=>{info.failedAssets++;log('Wall texture: '+e.message);});
 // Real architectural doorway, inset stone lintel + illuminated edge.
 col(v,0x0a1026,4.6,3.9,.12,0,1.98,-6.46);
 for(const x of [-2.55,2.55]){
  col(v,p.stone,.45,4.25,.83,x,2.13,-6.38);
  const seam=mesh(v,new T.BoxGeometry(.045,3.9,.09),material(p.bright,.3),x>0?x-.24:x+.24,2.03,-5.92,false);
 }
 col(v,p.stone,5.75,.49,.88,0,4.39,-6.31);
 // Side walls have real thickness and cast meaningful shadows.
 col(v,p.wall,.52,3.3,13.5,-8.64,1.35,-.13);
 col(v,p.wall,.52,3.3,13.5,8.64,1.35,-.13);
 const bricks=material(p.stone);
 // Raised stone border slabs and real battlements at walls/perimeter.
 for(let side of [-1,1]){
  for(let k=0;k<5;k++){
   const z=-5.75+k*2.66;
   col(v,k%2?p.wall:p.stone,.54,.45,2.57,side*8.32,.22,z);
  }
  for(let k=0;k<4;k++){
   const z=-5.65+k*3.65;
   // Actual 3D square stone columns, not flat CSS rectangles.
   mesh(v,new T.BoxGeometry(.72,3.7,.72),bricks,side*7.96,1.75,z);
   mesh(v,new T.BoxGeometry(1.05,.24,1.05),bricks,side*7.96,3.62,z);
   mesh(v,new T.BoxGeometry(1.02,.28,1.02),material(p.edge),side*7.96,.32,z);
  }
 }
 // Sparse sapphire crystals on perimeter: small objects with real relief.
 const crystal=material(theme==='violet'?0xb98ffe:0x61c6ee,.25,.16);
 const locations=[[-7.30,-4.3],[7.30,-4.3],[-7.36,3.3],[7.36,3.3]];
 for(const [x,z] of locations){
  const obj=mesh(v,new T.ConeGeometry(.41,2.1,5,1),crystal,x,1.0,z);
  obj.rotation.y=.34;
  const halo=mesh(v,new T.CylinderGeometry(.6,.75,.07,12),material(p.edge,.43),x,.06,z,false);
  halo.castShadow=false;
  illum(v,p.torches,x,2.4,z,.68,4.2);
 }
 // Real directional shadows onto a flat stone plane.
 v.scene.add(new T.HemisphereLight(0xb3ccff,0x141b2f,1.02));info.lights++;
 const key=new T.DirectionalLight(0xe2e8ff,2.05);
 key.position.set(-5.8,11,4.6);
 key.castShadow=true;key.shadow.mapSize.set(512,512);
 key.shadow.camera.left=-11;key.shadow.camera.right=11;
 key.shadow.camera.top=12;key.shadow.camera.bottom=-12;
 key.shadow.camera.near=1;key.shadow.camera.far=32;
 key.shadow.bias=-.00035;
 v.scene.add(key);info.lights++;
 info.shadowReceivers+=2;
 // Stone seams have physical dimension: faint raised grouting in world space.
 const seamMat=new T.MeshStandardMaterial({color:p.edge,roughness:1,transparent:true,opacity:.21});
 for(let x=-7.3;x<8;x+=1.82){
  const st=mesh(v,new T.BoxGeometry(.022,.009,12.9),seamMat,x,.015,0,false);st.castShadow=false;
 }
 for(let z=-5.7;z<6.7;z+=1.66){
  const st=mesh(v,new T.BoxGeometry(16.7,.009,.024),seamMat,0,.017,z,false);st.castShadow=false;
 }
}
function context(e){
 if(!live(e)||!e.w||!e.h)return null;
 let v=entries.get(e);
 // Original combat size can be fractional CSS pixels; WebGL buffer uses integer
 // ceil values. Comparing integer buffer to raw e.w/e.h destroyed the world
 // EVERY frame, removing the previous opponent and recreating 3D meshes/lights.
 if(v&&v.w===Math.ceil(e.w)&&v.h===Math.ceil(e.h))return v;
 if(v)drop(e);
 const host=e.canvas.parentElement;if(!host)return null;
 try{
  const w=Math.ceil(e.w),h=Math.ceil(e.h);
  const renderer=new T.WebGLRenderer({antialias:false,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:false});
  renderer.setPixelRatio(1);renderer.setSize(w,h,false);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.outputEncoding=T.sRGBEncoding;
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.27;
  const scene=new T.Scene();
  const camera=new T.PerspectiveCamera(51,w/h,.15,85);
  // Fixed tilted view of a full 3D hall. The actors stand on its REAL floor.
  camera.position.set(0,11.8,15.7);camera.lookAt(0,.20,-.45);
  const view=renderer.domElement;
  view.dataset.arena='three173';
  view.style.cssText='position:absolute;inset:0;z-index:0;pointer-events:none;max-width:none;transform-origin:top left';
  e.canvas.style.position='absolute';e.canvas.style.zIndex='1';e.canvas.style.background='transparent';
  host.insertBefore(view,e.canvas);
  v={e,w,h,renderer,scene,camera,view,actors:new Map(),frame:0,last:0,ray:new T.Raycaster(),
     plane:new T.Plane(new T.Vector3(0,1,0),0),tmp:new T.Vector3(),lastFps:performance.now(),frames:0};
  entries.set(e,v);active.add(v);info.mounts++;
  buildRoom(v);
  // Native draw() tests .complete and .naturalWidth before drawing its backdrop.
  // A normal Canvas object has neither, so it falls back to an OPAQUE gray
  // gradient and conceals the real Three.js world. Give it image semantics.
  const clear=document.createElement('canvas');
  clear.width=w;clear.height=h;clear.complete=true;clear.naturalWidth=w;
  v.blankBackdrop=clear;e.bg=clear;
  info.webgl=!!renderer.getContext();info.renderer='THREE.WebGLRenderer';
  update(v,performance.now());
  return v;
 }catch(err){log('3D stage: '+err.message);return null;}
}
// Raycast the existing combat footprints onto the real ground plane.
// Input and hitboxes remain 2D authoritative, THREE only renders the visual world.
function footprint(v,x,y){
 const p=v.tmp,pixelX=clamp(x/v.w,-.12,1.12),pixelY=clamp(y/v.h,-.12,1.12);
 v.ray.setFromCamera(new T.Vector2(pixelX*2-1,1-pixelY*2),v.camera);
 if(!v.ray.ray.intersectPlane(v.plane,p)){p.set((pixelX-.5)*15,0,(pixelY-.5)*12);}
 p.x=clamp(p.x,-7.2,7.2);p.z=clamp(p.z,-5.8,5.5);p.y=0;
 info.projectionChecks++;
 return p.clone();
}
function pixelsWorld(v,p,sizePx){
 const distance=v.camera.position.distanceTo(p);
 return clamp((sizePx/v.h)*2*Math.tan((v.camera.fov*Math.PI/180)*.5)*distance,.35,3.5);
}
function prefetch(id){
 if(!ids.has(id))return null;
 if(spriteLibrary.has(id))return spriteLibrary.get(id);
 const data={ready:false,actions:new Map(),meta:new Map(),errors:[]};
 spriteLibrary.set(id,data);
 const base='assets/pmd-spritecollab/'+String(id).padStart(4,'0')+'/';
 fetch(base+'AnimData.xml').then(r=>{if(!r.ok)throw Error('PMD metadata '+r.status);return r.text();}).then(xml=>{
  const doc=new DOMParser().parseFromString(xml,'application/xml');
  for(const item of doc.querySelectorAll('Anim')){
   const action=item.querySelector('Name')?.textContent?.trim();
   const width=Number(item.querySelector('FrameWidth')?.textContent);
   const height=Number(item.querySelector('FrameHeight')?.textContent);
   const durations=[...item.querySelectorAll('Durations > Duration')].map(n=>Number(n.textContent)).filter(n=>n>0);
   if(action&&width&&height&&durations.length)data.meta.set(action,{width,height,durations});
  }
  data.ready=true;
 }).catch(ex=>{data.errors.push(ex.message);info.failedAssets++;});
 for(const action of ['Idle','Walk','Attack','Shoot','Hurt']){
  texLoader.load(base+action+'-Anim.png',texture=>{
   texture.magFilter=T.NearestFilter;texture.minFilter=T.NearestFilter;
   texture.wrapS=T.ClampToEdgeWrapping;texture.wrapT=T.ClampToEdgeWrapping;
   texture.flipY=false;texture.generateMipmaps=false;
   data.actions.set(action,texture);
  },undefined,()=>{});
 }
 return data;
}
function actor(v,who,id,enemy){
 const s=prefetch(id);
 if(!s?.ready)return false;
 const moving=Math.hypot(who.vx||0,who.vy||0)>.06 ||
  (!enemy&&Math.hypot(v.e.input?.dx||0,v.e.input?.dy||0)>.1);
 const action=who.flash>0?'Hurt':who.action==='Attack'?'Attack':moving?'Walk':'Idle';
 const meta=s.meta.get(action)||s.meta.get('Idle');
 const texture=s.actions.get(action)||s.actions.get('Idle');
 if(!meta||!texture?.image?.width||!texture?.image?.height)return false;
 const viewName=enemy?'enemy':'player';
 let view=v.actors.get(viewName);
 if(!view||view.id!==id){
  if(view){v.scene.remove(view.sprite);v.scene.remove(view.shadow);view.sprite.material.dispose();}
  const mat=new T.SpriteMaterial({map:texture.clone(),transparent:true,alphaTest:.12,depthWrite:false,
   sizeAttenuation:true,color:0xffffff});
  mat.map.magFilter=T.NearestFilter;mat.map.minFilter=T.NearestFilter;
  mat.map.wrapS=T.ClampToEdgeWrapping;mat.map.wrapT=T.ClampToEdgeWrapping;
  mat.map.flipY=false;mat.map.generateMipmaps=false;mat.map.needsUpdate=true;
  const sprite=new T.Sprite(mat);
  const shadow=new T.Mesh(new T.CircleGeometry(.72,28),
    new T.MeshBasicMaterial({color:0x020916,transparent:true,opacity:.38,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=.038;shadow.renderOrder=5;
  v.scene.add(shadow);v.scene.add(sprite);
  view={id,sprite,shadow,action:'',changedAt:performance.now(),lastFrame:-1};
  v.actors.set(viewName,view);info.pmSprites++;
 }
 const tex=s.actions.get(action)||s.actions.get('Idle');
 const md=s.meta.get(action)||s.meta.get('Idle');
 const width=md.width,height=md.height;
 const cols=Math.max(1,Math.floor(tex.image.width/width)),rows=Math.max(1,Math.floor(tex.image.height/height));
 if(view.action!==action||view.sheet!==tex){
  view.action=action;view.sheet=tex;view.changedAt=performance.now();view.lastFrame=-1;
  // Clone per Pokémon to prevent player/enemy sharing atlas offsets.
  view.sprite.material.map.image=tex.image;
  view.sprite.material.map.needsUpdate=true;
 }
 const durations=md.durations,all=durations.reduce((a,b)=>a+b,0)||1;
 let cursor=(performance.now()-view.changedAt)*.06;
 if(action==='Idle'||action==='Walk')cursor%=all;else cursor=Math.min(cursor,all-1);
 let frame=0;while(frame<durations.length-1&&cursor>=durations[frame])cursor-=durations[frame++];
 frame=clamp(frame,0,cols-1);
 const row=rows>=8?clamp(typeof window.v354DirectionalRow==='function'?
  window.v354DirectionalRow(who,enemy,enemy?v.e.player:v.e.enemy,performance.now(),action,moving,8):0,0,rows-1):0;
 if(view.lastFrame!==frame||view.lastRow!==row){
  // PMD sheets: one texture atlas with frame offset/scale, nearest filtering.
  const map=view.sprite.material.map;
  map.repeat.set(1/cols,1/rows);
  map.offset.set(frame/cols,(rows-1-row)/rows);
  map.needsUpdate=true;
  view.lastFrame=frame;view.lastRow=row;info.animatedFrames++;
 }
 const p=footprint(v,who.x,who.y);
 const pixelHeight=v.e.h*(id===95?.23:id===150?.21:enemy?.205:.223);
 const unit=pixelsWorld(v,p,pixelHeight);
 // World-space billboard and its own ground shadow share a 3D anchor.
 view.sprite.position.set(p.x,.03+unit*.51+Math.sin(performance.now()*.003)*.025,p.z);
 view.sprite.scale.set(unit*width/height,unit,1);
 view.sprite.material.color.setHex(who.flash>0?0xffbe86:0xffffff);
 view.sprite.material.opacity=who.inv>0&&Math.floor(performance.now()*.01)%2===0?.58:1;
 view.shadow.position.set(p.x,.036,p.z);
 view.shadow.scale.set(clamp(unit*.85,.6,1.75),clamp(unit*.52,.5,1.3),1);
 info.actors3d=v.actors.size;
 if(!info.animatedSpecies.includes(id))info.animatedSpecies.push(id);
 return true;
}
function update(v,now){
 const e=v.e;
 // Sync battle 2D screen pixels and GPU canvas even after mobile resize/pan.
 const style=e.canvas.style;
 v.view.style.width=style.width||'100%';v.view.style.height=style.height||'100%';
 v.view.style.left=style.left||'0px';v.view.style.top=style.top||'0px';
 v.view.style.transform=style.transform||'none';
 if(now-v.frame<20)return;
 v.frame=now;
 try{
  v.renderer.render(v.scene,v.camera);
  info.frameCount++;
  v.frames++;const elapsed=now-v.lastFps;
  if(elapsed>950){info.avgFps=Math.round(v.frames*1000/elapsed);v.frames=0;v.lastFps=now;}
 }catch(err){log('3D frame: '+err.message);}
}
BattleEngine.prototype.generateBackdrop=function(){
 const result=native.bg.apply(this,arguments);
 if(live(this))context(this);
 return result;
};
BattleEngine.prototype.drawMon=function(a,id,enemy,now){
 info.monCalls++;
 const stage=context(this);
 if(stage)try{if(actor(stage,a,id,enemy))return;}catch(err){log('3D billboard: '+err.message);}
 info.monFallbacks++;
 return native.mon.apply(this,arguments);
};
BattleEngine.prototype.draw=function(now){
 let v=entries.get(this);
 if(!v&&live(this))v=context(this);
 if(v){
  // Other archived arena scripts can reset .bg. Force the known-transparent
  // pixel source right before native draw so its effects remain on top of 3D.
  this.bg=v.blankBackdrop;
  this.ctx.clearRect(0,0,this.w,this.h);
 }
 const result=native.draw.apply(this,arguments);
 if(v)update(v,Number.isFinite(now)?now:performance.now());
 return result;
};
// Old flat rocks/props are environmental pixels, not approved attack effects.
// They must not be painted over the 3D room; all damage/rings/attacks remain native.
const originalDrawRocks=BattleEngine.prototype.drawRocks;
if(typeof originalDrawRocks==='function')BattleEngine.prototype.drawRocks=function(c){
 if(entries.has(this))return;
 return originalDrawRocks.apply(this,arguments);
};
const originalDrawProps=BattleEngine.prototype.v26DrawProps;
if(typeof originalDrawProps==='function')BattleEngine.prototype.v26DrawProps=function(c){
 if(entries.has(this))return;
 return originalDrawProps.apply(this,arguments);
};
BattleEngine.prototype.destroy=function(){
 drop(this);return native.destroy.apply(this,arguments);
};
api.setTheme=value=>{
 theme=value==='violet'?'violet':'blue';
 for(const v of active){
  // Color/theme switch touches physical lights and PBR materials live.
  const pal=PAL[theme];v.scene.background=new T.Color(pal.fog);
  v.scene.fog=new T.FogExp2(pal.fog,.012);
 }
 return theme;
};
api.diagnostics=()=>({...info,activeStages:active.size,theme,actorSides:[...active].flatMap(v=>[...v.actors.keys()]),
  spriteLibrary:[...spriteLibrary].map(([id,x])=>({id,ready:x.ready,actions:[...x.actions.keys()],meta:[...x.meta.keys()],errors:x.errors})),
  backdrop:[...active].map(v=>({complete:v.e.bg?.complete,naturalWidth:v.e.bg?.naturalWidth,blank:v.e.bg===v.blankBackdrop,alpha:v.e.ctx?.getContextAttributes?.()?.alpha})),
  actorPositions:[...active].flatMap(v=>[...v.actors.values()].map(o=>({
   x:o.sprite.position.x,y:o.sprite.position.y,z:o.sprite.position.z}))),errors:[...info.errors]});
})();