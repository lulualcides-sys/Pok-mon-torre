/* V119 · extra mobile quality diagnostics with no second animation loop.
 * V117 adaptive DPR and protected move sprites remain untouched.
 */
(()=>{
'use strict';
if(new URLSearchParams(location.search).get('kanto119')==='0')return;
const mobile=/Android|iPhone|Mobile/i.test(navigator?.userAgent||'');
const perf={mobile,samples:0,meanFps:0,minFps:null,lowFpsSamples:0,
 cachedMonsters:0,pruned:0,lastQuality:'auto'};
const priorFrame=BattleEngine.prototype.frame;
BattleEngine.prototype.frame=function(now){
 const result=priorFrame.apply(this,arguments);
 if(!this.running||!Number.isFinite(now)||now-(this._v119SampleAt||0)<5000)return result;
 this._v119SampleAt=now;
 const fps=Number(this.fps);
 if(Number.isFinite(fps)&&fps>0&&fps<240){
  perf.samples++;perf.meanFps+=((fps-perf.meanFps)/perf.samples);
  perf.minFps=perf.minFps===null?fps:Math.min(perf.minFps,fps);
  if(fps<40)perf.lowFpsSamples++;
 }
 perf.cachedMonsters=this.assets?.size||0;
 // Preserve active, recently used and upcoming sprites during attack bursts.
 // Pruning at 16 used to cause expensive reload/decoding between casts.
 if(mobile&&this.assets?.size>32&&(!this._v123LastPrune||now-this._v123LastPrune>18000)&&
    (!Number.isFinite(this._v123CastAt)||now-this._v123CastAt>2500)){
  const keep=new Set([current()?.id,foe()?.id,
   battle?.enemies?.[0]?.id]);
  for(const id of this.assets.keys()){
   if(this.assets.size<=24)break;
   if(!keep.has(id)){this.assets.delete(id);perf.pruned++}
  }
  this._v123LastPrune=now;
 }
 return result;
};
window.PokemonTorreMobileV119=Object.freeze({installed:true,previewOnly:false,official:true,
 diagnostics:()=>({...perf,meanFps:Math.round(perf.meanFps*10)/10,
  noAdditionalAnimationLoop:true,stable60fpsClaim:false})});
})();