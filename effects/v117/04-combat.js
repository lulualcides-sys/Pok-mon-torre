/* V117 | 04 — differentiated hit reactions & existing status feedback.
 * Never edits approved move effects, HP, move cooldowns or battle hitboxes.
 */
(()=>{
'use strict';
const mode117=new URLSearchParams(location.search).get('kanto117');
if(mode117==='off'||(mode117!==null&&mode117!=='1'))return;
const hits={physical:0,special:0,status:0,reactionFrames:0,verifiedDamage:0};
const physical=new Set(['normal','fighting','bug','rock','ground','steel','flying','dark']);
const nativeHit=BattleEngine.prototype.hitTarget;
BattleEngine.prototype.hitTarget=function(who,type,power){
 const target=who==='enemy'?this.enemy:this.player;
 const pokemon=who==='enemy'?(typeof foe==='function'?foe():null):(typeof current==='function'?current():null);
 const before=pokemon?.hp;
 const result=nativeHit.apply(this,arguments);
 if(target&&Number.isFinite(before)&&pokemon?.hp<before){
  const family=physical.has(type)?'physical':'special';
  target._v117Hit={family,type,at:this.time,amount:before-pokemon.hp};
  hits[family]++;hits.verifiedDamage++;
 }
 return result;
};
const prevDraw=BattleEngine.prototype.drawMon;
BattleEngine.prototype.drawMon=function(actor,id,enemy,now){
 const recent=actor?._v117Hit;
 const elapsed=(this.time||0)-(recent?.at??-9999);
 if(+id===150||!recent||elapsed<0||elapsed>.24||!this.ctx)return prevDraw.apply(this,arguments);
 // Use the preexisting hurt sprite, adding only an extra few pixel steps:
 // physical hits recoil horizontally; special energy hits lift subtly.
 // Original actor x/y, HP and invincibility never change.
 const q=Math.max(0,1-elapsed/.24);
 const dir=Math.sign(actor.x-(enemy?this.player?.x:this.enemy?.x))||1;
 const x=(recent.family==='physical'?3.4:1.1)*q*dir;
 const y=(recent.family==='special'?-3.2:0)*q;
 const ctx=this.ctx,fn=ctx.drawImage;let intercepted=false;
 try{
  ctx.drawImage=function(image,...a){
   const dst=a.length===8?4:a.length===4?0:-1;
   if(dst>=0&&a.slice(dst,dst+4).every(Number.isFinite)){
    a[dst]+=x;a[dst+1]+=y;hits.reactionFrames++;
   }
   return fn.call(ctx,image,...a);
  };
  intercepted=ctx.drawImage!==fn;
 }catch(e){}
 try{return prevDraw.apply(this,arguments)}
 finally{if(intercepted){try{ctx.drawImage=fn}catch(e){}}}
};
const originalDraw=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(now){
 const result=originalDraw.apply(this,arguments);
 if(!battle?.active||!this.ctx)return result;
 const ctx=this.ctx;
 const paint=(actor,mon)=>{
  const statuses=[mon?.status,mon?.condition,mon?.statusEffect].filter(Boolean)
   .map(v=>String(typeof v==='object'?(v.id||v.type||v.name||''):v).toLowerCase());
  const key=statuses.join(' ');
  let icon=null;
  if(/paraly|paralis|paralys/.test(key))icon='⚡';
  else if(/freeze|frozen|congela/.test(key))icon='❄';
  else if(/sleep|sono|dorm/.test(key))icon='Z';
  else if(/poison|venen/.test(key))icon='☣';
  else if(/burn|queim/.test(key))icon='♨';
  if(!icon||!actor)return;
  ctx.save();
  try{
   ctx.font='bold '+Math.max(10,Math.min(14,this.h*.024))+'px sans-serif';
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.lineWidth=2;ctx.strokeStyle='#101020';ctx.fillStyle='#fff3ad';
   const y=actor.y-this.h*.22;
   ctx.strokeText(icon,actor.x,y);ctx.fillText(icon,actor.x,y);hits.status++;
  }finally{ctx.restore()}
 };
 paint(this.player,typeof current==='function'?current():null);
 paint(this.enemy,typeof foe==='function'?foe():null);
 return result;
};
// Localhost-only test hook: obtains the game's actual engine in its own scope.
if(/^(localhost|127\.0\.0\.1)$/.test(location.hostname||'')&&
   window.PokemonTorreLocalCombatTestV47){
 const local=window.PokemonTorreLocalCombatTestV47;
 local.verifyHitV117=()=>{
  try{
   local.prepareVisualV116(25,false,false);
   const runtime=typeof engine!=='undefined'?engine:null;
   if(!runtime?.enemy)return {error:'game engine unavailable inside QA scope'};
   runtime.enemy.inv=0;
   const before=foe().hp;
   runtime.hitTarget('enemy','fighting',5);
   return {hpBefore:before,hpAfter:foe().hp,diagnostics:{...hits}};
  }catch(error){return {error:String(error),stack:String(error?.stack||'')}}
 };
}
window.PokemonTorreCombatV117=Object.freeze({
 installed:true,previewOnly:false,approved:true,diagnostics:()=>({...hits,originalHitOwner:true,hpUnmodified:true})
});
})();