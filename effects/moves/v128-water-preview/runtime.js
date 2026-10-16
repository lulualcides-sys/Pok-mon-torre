/* V128 APPROVED: exact user-approved water animations made official in normal battle.
   No static PNG, no CSS animation, no external editor. Never alters approved moves. */
(()=>{
'use strict';
if(new URLSearchParams(location.search).get('water128')==='0'||new URLSearchParams(location.search).get('safe')==='1')return;
if(window.PokemonTorreWaterV128?.installed)return;
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
const lerp=(a,b,t)=>a+(b-a)*t;
const paints=new Map(),byKey=new Map(),status=new WeakMap();
const stats={casts:0,frames:0,errors:[],last:null,hiddenLegacy:0};
const brush={norm,clamp,ease,lerp,
 ring(g,x,y,rx,ry,alpha=1,colour='#91ecff',stroke=2.4){
  g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);
  g.lineWidth=stroke+1.2;g.strokeStyle='#082037';g.globalAlpha=alpha;g.stroke();
  g.lineWidth=stroke;g.strokeStyle=colour;g.stroke();
 },
 bubble(g,x,y,r,a=1){
  if(a<=0)return;g.save();g.globalAlpha*=clamp(a);
  g.lineWidth=2.6;g.strokeStyle='#0b2843';g.fillStyle='rgba(58,173,222,.24)';
  g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();g.stroke();
  g.lineWidth=1.7;g.strokeStyle='#d5faff';g.beginPath();
  g.arc(x-r*.12,y-r*.14,r*.64,3.35,5.35);g.stroke();
  g.fillStyle='#f0ffff';g.beginPath();g.arc(x-r*.38,y-r*.44,Math.max(1,r*.13),0,Math.PI*2);g.fill();g.restore();
 },
 droplet(g,x,y,r,ang=0,a=1){
  g.save();g.globalAlpha*=clamp(a);g.translate(x,y);g.rotate(ang);
  g.beginPath();g.moveTo(0,-r*1.45);g.bezierCurveTo(r*.85,-r*.3,r*.9,r*.8,0,r);
  g.bezierCurveTo(-r*.9,r*.8,-r*.85,-r*.3,0,-r*1.45);
  g.fillStyle='#46bce7';g.strokeStyle='#0a2a43';g.lineWidth=1.55;g.fill();g.stroke();
  g.beginPath();g.moveTo(-r*.19,-r*.55);g.lineTo(-r*.32,-r*.06);
  g.strokeStyle='#ebffff';g.lineWidth=1.5;g.stroke();g.restore();
 }};
function register(spec){
 if(!spec||!spec.key||typeof spec.draw!=='function'||byKey.has(spec.key))throw Error('V128 water duplicate');
 const clean={...spec,frames:spec.frames||16};
 byKey.set(clean.key,clean);
 for(const alias of [clean.key,...(clean.aliases||[])]){const k=norm(alias);if(paints.has(k)&&paints.get(k)!==clean)throw Error('V128 duplicate name '+k);paints.set(k,clean);}
}
window.PokemonTorreWaterV128=Object.freeze({installed:true,official:true,previewOnly:false,register,
 diagnostics:()=>({...stats,registered:[...byKey.keys()],approvedUnchanged:['Cauda de Água','Pulso de Água']})});
if(typeof BattleEngine!=='function')return;
const prior=window.PokemonTorreV360Paint;
window.PokemonTorreV360Paint=function(ctx,fx,now,e){
 const spec=paints.get(norm(fx?.move?.name||fx?.name));
 if(!spec||spec.key==='withdraw'||!ctx||!fx||fx.battle!==battle)
  return typeof prior==='function'?prior.apply(this,arguments):false;
 const duration=Math.max(1,Number(fx.duration)||spec.ms);
 const t=(now-fx.at)/duration;
 if(t<0||t>1)return true;
 const hit=clamp(Number(fx.times?.[0])||.64,.2,.90);
 const world=clamp((e.enemy?.r||34)/35,.72,1.28);
 const from=fx.from||[e.player?.x||0,e.player?.y||0];
 const to=fx.to||[e.enemy?.x||0,e.enemy?.y||0];
 const frame=Math.min(spec.frames-1,Math.floor(clamp(t)*spec.frames));
 ctx.save();
 try{
  spec.draw(ctx,{...brush,t,hit,world,from,to,frame,now,e,fx,frameCount:spec.frames});
  stats.frames++;stats.last={name:spec.key,frame:frame+1,total:spec.frames,hitAt:hit,previewOnly:false};
 }catch(error){stats.errors.push(String(error));return typeof prior==='function'?prior.apply(this,arguments):false;}
 finally{ctx.restore();}
 return true;
};
const oldUse=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(slot){
 const m=battle?.active&&Number.isInteger(slot)?skillSet(current())?.[slot]:null;
 const spec=paints.get(norm(m?.name));
 if(!spec)return oldUse.apply(this,arguments);
 const before=new Set(this.v359Attacks||[]);
 const result=oldUse.apply(this,arguments);
 if(result===false||!battle?.active)return result;
 stats.casts++;
 if(spec.key==='withdraw'){
  status.set(this,{start:performance.now(),length:1300,kind:'withdraw',battle});
 }else{
  const fx=(this.v359Attacks||[]).find(f=>!before.has(f)&&norm(f?.move?.name)===norm(m.name));
  if(fx){
   // Native V359 still schedules the damage once at fx.times[0].
   // Preserve approved artwork and this hit clock; leave amount/cost/CD intact.
   fx.duration=spec.ms;fx.end=fx.at+spec.ms;
  }
 }
 return result;
};
const oldDraw=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(now){
 oldDraw.apply(this,arguments);
 const entry=status.get(this);
 if(!entry)return;
 if(!battle?.active||entry.battle!==battle||!this.ctx||!this.canvas?.isConnected){status.delete(this);return;}
 const spec=byKey.get(entry.kind),t=(now-entry.start)/entry.length;
 if(!spec||t>=1){status.delete(this);return;}
 if(t<0)return;
 const g=this.ctx;g.save();
 try{spec.draw(g,{...brush,t,now,e:this,world:clamp((this.player?.r||34)/35,.72,1.25),
  from:[this.player.x,this.player.y-this.h*.13],to:[this.player.x,this.player.y-this.h*.13],
  frame:Math.min(spec.frames-1,Math.floor(t*spec.frames)),frameCount:spec.frames});
  stats.frames++;stats.last={name:spec.key,frame:Math.floor(t*spec.frames)+1,total:spec.frames,previewOnly:false};
 }catch(error){stats.errors.push(String(error));}finally{g.restore();}
};
})();