/* Pokemon Torre V180 | hand-designed 16-frame pixel fire via PixiJS WebGL.
 * Video reference: PokéArena2D 19/10 — small and distinct pixel sprites.
 * Flamethrower: continuous orange stream with connected irregular tongues.
 * Fire Blast: compact fireball, short ember tail, five-flame star ONLY on hit.
 * No PNG still, no Canvas2D, no CSS effect, no third-party protected assets.
 * Opt-in ?fire180=preview; V179/172 and approved moves never overwritten.
 */
(()=>{
'use strict';
const query=new URLSearchParams(location.search);
if(query.get('fire180')!=='preview'||query.get('safe')==='1'||
 !window.PIXI||typeof BattleEngine!=='function'||window.PokemonTorreFireV180?.installed)return;
const P=window.PIXI;
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const ease=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
const clock=()=>performance.now();
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .toLowerCase().replace(/[^a-z0-9]/g,'');
const kind=s=>{const v=norm(s);return v==='flamethrower'||v==='lancachamas'?'flamethrower':
 v==='fireblast'||v==='explosaodefogo'?'fireblast':null;};
const COL=[0x160d16,0x83261a,0xd43d16,0xff811c,0xffb52b,0xffe462,0xfff4bb];
const H=16,FRAMES=16;
const SIZES={stream:[72,26],projectile:[40,30],burst:[72,72]};
const reports={version:'180.0',installed:true,approved:false,
 renderer:'one PixiJS WebGL stage; 16 hand-timed pixel frames per attack',
 frames:0,prebaked:0,starts:{flamethrower:0,fireblast:0},nativeHits:0,
 confirmedImpacts:0,oldVisualsHidden:0,frameSwaps:0,cleared:0,
 fallback:0,errors:[]};
let atlasApp=null,atlases=null,prebakeIndex=0,active=[];
const problem=e=>{reports.errors.push(String(e?.message||e));reports.errors=reports.errors.slice(-4);};
const live=e=>!!(battle?.active&&e?.canvas?.isConnected&&e.player&&e.enemy);
const rnd=(x,y,k)=>{const f=Math.sin((x+13)*32.41+(y+6)*78.23+k*31.89)*43758.5453;return f-Math.floor(f);};
function gpu(e){
 try{const app=window.PokemonTorrePixelFlyingBridge?.labStage?.(e)?.app;
  if(app?.renderer?.gl&&!app.renderer.gl.isContextLost?.())return app;
 }catch(err){problem(err);}
 return null;
}
function outline(rows,w,h){
 const snap=rows.map(a=>a.slice());
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  if(snap[y][x]>=0)continue;
  let near=false;
  for(let dy=-1;dy<=1&&!near;dy++)for(let dx=-1;dx<=1;dx++){
   const xx=x+dx,yy=y+dy;
   if(xx>=0&&xx<w&&yy>=0&&yy<h&&snap[yy][xx]>0){near=true;break}
  }
  if(near)rows[y][x]=0;
 }
}
function art(type,k){
 const [w,h]=SIZES[type],rows=Array.from({length:h},()=>Array(w).fill(-1));
 if(type==='stream'){
  for(let x=1;x<w-1;x++){
   const head=1-ease((x-(w-10))/10);
   const xphase=x*.29-k*.51;
   const center=h*.50+1.12*Math.sin(x*.20-k*.45)+.8*Math.sin(x*.51+k*.31);
   const belly=5.6+2.0*Math.sin(xphase)+1.4*Math.sin(x*.56-k*.83)
    +2.4*Math.pow(.5+.5*Math.sin(x*.30-k*.57),3);
   const radius=Math.max(.2,belly*head*(.73+.27*ease(x/10)));
   for(let y=1;y<h-1;y++){
    const dist=Math.abs(y-center),tongues=(rnd(x,y>>2,k)-.5)*1.7+
       1.35*Math.sin(x*.84-k*.82+y*.17);
    const edge=radius+tongues;
    if(dist>edge)continue;
    const heat=1-dist/Math.max(1,radius);
    let ci=heat>.84?6:heat>.67?5:heat>.47?4:heat>.21?3:2;
    if(rnd(x,y,k)>.93&&heat<.48)ci=Math.max(2,ci-1);
    rows[y][x]=ci;
   }
  }
 }else if(type==='projectile'){
  const cx=w*.58,cy=h*.50;
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
   const dist=Math.hypot((x-cx)*.89,(y-cy)*1.0);
   const flutter=1.0+.10*Math.sin(x*.6+k*.53)+.08*Math.sin(y*.82-k*.72);
   const orb=dist<10.0*flutter;
   const tail=x<cx-6&&x>=2&&Math.abs(y-cy+2.3*Math.sin(x*.25+k*.45))<
    (2.7+1.4*Math.sin(x*.40-k*.84))&&rnd(x,y,k)>.13;
   if(!orb&&!tail)continue;
   const heat=1-dist/10.5;
   rows[y][x]=tail?((x+k)%4===0?4:3):heat>.67?6:heat>.40?5:heat>.13?4:3;
  }
  for(let j=0;j<6;j++){
   const x=2+(j*5+k*3)%20,y=Math.round(cy+Math.sin(j*2.4+k*.7)*8);
   if(x>0&&y>0&&y<h-1)rows[y][x]=j%3===0?5:3;
  }
 }else{
  const cx=(w-1)/2,cy=(h-1)/2;
  const expansion=.68+.32*ease(k/5),collapse=1-.45*ease((k-10)/6);
  const extent=expansion*collapse;
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
   const dx=x-cx,dy=y-cy,ang=Math.atan2(dy,dx);
   const dist=Math.hypot(dx,dy),ray=Math.pow(Math.max(0,.5+.5*Math.cos(5*ang-1.57)),5);
   const flameTip=8+21*ray;
   const rough=2.2*Math.sin(ang*19-k*.48)+1.5*(rnd(x>>2,y>>2,k)-.5);
   const bound=Math.max(1,(flameTip+rough)*extent);
   if(dist>bound)continue;
   const heat=1-dist/Math.max(bound,1);
   rows[y][x]=heat>.74?6:heat>.52?5:heat>.30?4:heat>.10?3:2;
  }
  // detached sparks stay tiny and last only the earliest frames
  if(k<9)for(let j=0;j<6;j++){
   const a=j*Math.PI*2/6+k*.08;
   const radius=(25+k*.65)*extent,x=Math.round(cx+Math.cos(a)*radius),
    y=Math.round(cy+Math.sin(a)*radius);
   if(x>1&&x<w-2&&y>1&&y<h-2)rows[y][x]=3+(j%3);
  }
 }
 outline(rows,w,h);
 return rows;
}
// Pixi Graphics are rasterized to 16 WebGL textures ONCE per move type.
// Each texture is a new pixel-art animation frame, never a static PNG/still.
function texture(app,type,k){
 const [w,h]=SIZES[type],rows=art(type,k),g=new P.Graphics();
 for(let y=0;y<h;y++){
  const line=rows[y];
  for(let x=0;x<w;){
   const color=line[x];if(color<0){x++;continue;}
   let end=x+1;while(end<w&&line[end]===color)end++;
   g.beginFill(COL[color]);g.drawRect(x,y,end-x,1);g.endFill();
   x=end;
  }
 }
 let result;
 try{result=app.renderer.generateTexture(g,{region:new P.Rectangle(0,0,w,h),resolution:1});
  if(result?.baseTexture)result.baseTexture.scaleMode=P.SCALE_MODES.NEAREST;
 }finally{g.destroy();}
 if(!result)throw Error('PixiJS pixel texture was not generated');
 reports.prebaked++;
 return result;
}
function dropAtlas(){
 if(atlases)for(const seq of Object.values(atlases))for(const t of seq)
  try{t?.destroy(true);}catch(_){}
 atlases=null;atlasApp=null;prebakeIndex=0;
}
function ensureAtlas(app){
 if(app!==atlasApp){dropAtlas();atlasApp=app;atlases={stream:[],projectile:[],burst:[]};}
 return atlases;
}
// Draw only TWO frames per draw call to avoid a first-attack CPU spike.
function preload(app,number=2){
 const a=ensureAtlas(app),order=['stream','projectile','burst'];
 for(let n=0;n<number&&prebakeIndex<FRAMES*order.length;n++){
  const type=order[Math.floor(prebakeIndex/FRAMES)],idx=prebakeIndex%FRAMES;
  try{a[type][idx]=texture(app,type,idx);}
  catch(err){problem(err);reports.fallback++;return false;}
  prebakeIndex++;
 }
 return true;
}
function frame(app,type,k){
 const a=ensureAtlas(app),index=((k%FRAMES)+FRAMES)%FRAMES;
 // If an attack happens before idle prewarm is complete, finish only its atlas.
 if(!a[type][index]){
  try{a[type][index]=texture(app,type,index);}catch(err){problem(err);return null;}
 }
 return a[type][index];
}
function dispose(f){
 if(f.done)return;
 f.done=true;
 try{f.stream?.destroy();f.blast?.destroy();f.embers?.destroy();f.root.destroy({children:true});}
 catch(err){problem(err);}
 active=active.filter(x=>x!==f);reports.cleared++;
}
const clear=e=>{for(const f of active.slice())if(!e||f.engine===e)dispose(f);};
function start(e,name,instantHit=false){
 if(!live(e))return null;
 const app=gpu(e);if(!app){reports.fallback++;return null;}
 if(!preload(app,1))return null;
 const type=name==='fireblast'?'projectile':'stream';
 const tex=frame(app,type,0);if(!tex){reports.fallback++;return null;}
 clear(e);
 const root=new P.Container(),sprite=new P.Sprite(tex);
 sprite.anchor.set(.5);root.addChild(sprite);
 const embers=new P.Graphics();root.addChild(embers);
 app.stage.addChild(root);
 const f={engine:e,app,root,stream:sprite,embers,blast:null,name,
  born:clock(),hitAt:instantHit?clock():0,impactConsumed:false,
  duration:name==='flamethrower'?1020:1250,done:false};
 active.push(f);reports.starts[name]++;
 if(instantHit){reports.nativeHits++;reports.confirmedImpacts++;}
 return f;
}
function positionStream(f){
 const e=f.engine,h=e.h||420,p=e.player,t=e.enemy;
 const dir=t.x>=p.x?1:-1;
 const x1=p.x+dir*Math.min(17,h*.031),y1=p.y-h*.145;
 const x2=t.x-dir*Math.min(12,h*.028),y2=t.y-h*.13;
 const dx=x2-x1,dy=y2-y1,s=f.stream;
 s.position.set((x1+x2)/2,(y1+y2)/2);
 s.rotation=Math.atan2(dy,dx);
 s.width=Math.hypot(dx,dy);
 s.height=clamp(h*.092,31,48); // about one Pokemon wide
}
function positionProjectile(f,progress){
 const e=f.engine,h=e.h||420,p=e.player,t=e.enemy;
 const ax=p.x,ay=p.y-h*.14,bx=t.x,by=t.y-h*.14;
 const u=ease(progress),s=f.stream;
 s.position.set(ax+(bx-ax)*u,ay+(by-ay)*u);
 s.rotation=Math.atan2(by-ay,bx-ax);
 const size=clamp(h*.103,31,48);s.width=size*1.12;s.height=size*.85;
}
function confirm(f){
 if(!f||f.done||f.hitAt||f.impactConsumed)return;
 f.hitAt=clock();reports.nativeHits++;reports.confirmedImpacts++;
}
function drawEmbers(f,now){
 const g=f.embers;g.clear();
 if(f.hitAt||f.done||f.name!=='flamethrower')return;
 const e=f.engine,p=e.player,t=e.enemy,h=e.h||420;
 // A handful of inexpensive detached pixels, not particle clouds.
 for(let j=0;j<5;j++){
  const u=((now-f.born)*.00072+j*.214)%1.0;
  const x=p.x+(t.x-p.x)*u,y=p.y-h*.145+(t.y-p.y)*u+
    Math.sin((u*8+j)*2.1+(now-f.born)*.008)*7.0;
  const s=1.2+(j%3),alpha=.60*(1-u*.65);
  g.beginFill(0x170e10,alpha);g.drawRect(Math.round(x)-1,Math.round(y)-1,s+2,s+2);g.endFill();
  g.beginFill(j%2?0xffca3c:0xff7125,alpha);g.drawRect(Math.round(x),Math.round(y),s,s);g.endFill();
 }
}
function draw(e){
 const app=gpu(e);
 if(app&&live(e))preload(app,2);
 if(!active.length)return;
 const now=clock();
 for(const f of active.slice()){
  if(f.engine!==e)continue;
  if(!live(e)||f.root.parent==null||f.app!==app){dispose(f);continue;}
  const elapsed=now-f.born,u=clamp(elapsed/f.duration,0,1);
  if(u>=1){dispose(f);continue;}
  const idx=f.name==='flamethrower'?
   Math.floor(elapsed/55)%FRAMES:Math.floor(elapsed/48)%FRAMES;
  const type=f.name==='flamethrower'?'stream':'projectile';
  const tex=frame(app,type,idx);
  if(tex){f.stream.texture=tex;reports.frameSwaps++;}
  if(f.name==='flamethrower'){
   positionStream(f);
   f.stream.alpha=ease(u/.12)*(1-ease((u-.85)/.15));
   drawEmbers(f,now);
  }else{
   const travel=f.hitAt?1:clamp((elapsed-45)/590,0,1);
   positionProjectile(f,travel);
   f.stream.alpha=f.hitAt?0:ease(u/.08)*(1-ease((u-.79)/.21));
  }
  if(f.hitAt&&!f.impactConsumed){
   f.impactConsumed=true;
   const burstTex=frame(app,'burst',0);
   if(burstTex){
    f.blast=new P.Sprite(burstTex);f.blast.anchor.set(.5);f.root.addChild(f.blast);
    f.impactAt=now;
   }
  }
  if(f.blast){
   const elapsedHit=now-f.impactAt,duration=f.name==='fireblast'?420:210;
   if(elapsedHit>=duration){f.blast.destroy();f.blast=null;}
   else{
    const t=clamp(elapsedHit/duration,0,1),sp=f.blast,h=e.h||420;
    const idx=Math.min(15,Math.floor(t*16));
    const tex=frame(app,'burst',idx);
    if(tex)sp.texture=tex;
    const sz=f.name==='fireblast'?clamp(h*.245,76,120):clamp(h*.074,23,36);
    sp.position.set(e.enemy.x,e.enemy.y-h*.13);
    sp.width=sz*(.78+.35*ease(t/.45));
    sp.height=sp.width;
    sp.alpha=ease(t/.12)*(1-ease((t-.58)/.42));
   }
  }
  reports.frames++;
 }
}
// Do not draw the deprecated sprite-only Fire Blast or old 2D effects
// if this SAME move is being rendered in V180 WebGL.
// Everything is restored automatically after the preview animation.
const oldPaint=window.PokemonTorreV360Paint;
if(typeof oldPaint==='function')window.PokemonTorreV360Paint=function(g,fx,now,e){
 const n=kind(fx?.move?.name||fx?.name);
 if(n&&active.some(f=>f.engine===e&&f.name===n&&!f.done)){
  reports.oldVisualsHidden++;return true;
 }
 return oldPaint.apply(this,arguments);
};
if(typeof fireSpriteV41!=='undefined'&&typeof fireSpriteV41.paint==='function'){
 const oldFirePaint=fireSpriteV41.paint;
 fireSpriteV41.paint=function(ctx,fx,now,e){
  if(kind(fx?.move?.name||fx?.name)==='fireblast'&&active.some(
   f=>f.engine===e&&f.name==='fireblast'&&!f.done)){
   reports.oldVisualsHidden++;return true;
  }
  return oldFirePaint.apply(this,arguments);
 };
}
const oldUse=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(slot){
 if(!live(this)||!Number.isInteger(slot))return oldUse.apply(this,arguments);
 const mon=typeof current==='function'?current():null;
 const move=mon&&typeof skillSet==='function'?skillSet(mon)?.[slot]:null;
 const n=kind(move?.name);
 if(!n)return oldUse.apply(this,arguments);
 const energy=Number(battle.energy),cd=typeof cooldowns==='object'?cooldowns[slot]:null;
 const hp=typeof foe==='function'?Number(foe()?.hp):NaN;
 const out=oldUse.apply(this,arguments);
 const accepted=out!==false&&live(this)&&(Number(battle.energy)<energy||
  (typeof cooldowns==='object'&&cooldowns[slot]!==cd));
 if(accepted){
  const currentHp=typeof foe==='function'?Number(foe()?.hp):NaN;
  start(this,n,Number.isFinite(hp)&&Number.isFinite(currentHp)&&currentHp<hp);
 }
 return out;
};
const oldHit=BattleEngine.prototype.hitTarget;
BattleEngine.prototype.hitTarget=function(who,type,power){
 const hp=who==='enemy'&&typeof foe==='function'?Number(foe()?.hp):NaN;
 const out=oldHit.apply(this,arguments);
 const after=who==='enemy'&&typeof foe==='function'?Number(foe()?.hp):NaN;
 if(who==='enemy'&&Number.isFinite(hp)&&Number.isFinite(after)&&after<hp){
  const f=active.find(x=>x.engine===this&&!x.done&&!x.hitAt&&!x.impactConsumed&&
   (!type||String(type).toLowerCase()==='fire')&&clock()-x.born<1400);
  if(f)confirm(f);
 }
 return out;
};
const oldDraw=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(time){
 const out=oldDraw.apply(this,arguments);
 try{draw(this);}catch(err){problem(err);clear(this);}
 return out;
};
const oldDestroy=BattleEngine.prototype.destroy;
BattleEngine.prototype.destroy=function(){clear(this);return oldDestroy.apply(this,arguments);};
window.PokemonTorreFireV180=Object.freeze({installed:true,approved:false,
 diagnostics:()=>({...reports,active:active.map(x=>x.name),
  prewarm:prebakeIndex,contexts:atlasApp?1:0})
});
})();
