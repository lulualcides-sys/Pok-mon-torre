/* Pokémon Torre V186 — deliberately compact source-timed REA pilot.
 * Reference OBSERVED from the public Poké Arena 2D REA study:
 * flamethrower sheet 112x64 at 14 FPS, fireblast 53x53 at 10 FPS,
 * independent fireblast_explosion sheet 112x112 at 16 FPS.
 * The reference is metadata and user-owned screenshots only; the GPU pixels
 * below are original and do NOT reproduce/copy third-party image files.
 * No Canvas 2D, no site assets, no physics/damage changes.
 * Opt-in only: ?fire186=preview; approved fire V172/V183 remain untouched.
 */
(()=>{'use strict';
const query=new URLSearchParams(location.search);
if(query.get('fire186')!=='preview'||query.get('safe')==='1'||
 typeof BattleEngine!=='function'||!window.PIXI||window.PokemonTorreReaFireV186?.installed)return;
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
 stream:{w:112,h:64,count:16},
 ember:{w:112,h:112,count:16},
 daimonji:{w:53,h:53,count:16}
};
const PAL=[0x210e18,0x63191b,0x9d2718,0xdb4818,0xf97921,
 0xffac2b,0xffd45b,0xfff6be];
const report={installed:true,approved:false,version:'186.0-rea-framerate-compact',
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
   // Tiny flickering flame tongues with gold highlights.
   // The emitter is a cluster of short sprites, never one huge beam.
   const phase=x*.18-k*.44;
   const taper=1-smooth((x-94)/16);
   const cx=32+Math.sin(phase)*2.6+Math.sin(x*.43+k*.6);
   const radius=(15+7.0*smooth(x/19)+3.8*Math.sin(x*.14-k*.52)+
    2.2*Math.sin(x*.39+k*.73))*taper;
   const plume=Math.abs(y-cx);
   const edge=radius+1.9*Math.sin(x*.83-k*.55+y*.11)+1.8*(random-.5);
   if(x>3&&x<110&&plume<Math.max(.15,edge)){
    const heat=1-plume/Math.max(1,radius);
    band=heat>.78?7:heat>.59?6:heat>.42?5:heat>.22?4:3;
    if(random>.92&&heat<.5)band=Math.max(2,band-1);
   }else if(x>20&&x<105&&(y<cx-10||y>cx+10)&&random>.996){
    band=4+(k+x)%3;
   }
  }else if(name==='daimonji'){
   // Small, readable Fire Blast at the actual 53x53 sheet frame scale.
   // 4 brushstrokes: crossbar, stem, two legs.
   const stroke=Math.min(
    pointDist(x,y,11,17,42,17),
    pointDist(x,y,27,6,27,29),
    pointDist(x,y,27,24,10,45),
    pointDist(x,y,27,24,44,45)
   );
   const flicker=.57*Math.sin(x*.29+y*.15-k*.7)+.48*(random-.5);
   const thick=3.9+.38*Math.sin(k*.55)+flicker;
   if(stroke<thick){
    const heat=1-stroke/Math.max(thick,1);
    band=heat>.78?7:heat>.59?6:heat>.40?5:heat>.17?4:3;
   }else if(stroke<thick+1.65&&random>.79&&k>1){band=3;}
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
 for(let n=0;n<5&&prewarmIndex<48;n++,prewarmIndex++){
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
   for(let i=0;i<7;i++){const obj=sprite(flame[(i*3)%16]);root.addChild(obj);visuals.push(obj);}
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
 const sx=p.x+sign*Math.min(15,h*.035),sy=p.y-Math.min(25,h*.06);
 const ex=q.x-sign*Math.min(13,h*.031),ey=q.y-Math.min(18,h*.045);
 return {sx,sy,ex,ey,dx:ex-sx,dy:ey-sy,
  angle:Math.atan2(ey-sy,ex-sx),length:Math.hypot(ex-sx,ey-sy),h};
}
function paintFlame(f,age){
 const app=f.app,p=position(f.e),nowT=now(),texture=frames(app,'stream');
 const maxEnd=f.hitAt?Math.min(1200,f.hitAt-f.start+280):1120;
 if(age>=maxEnd){dispose(f);return;}
 const a=smooth(age/92)*(1-smooth((age-(maxEnd-160))/160));
 // The reference screenshot shows two to four small, separate animated tongues
 // and detached embers traveling over a SHORT arc near the caster.
 const trail=clamp(p.length*.34,78,172),pulse=smooth(age/175);
 const xdir=Math.cos(p.angle),ydir=Math.sin(p.angle),normalX=-ydir,normalY=xdir;
 const frame=Math.floor(age/(1000/14))%16;
 for(let i=0;i<f.visuals.length;i++){
  const s=f.visuals[i],primary=i<4;
  // Looped but staggered small flames. Cannot form one giant tube.
  const u=((age/660+i*.105)%1)*pulse;
  const offset=Math.sin(age*.018+i*2.3)*Math.min(7,p.h*.012);
  s.position.set(Math.round(p.sx+xdir*(10+trail*u)+normalX*offset),
                 Math.round(p.sy+ydir*(10+trail*u)+normalY*offset));
  s.rotation=p.angle+(i%2?-.06:.08)*Math.sin(age*.009+i);
  s.texture=texture[(frame+i*3)%16];
  s.width=primary?clamp(p.h*.105,33,49):clamp(p.h*.066,17,31);
  s.height=primary?clamp(p.h*.064,21,31):clamp(p.h*.041,12,19);
  s.alpha=a*(primary?.88:.58)*(1-.20*u);
  s.blendMode=P.BLEND_MODES.NORMAL;
 }
 // Only a small, dedicated contact fire flicker after an actual HP hit.
 if(f.hitAt){
  const elapsed=nowT-f.hitAt,u=clamp(elapsed/220,0,1);
  f.impact.visible=elapsed<220;
  f.impact.texture=frames(app,'ember')[Math.min(15,Math.floor(u*16))];
  f.impact.position.set(p.ex,p.ey);
  const size=clamp(p.h*.079,26,40);
  f.impact.width=size;f.impact.height=size;
  f.impact.alpha=.74*(1-smooth((u-.66)/.34));
 }else f.impact.visible=false;
 report.frames++;
}
function paintBlast(f,age){
 const app=f.app,p=position(f.e),hitAge=f.hitAt?now()-f.hitAt:0;
 const proj=f.visuals[0],aura=f.visuals[1];
 if(!f.hitAt&&age>1200){report.misses++;dispose(f);return;}
 if(f.hitAt&&hitAge>690){dispose(f);return;}
 if(!f.hitAt){
  const u=smooth(age/420);
  proj.visible=true;proj.position.set(p.sx+p.dx*u,p.sy+p.dy*u);
  proj.rotation=.08*Math.sin(age*.008);
  proj.texture=frames(app,'daimonji')[Math.floor(age/(1000/10))%16];
  const size=clamp(p.h*.14,45,65); // Reference 53x53, NOT a 173px badge
  proj.width=size;proj.height=size;
  proj.alpha=smooth(age/90)*(1-smooth((age-910)/260));
  aura.visible=false;f.impact.visible=false;
 }else{
  // Reference: the small projectile disappears and a distinct 112x112
  // five-pronged fiery explosion animates ONCE at 16 FPS.
  proj.visible=false;aura.visible=false;
  const u=clamp(hitAge/620,0,1);
  f.impact.visible=hitAge<620;
  f.impact.texture=frames(app,'ember')[Math.min(15,Math.floor(hitAge/(1000/16)))];
  f.impact.position.set(p.ex,p.ey);
  const size=clamp(p.h*(.18+.11*smooth(u/.5)),76,132);
  f.impact.width=size;f.impact.height=size;
  f.impact.alpha=(1-smooth((u-.72)/.28));
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
window.PokemonTorreReaFireV186=Object.freeze({
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
