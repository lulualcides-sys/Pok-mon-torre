/* V124 | Real red Pokeball recall/send on both sides + trainer team-switch AI.
 * Official animation uses the SAME V27 trainer sprite already supplied by game.
 * Never mutates approved move visuals, type formulas, HP, hitboxes or save schema.
 */
(()=>{
'use strict';
if(window.PokemonTorreRecallV124?.installed)return;
const params=new URLSearchParams(location.search);
if(params.get('swap124')==='0')return;
const stat={manual:0,enemy:0,automatic:0,recalls:0,sends:0,coachSprites:0,decisions:0,rejected:0,completed:0,oldOverlaysCleared:0,recallHandoff:0,syncedRecallFrames:0,syncedSendFrames:0,fallbackFrames:0,lastAnchor:null,last:null};
const clock=()=>performance.now();
const EASE=t=>1-Math.pow(1-Math.max(0,Math.min(1,t)),3);
const N=n=>Number.isFinite(n)?n:0;
let activeScene=null,backdrop=null;
function resetScene(){
 if(activeScene?.b&&activeScene.b.active)activeScene.b.paused=false;
 if(activeScene?.b)activeScene.b.v124Swapping=false;
 activeScene=null;
 try{backdrop?.remove()}catch(e){}
 backdrop=null;
}
function trainerName(side){
 if(side==='ally')return 'VOCÊ';
 const g=Math.min(12,Math.max(0,Number(save.gym)||0));
 if(/RIVAL/i.test(String(battle?.label||'')))return 'Blue';
 if(/ROCKET/i.test(String(battle?.label||'')))return 'EQUIPE ROCKET';
 return GYMS[g]?.leader||'TREINADOR';
}
function showRecallTrainer(side){
 const arena=document.getElementById('arenaPro');
 if(!arena||typeof arena.appendChild!=='function')return;
 // Clear only stale V27 trainer throws from a previous entry. Reusing the
 // same actor as V27 must not display two trainers on the same arena side.
 const oldThrows=arena.querySelectorAll?.('.v27Throw')||[];
 for(const prior of oldThrows){if(prior?.remove){prior.remove();stat.oldOverlaysCleared++;}}
 const wrap=document.createElement('div');
 wrap.className='v124RecallTrainer '+(side==='ally'?'ally':'enemy');
 wrap.setAttribute('aria-hidden','true');
 const spr=document.createElement('div');spr.className='v27ThrowTrainer';
 const coach=document.createElement('div');
 if(side==='ally'&&typeof V27_HERO_THROW_SHEET==='string'){
  coach.className='v27HeroSprite';coach.style.backgroundImage='url('+V27_HERO_THROW_SHEET+')';stat.coachSprites++;
 }else{
  const name=trainerName(side),url=typeof V27_TRAINER_GIFS==='object'?V27_TRAINER_GIFS[name]:null;
  if(url){const pic=document.createElement('img');pic.src=url;pic.alt=name;pic.loading='eager';coach.appendChild(pic);stat.coachSprites++;}
  else coach.textContent='●';
 }
 spr.appendChild(coach);
 const ball=document.createElement('span');ball.className='v124Ball';
 wrap.append(spr,ball);arena.appendChild(wrap);backdrop=wrap;
}
function begin(side,config={}){
 if(!battle?.active||!engine||activeScene||battle.v124Swapping)return false;
 const target=side==='ally'?engine.player:engine.enemy;
 const mon=side==='ally'?current():foe();
 if(!target||!mon)return false;
 const b=battle;
 activeScene={b,side,sourceId:mon.id,nextId:config.nextId||null,targetIndex:config.index,
  oldMon:mon,newMon:config.newMon||null,started:clock(),phase:0,done:false,
  x:N(target.x),y:N(target.y),needsCommit:config.needsCommit!==false};
 b.v124Swapping=true;b.paused=true;
 showRecallTrainer(side);
 stat.recalls++;stat.last={side,sourceId:mon.id,nextId:config.nextId||null};
 return true;
}
function end(scene){
 if(activeScene!==scene)return;
 if(scene.b?.active)scene.b.paused=false;
 scene.b.v124Swapping=false;stat.completed++;
 activeScene=null;try{backdrop?.remove()}catch(e){}backdrop=null;
}
function commit(scene){
 if(scene.done||!scene.b?.active||battle!==scene.b)return;
 const b=scene.b;
 if(scene.side==='ally'){
  const index=scene.targetIndex,mon=save.team[index];
  if(!mon||mon.hp<=0||index===b.pIndex){end(scene);return;}
  // Hand off the trainer picture to the EXISTING V27 send animation.
  // Leaving V124's recall coach visible would render two overlapped trainers.
  if(backdrop){backdrop.remove();backdrop=null;stat.recallHandoff++;}
  b.pIndex=index;b.energy=Math.max(0,b.energy-12);
  cooldowns=[0,0,0,0];
  engine?.switchMon(); // existing V27 trainer throw, native HUD/skills/sounds
  log('Vai, '+(D[mon.id]?.name||'Pokémon')+'!');
 }else{
  const queue=b.enemies;
  if(!Array.isArray(queue)||!queue.includes(scene.newMon)||b.foe!==scene.oldMon){end(scene);return;}
  const i=queue.indexOf(scene.newMon);
  queue.splice(i,1);
  // The recalled foe retains its exact HP/status/shiny/level. Never duplicate it.
  if(scene.oldMon?.hp>0)queue.push(scene.oldMon);
  if(backdrop){backdrop.remove();backdrop=null;stat.recallHandoff++;}
  b.foe=scene.newMon;
  if(b.v30Boss){b.v30Phase=b.v30Phase||1;} // AI switch is NOT a boss phase knockout.
  engine?.newEnemy(); // native asset loading, V27 trainer appearance, HUD, AI resets
  engine.enemy.inv=Math.max(N(engine.enemy.inv),.45);
  log(trainerName('enemy')+' trocou para '+(D[scene.newMon.id]?.name||'Pokémon')+'!');
  stat.enemy++;
 }
 scene.done=true;scene.nextId=scene.side==='ally'?save.team[b.pIndex].id:b.foe.id;
 stat.sends++;
 // Do not call persist or finishBattle; HP and save progression unchanged.
}
function sceneClock(){
 if(!activeScene)return null;
 const a=activeScene;
 if(battle!==a.b||!a.b.active||!engine){resetScene();return null;}
 const t=Math.max(0,(clock()-a.started)/1000);
 if(t>=.52&&!a.done)commit(a);
 if(t>=1.42){end(a);return null;}
 a.phase=t;return a;
}
// V124.2 — the red beam must leave the *visible* Poke Ball, not a
// hard-coded arena position. The Ball is DOM/CSS-animated while the beam is
// Canvas-rendered, so translate actual screen coordinates each frame.
function ballAnchor(scene,renderer,w,h){
 const canvas=renderer?.canvas,canvasRect=canvas?.getBoundingClientRect?.();
 const arena=document.getElementById('arenaPro');
 const selector=scene.side==='ally'?'.v27Throw.left .v27ThrowBall':'.v27Throw.right .v27ThrowBall';
 let ball=null;
 if(scene.done){
  const candidates=arena?.querySelectorAll?.(selector);
  if(candidates?.length)ball=candidates[candidates.length-1];
 }else{
  ball=backdrop?.querySelector?.('.v124Ball')||null;
 }
 const ballRect=ball?.getBoundingClientRect?.();
 if(canvasRect&&ballRect&&canvasRect.width>0&&canvasRect.height>0&&ballRect.width>0&&ballRect.height>0){
  const x=((ballRect.left+ballRect.width*.5-canvasRect.left)/canvasRect.width)*w;
  const y=((ballRect.top+ballRect.height*.5-canvasRect.top)/canvasRect.height)*h;
  if(Number.isFinite(x)&&Number.isFinite(y)){
   const point={x,y};
   scene.anchor=point;
   if(scene.done)stat.syncedSendFrames++;else stat.syncedRecallFrames++;
   stat.lastAnchor={side:scene.side,phase:scene.done?'send':'recall',x:+x.toFixed(1),y:+y.toFixed(1)};
   return point;
  }
 }
 // Keep the last measured point only when the CSS ball temporarily disappears
 // during the handoff. This is better than snapping the ray across the arena.
 stat.fallbackFrames++;
 return scene.anchor||{x:scene.side==='ally'?w*.095:w*.905,y:scene.side==='ally'?h*.67:h*.47};
}
// Native paint uses same scene clock; no second RAF and no additional animation timer.
const prevDraw=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(now){
 const scene=sceneClock();
 const out=prevDraw.apply(this,arguments);
 if(scene&&this.ctx){
  const c=this.ctx,h=Math.max(240,N(this.h)),w=Math.max(280,N(this.w));
  const actor=scene.side==='ally'?this.player:this.enemy;
  const x=actor?.x??scene.x,y=actor?.y??scene.y;
  const ball=ballAnchor(scene,this,w,h);
  const ballX=ball.x,ballY=ball.y;
  const entering=scene.phase>=.52;
  const strength=entering?Math.max(0,1-(scene.phase-.52)/.74):Math.max(0,1-scene.phase/.60);
  const beams=Math.max(0,Math.min(1,strength));
  c.save();
  c.globalAlpha=Math.min(1,.24+beams*.76);
  const gradient=c.createLinearGradient(ballX,ballY,x,y);
  if(entering){
   gradient.addColorStop(0,'#ffe0ef');gradient.addColorStop(.3,'#fd415f');
   gradient.addColorStop(.86,'#fe5166');gradient.addColorStop(1,'#ffd3ed');
  }else{
   gradient.addColorStop(0,'#ffbdc8');gradient.addColorStop(.24,'#ff475d');
   gradient.addColorStop(.78,'#ff2f4a');gradient.addColorStop(1,'#fff2ee');
  }
  c.lineCap='round';c.strokeStyle=gradient;
  c.shadowColor='#ff304e';c.shadowBlur=Math.min(16,h*.031)*beams;
  c.lineWidth=Math.max(4,h*.021*beams);
  c.beginPath();c.moveTo(ballX,ballY);c.lineTo(x,y-h*.08);c.stroke();
  c.shadowBlur=0;c.lineWidth=Math.max(1.4,h*.005);
  c.strokeStyle='#ffe6e6';c.beginPath();c.moveTo(ballX,ballY);c.lineTo(x,y-h*.08);c.stroke();
  // Elliptical capture/arrival rings frame the real Pokémon sprite.
  c.strokeStyle='#ff5a80';c.lineWidth=Math.max(2,h*.005);
  c.beginPath();c.ellipse(x,y-h*.09,Math.max(4,h*.065)*beams,Math.max(3,h*.09)*beams,
   0,0,Math.PI*2);c.stroke();
  c.fillStyle='#ffdde7';c.beginPath();c.arc(ballX,ballY,Math.max(2,h*.007),0,Math.PI*2);c.fill();
  c.restore();
 }
 return out;
};
// Shrink outgoing real species frames, then expand incoming real frames.
// Keep original sprite source/colour and V122 scale; collision remains unchanged.
const prevMon=BattleEngine.prototype.drawMon;
BattleEngine.prototype.drawMon=function(actor,id,isEnemy,now){
 const s=activeScene,side=isEnemy?'enemy':'ally';
 if(!s||s.side!==side||!actor||!this.ctx||battle!==s.b)return prevMon.apply(this,arguments);
 const t=s.phase;
 let showId=s.done?(s.nextId||id):s.sourceId;
 const scale=!s.done?Math.max(.025,1-EASE(t/.50)*.975):
  Math.max(.025,EASE((t-.52)/.78));
 const ctx=this.ctx;
 ctx.save();
 try{
  ctx.translate(actor.x,actor.y-N(actor.r)*.14);
  ctx.scale(scale,scale);
  ctx.translate(-actor.x,-actor.y+N(actor.r)*.14);
  ctx.globalAlpha*=Math.max(.13,Math.min(1,scale*1.5));
  return prevMon.call(this,actor,showId,isEnemy,now);
 }finally{ctx.restore();}
};
// Player manual switch: postpone the roster mutation until beam has actually recalled
// outgoing species. Original 'showSwap' UI remains usable; no extra menu is created.
const prevShow=showSwap;
showSwap=function(){
 const ret=prevShow.apply(this,arguments);
 if(!battle?.active)return ret;
 const sheet=document.getElementById('swapSheet');
 if(!sheet)return ret;
 sheet.querySelectorAll('[data-swap]').forEach(btn=>{
  btn.onclick=()=>{
   const next=Number(btn.dataset.swap);
   if(!Number.isInteger(next)||next<0||next>=save.team.length||
     save.team[next]?.hp<=0||next===battle.pIndex)return;
   sheet.classList.add('hide');
   if(!begin('ally',{index:next,nextId:save.team[next].id})){
    sheet.classList.remove('hide');battle.paused=false;return;
   }
   stat.manual++;
  };
 });
 return ret;
};
// Auto replacement after faint stays native: a defeated mon is not "recalled"
// as though still conscious, but the next Pokéball emits the red arrival ray.
const nativeSwitch=BattleEngine.prototype.switchMon;
BattleEngine.prototype.switchMon=function(){
 const last=this._v124AllyId;
 const nowMon=current();
 const ret=nativeSwitch.apply(this,arguments);
 if(!this._v124AllyId)this._v124AllyId=nowMon?.id;
 if(!activeScene&&battle?.active&&last&&nowMon?.id!==last){
  const s={b:battle,side:'ally',sourceId:last,nextId:nowMon.id,done:true,
   started:clock()-.52,phase:.52,x:N(this.player?.x),y:N(this.player?.y)};
  activeScene=s;stat.automatic++;stat.sends++;
 }
 this._v124AllyId=nowMon?.id;return ret;
};
// When a previous opponent faints, the native engine sends the next one.
// Render the same red emergence on that transition without inventing a recall.
const nativeNewEnemy=BattleEngine.prototype.newEnemy;
BattleEngine.prototype.newEnemy=function(){
 const last=this._v124EnemyId,mon=foe();
 const ret=nativeNewEnemy.apply(this,arguments);
 if(!activeScene&&battle?.active&&last&&mon?.id!==last){
  activeScene={b:battle,side:'enemy',sourceId:last,nextId:mon.id,done:true,
   started:clock()-.52,phase:.52,x:N(this.enemy?.x),y:N(this.enemy?.y)};
  stat.automatic++;stat.sends++;
 }
 this._v124EnemyId=mon?.id;return ret;
};
// Tactical substitutions use the EXISTING opponent queue; it is not a new spawn.
// Wild fights, single-foe battles and test labs never switch strategically.
const prevUpdate=BattleEngine.prototype.update;
BattleEngine.prototype.update=function(dt,now){
 const ret=prevUpdate.apply(this,arguments);
 const b=battle;
 if(!b?.active||b.paused||b.wild||b.v124Swapping||activeScene||
    b.v33Type==='lab'||b.v32Mode==='lab'||/LABORATÓRIO|TESTE/i.test(String(b.label||''))||
    !Array.isArray(b.enemies)||!b.enemies.length||!this.enemy||!this.player)return ret;
 const t=N(this.time);
 const flags=b.v124AI||(b.v124AI={lastCheck:0,lastSwitch:-100,swaps:0});
 if(t<4.5||t-flags.lastCheck<.75)return ret;
 flags.lastCheck=t;stat.decisions++;
 if(flags.swaps>=Math.min(3,b.enemies.length+1)||t-flags.lastSwitch<11||
    !foe()||foe().hp<=0||!current()||current().hp<=0)return ret;
 const player=D[current().id],old=foe(),oldSpecies=D[old.id];
 if(!player||!oldSpecies)return ret;
 const hp=m=>Math.max(0,Math.min(1,N(m.hp)/Math.max(1,N(m.maxHp))));
 const score=m=>{
  const d=D[m.id];if(!d||m.hp<=0)return -999;
  const offens=Math.max(advantage(d.type,player),d.type2?advantage(d.type2,player):0);
  const incoming=advantage(player.type,d)*(player.type2?Math.max(1,advantage(player.type2,d)):1);
  return offens*1.2-incoming*.75+hp(m)*.8;
 };
 const currentScore=score(old),options=b.enemies.filter(m=>m&&m!==old&&m.hp>0&&D[m.id]);
 if(!options.length)return ret;
 const selected=options.sort((a,c)=>score(c)-score(a))[0];
 const delta=score(selected)-currentScore;
 // Switch only for meaningful defensive/offensive advantage or imminent KO.
 const vulnerable=hp(old)<.31&&hp(selected)>.55;
 if(delta<.56&&!(vulnerable&&delta>-.22)){stat.rejected++;return ret;}
 if(!begin('enemy',{newMon:selected,oldMon:old,nextId:selected.id}))return ret;
 flags.lastSwitch=t;flags.swaps++;
 stat.last={enemyBefore:old.id,enemyAfter:selected.id,delta:+delta.toFixed(2),lowHp:vulnerable};
 return ret;
};
const oldStart=startBattle;
startBattle=function(){
 resetScene();
 const ret=oldStart.apply(this,arguments);
 if(engine){engine._v124AllyId=current()?.id;engine._v124EnemyId=foe()?.id;}
 return ret;
};
const oldFinish=finishBattle;
finishBattle=function(){
 resetScene();
 return oldFinish.apply(this,arguments);
};
const style=document.createElement('style');
style.id='v124-pokeball-recall';
style.textContent='.v124RecallTrainer{position:absolute;z-index:8;pointer-events:none;bottom:19%;left:3%;width:90px;height:110px;opacity:.94;filter:drop-shadow(0 6px 6px #051021aa)}'+
 '.v124RecallTrainer.enemy{left:auto;right:3%;bottom:34%;transform:none}'+
 // Native V27 move rotates the trainer; on the recall frame keep a stable
 // pixel-art pose and let the original V27 animation perform the SEND phase.
 '.v124RecallTrainer .v27ThrowTrainer{position:absolute;bottom:5px;left:0;animation:none!important;transform:none!important}'+
 '.v124RecallTrainer.enemy .v27ThrowTrainer{left:12px}'+
 '.v124RecallTrainer.enemy .v124Ball{left:9px}'+
 '.v124RecallTrainer .v124Ball{position:absolute;left:57px;bottom:64px;width:19px;height:19px;'+
 'border:2px solid #121e2d;border-radius:50%;background:linear-gradient(#e94b57 0 45%,#182431 46% 55%,#fff 56%);'+
 'box-shadow:0 0 12px #fb476888;animation:v124BallPulse .48s ease-in-out both}'+
 '@keyframes v124BallPulse{0%{transform:translateY(8px) scale(.7)}65%{transform:translateY(-8px) scale(1.1)}100%{transform:translateY(0) scale(1)}}'+
 '@media(max-width:650px){.v124RecallTrainer{transform:scale(.77);transform-origin:bottom left}'+
 '.v124RecallTrainer.enemy{transform:scale(.77);transform-origin:bottom right}}';
document.head.appendChild(style);
window.PokemonTorreRecallV124=Object.freeze({installed:true,official:true,version:'124.2',
 diagnostics:()=>({...stat,active:!!activeScene,queueLength:battle?.enemies?.length||0})});
})();