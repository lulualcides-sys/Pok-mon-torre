/* Pokémon Torre V185 — REA-informed fire-move preview in the REAL battle.
 * V172 Flamethrower and V183 Fire Blast remain untouched and APPROVED.
 * This feature is opt-in (?fire185=preview), and draws with the SAME Pixi/WebGL
 * context already owned by the game. No Canvas2D, static image effects or CSS VFX.
 * Frames come from original LibreSprite art in this repo (v181, v183).
 * Compared with older experiments, this version layers moving flame cells rather
 * than stretching a single flame over the whole arena. Fire Blast uses its actual
 * daimonji (大) art and a separate contact burst. Native HP logic stays authoritative.
 */
(()=>{'use strict';
const query=new URLSearchParams(location.search);
if(query.get('fire185')!=='preview'||query.get('safe')==='1'||
 typeof BattleEngine!=='function'||!window.PIXI||window.PokemonTorreReaFireV185?.installed)return;
const P=window.PIXI,now=()=>performance.now();
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const smooth=v=>{v=clamp(v,0,1);return v*v*(3-2*v);};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .toLowerCase().replace(/[^a-z0-9]/g,'');
const kind=s=>{
 const n=norm(s);
 if(n==='flamethrower'||n==='lancachamas')return 'flamethrower';
 if(n==='fireblast'||n==='explosaodefogo'||n==='rajadadefogo')return 'fireblast';
 return null;
};
const SOURCES={
 stream:{url:'effects/moves/v181-hand-drawn-fire/flamethrower/sheet.png',
  frameW:144,frameH:48,columns:8,count:16},
 ember:{url:'effects/moves/v181-hand-drawn-fire/impact/sheet.png',
  frameW:112,frameH:112,columns:8,count:16},
 daimonji:{url:'effects/moves/v183-daimonji/sheet.png',
  frameW:192,frameH:128,columns:4,count:16}
};
const report={installed:true,approved:false,version:'185.0-rea-fire-review',
 renderer:'shared PixiJS WebGL; author-owned 16-frame LibreSprite atlases',
 loaded:{},casts:{flamethrower:0,fireblast:0},frames:0,textureFrames:0,
 confirmedImpacts:0,misses:0,legacySuppressed:0,blocked:0,previewCasts:0,
 errors:[],maxObjects:16,nativeDamageUntouched:true};
const imageCache=Object.create(null),cache=Object.create(null),active=[];
for(const [key,s] of Object.entries(SOURCES)){
 const image=new Image();image.decoding='async';
 const r={image,ok:false,frames:null,app:null,base:null};
 image.onload=()=>{
  r.ok=image.naturalWidth===s.frameW*s.columns&&
   image.naturalHeight===s.frameH*Math.ceil(s.count/s.columns);
  report.loaded[key]=r.ok;
  if(!r.ok)fail('Sprite dimensions invalid: '+key);
 };
 image.onerror=()=>{report.loaded[key]=false;fail('Sprite not found: '+key)};
 image.src=s.url+'?build=v185-rea-pixel';
 imageCache[key]=r;
}
function fail(error){
 report.errors.push(String(error?.message||error).slice(0,230));
 report.errors=report.errors.slice(-7);
}
function live(e){
 return !!(typeof battle==='object'&&battle?.active&&e?.canvas?.isConnected&&e.player&&e.enemy);
}
function gpu(e){
 try{const app=window.PokemonTorrePixelFlyingBridge?.labStage?.(e)?.app;
  return app?.renderer?.gl&&!app.renderer.gl.isContextLost?.()?app:null;
 }catch(error){fail(error);return null;}
}
function frames(app,key){
 const res=imageCache[key],spec=SOURCES[key];
 if(!res?.ok)return null;
 if(res.app===app&&res.frames?.length===spec.count)return res.frames;
 try{
  if(res.frames)for(const f of res.frames)try{f.destroy()}catch(_){}
  res.base=P.BaseTexture.from(res.image);
  res.base.scaleMode=P.SCALE_MODES.NEAREST;
  const list=Array.from({length:spec.count},(_,i)=>new P.Texture(res.base,
   new P.Rectangle((i%spec.columns)*spec.frameW,Math.floor(i/spec.columns)*spec.frameH,
    spec.frameW,spec.frameH)));
  res.frames=list;res.app=app;report.textureFrames+=list.length;
  return list;
 }catch(error){fail(error);return null;}
}
function dispose(f){
 if(f.dead)return;
 f.dead=true;
 try{f.root.destroy({children:true});}catch(error){fail(error);}
 const index=active.indexOf(f);if(index>=0)active.splice(index,1);
}
function kill(e){for(const item of active.slice())if(!e||item.e===e)dispose(item);}
function sprite(tex,alpha=1){
 const s=new P.Sprite(tex);s.anchor.set(.5,.5);s.alpha=alpha;
 s.roundPixels=true;return s;
}
function begin(e,name,alreadyHit=false,origin='native'){
 if(!live(e))return false;
 const app=gpu(e);
 if(!app){report.blocked++;return false;}
 const flame=frames(app,'stream'),burst=frames(app,'ember'),star=frames(app,'daimonji');
 if(!burst||(name==='flamethrower'&&!flame)||(name==='fireblast'&&!star)){
  report.blocked++;return false;
 }
 kill(e);
 try{
  const root=new P.Container();root.interactiveChildren=false;
  const visuals=[];
  if(name==='flamethrower'){
   for(let i=0;i<8;i++){const obj=sprite(flame[(i*3)%16]);root.addChild(obj);visuals.push(obj);}
  }else{
   const core=sprite(star[0]),aura=sprite(burst[0],.36);
   root.addChild(aura);root.addChild(core);visuals.push(core,aura);
  }
  // The contact animation is separate and starts ONLY after a native hit.
  const impact=sprite(burst[0]);impact.visible=false;root.addChild(impact);
  app.stage.addChild(root);
  const item={e,app,name,root,visuals,impact,start:now(),hitAt:alreadyHit?now():0,
   impactFrame:-1,drawn:-1,dead:false,origin,player:typeof current==='function'?current():null,
   opponent:typeof foe==='function'?foe():null};
  active.push(item);
  report.casts[name]++;if(origin==='manual-preview')report.previewCasts++;
  if(alreadyHit)report.confirmedImpacts++;
  return true;
 }catch(error){fail(error);return false;}
}
function confirm(e){
 const time=now();
 const item=active.find(f=>f.e===e&&!f.dead&&!f.hitAt&&time-f.start<1800);
 if(item){item.hitAt=time;report.confirmedImpacts++;}
}
function position(e){
 const h=e.h||420,p=e.player,q=e.enemy;
 const sign=q.x>=p.x?1:-1;
 const sx=p.x+sign*Math.min(15,h*.035),sy=p.y-h*.145;
 const ex=q.x-sign*Math.min(13,h*.031),ey=q.y-h*.135;
 return {sx,sy,ex,ey,dx:ex-sx,dy:ey-sy,
  angle:Math.atan2(ey-sy,ex-sx),length:Math.hypot(ex-sx,ey-sy),h};
}
function paintFlame(f,age){
 const app=f.app,sheet=frames(app,'stream');
 const p=position(f.e),nowT=now();
 const endAt=f.hitAt?f.hitAt-f.start+260:1170;
 if(age>endAt){dispose(f);return;}
 const turnOn=smooth(age/130);
 const turnOff=1-smooth((age-(endAt-215))/215);
 const alpha=turnOn*turnOff;
 const reach=smooth(age/240),len=p.length*reach;
 const frame=Math.floor(age/71.4)%16; // 14 FPS, same cadence observed by REA
 const count=f.visuals.length;
 for(let i=0;i<count;i++){
  const s=f.visuals[i],u=i===0?.5:(i-.53)/(count-1);
  const drift=(nowT*.012+i*12)%52;
  const across=i===0?.5:clamp(u+drift/p.length*.34,.05,.98);
  if(i>0&&across>reach){s.visible=false;continue;}
  s.visible=true;
  const wave=Math.sin(age*.017+i*1.74)*p.h*.008;
  const nx=-Math.sin(p.angle),ny=Math.cos(p.angle);
  const x=p.sx+p.dx*across+nx*wave,y=p.sy+p.dy*across+ny*wave;
  s.position.set(Math.round(x),Math.round(y));
  s.rotation=p.angle+(i?Math.sin(age*.006+i*2)*.055:0);
  s.texture=sheet[(frame+i*3)%16];
  s.width=i===0?Math.max(22,len*.88):clamp(p.length*.19,34,99);
  s.height=i===0?clamp(p.h*.11,37,54):clamp(p.h*(.065+.014*(i%3)),25,40);
  s.alpha=alpha*(i===0?.95:.38+.065*(i%3));
  if(i>0) s.blendMode=i%3===0?P.BLEND_MODES.ADD:P.BLEND_MODES.NORMAL;
 }
 // A restrained hit flare replaces generic huge explosions.
 if(f.hitAt){
  const u=clamp((nowT-f.hitAt)/230,0,1);
  const sheet2=frames(app,'ember'),idx=Math.min(15,Math.floor(u*16));
  f.impact.visible=u<1;
  f.impact.texture=sheet2[idx];
  f.impact.position.set(p.ex,p.ey);
  const size=clamp(p.h*.089,27,43);
  f.impact.width=size;f.impact.height=size;
  f.impact.alpha=(1-smooth((u-.63)/.37))*.85;
 }else f.impact.visible=false;
 report.frames++;
}
function paintBlast(f,age){
 const app=f.app,p=position(f.e),ageFromHit=f.hitAt?now()-f.hitAt:0;
 const core=f.visuals[0],aura=f.visuals[1];
 const travel=smooth(age/440);
 if(!f.hitAt&&age>1250){report.misses++;dispose(f);return;}
 if(f.hitAt&&ageFromHit>710){dispose(f);return;}
 if(!f.hitAt){
  const x=p.sx+p.dx*travel,y=p.sy+p.dy*travel;
  core.visible=true;
  core.position.set(x,y);
  core.rotation=.07*Math.sin(age*.012)*(p.dx<0?-1:1);
  core.texture=frames(app,'daimonji')[Math.floor(age/100)%4];
  const size=clamp(p.h*.26,87,113);
  core.width=size;core.height=size*128/192;
  core.alpha=smooth(age/105)*(1-smooth((age-1000)/250));
  aura.visible=false;f.impact.visible=false;
 }else{
  const u=clamp(ageFromHit/700,0,1),seq=4+Math.min(11,Math.floor(u*12));
  core.visible=true;
  core.position.set(p.ex,p.ey);core.rotation=0;
  core.texture=frames(app,'daimonji')[seq];
  core.width=clamp(p.h*(.31+.13*Math.sin(u*Math.PI)),110,173);
  core.height=core.width*128/192;
  core.alpha=1-smooth((u-.74)/.26);
  aura.visible=u<.6;
  aura.texture=frames(app,'ember')[Math.min(15,Math.floor(u*22))];
  aura.position.set(p.ex,p.ey);
  aura.width=core.width*.83;aura.height=core.height*.93;
  aura.alpha=(1-smooth((u-.28)/.34))*.5;
  aura.blendMode=P.BLEND_MODES.ADD;
  f.impact.visible=false;
 }
 report.frames++;
}
function render(e){
 if(!active.length||!live(e)){if(!live(e))kill(e);return;}
 const app=gpu(e);
 if(!app)return;
 for(const f of active.slice()){
  if(f.e!==e)continue;
  if(app!==f.app||!f.root.parent||
    (typeof current==='function'&&current()!==f.player)||
    (typeof foe==='function'&&foe()!==f.opponent)){
   dispose(f);continue;
  }
  const age=now()-f.start;
  if(f.name==='flamethrower')paintFlame(f,age);
  else paintBlast(f,age);
 }
 // The original game has already updated its sole WebGL stage. Redraw it once
 // here only for an active cast: no new ticker, context or render textures.
 if(active.some(f=>f.e===e)&&app.renderer?.render)app.renderer.render(app.stage);
}
function hidden(e,fx){
 const name=kind(fx?.move?.name||fx?.name);
 return !!name&&active.some(f=>f.e===e&&!f.dead&&f.name===name);
}
// Hide only the replaced visual; never suppress the native attack or HP changes.
const oldPainter=window.PokemonTorreV360Paint;
if(typeof oldPainter==='function')window.PokemonTorreV360Paint=function(g,fx,t,e){
 if(hidden(e,fx)){report.legacySuppressed++;return true;}
 return oldPainter.apply(this,arguments);
};
if(typeof fireSpriteV41!=='undefined'&&typeof fireSpriteV41.paint==='function'){
 const original=fireSpriteV41.paint;
 fireSpriteV41.paint=function(g,fx,t,e){
  if(hidden(e,fx)){report.legacySuppressed++;return true;}
  return original.apply(this,arguments);
 };
}
const originalUse=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(slot){
 if(!live(this)||!Number.isInteger(slot))return originalUse.apply(this,arguments);
 const mon=typeof current==='function'?current():null;
 const move=mon&&typeof skillSet==='function'?skillSet(mon)?.[slot]:null;
 const name=kind(move?.name);
 if(!name)return originalUse.apply(this,arguments);
 const energy=Number(battle.energy),beforeCd=typeof cooldowns==='object'?cooldowns[slot]:null;
 const hp=typeof foe==='function'?Number(foe()?.hp):NaN;
 const result=originalUse.apply(this,arguments);
 const spent=Number(battle.energy)<energy||
  (typeof cooldowns==='object'&&cooldowns[slot]!==beforeCd);
 if(result!==false&&spent){
  const after=typeof foe==='function'?Number(foe()?.hp):NaN;
  begin(this,name,Number.isFinite(hp)&&Number.isFinite(after)&&after<hp);
 }else report.blocked++;
 return result;
};
const oldHit=BattleEngine.prototype.hitTarget;
BattleEngine.prototype.hitTarget=function(who,type,power){
 const hp=who==='enemy'&&typeof foe==='function'?Number(foe()?.hp):NaN;
 const result=oldHit.apply(this,arguments);
 const after=who==='enemy'&&typeof foe==='function'?Number(foe()?.hp):NaN;
 if(who==='enemy'&&(!type||norm(type)==='fire')&&Number.isFinite(hp)&&
  Number.isFinite(after)&&after<hp)confirm(this);
 return result;
};
const oldDraw=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(){
 const result=oldDraw.apply(this,arguments);
 try{render(this)}catch(error){fail(error);kill(this);}
 return result;
};
const oldDestroy=BattleEngine.prototype.destroy;
BattleEngine.prototype.destroy=function(){kill(this);return oldDestroy.apply(this,arguments);};
window.PokemonTorreReaFireV185=Object.freeze({
 installed:true,approved:false,
 // Visual-only QA helper: no damage and never called during normal game operation.
 visualTest:name=>{if(!kind(name)||typeof engine==='undefined'||!live(engine))return false;
  return begin(engine,kind(name),false,'manual-preview');},
 diagnostics:()=>({...report,active:active.map(x=>({name:x.name,hit:!!x.hitAt,
  source:x.origin,age:Math.round(now()-x.start)}))})
});
})();
