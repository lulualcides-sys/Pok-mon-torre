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
// Real animated pixel-art frames rendered once to WebGL textures.
// Nothing depends on missing PNG files or Canvas2D at runtime.
const SPECS={
 stream:{w:144,h:48,count:16},
 ember:{w:112,h:112,count:16},
 daimonji:{w:128,h:128,count:16}
};
const PAL=[0x210e18,0x63191b,0x9d2718,0xdb4818,0xf97921,
 0xffac2b,0xffd45b,0xfff6be];
const report={installed:true,approved:false,version:'185.1-rea-pixel-authoring',
 renderer:'shared PixiJS/WebGL, GPU cached 16-frame editable pixel art',
 loaded:{},casts:{flamethrower:0,fireblast:0},frames:0,textureFrames:0,
 confirmedImpacts:0,misses:0,legacySuppressed:0,blocked:0,previewCasts:0,
 errors:[],maxObjects:16,nativeDamageUntouched:true,prewarm:0};
let latestEngine=null,cacheApp=null,artCache=Object.create(null),prewarmIndex=0;
const active=[],artKeys=['stream','ember','daimonji'];
const getRandom=(x,y,k)=>{const n=Math.sin(x*127.1+y*311.7+k*74.77)*43758.5453;return n-Math.floor(n)};
const pointDist=(x,y,ax,ay,bx,by)=>{
 const dx=bx-ax,dy=by-ay;
 const t=clamp(((x-ax)*dx+(y-ay)*dy)/Math.max(.01,dx*dx+dy*dy),0,1);
 return Math.hypot(x-ax-dx*t,y-ay-dy*t);
};
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
function makePixels(name,k){
 const {w,h}=SPECS[name],pixels=new Int8Array(w*h).fill(-1);
 const t=k/16;
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
  const random=getRandom(x,y,k), p=y*w+x;
  let band=-1;
  if(name==='stream'){
   // Flame tongue extending naturally from a nozzle, never a rectangle.
   const phase=x*.17-k*.35,spread=(1-smooth((x-126)/17));
   const cx=24+Math.sin(phase)*2.5+Math.sin(x*.43+k*.65)*1.0;
   const radius=(5.2+4.5*smooth(x/18)+2.3*Math.sin(x*.12-k*.54)+
    1.5*Math.sin(x*.34+k*.72))*spread;
   const plume=Math.abs(y-cx);
   const edge=radius+1.5*Math.sin(x*.9-k*.56+y*.13)+1.7*(random-.5);
   if(x>3&&x<142&&plume<Math.max(.15,edge)){
    const heat=1-plume/Math.max(1,radius);
    band=heat>.79?7:heat>.62?6:heat>.43?5:heat>.22?4:3;
    if(random>.89&&heat<.5)band=Math.max(2,band-1);
   }else if(x>20&&x<130&&(y<cx-7||y>cx+7)&&random>.992){
    band=4+(k+x)%3;
   }
  }else if(name==='daimonji'){
   // The distinctive Pokémon Fire Blast 大, drawn as strokes with flickering tongues.
   const n=Math.sin(k*.55),cx=64,cy=61;
   const stroke=Math.min(
    pointDist(x,y,27,40,101,40),
    pointDist(x,y,64,17,64,68),
    pointDist(x,y,65,58,26,105),
    pointDist(x,y,65,58,103,105)
   );
   const flicker=1.9*Math.sin(x*.29+y*.11-k*.7)+1.2*(random-.5);
   const thick=9.6+1.1*n+flicker;
   if(stroke<thick){
    const heat=1-stroke/Math.max(thick,1);
    band=heat>.81?7:heat>.64?6:heat>.43?5:heat>.17?4:3;
   }else if(stroke<thick+3.4&&random>.67&&k>2){band=3;}
   // detached fragments along top and wing tips, not huge glowing circles.
   if(k>=4&&k<=12&&random>.995&&x>15&&x<113&&y>11&&y<115)band=5;
  }else{
   // Irregular contact flare from an actual hit. Five asymmetrical tongues
   // expand then fade in sixteen distinct frames, not a white disc.
   const dx=x-56,dy=y-56,angle=Math.atan2(dy,dx);
   const radius=Math.hypot(dx,dy);
   const size=7+37*smooth(t/.68);
   const spikes=Math.pow(.5+.5*Math.cos(angle*5-k*.21),3)*14+
    Math.pow(.5+.5*Math.cos(angle*9+k*.32),6)*8;
   const limit=size*.70+spikes+(getRandom(x>>2,y>>2,k)-.5)*5;
   const hollow=t>.5?(t-.5)*39:0;
   if(radius<limit&&radius>hollow){
    const heat=1-radius/Math.max(1,limit);
    band=heat>.65?7:heat>.43?6:heat>.22?5:4;
    if(t>.75&&random>.5)band=Math.max(2,band-2);
   }
  }
  if(band>=0)pixels[p]=band;
 }
 // Single-pixel outline drawn on the sprite sheet itself, not a CSS border.
 const snapshot=pixels.slice();
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
  const idx=y*w+x;
  if(snapshot[idx]>=0)continue;
  let edge=false;
  for(let yy=-1;yy<=1&&!edge;yy++)for(let xx=-1;xx<=1;xx++){
   if(snapshot[idx+yy*w+xx]>=2){edge=true;break;}
  }
  if(edge)pixels[idx]=0;
 }
 return pixels;
}
function generate(app,name,index){
 const {w,h}=SPECS[name],cells=makePixels(name,index),g=new P.Graphics();
 try{
  for(let y=0;y<h;y++)for(let x=0;x<w;){
   const color=cells[y*w+x];
   if(color<0){x++;continue;}
   let right=x+1;
   while(right<w&&cells[y*w+right]===color)right++;
   g.beginFill(PAL[color]);g.drawRect(x,y,right-x,1);g.endFill();
   x=right;
  }
  const tex=app.renderer.generateTexture(g,{region:new P.Rectangle(0,0,w,h),resolution:1});
  tex.baseTexture.scaleMode=P.SCALE_MODES.NEAREST;
  return tex;
 }finally{g.destroy();}
}
function prepare(app){
 if(!app)return;
 if(cacheApp!==app){
  for(const list of Object.values(artCache))for(const tex of list)try{tex.destroy()}catch(_){}
  artCache=Object.create(null);cacheApp=app;prewarmIndex=0;
  for(const key of artKeys){artCache[key]=[];report.loaded[key]=false;}
 }
 // Spread texture generation over 24 renders: no single-frame 48-sheet stall.
 for(let n=0;n<2&&prewarmIndex<48;n++,prewarmIndex++){
  const index=Math.floor(prewarmIndex/16),frame=prewarmIndex%16,key=artKeys[index];
  try{
   artCache[key].push(generate(app,key,frame));
   report.textureFrames++;
   report.loaded[key]=artCache[key].length===16;
  }catch(err){fail(err);break;}
 }
 report.prewarm=prewarmIndex;
}
function frames(app,key){
 prepare(app);
 return artCache[key]?.length===16?artCache[key]:null;
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
 prepare(app);
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
 if(!live(e)){kill(e);return;}
 const app=gpu(e);
 if(!app)return;
 prepare(app);
 if(!active.length)return;
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
 latestEngine=this;
 const result=oldDraw.apply(this,arguments);
 try{render(this)}catch(error){fail(error);kill(this);}
 return result;
};
const oldDestroy=BattleEngine.prototype.destroy;
BattleEngine.prototype.destroy=function(){kill(this);return oldDestroy.apply(this,arguments);};
window.PokemonTorreReaFireV185=Object.freeze({
 installed:true,approved:false,
 // Visual-only QA helper: no damage and never called during normal game operation.
 visualTest:(name,simulateHit=false)=>{
  if(!kind(name)||!latestEngine||!live(latestEngine))return false;
  return begin(latestEngine,kind(name),!!simulateHit,'manual-preview');
 },
 diagnostics:()=>({...report,active:active.map(x=>({name:x.name,hit:!!x.hitAt,
  source:x.origin,age:Math.round(now()-x.start)}))})
});
})();
