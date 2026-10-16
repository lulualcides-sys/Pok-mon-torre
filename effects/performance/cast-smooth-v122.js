/* V122 low-latency cast stabilizer: no damage/cooldown changes.
 * Caps generic particle bursts and warms pre-existing sprite sheets asynchronously. */
(()=>{
'use strict';
if(window.PokemonTorreCastSmoothV122?.installed)return;
const mobile=/Android|iPhone|Mobile/i.test(navigator?.userAgent||'');
const stats={mobile,casts:0,castMsMax:0,particleCalls:0,trimmedParticles:0,
 warmedSprites:0,warmErrors:0,stalls:0,framesObserved:0,slowFrames:0};
const cap=mobile?92:180,burst=mobile?18:32;
const oldParticles=BattleEngine.prototype.particlesAt;
BattleEngine.prototype.particlesAt=function(x,y,color,count=18,speed=120){
 stats.particleCalls++;
 const before=this.particles?.length||0;
 const allowed=Math.min(Math.max(0,cap-before),Math.max(0,burst));
 const reduced=Math.min(Math.max(0,Number(count)||0),allowed);
 stats.trimmedParticles+=Math.max(0,(Number(count)||0)-reduced);
 if(reduced===0)return;
 return oldParticles.call(this,x,y,color,reduced,speed);
};
const oldUse=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(){
 const start=performance.now();
 try{return oldUse.apply(this,arguments)}
 finally{
  const elapsed=performance.now()-start;
  stats.casts++;
  if(elapsed>stats.castMsMax)stats.castMsMax=Math.round(elapsed*10)/10;
  if(elapsed>28)stats.stalls++;
 }
};
const oldFrame=BattleEngine.prototype.frame;
if(typeof oldFrame==='function')
 BattleEngine.prototype.frame=function(t){
  const now=performance.now(),out=oldFrame.apply(this,arguments);
  stats.framesObserved++;
  if(performance.now()-now>24)stats.slowFrames++;
  // Avoid synchronous removal/resizes on the frame that launches a move.
  return out;
 };
const warm=new WeakSet();
const startWarm=(engine)=>{
 if(!mobile||!engine?.assets)return;
 const run=()=>{
  let count=0;
  for(const id of [typeof current==='function'?current()?.id:0,
                    typeof foe==='function'?foe()?.id:0]){
   const a=engine.assets.get(id);
   if(!a)continue;
   for(const image of Object.values(a.sheets||{})){
    if(!image||typeof image.decode!=='function'||warm.has(image))continue;
    warm.add(image);
    image.decode().then(()=>stats.warmedSprites++).catch(()=>stats.warmErrors++);
    if(++count>=8)return;
   }
  }
 };
 if(typeof requestIdleCallback==='function')requestIdleCallback(run,{timeout:1600});
 else Promise.resolve().then(run); // nonblocking, no sync image decoding
};
const oldStart=BattleEngine.prototype.start;
if(typeof oldStart==='function')
 BattleEngine.prototype.start=function(){
  const out=oldStart.apply(this,arguments);
  startWarm(this);return out;
 };
const oldLoad=BattleEngine.prototype.loadArt;
if(typeof oldLoad==='function')
 BattleEngine.prototype.loadArt=function(id){
  const out=oldLoad.apply(this,arguments);
  startWarm(this);return out;
 };
window.PokemonTorreCastSmoothV122=Object.freeze({installed:true,official:true,
 diagnostics:()=>({...stats,particleCap:cap,burstCap:burst})});
})();