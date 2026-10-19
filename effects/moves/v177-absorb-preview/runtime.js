/* V177 Absorb approved — 12 discrete pixel frames, shared PixiJS/WebGL only.
 * Active by default; ?absorb177=0 returns to legacy, safe=1 disables.
 * Never modifies real V65 damage/healing.
 */
(()=>{
'use strict';
const query=new URLSearchParams(location.search);
if(query.get('absorb177')==='0'||query.get('safe')==='1'||
 query.get('moves175')==='0'||!window.PIXI||typeof BattleEngine!=='function'||
 window.PokemonTorreAbsorbV177?.installed)return;
const P=window.PIXI,now=()=>performance.now();
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const isAbsorb=s=>['absorb','absorver'].includes(norm(s));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const metrics={version:'177.1-approved',casts:0,hits:0,misses:0,frames:0,suppressed:0,errors:[]};
let active=[];
function report(e){metrics.errors.push(String(e?.message||e));metrics.errors=metrics.errors.slice(-5);}
function live(e){return !!(battle?.active&&e?.canvas?.isConnected&&e.player&&e.enemy);}
function stage(e){
 try{const app=window.PokemonTorrePixelFlyingBridge?.labStage?.(e)?.app;
  return app?.renderer?.gl&&!app.renderer.gl.isContextLost?.()?app:null;
 }catch(err){report(err);return null;}
}
function pixel(g,x,y,w,h,color,alpha=1){
 x=Math.round(x);y=Math.round(y);
 g.beginFill(0x092317,alpha);g.drawRect(x-1,y-1,w+2,h+2);g.endFill();
 g.beginFill(color,alpha);g.drawRect(x,y,w,h);g.endFill();
}
function mote(g,x,y,size,seed,alpha=1){
 const s=Math.max(2,size|0);
 pixel(g,x-s,y,s*2,s,0x237f44,alpha);
 pixel(g,x-s+1,y+1,s,s-1,seed%3?0x74ef80:0xbaffad,alpha);
 pixel(g,x+s*.4,y-s*.7,2,2,0xecffe5,alpha*.72);
}
function renderFrame(f,k){
 const g=f.g;g.clear();
 const a=f.enemy,b=f.player;
 if(!f.hitAt){
  const pulse=(k%6)/6;
  for(let j=0;j<5;j++){
   const theta=j*2.4+k*.14,r=9+pulse*8+(j%2)*5;
   mote(g,a.x+Math.cos(theta)*r,a.y+Math.sin(theta)*r*.65,2+(j%2),j,.45+.5*(1-pulse));
  }
  return;
 }
 const t=k/11;
 for(let j=0;j<7;j++){
  const progress=smooth(t*1.24-j*.065);
  if(progress<=0||progress>=1)continue;
  const lean=j%2?-1:1;
  const x=a.x+(b.x-a.x)*progress;
  const y=a.y+(b.y-a.y)*progress+Math.sin(progress*Math.PI)*lean*(8+j*1.8);
  mote(g,x,y,2+(j%3),j,clamp((1-progress)*1.4,.25,1));
 }
 if(k>7)for(let j=0;j<4;j++){
  const r=5+(k-8)*2+j*3;
  mote(g,b.x+Math.cos(j*Math.PI*.5)*r,b.y+Math.sin(j*Math.PI*.5)*r*.65,
   2,j,clamp((12-k)/5,.2,.8));
 }
}
function end(f){
 if(f.done)return;
 f.done=true;
 try{f.root.destroy({children:true});}catch(err){report(err);}
 active=active.filter(v=>v!==f);
}
function clear(e){for(const f of active.slice())if(!e||f.e===e)end(f);}
function begin(e){
 if(!live(e))return null;
 const app=stage(e);if(!app)return null;
 clear(e);
 const root=new P.Container(),g=new P.Graphics();
 root.interactiveChildren=false;root.addChild(g);app.stage.addChild(root);
 const h=e.h||420,f={e,app,root,g,started:now(),hitAt:0,frame:-1,
  enemy:{x:e.enemy.x,y:e.enemy.y-h*.135},
  player:{x:e.player.x,y:e.player.y-h*.135},done:false};
 active.push(f);metrics.casts++;return f;
}
function tick(e){
 for(const f of active.slice()){
  if(f.e!==e)continue;
  if(!live(e)||f.root.destroyed||!f.root.parent||
     !f.app.renderer?.gl||f.app.renderer.gl.isContextLost?.()){end(f);continue;}
  const elapsed=now()-(f.hitAt||f.started),limit=f.hitAt?780:2250;
  if(elapsed>=limit){if(!f.hitAt)metrics.misses++;end(f);continue;}
  const k=clamp(Math.floor(elapsed/limit*12),0,11);
  if(k!==f.frame){f.frame=k;renderFrame(f,k);metrics.frames++;}
 }
}
const originalUse=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(slot){
 if(!live(this)||!Number.isInteger(slot))return originalUse.apply(this,arguments);
 const actor=typeof current==='function'?current():null;
 const move=actor&&typeof skillSet==='function'?skillSet(actor)?.[slot]:null;
 if(!isAbsorb(move?.name))return originalUse.apply(this,arguments);
 const energy=Number(battle.energy),cd=typeof cooldowns==='object'?cooldowns[slot]:null;
 const previousDrain=this.v65LastDrain;
 const result=originalUse.apply(this,arguments);
 if(result!==false&&live(this)&&(Number(battle.energy)<energy||
    (typeof cooldowns==='object'&&cooldowns[slot]!==cd))){
  const f=begin(this);
  if(f&&this.v65LastDrain!==previousDrain&&isAbsorb(this.v65LastDrain?.move)&&
      this.v65LastDrain.damage>0){f.hitAt=now();metrics.hits++;}
 }
 return result;
};
const originalHit=BattleEngine.prototype.hitTarget;
BattleEngine.prototype.hitTarget=function(){
 const before=this.v65LastDrain;
 const result=originalHit.apply(this,arguments);
 const drain=this.v65LastDrain;
 if(drain!==before&&isAbsorb(drain?.move)&&drain.damage>0){
  const f=active.find(x=>x.e===this&&!x.hitAt);
  if(f){f.hitAt=now();f.frame=-1;metrics.hits++;}
 }
 return result;
};
const originalDraw=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(){
 const result=originalDraw.apply(this,arguments);
 try{tick(this);}catch(err){report(err);clear(this);}
 return result;
};
const originalDestroy=BattleEngine.prototype.destroy;
BattleEngine.prototype.destroy=function(){clear(this);return originalDestroy.apply(this,arguments);};
const oldPaint=window.PokemonTorreV360Paint;
if(typeof oldPaint==='function')window.PokemonTorreV360Paint=function(ctx,fx,t,e){
 if(isAbsorb(fx?.move?.name||fx?.name)&&active.some(f=>f.e===e&&!f.done)){
  metrics.suppressed++;return true;
 }
 return oldPaint.apply(this,arguments);
};
window.PokemonTorreAbsorbV177=Object.freeze({installed:true,version:'177.1',
 approved:true,diagnostics:()=>({...metrics,active:active.length,phase:active.map(f=>f.hitAt?'return':'prepare')})});
})();