/* Pokemon Torre V184 — FOUR ORIGINAL fire moves: Flame Wheel, Inferno, Ember, Eruption.
 * Sprite animation: independent LibreSprite sheets, 8/12/16 actual pixel frames.
 * Opt-in ?fire184=preview only, shared PixiJS/WebGL, no Canvas2D or game-rule changes.
 */
(()=>{'use strict';
const qs=new URLSearchParams(location.search);
if(qs.get('fire184')!=='preview'||qs.get('safe')==='1'||!window.PIXI||
 typeof BattleEngine!=='function'||window.PokemonTorreFireFourV184?.installed)return;
const P=window.PIXI,now=()=>performance.now(),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .toLowerCase().replace(/[^a-z0-9]/g,'');
const MAP=Object.freeze({'flamewheel':'flame-wheel','rodadefogo':'flame-wheel',
 'inferno':'inferno','ember':'ember','brasa':'ember',
 'eruption':'eruption','erupcao':'eruption'});
const kind=s=>MAP[normalize(s)]||null;
const ROOT='effects/moves/v184-fire-four/';
const SPECS={
 'flame-wheel':{count:12,frameMs:72,duration:920,size:.335,behavior:'contact'},
 'inferno':{count:16,frameMs:66,duration:1190,size:.39,behavior:'target'},
 'ember':{count:8,frameMs:66,duration:570,size:.29,behavior:'projectile'},
 'eruption':{count:16,frameMs:75,duration:1320,size:.51,behavior:'target'}
};
const report={version:'184.1',installed:true,approved:false,readiness:{},starts:{},
 confirmedImpacts:0,activeSprites:0,textureFrames:0,draws:0,blocked:0,
 suppressedLegacy:0,fallbacks:0,errors:[]};
const resources=Object.fromEntries(Object.entries(SPECS).map(([name,spec])=>{
 const image=new Image();image.decoding='async';
 const obj={image,ready:false,base:null,app:null,frames:null};
 image.onload=()=>{
  obj.ready=image.naturalWidth===768&&image.naturalHeight===128*Math.ceil(spec.count/4);
  report.readiness[name]=obj.ready;
  if(!obj.ready)report.errors.push('Bad PNG dimensions: '+name);
 };
 image.onerror=()=>{report.readiness[name]=false;report.errors.push('PNG missing: '+name)};
 image.src=ROOT+name+'/sheet.png?build=v184-1-stage-fire';
 return [name,obj];
}));
const active=[];
const error=e=>{report.errors.push(String(e?.message||e));report.errors=report.errors.slice(-8)};
const live=e=>!!(typeof battle==='object'&&battle?.active&&e?.canvas?.isConnected&&e.player&&e.enemy);
function gpu(e){
 try{
  const app=window.PokemonTorrePixelFlyingBridge?.labStage?.(e)?.app;
  return app?.renderer?.gl&&!app.renderer.gl.isContextLost?.()?app:null;
 }catch(err){error(err);return null}
}
function frames(app,name){
 const spec=SPECS[name],r=resources[name];
 if(!r.ready)return null;
 if(app===r.app&&r.frames?.length===spec.count)return r.frames;
 try{
  if(r.frames)for(const t of r.frames)try{t.destroy()}catch(_){}
  r.base=P.BaseTexture.from(r.image);r.base.scaleMode=P.SCALE_MODES.NEAREST;
  r.frames=Array.from({length:spec.count},(_,i)=>new P.Texture(r.base,
   new P.Rectangle((i%4)*192,Math.floor(i/4)*128,192,128)));
  r.app=app;report.textureFrames+=spec.count;return r.frames;
 }catch(err){error(err);return null}
}
function dispose(item){
 if(item.dead)return;item.dead=true;
 try{item.emitter?.destroy();item.root.destroy({children:true})}catch(err){error(err)}
 const ix=active.indexOf(item);if(ix>=0)active.splice(ix,1);
 report.activeSprites=active.length;
}
function begin(e,name,instantHit=false,nativeFx=null){
 if(!live(e))return false;
 const app=gpu(e),art=app&&frames(app,name);
 if(!art){report.fallbacks++;return false}
 try{
  for(const f of active.slice())if(f.e===e&&f.name===name)dispose(f);
  while(active.length>=6)dispose(active[0]);
  const root=new P.Container();root.interactiveChildren=false;
  const sprite=new P.Sprite(art[0]);sprite.anchor.set(.5,.5);
  root.addChild(sprite);app.stage.addChild(root);
  const t=now();
  const sprites=[sprite];
  if(name==='ember')for(let i=1;i<3;i++){
   const extra=new P.Sprite(art[0]);extra.anchor.set(.5,.5);root.addChild(extra);sprites.push(extra);
  }
  const item={e,name,app,root,sprite,sprites,nativeFx,battleRef:battle,
   owner:typeof current==='function'?current():null,target:typeof foe==='function'?foe():null,
   origin:{x:e.player.x,y:e.player.y},created:t,lastDraw:t,hitAt:instantHit?t:0,frame:-1,dead:false};
  if(P.particles?.Emitter)try{
   item.emitter=new P.particles.Emitter(root,{
    lifetime:{min:.12,max:.28},frequency:.06,emitterLifetime:-1,maxParticles:8,
    particlesPerWave:1,pos:{x:0,y:0},addAtBack:true,
    behaviors:[
     {type:'alpha',config:{alpha:{list:[{value:.8,time:0},{value:0,time:1}]}}},
     {type:'scale',config:{scale:{list:[{value:2,time:0},{value:1,time:1}]}}},
     {type:'color',config:{color:{list:[{value:'ffdd83',time:0},{value:'d94514',time:1}]}}},
     {type:'moveSpeed',config:{speed:{list:[{value:30,time:0},{value:8,time:1}]}}},
     {type:'rotationStatic',config:{min:240,max:300}},
     {type:'spawnShape',config:{type:'point',data:{x:0,y:0}}},
     {type:'textureSingle',config:{texture:P.Texture.WHITE}}
    ]});
  }catch(err){error(err)}
  active.push(item);
  report.starts[name]=(report.starts[name]||0)+1;
  if(instantHit)report.confirmedImpacts++;
  report.activeSprites=active.length;return true;
 }catch(err){error(err);return false}
}
function confirm(e){
 const time=now();
 // V359 increments hits after calling hitTarget. Match only its due native cast.
 const f=active.find(x=>x.e===e&&!x.hitAt&&!x.dead&&time-x.created<1500&&
  (!x.nativeFx||x.nativeFx.end>time&&x.nativeFx.times?.[x.nativeFx.hits]!=null&&
   time>=x.nativeFx.at+x.nativeFx.duration*x.nativeFx.times[x.nativeFx.hits]));
 if(f){f.hitAt=time;report.confirmedImpacts++}
}
function draw(e){
 if(!active.length)return;
 const app=gpu(e),time=now();
 for(const f of active.slice()){
  if(f.e!==e)continue;
  if(!live(e)||battle!==f.battleRef||
   (typeof current==='function'&&current()!==f.owner)||
   (typeof foe==='function'&&foe()!==f.target)||
   !app||app!==f.app||!f.root.parent){dispose(f);continue}
  const spec=SPECS[f.name],age=time-f.created,hitAge=f.hitAt?time-f.hitAt:0;
  const impactStart=f.name==='ember'?4:Math.floor(spec.count*.46);
  const tailDuration=(spec.count-impactStart)*spec.frameMs;
  if(age>spec.duration+tailDuration||(!f.hitAt&&age>=spec.duration)||
    (f.hitAt&&hitAge>=tailDuration)){dispose(f);continue}
  // Loop only preparation/flight until damage; run impact frames in order once.
  const index=f.hitAt?Math.min(spec.count-1,impactStart+Math.floor(hitAge/spec.frameMs)):
   Math.floor(age/spec.frameMs)%impactStart;
  f.frame=index;
  const art=frames(app,f.name),p=e.player,q=e.enemy,h=e.h||420,w=e.w||900;
  const sign=q.x>=f.origin.x?1:-1;
  const bx=f.origin.x+sign*Math.min(18,h*.037),by=f.origin.y-h*.14;
  const tx=q.x,ty=q.y-h*.14;
  let x,y;
  for(let i=0;i<f.sprites.length;i++){
   const sprite=f.sprites[i],delay=i*45,localAge=age-delay;
   sprite.visible=localAge>=0;
   const progress=clamp(localAge/(spec.duration*.66),0,1);
   sprite.texture=art[index];
   if(spec.behavior==='contact'){
    // Follow the native actor; never invent a second charge trajectory.
    x=p.x;y=p.y-h*.14;
    sprite.rotation=0;
    sprite.width=clamp(h*spec.size,95,157);
   }else if(spec.behavior==='projectile'){
    const u=f.hitAt?1:ease(progress);
    x=bx+(tx-bx)*u;y=by+(ty-by)*u+(i-1)*h*.018;
    sprite.rotation=Math.atan2(ty-by,tx-bx);
    sprite.width=clamp(h*spec.size,79,136)*(i===0?1:.76);
   }else{
    x=tx;y=(q.y+h*.035+ty)*.5;sprite.rotation=0;
    sprite.width=clamp(h*spec.size,f.name==='eruption'?180:130,w*.27);
   }
   sprite.position.set(Math.round(x),Math.round(y));sprite.height=sprite.width*128/192;
   sprite.alpha=f.hitAt?1-ease(hitAge/tailDuration):
    ease(clamp(localAge/80,0,1))*(1-ease(clamp((age-spec.duration*.8)/(spec.duration*.2),0,1)));
  }
  if(f.emitter){
   f.emitter.emit=!f.hitAt&&age<spec.duration*.8;
   f.emitter.updateOwnerPos(x,y);f.emitter.update(Math.min(.05,(time-f.lastDraw)/1000));
  }
  f.lastDraw=time;report.draws++;
 }
 // Render in the existing battle draw, after the shared layer updates. No extra ticker/context.
 if(active.some(f=>f.e===e)&&app?.renderer?.render){
  if(app.view?.style)app.view.style.display='block';app.renderer.render(app.stage);
 }
}
function shouldHide(e,fx){
 const name=kind(fx?.move?.name||fx?.name);
 return name&&active.some(f=>f.e===e&&!f.dead&&f.name===name&&(!f.nativeFx||f.nativeFx===fx));
}
const oldPaint=window.PokemonTorreV360Paint;
if(typeof oldPaint==='function')window.PokemonTorreV360Paint=function(ctx,fx,time,e){
 if(shouldHide(e,fx)){report.suppressedLegacy++;return true}
 return oldPaint.apply(this,arguments);
};
if(typeof fireSpriteV41!=='undefined'&&typeof fireSpriteV41.paint==='function'){
 const oldFire=fireSpriteV41.paint;
 fireSpriteV41.paint=function(ctx,fx,time,e){
  if(shouldHide(e,fx)){report.suppressedLegacy++;return true}
  return oldFire.apply(this,arguments);
 };
}
const oldUse=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(slot){
 if(!live(this)||!Number.isInteger(slot))return oldUse.apply(this,arguments);
 const mon=typeof current==='function'?current():null;
 const move=mon&&typeof skillSet==='function'?skillSet(mon)?.[slot]:null;
 const name=kind(move?.name);
 if(!name)return oldUse.apply(this,arguments);
 const before=Number(battle.energy),cd=typeof cooldowns==='object'?cooldowns[slot]:null;
 const hp=typeof foe==='function'?Number(foe()?.hp):NaN;
 const out=oldUse.apply(this,arguments);
 const success=out!==false&&(Number(battle.energy)<before||
  typeof cooldowns==='object'&&cooldowns[slot]!==cd);
 if(success){
  const after=typeof foe==='function'?Number(foe()?.hp):NaN;
  const nativeFx=(this.v359Attacks||[]).slice().reverse().find(f=>kind(f.move?.name)===name&&f.battle===battle);
  begin(this,name,Number.isFinite(hp)&&Number.isFinite(after)&&after<hp,nativeFx);
 }else report.blocked++;
 return out;
};
const oldHit=BattleEngine.prototype.hitTarget;
BattleEngine.prototype.hitTarget=function(who,type,power){
 const before=who==='enemy'&&typeof foe==='function'?Number(foe()?.hp):NaN;
 const out=oldHit.apply(this,arguments);
 const after=who==='enemy'&&typeof foe==='function'?Number(foe()?.hp):NaN;
 if(who==='enemy'&&(!type||normalize(type)==='fire')&&Number.isFinite(before)&&after<before)confirm(this);
 return out;
};
const oldDraw=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(t){
 const out=oldDraw.apply(this,arguments);
 try{draw(this)}catch(err){error(err);for(const f of active.slice())if(f.e===this)dispose(f)}
 return out;
};
const oldDestroy=BattleEngine.prototype.destroy;
BattleEngine.prototype.destroy=function(){
 for(const f of active.slice())if(f.e===this)dispose(f);
 return oldDestroy.apply(this,arguments);
};
window.PokemonTorreFireFourV184=Object.freeze({installed:true,approved:false,
 diagnostics:()=>({...report,active:active.map(f=>({name:f.name,frame:f.frame,hit:!!f.hitAt}))})});
})();
