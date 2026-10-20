/* Pokemon Torre V182: Flamethrower 12-frame pixel-art spritesheet preview.
 * ?fire182=preview only; leaves approved V172 and V181 comparison untouched.
 * PixiJS WebGL only, shared stage; native BattleEngine owns HP, status and cooldown.
 */
(()=>{
'use strict';
const qs=new URLSearchParams(location.search);
if(qs.get('fire182')!=='preview'||qs.get('safe')==='1'||
 !window.PIXI||typeof BattleEngine!=='function'||window.PokemonTorreFireV182?.installed)return;
const P=window.PIXI,clock=()=>performance.now();
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const isFlame=s=>['flamethrower','lancachamas'].includes(norm(s));
const W=192,H=128,COUNT=12,FRAME_MS=83.333;
const info={installed:true,version:'182-preview',approved:false,renderer:'shared PixiJS WebGL',
 sheet:'effects/moves/v182-flamethrower/sheet.png',frameSize:[W,H],frames:COUNT,
 imageReady:false,casts:0,draws:0,confirmedImpacts:0,suppressedLegacy:0,cleared:0,
 gpuFallbacks:0,errors:[],nativeDamageUntouched:true};
let loaded=false,invalid=false,base=null,atlas=null,frames=null,active=null;
const image=new Image();
image.decoding='async';
image.onload=()=>{
 if(image.naturalWidth===W*4&&image.naturalHeight===H*3)loaded=info.imageReady=true;
 else {invalid=true;info.errors.push('Spritesheet must be 768x384');}
};
image.onerror=()=>{invalid=true;info.errors.push('Spritesheet load failed');};
image.src='effects/moves/v182-flamethrower/sheet.png?asset=v182-12f';
const live=e=>!!(typeof battle==='object'&&battle?.active&&e?.canvas?.isConnected&&e.player&&e.enemy);
function gpu(e){
 try{
  const app=window.PokemonTorrePixelFlyingBridge?.labStage?.(e)?.app;
  if(app?.renderer?.gl&&!app.renderer.gl.isContextLost?.())return app;
 }catch(err){info.errors.push(String(err?.message||err));}
 return null;
}
function textures(app){
 if(!loaded||invalid)return null;
 if(atlas===app&&frames?.length===COUNT)return frames;
 try{
  if(active)clear();
  if(frames)for(const t of frames)try{t.destroy();}catch(_){}
  base=P.BaseTexture.from(image);base.scaleMode=P.SCALE_MODES.NEAREST;
  frames=Array.from({length:COUNT},(_,i)=>new P.Texture(base,
   new P.Rectangle((i%4)*W,Math.floor(i/4)*H,W,H)));
  atlas=app;return frames;
 }catch(err){info.errors.push(String(err?.message||err));return null;}
}
function clear(){
 if(!active)return;
 try{active.sprite.destroy();active.root.destroy({children:true});}catch(_){}
 active=null;info.cleared++;
}
function begin(e,alreadyHit){
 if(!live(e)||!loaded){info.gpuFallbacks++;return false;}
 const app=gpu(e);
 if(!app){info.gpuFallbacks++;return false;}
 const tex=textures(app);
 if(!tex)return false;
 try{
  clear();
  const root=new P.Container();root.interactiveChildren=false;
  const sprite=new P.Sprite(tex[0]);sprite.anchor.set(0,.5);
  root.addChild(sprite);app.stage.addChild(root);
  const t=clock();
  active={e,app,root,sprite,start:t,hitAt:alreadyHit?t:0,tailAt:0,frame:-1};
  info.casts++;if(alreadyHit)info.confirmedImpacts++;
  return true;
 }catch(err){info.errors.push(String(err?.message||err));clear();return false;}
}
function confirmed(e){
 if(active?.e!==e||active.hitAt)return;
 active.hitAt=clock();info.confirmedImpacts++;
}
function tick(e){
 const f=active;if(!f)return;
 const app=gpu(e);
 if(!live(e)||f.e!==e||!app||app!==f.app||!f.root.parent){clear();return;}
 const t=clock(),ms=t-f.start;
 // Four onset cells, four looping sustained-flame cells, four fade cells.
 // The loop lasts until native damage is confirmed or a safety timeout expires.
 if(!f.tailAt&&((f.hitAt&&ms>660&&t-f.hitAt>120)||ms>1280)){
  f.tailAt=t;
 }
 let idx;
 if(f.tailAt){
  idx=8+Math.min(3,Math.floor((t-f.tailAt)/FRAME_MS));
  if(t-f.tailAt>=4*FRAME_MS){clear();return;}
 }else if(ms<4*FRAME_MS){
  idx=Math.min(3,Math.floor(ms/FRAME_MS));
 }else{
  idx=4+(Math.floor((ms-4*FRAME_MS)/FRAME_MS)%4);
 }
 if(idx!==f.frame){f.frame=idx;f.sprite.texture=frames[idx];}
 const h=e.h||420,from=e.player,to=e.enemy,dir=to.x>=from.x?1:-1;
 const sx=from.x+dir*Math.min(19,h*.04),sy=from.y-h*.145;
 const ex=to.x-dir*Math.min(14,h*.029),ey=to.y-h*.13;
 f.sprite.position.set(sx,sy);
 f.sprite.rotation=Math.atan2(ey-sy,ex-sx);
 f.sprite.width=clamp(Math.hypot(ex-sx),34,(e.w||960)*.72);
 f.sprite.height=clamp(h*.22,58,102);
 f.sprite.alpha=1;
 info.draws++;
}
const originalPaint=window.PokemonTorreV360Paint;
if(typeof originalPaint==='function')window.PokemonTorreV360Paint=function(g,fx,t,e){
 if(active?.e===e&&isFlame(fx?.move?.name||fx?.name)){
  info.suppressedLegacy++;return true;
 }
 return originalPaint.apply(this,arguments);
};
if(typeof fireSpriteV41!=='undefined'&&typeof fireSpriteV41.paint==='function'){
 const oldFire=fireSpriteV41.paint;
 fireSpriteV41.paint=function(g,fx,t,e){
  if(active?.e===e&&isFlame(fx?.move?.name||fx?.name)){
   info.suppressedLegacy++;return true;
  }
  return oldFire.apply(this,arguments);
 };
}
const oldUse=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(slot){
 if(!live(this)||!Number.isInteger(slot))return oldUse.apply(this,arguments);
 const mon=typeof current==='function'?current():null;
 const move=mon&&typeof skillSet==='function'?skillSet(mon)?.[slot]:null;
 if(!isFlame(move?.name))return oldUse.apply(this,arguments);
 const energy=Number(battle.energy),cd=typeof cooldowns==='object'?cooldowns[slot]:null;
 const before=typeof foe==='function'?Number(foe()?.hp):NaN;
 const result=oldUse.apply(this,arguments);
 const spent=Number(battle.energy)<energy||(typeof cooldowns==='object'&&cooldowns[slot]!==cd);
 const after=typeof foe==='function'?Number(foe()?.hp):NaN;
 if(result!==false&&spent)begin(this,Number.isFinite(before)&&Number.isFinite(after)&&after<before);
 return result;
};
const oldHit=BattleEngine.prototype.hitTarget;
BattleEngine.prototype.hitTarget=function(who,type,power){
 const before=who==='enemy'&&typeof foe==='function'?Number(foe()?.hp):NaN;
 const result=oldHit.apply(this,arguments);
 const after=who==='enemy'&&typeof foe==='function'?Number(foe()?.hp):NaN;
 if(who==='enemy'&&(!type||norm(type)==='fire')&&Number.isFinite(before)&&after<before)confirmed(this);
 return result;
};
const oldDraw=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(){
 const result=oldDraw.apply(this,arguments);
 try{tick(this);}catch(err){info.errors.push(String(err?.message||err));clear();}
 return result;
};
const oldDestroy=BattleEngine.prototype.destroy;
BattleEngine.prototype.destroy=function(){if(active?.e===this)clear();return oldDestroy.apply(this,arguments);};
window.PokemonTorreFireV182=Object.freeze({
 installed:true,approved:false,
 diagnostics:()=>({...info,active:active?{frame:active.frame,hit:!!active.hitAt,tail:!!active.tailAt}:null})
});
})();