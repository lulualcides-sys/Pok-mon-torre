/* Pokémon Torre V181: actual artist-directed editable LibreSprite flames.
 * Original hand-drawn 16-frame .aseprite exported by LibreSprite CLI.
 * Flamethrower: fast coherent tongues, orange body + yellow flame core.
 * Fire Blast: a compact firebolt -> asymmetric five-arm flaming contact.
 * ONE existing PixiJS WebGL context, no Canvas2D/CSS, no new ticker.
 * Preview only: ?fire181=preview; no unapproved replacement to normal.
 */
(()=>{
'use strict';
const query=new URLSearchParams(location.search);
if(query.get('fire181')!=='preview'||query.get('safe')==='1'||
 !window.PIXI||typeof BattleEngine!=='function'||window.PokemonTorreFireV181?.installed)return;
const P=window.PIXI;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
const now=()=>performance.now();
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const kind=s=>{const n=norm(s);return n==='flamethrower'||n==='lancachamas'?'flamethrower':
 n==='fireblast'||n==='explosaodefogo'?'fireblast':null;};
const BASE='effects/moves/v181-hand-drawn-fire/';
const SPECS={
 flamethrower:{w:144,h:48,ms:1060,frameMs:57},
 fireblast:{w:48,h:40,ms:1270,frameMs:52},
 impact:{w:112,h:112,ms:420,frameMs:26}
};
const stats={version:'181.0',installed:true,approved:false,
 source:'3 editable .aseprite animations, 16 hand-authored frames each, batch-exported by LibreSprite',
 ready:0,starts:{flamethrower:0,fireblast:0},frames:0,
 textureFrames:0,confirmedImpacts:0,suppressedLegacy:0,cleared:0,errors:[],gpuFallbacks:0};
let atlasApp=null,frames=Object.create(null),active=[];
const fail=e=>{stats.errors.push(String(e?.message||e));stats.errors=stats.errors.slice(-5)};
const live=e=>!!(battle?.active&&e?.canvas?.isConnected&&e.player&&e.enemy);
function gpu(e){
 try{const app=window.PokemonTorrePixelFlyingBridge?.labStage?.(e)?.app;
  if(app?.renderer?.gl&&!app.renderer.gl.isContextLost?.())return app;
 }catch(error){fail(error)}
 return null;
}
const sprites=Object.fromEntries(Object.entries(SPECS).map(([name,spec])=>{
 const image=new Image();image.decoding='async';
 const data={image,loaded:false,error:''};
 image.onload=()=>{
  if(image.naturalWidth!==spec.w*8||image.naturalHeight!==spec.h*2){
   data.error='Invalid 16-frame LibreSprite atlas dimensions for '+name;
   fail(data.error);
  }else {data.loaded=true;stats.ready++;}
 };
 image.onerror=()=>{data.error='Unavailable V181 sprite '+name;fail(data.error);};
 image.src=BASE+name+'/sheet.png?v=v181-original-hand-art';
 return [name,data];
}));
function sheetFrames(app,name){
 if(app!==atlasApp){
  for(const seq of Object.values(frames))for(const tex of seq)try{tex.destroy();}catch(_){}
  atlasApp=app;frames=Object.create(null);stats.textureFrames=0;
 }
 if(frames[name])return frames[name];
 const spec=SPECS[name],src=sprites[name];
 if(!src?.loaded)return null;
 try{
  const base=P.BaseTexture.from(src.image);
  base.scaleMode=P.SCALE_MODES.NEAREST;
  const result=Array.from({length:16},(_,i)=>new P.Texture(base,
   new P.Rectangle((i%8)*spec.w,Math.floor(i/8)*spec.h,spec.w,spec.h)));
  frames[name]=result;stats.textureFrames+=16;return result;
 }catch(err){fail(err);return null;}
}
function clear(f){
 if(f.done)return;f.done=true;
 try{f.projectile?.destroy();f.burst?.destroy();f.root.destroy({children:true});}catch(err){fail(err);}
 active=active.filter(x=>x!==f);stats.cleared++;
}
const clearEngine=e=>{for(const f of active.slice())if(!e||f.e===e)clear(f);};
function begin(e,name,instantHit){
 if(!live(e))return false;
 const app=gpu(e);
 if(!app){stats.gpuFallbacks++;return false}
 const textures=sheetFrames(app,name);
 if(!textures||!sheetFrames(app,'impact'))return false;
 try{
  clearEngine(e);
  const root=new P.Container();root.interactiveChildren=false;
  const projectile=new P.Sprite(textures[0]);projectile.anchor.set(.5);
  root.addChild(projectile);app.stage.addChild(root);
  const item={e,app,name,root,projectile,burst:null,hitAt:instantHit?now():0,used:false,
   started:now(),done:false};
  active.push(item);stats.starts[name]++;
  if(instantHit)stats.confirmedImpacts++;
  return true;
 }catch(err){fail(err);return false}
}
function confirm(f){
 if(!f||f.done||f.hitAt||f.used)return;
 f.hitAt=now();stats.confirmedImpacts++;
}
function alignStream(f){
 const e=f.e,p=e.player,q=e.enemy,h=e.h||420;
 const sign=q.x>=p.x?1:-1,ax=p.x+sign*16,ay=p.y-h*.14;
 const bx=q.x-sign*10,by=q.y-h*.13,dx=bx-ax,dy=by-ay;
 f.projectile.position.set((ax+bx)*.5,(ay+by)*.5);
 f.projectile.rotation=Math.atan2(dy,dx);
 f.projectile.width=clamp(Math.hypot(dx,dy),35,(e.w||960)*.70);
 f.projectile.height=clamp(h*.10,31,52);
}
function alignBolt(f,travel){
 const e=f.e,h=e.h||420,p=e.player,q=e.enemy;
 const a={x:p.x,y:p.y-h*.14},b={x:q.x,y:q.y-h*.13};
 const u=ease(travel),s=f.projectile;
 s.position.set(a.x+(b.x-a.x)*u,a.y+(b.y-a.y)*u);
 s.rotation=Math.atan2(b.y-a.y,b.x-a.x);
 const size=clamp(h*.094,31,49);
 s.width=size*1.2;s.height=size;
}
function animate(e){
 if(!active.length)return;
 const app=gpu(e);
 const time=now();
 for(const f of active.slice()){
  if(f.e!==e)continue;
  if(!live(e)||!f.root.parent||f.app!==app){clear(f);continue;}
  const duration=SPECS[f.name].ms,elapsed=time-f.started,progress=clamp(elapsed/duration,0,1);
  if(progress>=1){clear(f);continue}
  const art=sheetFrames(app,f.name);
  if(!art){clear(f);continue}
  const k=Math.floor(elapsed/SPECS[f.name].frameMs)%16;
  f.projectile.texture=art[k];
  if(f.name==='flamethrower'){
   alignStream(f);
   // 12% quick ignition, 73% uninterrupted stream, 15% taper.
   f.projectile.alpha=ease(progress/.12)*(1-ease((progress-.85)/.15));
  }else{
   const travel=f.hitAt?1:clamp((elapsed-42)/540,0,1);
   alignBolt(f,travel);
   f.projectile.alpha=f.hitAt?0:ease(progress/.09)*(1-ease((progress-.73)/.20));
  }
  if(f.hitAt&&!f.used){
   f.used=true;const frames=sheetFrames(app,'impact');
   if(frames){
    f.burst=new P.Sprite(frames[0]);f.burst.anchor.set(.5);f.root.addChild(f.burst);
    f.burstAt=time;
   }
  }
  if(f.burst){
   const age=time-f.burstAt,ttl=f.name==='fireblast'?415:198,t=clamp(age/ttl,0,1);
   if(t>=1){f.burst.destroy();f.burst=null;}
   else{
    const fxs=sheetFrames(app,'impact'),index=Math.min(15,Math.floor(t*16));
    if(fxs)f.burst.texture=fxs[index];
    const h=e.h||420,size=f.name==='fireblast'?clamp(h*.255,82,139):clamp(h*.076,24,37);
    f.burst.position.set(e.enemy.x,e.enemy.y-h*.13);
    f.burst.width=size;f.burst.height=size;
    f.burst.alpha=ease(t/.10)*(1-ease((t-.77)/.23));
   }
  }
  stats.frames++;
 }
}
const oldPainter=window.PokemonTorreV360Paint;
if(typeof oldPainter==='function')window.PokemonTorreV360Paint=function(ctx,fx,t,e){
 const n=kind(fx?.move?.name||fx?.name);
 if(n&&active.some(f=>f.e===e&&f.name===n&&!f.done)){
  stats.suppressedLegacy++;return true;
 }
 return oldPainter.apply(this,arguments);
};
if(typeof fireSpriteV41!=='undefined'&&typeof fireSpriteV41.paint==='function'){
 const oldFire=fireSpriteV41.paint;
 fireSpriteV41.paint=function(ctx,fx,t,e){
  if(kind(fx?.move?.name||fx?.name)==='fireblast'&&active.some(f=>f.e===e&&f.name==='fireblast'&&!f.done)){
   stats.suppressedLegacy++;return true;
  }
  return oldFire.apply(this,arguments);
 };
}
const oldUse=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(slot){
 if(!live(this)||!Number.isInteger(slot))return oldUse.apply(this,arguments);
 const pokemon=typeof current==='function'?current():null;
 const move=pokemon&&typeof skillSet==='function'?skillSet(pokemon)?.[slot]:null;
 const n=kind(move?.name);
 if(!n)return oldUse.apply(this,arguments);
 const energy=Number(battle.energy),cd=typeof cooldowns==='object'?cooldowns[slot]:null;
 const before=typeof foe==='function'?Number(foe()?.hp):NaN;
 const out=oldUse.apply(this,arguments);
 const ok=out!==false&&live(this)&&(Number(battle.energy)<energy||
  (typeof cooldowns==='object'&&cooldowns[slot]!==cd));
 if(ok){
  const after=typeof foe==='function'?Number(foe()?.hp):NaN;
  begin(this,n,Number.isFinite(before)&&Number.isFinite(after)&&after<before);
 }
 return out;
};
const oldHit=BattleEngine.prototype.hitTarget;
BattleEngine.prototype.hitTarget=function(who,type,power){
 const prior=who==='enemy'&&typeof foe==='function'?Number(foe()?.hp):NaN;
 const result=oldHit.apply(this,arguments);
 const after=who==='enemy'&&typeof foe==='function'?Number(foe()?.hp):NaN;
 if(who==='enemy'&&Number.isFinite(prior)&&Number.isFinite(after)&&after<prior){
  const f=active.find(x=>x.e===this&&!x.done&&!x.hitAt&&!x.used&&
    (!type||norm(type)==='fire')&&now()-x.started<1300);
  if(f)confirm(f);
 }
 return result;
};
const oldDraw=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(t){
 const result=oldDraw.apply(this,arguments);
 try{animate(this)}catch(err){fail(err);clearEngine(this)}
 return result;
};
const oldDestroy=BattleEngine.prototype.destroy;
BattleEngine.prototype.destroy=function(){clearEngine(this);return oldDestroy.apply(this,arguments);};
window.PokemonTorreFireV181=Object.freeze({
 installed:true,approved:false,
 diagnostics:()=>({...stats,active:active.map(x=>x.name),loaded:Object.entries(sprites).filter(([,v])=>v.loaded).map(([k])=>k)})
});
})();
