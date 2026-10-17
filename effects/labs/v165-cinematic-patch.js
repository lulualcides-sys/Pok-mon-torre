/* Pokemon Torre V157 — isolated five-stage integration inside a COPY of the campaign.
 * NOT loaded by index.html. Original saves, approved moves and main game remain unchanged.
 * One existing pixiFX WebGL overlay draws PMD actors and cinematic authored FX.
 */
(() => {
'use strict';
window.PokemonTorreV165Boot={pixi:!!window.PIXI,labFlag:!!window.__V165_LAB,engine:typeof BattleEngine,bridge:!!window.PokemonTorrePixelFlyingBridge,stageAPI:typeof window.PokemonTorrePixelFlyingBridge?.labStage};
if(!window.PIXI||typeof BattleEngine!=='function'||typeof window.PokemonTorrePixelFlyingBridge?.labStage!=='function')return;
const P=window.PIXI, now=()=>performance.now(), clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lab={version:'165-cinematic-fidelity',stages:[true,true,true,true,true],active:false,artRevision:'v165-authored-frame-sequences',
 duplicateActors:0,stableSizeChecks:0,arenaTheme:'blue',cameraPan:0,fxSuppressedNative:0,
 actors:0,animatedFrames:0,casts:0,impacts:0,webgl:false,fps:60,quality:'high',
 animatedSpecies:new Set(),attackActions:0,hitFrameHints:0,projectileHitSyncs:0,fxTrails:0,errors:[],saveNamespace:'__torre_lab_v165__',officialGameUntouched:true};
let owner=null,layer=null,fxLayer=null,actorViews=new Map(),sheetCache=new Map(),casts=[],trail=[],atlasCache=new Map();
let lastTick=now(),avg=60,focusUntil=0,frameNum=0,lastHudAt=0;
const LOCAL_IDS=new Set([1,4,7,25,74,95,150,151]);
const localEntries=new Map(),attackPhases=new Map();
function entryFor(e,id){
 // Cache PMD actions per species across successive trainers/battles.
 // A new BattleEngine must not lose assets because a global request flag is set.
 if(!localEntries.has(id)){
  const existing=e.assets?.get(id);
  const entry=existing||{meta:{},sheets:{}};
  entry.meta ||= {};entry.sheets ||= {};
  localEntries.set(id,entry);
 }
 return localEntries.get(id);
}
const logError=(err)=>{let v=String(err?.message||err);if(!lab.errors.includes(v))lab.errors.push(v);lab.errors=lab.errors.slice(-5);};
const live=e=>!!(e?.canvas?.isConnected&&typeof battle!=='undefined'&&battle?.active);
function stage(e){
 if(!live(e))return null;
 let access=window.PokemonTorrePixelFlyingBridge?.labStage?.(e);
 if(!access?.app?.renderer?.gl)return null;
 if(owner!==e||!layer?.parent||!fxLayer?.parent){
  owner=e;actorViews.clear();sheetCache.clear();casts.length=0;trail.length=0;attackPhases.clear();
  layer=new P.Container();fxLayer=new P.Container();
  access.app.stage.addChild(layer);access.app.stage.addChild(fxLayer);
 }
 lab.webgl=true;lab.active=true;
 access.position?.();
 access.app.view.style.display='block';
 return access.app;
}
// PMD pilot species are shipped LOCALLY by the deploy workflow: no failed CDN
// roundtrip can turn the lab's initial Mew/Mewtwo animation invisible.
const localRequested=new Set();
function localPMD(e,id){
 if(!LOCAL_IDS.has(id))return;
 const entry=entryFor(e,id);if(localRequested.has(id))return;
 localRequested.add(id);
 const base='assets/pmd-spritecollab/'+String(id).padStart(4,'0')+'/';
 fetch(base+'AnimData.xml',{cache:'force-cache'}).then(r=>{
  if(!r.ok)throw Error('V157 PMD XML '+r.status);
  return r.text();
 }).then(xml=>{
  const doc=new DOMParser().parseFromString(xml,'application/xml');
  for(const a of doc.querySelectorAll('Anim')){
   const name=a.querySelector('Name')?.textContent?.trim();
   const width=Number(a.querySelector('FrameWidth')?.textContent),height=Number(a.querySelector('FrameHeight')?.textContent);
   const durations=[...a.querySelectorAll('Durations > Duration')].map(x=>Number(x.textContent)).filter(x=>x>0);
   if(name&&width>0&&height>0&&durations.length){
    const raw=a.querySelector('HitFrame')?.textContent;
    entry.meta[name]={width,height,durations,hitFrame:raw==null?null:Number(raw)};
    if(raw!=null)lab.hitFrameHints++;
   }
  }
 }).catch(logError);
 for(const action of ['Idle','Walk','Attack','Shoot','Hurt','Faint']){
  const img=new Image();img.decoding='async';img.onload=()=>{if(img.naturalWidth)entry.sheets[action]=img;};
  img.src=base+action+'-Anim.png';
 }
}
function sheet(e,id,action){
 localPMD(e,id);
 const entry=entryFor(e,id),pic=entry?.sheets?.[action],md=entry?.meta?.[action];
 if(!pic?.complete||!pic.naturalWidth||!md?.width||!md?.height)return null;
 const cacheId=id+':'+action+':'+pic.naturalWidth;
 if(sheetCache.has(cacheId))return sheetCache.get(cacheId);
 try{
  const bt=P.BaseTexture.from(pic);
  bt.scaleMode=P.SCALE_MODES.NEAREST;
  const cols=Math.floor(pic.naturalWidth/md.width),rows=Math.floor(pic.naturalHeight/md.height);
  if(!cols||!rows)return null;
  const n=Math.min(cols,md.durations.length);
  const directions=Array.from({length:rows},(_,r)=>Array.from({length:n},(_,i)=>new P.Texture(bt,
    new P.Rectangle(i*md.width,r*md.height,md.width,md.height))));
  const data={directions,durations:md.durations.slice(0,n),width:md.width,height:md.height,rows,hitFrame:md.hitFrame};
  sheetCache.set(cacheId,data);return data;
 }catch(err){logError(err);return null;}
}
function renderActor(e,actor,id,enemy){
 if(!LOCAL_IDS.has(id))return false;
 const access=stage(e);if(!access)return false;
 const side=enemy?'enemy':'player';
 const prev=actorViews.get(side);
 const moving=Math.hypot(actor.x-(prev?.x??actor.x),actor.y-(prev?.y??actor.y))>.4||
  (!enemy&&(Math.hypot(e.input.dx,e.input.dy)>.12||
   [...e.keys].some(k=>['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k))));
 const phase=attackPhases.get(side);
 const attack=phase&&phase.until>now()?phase.action:(e.attackActs?.[side]>e.time?'Attack':null);
 let action=actor.flash>0?'Hurt':attack||(moving?'Walk':'Idle');
 let data=sheet(e,id,action);
 if(!data&&action==='Shoot'){action='Attack';data=sheet(e,id,action);}
 if(!data){action='Idle';data=sheet(e,id,'Idle');}
 if(!data)return false; // no blank Pokemon when the PMD data are unavailable
 const facing=typeof window.v354DirectionalRow==='function'?
  window.v354DirectionalRow(actor,enemy,enemy?e.player:e.enemy,now(),action,moving,8):0;
 const row=data.rows>=8?clamp(facing,0,data.rows-1):0;
 let view=prev;
 if(!view||view.id!==id||!view.container?.parent){
  if(view?.container?.parent)view.container.destroy({children:true});
  const container=new P.Container();
  const silhouettes=Array.from({length:8},()=>{const sp=new P.Sprite();sp.anchor.set(.5,.85);sp.tint=0x050309;container.addChild(sp);return sp});
  const sprite=new P.Sprite();sprite.anchor.set(.5,.85);container.addChild(sprite);
  layer.addChild(container);
  view={id,container,sprite,silhouettes,start:now(),action:'',x:actor.x,y:actor.y,baseScale:null,baseSize:0};
  actorViews.set(side,view);
 }
 if(view.action!==action){view.action=action;view.start=now();}
 const elapsed=(now()-view.start)/1000;
 const durations=data.durations,all=durations.reduce((s,v)=>s+v,0)||1;
 let cursor=action==='Idle'||action==='Walk'?elapsed*60%all:Math.min(all-1,elapsed*60);
 let i=0;while(i<durations.length-1&&cursor>=durations[i])cursor-=durations[i++];
 const texture=data.directions[row]?.[i]||data.directions[0][0];
 view.sprite.texture=texture;
 // The V158 shrink BUG: different PMD actions have different frame sizes.
 // Keep pixels-per-world-unit CONSTANT for each Pokemon during all actions.
 // Give Pokemon 65-85% more screen presence without stretching every attack.
 const idle=entryFor(e,id).meta.Idle;
 const baseline=idle?.height||data.height;
 const shownH=e.h*(id===95?.235:id===150?.192:enemy?.170:.185);
 const fixedScale=shownH/baseline;
 if(view.baseScale==null){view.baseScale=fixedScale;view.baseSize=shownH;}
 const scale=view.baseScale;
 lab.stableSizeChecks++;
 view.container.position.set(actor.x,actor.y+Math.sin(e.time*3.8+(enemy?1.4:0))*(enemy?1.4:.8));
 view.container.scale.set(scale);
 view.sprite.alpha=actor.inv>0&&Math.floor(e.time*20)%2===0?.55:1;
 // A single actor sprite with a thin pixel contour, not 8 visible duplicates:
 // four cardinal one-source-pixel offsets only; diagonals disabled.
 const border=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];
 view.silhouettes.forEach((p,j)=>{
   p.texture=texture;p.alpha=1;p.position.set(border[j][0],border[j][1]);
   p.visible=j<4;
 });
 view.container.visible=true;view.x=actor.x;view.y=actor.y;
 lab.actors=actorViews.size;lab.animatedFrames++;lab.animatedSpecies.add(id);
 if(view.lastReportedAction!==action){if(action==='Shoot'||action==='Attack')lab.attackActions++;view.lastReportedAction=action;}
 return true;
}
function atlas(name,w,h,n){
 const key=name;
 if(atlasCache.has(key))return atlasCache.get(key);
 try{
   const bt=P.BaseTexture.from('assets/battle-v165/'+name);
   bt.scaleMode=P.SCALE_MODES.NEAREST;
   if(!bt.valid)return null;
   const frames=Array.from({length:n},(_,i)=>new P.Texture(bt,
     new P.Rectangle((i%4)*w,Math.floor(i/4)*h,w,h)));
   atlasCache.set(key,frames);return frames;
 }catch(err){logError(err);return null;}
}
function spell(e,kind,from,to,impactOnly=false){
 if(!stage(e))return false;
 const dark=kind==='shadow';
 const frames=atlas(impactOnly?'impact-12.png':dark?'shadow-ball-16.png':'psychic-wave-16.png',
   128,128,impactOnly?12:16);
 if(!frames){
  const name=impactOnly?'impact-12.png':dark?'shadow-ball-16.png':'psychic-wave-16.png';
  const base=P.BaseTexture.from('assets/battle-v165/'+name);
  if(!base.valid)base.once('loaded',()=>{if(live(e))spell(e,kind,from,to,impactOnly);});
  return false;
 }
 const sprite=new P.Sprite(frames[0]);sprite.anchor.set(.5);
 sprite.position.set(from.x,from.y);
 // Frames already contain hand-drawn black outlines: no duplicate scaled
 // silhouette under the projectile (the old double rim looked like two hits).
 const rim=null;
 const sz=impactOnly?Math.min(e.h*.21,125):Math.min(e.h*(dark?.255:.29),171);
 sprite.width=sz;sprite.height=sz;
 if(rim){rim.width=sz*1.12;rim.height=sz*1.12;}
 sprite.blendMode=dark?P.BLEND_MODES.NORMAL:P.BLEND_MODES.ADD;
 fxLayer.addChild(sprite);
 casts.push({sprite,rim,frames,start:now(),duration:impactOnly?330:kind==='shadow'?820:860,
  from,to,impactOnly,kind,forcedImpact:false});
 if(impactOnly)lab.impacts++;else lab.casts++;
 if(casts.length>8){const old=casts.shift();old.rim?.destroy();old.sprite.destroy();}
 return true;
}
function frameFX(e,app){
 const t=now(),dt=Math.max(1,t-lastTick);lastTick=t;avg=avg*.93+(1000/dt)*.07;frameNum++;
 lab.fps=Math.round(avg);
 lab.quality=avg<41?'low':avg<53?'medium':'high';
 // Reuse existing Pixi application and ticker. Never add an extra RAF.
 for(let k=casts.length-1;k>=0;k--){
  const fx=casts[k],u=clamp((t-fx.start)/fx.duration,0,1);
  if(u>=1){fx.rim?.destroy();fx.sprite.destroy();casts.splice(k,1);continue;}
  fx.sprite.texture=fx.frames[Math.min(fx.frames.length-1,Math.floor(u*fx.frames.length))];
  let p=fx.impactOnly||fx.forcedImpact?1:(u<.20?(.10*u/.20):.10+.90*(1-Math.pow(1-(u-.20)/.80,2)));
  fx.sprite.position.set(fx.from.x+(fx.to.x-fx.from.x)*p,
   fx.from.y+(fx.to.y-fx.from.y)*p-(fx.impactOnly?0:Math.sin(u*Math.PI)*e.h*.07));
  fx.sprite.alpha=1;
  // V162: no per-frame sprite.scale — changing it after width/height shrank
  // the attack to a few pixels. Texture changes retain stable display dimensions.
  if(!fx.impactOnly){const width=fx.sprite.width,height=fx.sprite.height;
    if(!fx.fixedSize){fx.fixedSize=[width,height];}
    fx.sprite.width=fx.fixedSize[0];fx.sprite.height=fx.fixedSize[1];
  }
  // No duplicated rim sprites: each frame supplies its own pixel outline.
  // Pixel atlas trails, bounded by quality mode. The official move VFX are untouched.
  if(fx.kind==='shadow'&&!fx.impactOnly&&frameNum%10===0&&lab.quality==='high'&&trail.length<9){
   const dot=new P.Sprite(fx.frames[Math.min(15,Math.floor(u*16))]);dot.anchor.set(.5);
   dot.tint=0x291046;dot.position.copyFrom(fx.sprite.position);
   dot.width=10;dot.height=10;dot.alpha=.32;fxLayer.addChild(dot);
   trail.push({sprite:dot,life:220});lab.fxTrails++;
  }
 }
for(let i=trail.length-1;i>=0;i--){
  const p=trail[i];p.life-=dt;p.sprite.alpha=clamp(p.life/220,0,.55);
  if(p.life<=0){p.sprite.destroy();trail.splice(i,1);}
 }
 // Existing game has V98 follow camera, impact shake and approved hit timing.
 // This layer adds brief cinematic zoom to animated sprites only.
 // V161: mirror the actual V98 world-follow camera, not an actor-only zoom
 // (which caused the GPU Pokemon to drift off the native hitbox).
 layer.pivot.set(0,0);layer.position.set(0,0);layer.scale.set(1);
 lab.cameraPan=Number(e._stadiumCameraX||0);
 if(t<focusUntil&&lab.quality==='high')layer.alpha=.93;else layer.alpha=1;
 if(!live(e)){layer.visible=false;fxLayer.visible=false;return;}
 layer.visible=true;fxLayer.visible=true;
 app.view.style.display='block';
}
const nativeMon=BattleEngine.prototype.drawMon;
BattleEngine.prototype.drawMon=function(actor,id,enemy,clock){
 try{if(renderActor(this,actor,id,enemy))return;}catch(err){logError(err);}
 return nativeMon.call(this,actor,id,enemy,clock);
};
const nativeDraw=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(t){
 const result=nativeDraw.apply(this,arguments);
 try{let app=stage(this);if(app)frameFX(this,app);}catch(err){logError(err);}
 return result;
};
const nativeUpdate=BattleEngine.prototype.update;
BattleEngine.prototype.update=function(dt,t){
 // V161: keep native collision and animation timing at the same clock speed.
 return nativeUpdate.call(this,dt,t);
};
const nativeHit=BattleEngine.prototype.hitTarget;
BattleEngine.prototype.hitTarget=function(who,type,power){
 const target=who==='enemy'?this.enemy:this.player;
 const res=nativeHit.apply(this,arguments);
 try{
  if(live(this)){
   focusUntil=now()+115;
   const point={x:target.x,y:target.y-this.h*.12};
   // Real hitTarget is the authoritative damage moment. Align the ghost/psychic
   // image with that impact instead of running a disconnected projectile.
   const wanted=type==='ghost'||type==='dark'?'shadow':'psychic';
   const activeCast=[...casts].reverse().find(c=>!c.impactOnly&&!c.forcedImpact&&c.kind===wanted);
   if(activeCast){activeCast.forcedImpact=true;activeCast.to=point;
      activeCast.start=now()-activeCast.duration*.92;lab.projectileHitSyncs++;}
   // Native V19 impact already exists. A second identical impact made layers
   // look doubled; the experimental projectile alone ends at native hit time.
   if(activeCast)lab.impacts++;
  }
 }catch(err){logError(err);}
 return res;
};
// Replace ONLY original bolt pixels for experimental Shadow Ball/Psychic
// while retaining the actual projectile/collision/damage objects in engine.
const nativeProjectile=BattleEngine.prototype.drawProjectile;
BattleEngine.prototype.drawProjectile=function(projectile){
 if(projectile?._cinematic160)return;
 return nativeProjectile.apply(this,arguments);
};
const nativeMove=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(i){
 const move=skillSet(current())?.[i];
 if(!move)return nativeMove.apply(this,arguments);
 const name=String(move.name||'').toLowerCase();
 const targeted=/shadow ball|bola sombria|psychic|psíquico|psiquico/.test(name);
 const kind=/shadow|sombria/.test(name)?'shadow':'psychic';
 const ranged=/shadow ball|bola sombria|psychic|psíquico|psiquico|raio|beam|pulso|bola|ball/.test(name);
 attackPhases.set('player',{action:ranged?'Shoot':'Attack',until:now()+590});
 // For beams and already-approved special renderers keep original visuals.
 // Only a true "bolt" can replace its native drawn projectile without
 // touching the collision, damage, cooldown, or projectile movement.
 const index=this.projectiles.length;
 const result=nativeMove.apply(this,arguments);
 const added=this.projectiles.slice(index);
 if(targeted&&move.kind==='bolt'&&added.length){
   const ok=spell(this,kind,{x:this.player.x,y:this.player.y-this.h*.15},
     {x:this.enemy.x,y:this.enemy.y-this.h*.14});
   if(ok){added.forEach(p=>{p._cinematic160=true;});lab.fxSuppressedNative+=added.length;}
 }
 return result;
};
const nativeDestroy=BattleEngine.prototype.destroy;
BattleEngine.prototype.destroy=function(){
 if(owner===this){owner=null;lab.active=false;layer?.destroy({children:true});fxLayer?.destroy({children:true});
  layer=null;fxLayer=null;actorViews.clear();sheetCache.clear();casts.length=0;trail.length=0;attackPhases.clear();}
 return nativeDestroy.apply(this,arguments);
};
// Battle-only floating control to inspect the two cinematic attacks without changing saved moves.
const holder=document.createElement('aside');
holder.id='v165-lab-controls';
holder.style.cssText='position:fixed;right:9px;bottom:10px;z-index:9500;background:#0b0c20e8;border:1px solid #816aa5;border-radius:12px;padding:8px;color:#fff;font:11px system-ui;display:none;max-width:214px;box-shadow:0 4px 25px #0008';
holder.innerHTML='<b>V165 · GOLPES + ARENA PIXEL</b><div id="v165-fps" style="opacity:.8;margin:5px 0"></div><div style="display:flex;gap:4px"><button type="button" data-v165="shadow">Shadow Ball</button><button type="button" data-v165="psychic">Psychic</button></div><small>Visual separado: não altera HP ou golpes salvos</small>';
const themeButton=document.createElement('button');
themeButton.type='button';themeButton.textContent='Arena: AZUL';themeButton.id='v165-arena-theme';
themeButton.style.cssText='margin-top:5px;border-radius:6px;background:#243e74;color:white;border:1px solid #688aba;padding:6px;font:11px system-ui';
themeButton.addEventListener('click',()=>{
 const theme=lab.arenaTheme==='blue'?'violet':'blue';
 lab.arenaTheme=theme;
 window.PokemonTorreBlue153?.setTheme?.(theme);
 themeButton.textContent='Arena: '+(theme==='violet'?'ROXA':'AZUL');
});
holder.appendChild(themeButton);
holder.querySelectorAll('[data-v165]').forEach(b=>{
 b.style.cssText='border-radius:6px;background:#463069;color:white;border:1px solid #9076bc;padding:6px;font:11px system-ui';
 b.addEventListener('click',()=>{
  if(!owner||!live(owner))return;
  spell(owner,b.dataset.v165,{x:owner.player.x,y:owner.player.y-owner.h*.15},
   {x:owner.enemy.x,y:owner.enemy.y-owner.h*.12});
 });
});
document.body.appendChild(holder);
// No polling timer or extra render loop: update HUD from the existing battle draw.
const baseDraw=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(t){
 const result=baseDraw.apply(this,arguments);
 if(now()-lastHudAt>700){
  lastHudAt=now();const active=!!(owner&&live(owner));
  holder.style.display=active?'block':'none';
  if(active){const status=document.getElementById('v165-fps');
   if(status)status.textContent=lab.fps+' FPS · GPU '+(lab.webgl?'ativa':'indisponível')+' · '+lab.quality;}
 }
 return result;
};
window.PokemonTorreV165Lab=Object.freeze({diagnostics:()=>({...lab,animatedSpecies:[...lab.animatedSpecies],
 loadedSpecies:[...localRequested],errors:[...lab.errors],
 actorsCurrently:actorViews.size,effectsAlive:casts.length,trailAlive:trail.length,
 arena:window.PokemonTorreBlue153?.diagnostics?.()||null})});
})();
