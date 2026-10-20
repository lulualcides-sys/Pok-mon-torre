/* Pokemon Torre V183 — Fire Blast daimonji (大), 16 RGBA pixel-art frames.
 * Independent opt-in battle preview, PixiJS/WebGL only, approved V172 unchanged.
 * The engine owns HP, accuracy, cooldown and burn, never this visual renderer.
 */
(()=>{'use strict';
const query=new URLSearchParams(location.search);
if(query.get('fire183')!=='preview'||query.get('safe')==='1'||
 !window.PIXI||typeof BattleEngine!=='function'||window.PokemonTorreFireBlastV183?.installed)return;
const P=window.PIXI,now=()=>performance.now(),clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const isBlast=s=>['fireblast','explosaodefogo','rajadadefogo'].includes(norm(s));
const W=192,H=128,FRAMES=16;
const info={installed:true,approved:false,version:'183-daimonji',sprite:'v183-daimonji/sheet.png',
 frameSize:[W,H],frameCount:FRAMES,ready:false,casts:0,confirmedHits:0,framesRendered:0,
 legacySuppressed:0,gpuFallbacks:0,removed:0,errors:[]};
const img=new Image();img.decoding='async';
let ready=false,textureApp=null,tex=[],active=null;
img.onload=()=>{ready=info.ready=(img.naturalWidth===W*4&&img.naturalHeight===H*4);
 if(!ready)info.errors.push('Fire Blast sheet must be 768x512 RGBA')};
img.onerror=()=>{ready=false;info.errors.push('Fire Blast spritesheet unavailable')};
img.src='effects/moves/v183-daimonji/sheet.png?v183-daimonji-original';
const live=e=>!!(typeof battle==='object'&&battle?.active&&e?.canvas?.isConnected&&e.player&&e.enemy);
function gpu(e){
 try{const app=window.PokemonTorrePixelFlyingBridge?.labStage?.(e)?.app;
  return app?.renderer?.gl&&!app.renderer.gl.isContextLost?.()?app:null;
 }catch(err){info.errors.push(String(err?.message||err));return null}
}
function cleanup(){if(!active)return;
 try{active.sprite.destroy();active.root.destroy({children:true})}catch(err){info.errors.push(String(err?.message||err))}
 active=null;info.removed++;
}
function textures(app){
 if(!ready)return null;
 if(app===textureApp&&tex.length===FRAMES)return tex;
 try{
  cleanup();for(const t of tex)try{t.destroy()}catch(_){}
  const base=P.BaseTexture.from(img);base.scaleMode=P.SCALE_MODES.NEAREST;
  tex=Array.from({length:FRAMES},(_,i)=>new P.Texture(base,
   new P.Rectangle((i%4)*W,Math.floor(i/4)*H,W,H)));
  textureApp=app;return tex;
 }catch(err){info.errors.push(String(err?.message||err));return null}
}
function begin(e,alreadyHit=false){
 const app=gpu(e);if(!live(e)||!app||!textures(app)){info.gpuFallbacks++;return false}
 try{
  cleanup();const root=new P.Container();root.interactiveChildren=false;
  const sprite=new P.Sprite(tex[0]);sprite.anchor.set(.5,.5);
  root.addChild(sprite);app.stage.addChild(root);
  active={e,app,root,sprite,start:now(),hitAt:alreadyHit?now():0,drawn:-1};
  info.casts++;if(alreadyHit)info.confirmedHits++;return true;
 }catch(err){info.errors.push(String(err?.message||err));cleanup();return false}
}
function confirm(e){if(active?.e!==e||active.hitAt)return;
 active.hitAt=now();info.confirmedHits++;
}
function draw(e){const a=active;if(!a||a.e!==e)return;
 const app=gpu(e);
 if(!live(e)||!app||app!==a.app||!a.root.parent){cleanup();return}
 const elapsed=now()-a.start,h=e.h||420,p=e.player,t=e.enemy;
 let frame;
 if(a.hitAt){
  const age=Math.max(0,now()-a.hitAt);
  frame=4+Math.min(11,Math.floor(age/70));
  if(age>=12*70){cleanup();return}
  a.sprite.position.set(t.x,t.y-h*.13);
  const box=clamp(h*.37,112,158);
  a.sprite.width=box;a.sprite.height=box*128/192;
 }else{
  if(elapsed>850){cleanup();return}
  frame=Math.min(3,Math.floor(elapsed/85));
  const dist=ease(Math.min(1,elapsed/330));
  const sx=p.x,sy=p.y-h*.14,tx=t.x,ty=t.y-h*.13;
  a.sprite.position.set(sx+(tx-sx)*dist,sy+(ty-sy)*dist);
  a.sprite.width=clamp(h*.32,105,143);a.sprite.height=a.sprite.width*128/192;
  a.sprite.alpha=1-ease((elapsed-650)/200);
 }
 if(frame!==a.drawn){a.drawn=frame;a.sprite.texture=tex[frame]}
 info.framesRendered++;
}
const oldPainter=window.PokemonTorreV360Paint;
if(typeof oldPainter==='function')window.PokemonTorreV360Paint=function(g,fx,t,e){
 if(active?.e===e&&isBlast(fx?.move?.name||fx?.name)){
  info.legacySuppressed++;return true;
 }return oldPainter.apply(this,arguments);
};
if(typeof fireSpriteV41!=='undefined'&&typeof fireSpriteV41.paint==='function'){
 const oldFire=fireSpriteV41.paint;
 fireSpriteV41.paint=function(g,fx,t,e){
  if(active?.e===e&&isBlast(fx?.move?.name||fx?.name)){
   info.legacySuppressed++;return true;
  }return oldFire.apply(this,arguments);
 };
}
const previousUse=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(slot){
 if(!live(this)||!Number.isInteger(slot))return previousUse.apply(this,arguments);
 const poke=typeof current==='function'?current():null;
 const move=poke&&typeof skillSet==='function'?skillSet(poke)?.[slot]:null;
 if(!isBlast(move?.name))return previousUse.apply(this,arguments);
 const energy=Number(battle.energy),cd=typeof cooldowns==='object'?cooldowns[slot]:null;
 const before=typeof foe==='function'?Number(foe()?.hp):NaN;
 const result=previousUse.apply(this,arguments);
 const spent=Number(battle.energy)<energy||typeof cooldowns==='object'&&cooldowns[slot]!==cd;
 if(result!==false&&spent){
  const after=typeof foe==='function'?Number(foe()?.hp):NaN;
  begin(this,Number.isFinite(before)&&Number.isFinite(after)&&after<before);
 }return result;
};
const previousHit=BattleEngine.prototype.hitTarget;
BattleEngine.prototype.hitTarget=function(who,type,power){
 const before=who==='enemy'&&typeof foe==='function'?Number(foe()?.hp):NaN;
 const result=previousHit.apply(this,arguments);
 const after=who==='enemy'&&typeof foe==='function'?Number(foe()?.hp):NaN;
 if(who==='enemy'&&(!type||norm(type)==='fire')&&Number.isFinite(before)&&after<before)confirm(this);
 return result;
};
const previousDraw=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(){const result=previousDraw.apply(this,arguments);
 try{draw(this)}catch(err){info.errors.push(String(err?.message||err));cleanup()}
 return result;
};
const previousDestroy=BattleEngine.prototype.destroy;
BattleEngine.prototype.destroy=function(){if(active?.e===this)cleanup();return previousDestroy.apply(this,arguments)};
window.PokemonTorreFireBlastV183=Object.freeze({installed:true,approved:false,
 diagnostics:()=>({...info,active:active?{frame:active.drawn,hit:!!active.hitAt}:null})});
})();
