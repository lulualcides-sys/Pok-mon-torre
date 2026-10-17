/* Pokemon Torre V157 — isolated five-stage integration inside a COPY of the campaign.
 * NOT loaded by index.html. Original saves, approved moves and main game remain unchanged.
 * One existing pixiFX WebGL overlay draws PMD actors and cinematic authored FX.
 */
(() => {
'use strict';
window.PokemonTorreV157Boot={pixi:!!window.PIXI,labFlag:!!window.__V157_LAB,engine:typeof BattleEngine,pixiFX:typeof pixiFX};
if(!window.PIXI||typeof BattleEngine!=='function'||typeof pixiFX==='undefined')return;
const P=window.PIXI, now=()=>performance.now(), clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lab={version:'157-lab',stages:[true,true,true,true,true],active:false,
 actors:0,animatedFrames:0,casts:0,impacts:0,webgl:false,fps:60,quality:'high',
 errors:[],saveNamespace:'__torre_lab_v157__',officialGameUntouched:true};
let owner=null,layer=null,fxLayer=null,actorViews=new Map(),sheetCache=new Map(),casts=[],atlasCache=new Map();
let lastTick=now(),avg=60,focusUntil=0;
const logError=(err)=>{let v=String(err?.message||err);if(!lab.errors.includes(v))lab.errors.push(v);lab.errors=lab.errors.slice(-5);};
const live=e=>!!(e?.canvas?.isConnected&&typeof battle!=='undefined'&&battle?.active);
function stage(e){
 if(!live(e))return null;
 let access=typeof pixiFX.labStage==='function'?pixiFX.labStage(e):null;
 if(!access?.app?.renderer?.gl)return null;
 if(owner!==e||!layer?.parent||!fxLayer?.parent){
  owner=e;actorViews.clear();sheetCache.clear();casts.length=0;
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
 if(id!==150&&id!==151)return;
 const entry=e.assets?.get(id);if(!entry||localRequested.has(id))return;
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
   if(name&&width>0&&height>0&&durations.length)entry.meta[name]={width,height,durations};
  }
 }).catch(logError);
 for(const action of ['Idle','Walk','Attack','Shoot','Hurt','Faint']){
  const img=new Image();img.decoding='async';img.onload=()=>{if(img.naturalWidth)entry.sheets[action]=img;};
  img.src=base+action+'-Anim.png';
 }
}
function sheet(e,id,action){
 localPMD(e,id);
 const entry=e.assets?.get(id),pic=entry?.sheets?.[action],md=entry?.meta?.[action];
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
  const data={directions,durations:md.durations.slice(0,n),width:md.width,height:md.height,rows};
  sheetCache.set(cacheId,data);return data;
 }catch(err){logError(err);return null;}
}
function renderActor(e,actor,id,enemy){
 const access=stage(e);if(!access)return false;
 const side=enemy?'enemy':'player';
 const prev=actorViews.get(side);
 const moving=Math.hypot(actor.x-(prev?.x??actor.x),actor.y-(prev?.y??actor.y))>.4||
  (!enemy&&(Math.hypot(e.input.dx,e.input.dy)>.12||
   [...e.keys].some(k=>['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k))));
 const action=actor.flash>0?'Hurt':e.attackActs[side]>e.time?'Attack':moving?'Walk':'Idle';
 const data=sheet(e,id,action)||sheet(e,id,'Idle');
 if(!data)return false; // no blank Pokemon when the PMD data are unavailable
 const facing=typeof window.v354DirectionalRow==='function'?
  window.v354DirectionalRow(actor,enemy,enemy?e.player:e.enemy,now(),action,moving,8):0;
 const row=data.rows>=8?clamp(facing,0,data.rows-1):0;
 let view=prev;
 if(!view||view.id!==id||!view.container?.parent){
  if(view?.container?.parent)view.container.destroy({children:true});
  const container=new P.Container();
  const silhouettes=Array.from({length:4},()=>{const sp=new P.Sprite();sp.anchor.set(.5,.85);sp.tint=0x080714;container.addChild(sp);return sp});
  const sprite=new P.Sprite();sprite.anchor.set(.5,.85);container.addChild(sprite);
  layer.addChild(container);
  view={id,container,sprite,silhouettes,start:now(),action:'',x:actor.x,y:actor.y};
  actorViews.set(side,view);
 }
 if(view.action!==action){view.action=action;view.start=now();}
 const elapsed=(now()-view.start)/1000;
 const durations=data.durations,all=durations.reduce((s,v)=>s+v,0)||1;
 let cursor=action==='Idle'||action==='Walk'?elapsed*60%all:Math.min(all-1,elapsed*60);
 let i=0;while(i<durations.length-1&&cursor>=durations[i])cursor-=durations[i++];
 const texture=data.directions[row]?.[i]||data.directions[0][0];
 view.sprite.texture=texture;
 const naturalH=data.height,shownH=e.h*(enemy?.10:.108);
 const scale=shownH/naturalH;
 view.container.position.set(actor.x,actor.y+Math.sin(e.time*3.8+(enemy?1.4:0))*(enemy?1.4:.8));
 view.container.scale.set(scale);
 view.sprite.alpha=actor.inv>0&&Math.floor(e.time*20)%2===0?.55:1;
 view.silhouettes.forEach((p,j)=>{
   p.texture=texture;p.alpha=lab.quality==='low'?.7:.98;
   p.position.set(([[-1.2,0],[1.2,0],[0,-1.2],[0,1.2]][j])[0],
       ([[-1.2,0],[1.2,0],[0,-1.2],[0,1.2]][j])[1]);
   p.visible=lab.quality!=='low'||j<2;
 });
 view.container.visible=true;view.x=actor.x;view.y=actor.y;
 lab.actors=actorViews.size;lab.animatedFrames++;
 return true;
}
function atlas(name,w,h,n){
 const key=name;
 if(atlasCache.has(key))return atlasCache.get(key);
 try{
   const bt=P.BaseTexture.from('assets/battle-v156/'+name);
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
 const frames=atlas(impactOnly?'impact-12.png':dark?'shadow-ball-16.png':'psychic-glyph-16.png',
   impactOnly?128:dark?128:160,impactOnly?128:dark?128:160,impactOnly?12:16);
 if(!frames)return false;
 const sprite=new P.Sprite(frames[0]);sprite.anchor.set(.5);
 sprite.position.set(from.x,from.y);
 const sz=impactOnly?Math.min(e.h*.23,115):Math.min(e.h*(dark?.22:.27),130);
 sprite.width=sz;sprite.height=sz;
 sprite.blendMode=dark?P.BLEND_MODES.NORMAL:P.BLEND_MODES.ADD;
 fxLayer.addChild(sprite);
 casts.push({sprite,frames,start:now(),duration:impactOnly?370:620,from,to,impactOnly,kind});
 if(impactOnly)lab.impacts++;else lab.casts++;
 if(casts.length>8){const old=casts.shift();old.sprite.destroy();}
 return true;
}
function frameFX(e,app){
 const t=now(),dt=Math.max(1,t-lastTick);lastTick=t;avg=avg*.93+(1000/dt)*.07;
 lab.fps=Math.round(avg);
 lab.quality=avg<41?'low':avg<53?'medium':'high';
 // Reuse existing Pixi application and ticker. Never add an extra RAF.
 for(let k=casts.length-1;k>=0;k--){
  const fx=casts[k],u=clamp((t-fx.start)/fx.duration,0,1);
  if(u>=1){fx.sprite.destroy();casts.splice(k,1);continue;}
  fx.sprite.texture=fx.frames[Math.min(fx.frames.length-1,Math.floor(u*fx.frames.length))];
  let p=fx.impactOnly?1:1-Math.pow(1-u,2);
  fx.sprite.position.set(fx.from.x+(fx.to.x-fx.from.x)*p,
   fx.from.y+(fx.to.y-fx.from.y)*p-(fx.impactOnly?0:Math.sin(u*Math.PI)*e.h*.07));
  fx.sprite.alpha=fx.kind==='shadow'?.95:1;
  if(!fx.impactOnly){const scale=.85+Math.sin(u*Math.PI)*.34;fx.sprite.scale.set(scale);}
 }
 // Existing game has V98 follow camera, impact shake and approved hit timing.
 // This layer adds brief cinematic zoom to animated sprites only.
 const zoom=t<focusUntil?1.07:1;
 layer.pivot.set(e.w/2,e.h/2);layer.position.set(e.w/2,e.h/2);layer.scale.set(zoom);
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
 // +6% speed only in this sandbox; official gameplay is unchanged.
 return nativeUpdate.call(this,Math.min(.042,dt*1.06),t);
};
const nativeHit=BattleEngine.prototype.hitTarget;
BattleEngine.prototype.hitTarget=function(who,type,power){
 const target=who==='enemy'?this.enemy:this.player;
 const res=nativeHit.apply(this,arguments);
 try{
  if(live(this)){
   focusUntil=now()+115;
   const point={x:target.x,y:target.y-this.h*.12};
   spell(this,type==='ghost'||type==='dark'?'shadow':'psychic',point,point,true);
  }
 }catch(err){logError(err);}
 return res;
};
const nativeMove=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(i){
 try{
  const move=skillSet(current())[i],s=(move?.name||'').toLowerCase();
  if(/shadow ball|bola sombria/.test(s)||/psychic|psíquico|psiquico/.test(s)){
   const kind=/shadow|sombria/.test(s)?'shadow':'psychic';
   spell(this,kind,{x:this.player.x,y:this.player.y-this.h*.15},
    {x:this.enemy.x,y:this.enemy.y-this.h*.14});
  }
 }catch(err){logError(err);}
 return nativeMove.apply(this,arguments);
};
const nativeDestroy=BattleEngine.prototype.destroy;
BattleEngine.prototype.destroy=function(){
 if(owner===this){owner=null;lab.active=false;layer?.destroy({children:true});fxLayer?.destroy({children:true});
  layer=null;fxLayer=null;actorViews.clear();sheetCache.clear();casts.length=0;}
 return nativeDestroy.apply(this,arguments);
};
// Battle-only floating control to inspect the two cinematic attacks without changing saved moves.
const holder=document.createElement('aside');
holder.id='v157-lab-controls';
holder.style.cssText='position:fixed;right:9px;bottom:10px;z-index:9500;background:#0b0c20e8;border:1px solid #816aa5;border-radius:12px;padding:8px;color:#fff;font:11px system-ui;display:none;max-width:214px;box-shadow:0 4px 25px #0008';
holder.innerHTML='<b>LAB V157 · 5 ETAPAS</b><div id="v157-fps" style="opacity:.8;margin:5px 0"></div><div style="display:flex;gap:4px"><button type="button" data-v157="shadow">Shadow Ball</button><button type="button" data-v157="psychic">Psychic</button></div><small>Prévia visual: não altera HP nem golpes equipados</small>';
holder.querySelectorAll('button').forEach(b=>{
 b.style.cssText='border-radius:6px;background:#463069;color:white;border:1px solid #9076bc;padding:6px;font:11px system-ui';
 b.addEventListener('click',()=>{
  if(!owner||!live(owner))return;
  spell(owner,b.dataset.v157,{x:owner.player.x,y:owner.player.y-owner.h*.15},
   {x:owner.enemy.x,y:owner.enemy.y-owner.h*.12});
 });
});
document.body.appendChild(holder);
setInterval(()=>{
 const active=!!(owner&&live(owner));
 holder.style.display=active?'block':'none';
 if(active)document.getElementById('v157-fps').textContent=lab.fps+' FPS · GPU '+(lab.webgl?'ativa':'indisponível')+' · '+lab.quality;
},750);
window.PokemonTorreV157Lab=Object.freeze({diagnostics:()=>({...lab,errors:[...lab.errors]})});
})();
