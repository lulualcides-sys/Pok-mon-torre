/* Pokemon Torre V47.5 — reliable physical collisions, queued commands and zero-cost inputs with independent per-cast physics.
 * The original BattleEngine.hitTarget()/damage() remains the only damage source.
 * Projectiles steer toward the foe instead of missing on every sideways step.
 * Beams track the visible target on discharge; physical dashes actually connect.
 * Status moves never gain damage, enemy attacks and dodge mechanics remain.
 */
(function(){
 'use strict';
 const report={version:'47.8',casts:0,projectileCorrections:0,beamsAligned:0,
  contactFollowThrough:0,missingCollisionRecovered:0,realHits:0,
  ignoredOldShots:0,waitedForInvincibility:0,zeroCostRecognized:0,
  queuedDuringWindup:0,replayedQueued:0,discardedQueued:0,
  recoveredBasicDashes:0,timerContactHits:0,contactConfirmedByUpdate:0,
  contactAttemptFailures:0,lastContactAttempt:null,meleeRangeAligned:0,updateTicks:0,drawTicks:0,contactChecks:0,lastContactCheck:null,
  hitAttempts:0,hitAttemptsNoHP:0,lastZeroHit:null,
  lastHit:null,lastCast:null};
 const savedHit=BattleEngine.prototype.hitTarget;
 BattleEngine.prototype.hitTarget=function(who,type,power){
  const victim=battle?.active?(who==='enemy'?foe():current()):null;
  const before=Number(victim?.hp);
  const result=savedHit.apply(this,arguments);
  const after=Number(victim?.hp);
  if(who==='enemy'){
   report.hitAttempts++;
   if(Number.isFinite(before)&&Number.isFinite(after)&&after>=before){
    report.hitAttemptsNoHP++;
    report.lastZeroHit={type,power,monId:current()?.id,foeId:foe()?.id,
     targetInv:this.enemy?.inv,playerInv:this.player?.inv,
     hpBefore:before,hpAfter:after,battlePaused:battle?.paused,
     targetId:this.enemy?.id,foeMatches:victim===foe(),
     attackerStats:this.v25?.stats?.player?{
      accuracy:this.v25.stats.player.accuracy,atk:this.v25.stats.player.atk,
      speed:this.v25.stats.player.speed
     }:null,
     defenderStats:this.v25?.stats?.enemy?{
      def:this.v25.stats.enemy.def,accuracy:this.v25.stats.enemy.accuracy
     }:null,
     time:performance.now()};
   }
  }
  if(Number.isFinite(before)&&Number.isFinite(after)&&after<before){
   report.realHits++;
   report.lastHit={who,type,damage:before-after,time:performance.now()};
  }
  return result;
 };
 // Physical hit confirmation is independent of render FPS. A short timer checks
 // the actual enemy at the collision moment, and ALWAYS uses the original
 // hitTarget() logic; neither visuals nor CSS calculate or fabricate damage.
 // Every cast has one settled token shared by the update loop and this timer.
 // V35.54 rejects Fighting damage when PHYSICS coordinates are far apart.
 // Yet approved melee VFX move the rendered Pokémon toward the foe without
 // updating persistent actor coordinates. For a REGISTERED melee cast only,
 // synchronize the physical hit position with the visible contact frame,
 // then restore it immediately. Preserve all existing immunity/accuracy rules.
 function landPhysicalContact(engine,event){
  if(event.settled||!battle?.active||event.owner!==current()||
     event.victim!==foe()||event.power<=0)return;
  const p=engine.player,e=engine.enemy;
  const reposition=event.type==='fighting'&&p&&e;
  const oldX=p?.x,oldY=p?.y;
  if(reposition){
   const dx=p.x-e.x,dy=p.y-e.y,length=Math.hypot(dx,dy)||1;
   const limit=Math.max(56,(engine.h||560)*.19);
   if(length>limit){
    const gap=limit*.64;
    p.x=e.x+dx/length*gap;
    p.y=e.y+dy/length*gap;
    report.meleeRangeAligned++;
   }
  }
  try{return engine.hitTarget('enemy',event.type,event.power)}
  finally{
   if(reposition){p.x=oldX;p.y=oldY}
  }
 }
 function confirmRealContact(engine,event){
  if(typeof setTimeout!=='function')return;
  const check=()=>{
   const now=performance.now();
   if(event.settled||now>event.until||!battle?.active||
      event.owner!==current()||event.victim!==foe())return;
   if(Number(event.victim.hp)<event.hpBefore){
    event.settled=true;return;
   }
   if(battle.paused||now<event.at||Number(engine.enemy?.inv||0)>0){
    if(now<event.until)setTimeout(check,Math.max(24,Math.min(75,
       now<event.at?event.at-now:70)));
    return;
   }
   const before=Number(event.victim.hp),inv=Number(engine.enemy?.inv||0);
   landPhysicalContact(engine,event);
   const after=Number(event.victim.hp);
   event.attempts=(event.attempts||0)+1;
   report.lastContactAttempt={source:'timer',name:event.name,at:now,before,after,
    inv,attempts:event.attempts};
   if(after<before){
    event.settled=true;
    report.contactFollowThrough++;
    report.timerContactHits++;
   }else if(event.attempts<12&&now+100<event.until){
    report.contactAttemptFailures++;
    setTimeout(check,90);
    return;
   }else{
    event.settled=true;
   }
   engine.v47ContactToLand=(engine.v47ContactToLand||[]).filter(x=>x!==event);
  };
  setTimeout(check,Math.max(0,event.at-performance.now()));
 }
 const savedCast=BattleEngine.prototype.useMove;
 BattleEngine.prototype.useMove=function(slot){
  const active=battle?.active&&!battle.paused;
  // Some battle transitions leave the battle active while the animation
  // loop is stopped. A registered attack then has no update() and never hits.
  // Restart only after an actual unpaused player input; never bypass pause.
  if(active&&!this.running&&typeof this.start==='function')this.start();
  const owner=active?current():null;
  const selected=owner&&Number.isInteger(slot)?skillSet(owner)?.[slot]:null;
  const now=performance.now();
  const priorEnergy=Number(battle?.energy);
  const priorCooldown=Number(cooldowns[slot]||0);
  const victim=active?foe():null;
  const priorHP=Number(victim?.hp);
  // An existing projectile from an EARLIER move must never prevent THIS
  // move from generating an independent collision. Track the identity
  // of physics actors present BEFORE the new cast.
  const shotsBefore=new Set((this.projectiles||[]).filter(x=>x.from==='player'));
  const beamBefore=this.telegraph;
  const oldX=Number(this.player?.x),oldY=Number(this.player?.y);
  const oldAttackAct=Number(this.attackActs?.player||0);
  const particleBefore=this.particles?.length||0;
  const result=savedCast.apply(this,arguments);
  // Several ORIGINAL physical moves (Soco, etc.) have cost=0 and cd=0.
  // The engine still performs their dash/attack, so resource-based detection
  // alone misses EVERY real cast for these moves.
  const actorAdvanced=Number.isFinite(oldX)&&Number.isFinite(oldY)&&
   Math.hypot((this.player?.x||0)-oldX,(this.player?.y||0)-oldY)>2;
  const animationBegan=Number(this.attackActs?.player||0)>oldAttackAct+.001;
  const particlesSpawned=(this.particles?.length||0)>particleBefore;
  const resourcesChanged=Number(battle?.energy)<priorEnergy||
   (Number(cooldowns[slot]||0)>now&&Number(cooldowns[slot]||0)!==priorCooldown);
  // Some legacy V33/V34 move handlers swallow zero-cost punches entirely:
  // Soco (Machamp) has 0 cost/0 cd, so the normal cast produces no movement,
  // projectile, attack pose or resource change. Recover this valid PHYSICAL
  // command only, rather than silently ignoring it.
  const legacyZeroDash=!!(active&&selected?.kind==='dash'&&Number(selected.power)>0&&
   !resourcesChanged&&!actorAdvanced&&!animationBegan&&!particlesSpawned&&
   current()?.hp>0&&(cooldowns[slot]||0)<=now&&
   Number(battle.energy)>=Number(selected.cost||0)&&
   (!this.v33Windup||now>=this.v33Windup.until)&&
   now>=Number(this.v47NextZeroDash||0));
  if(legacyZeroDash){
   // The older wrapper swallowed the action BEFORE charging its actual
   // move cost and cooldown. Restore both original move-definition values.
   const cost=Math.max(0,Number(selected.cost)||0);
   const cd=Math.max(0,Number(selected.cd)||0);
   battle.energy=Math.max(0,battle.energy-cost);
   if(cd>0)cooldowns[slot]=now+cd;
   this.v47NextZeroDash=now+Math.max(850,cd); // no button-spam
   this.attackActs.player=this.time+.53;
   this.v47RecoveredDashes=(this.v47RecoveredDashes||[]).filter(x=>x.until>now);
   this.v47RecoveredDashes.push({at:now,until:now+860,owner,victim,
    start:[this.player.x,this.player.y]});
   report.recoveredBasicDashes++;
  }
  const accepted=!!(active&&selected&&battle?.active&&
   (resourcesChanged||actorAdvanced||animationBegan||particlesSpawned||legacyZeroDash));
  if(accepted&&!resourcesChanged)report.zeroCostRecognized++;
  if(!accepted){
   // V33's cinematic windup blocks otherwise valid player inputs.
   // Buffer the LAST button pressed instead of silently losing the attack.
   // A queue is NOT treated as a hit or cast until the core engine
   // actually accepts it and starts its own physics.
   if(active&&selected&&this.v33Windup?.until>now&&
     (cooldowns[slot]||0)<=now&&Number(battle.energy)>=Number(selected.cost||0)&&
     owner.hp>0){
    this.v474QueuedMove={slot,b:battle,owner,at:now,until:now+2200};
    report.queuedDuringWindup++;
    return result;
   }
   return result;
  }
  report.casts++;report.lastCast=selected.name;
  // The real game catalogue marks some physical moves (e.g. Faísca,
  // Aqua Tail) as "bolt", although the approved animations are body contact.
  // Check their visual registration; don't trust the obsolete kind alone.
  const spriteContact=Boolean(
   (typeof electricSpriteV46!=='undefined'&&electricSpriteV46.resolve(selected)?.contact)||
   (typeof waterSpriteV43!=='undefined'&&waterSpriteV43.resolve(selected)?.contact)||
   (typeof fireSpriteV41!=='undefined'&&fireSpriteV41.resolve(selected)?.contact)
  );
  if((selected.kind==='dash'||spriteContact)&&selected.kind!=='status'&&
     selected.cat!=='status'&&Number(selected.power)>0&&
    victim===foe()&&Number(victim?.hp)>=priorHP){
   this.v47ContactToLand=(this.v47ContactToLand||[]).filter(f=>f.until>now);
   const contact={at:now+380,until:now+2750,owner,victim,hpBefore:priorHP,
    type:selected.type,power:selected.power,name:selected.name,settled:false};
   this.v47ContactToLand.push(contact);
   confirmRealContact(this,contact);
  }else if(Number(selected.power)>0&&!spriteContact&&selected.kind!=='dash'&&
      selected.kind!=='status'&&selected.cat!=='status'&&
      victim===foe()&&Number(victim?.hp)>=priorHP){
   // Some older visual-move overrides consume cooldown and play an animation
   // without ever spawning a REAL projectile / beam. Recover ONLY those casts.
   // A real projectile/beam, or a previous damage event, cancels the fallback.
   this.v47MissingCollisions=(this.v47MissingCollisions||[]).filter(x=>x.until>now);
   const createdProjectiles=(this.projectiles||[]).filter(x=>
    x.from==='player'&&!shotsBefore.has(x)&&x.life>0);
   const createdBeam=this.telegraph?.from==='player'&&this.telegraph!==beamBefore;
   // Do not duplicate a REAL projectile or beam created by the same cast.
   // Other casts' shots do not affect this decision.
   if(!createdProjectiles.length&&!createdBeam){
    this.v47MissingCollisions.push({
     at:now+770,until:now+3200,owner,victim,type:selected.type,
     power:selected.power,hpBefore:priorHP,name:selected.name
    });
    report.ignoredOldShots+=shotsBefore.size;
   }
   // Wider matching between the visible projectile and the original game's
   // segmentTouches() collider, without changing the animation itself.
   for(const shot of createdProjectiles){
    shot.r=Math.max(Number(shot.r)||0,(this.h||560)*.031);
   }
  }
  return result;
 };
 const savedUpdate=BattleEngine.prototype.update;
 BattleEngine.prototype.update=function(dt,now){
  report.updateTicks++;
  const ready=battle?.active&&!battle.paused&&current()?.hp>0&&foe()?.hp>0;
  if(ready&&this.enemy){
   const x=this.enemy.x,y=this.enemy.y;
   for(const projectile of this.projectiles||[]){
    if(projectile.from!=='player'||projectile.life<=0)continue;
    if(!Number.isFinite(projectile.vx)||!Number.isFinite(projectile.vy))continue;
    // Preserve direction and speed so hit physics and art agree.
    const dx=x-projectile.x,dy=y-projectile.y;
    const d=Math.hypot(dx,dy),speed=Math.hypot(projectile.vx,projectile.vy);
    if(d<1||speed<1)continue;
    const steer=Math.min(.95,Math.max(.50,(Number(dt)||.016)*43));
    const vx=projectile.vx*(1-steer)+dx/d*speed*steer;
    const vy=projectile.vy*(1-steer)+dy/d*speed*steer;
    const length=Math.hypot(vx,vy)||1;
    projectile.vx=vx/length*speed;projectile.vy=vy/length*speed;
    report.projectileCorrections++;
   }
   // The original beam checks an extremely thin static line aimed at the
   // enemy's OLD position. Aim its REAL collision at the current target.
   const t=this.telegraph;
   if(t?.from==='player'&&t.kind==='beam'&&t.remaining<=dt+.015){
    const dx=x-this.player.x,dy=y-this.player.y;
    const length=Math.hypot(dx,dy)||1;
    t.dx=dx/length;t.dy=dy/length;
    t.width=Math.max(t.width||0,(this.h||560)*.082);
    report.beamsAligned++;
   }
  }
  const result=savedUpdate.apply(this,arguments);
  // Replay legitimate input after V33's heavy-attack preparation completes.
  // Guards ensure a queued move cannot leak into a different Pokémon/battle.
  const queued=this.v474QueuedMove;
  if(queued){
   const time=performance.now();
   if(!battle?.active||battle!==queued.b||current()!==queued.owner||
      time>queued.until||current()?.hp<=0){
    this.v474QueuedMove=null;report.discardedQueued++;
   }else if(!battle.paused&&(!this.v33Windup||this.v33Windup.until<=time)&&
     (cooldowns[queued.slot]||0)<=time){
    this.v474QueuedMove=null;
    const oldCd=Number(cooldowns[queued.slot]||0);
    const oldEnergy=Number(battle.energy);
    const oldCastCount=report.casts;
    this.useMove(queued.slot);
    if(report.casts>oldCastCount||
       Number(cooldowns[queued.slot]||0)>oldCd||
       Number(battle.energy)<oldEnergy)report.replayedQueued++;
   }
  }
  // Dash impact at its actual animation contact moment, with original damage
  // and resistance logic. No instant fake hit, no double damage, no status hit.
  if(battle?.active&&this.v47ContactToLand?.length){
   const time=performance.now();
   report.contactChecks++;
   report.lastContactCheck={source:'update',time,count:this.v47ContactToLand.length};
   const pending=[];
   for(const fx of this.v47ContactToLand){
    if(fx.settled||fx.until<=time||fx.victim!==foe()||fx.owner!==current())continue;
    if(Number(fx.victim.hp)<fx.hpBefore){fx.settled=true;continue;}
    if(time<fx.at||this.enemy.inv>0){
     if(this.enemy.inv>0)report.waitedForInvincibility++;
     pending.push(fx);continue;
    }
    const hp=Number(fx.victim.hp),inv=Number(this.enemy?.inv||0);
    landPhysicalContact(this,fx);
    const after=Number(fx.victim.hp);
    fx.attempts=(fx.attempts||0)+1;
    report.lastContactAttempt={source:'update',name:fx.name,at:time,before:hp,
     after,inv,attempts:fx.attempts};
    if(after<hp){
     fx.settled=true;
     report.contactFollowThrough++;
     report.contactConfirmedByUpdate++;
    }else if(fx.attempts<12&&time+100<fx.until){
     report.contactAttemptFailures++;
     fx.at=time+90;
     pending.push(fx);
    }else fx.settled=true;
   }
   this.v47ContactToLand=pending;
  }
  // A reliable impact, not a fake visual number: use the same damage()
  // and immunities as the base game if NO collision actor was ever created.
  if(battle?.active&&this.v47MissingCollisions?.length){
   const time=performance.now(),pending=[];
   for(const fx of this.v47MissingCollisions){
    if(fx.until<=time||fx.victim!==foe()||fx.owner!==current())continue;
    // Only this cast's physics is relevant. Previous casts can leave shots
    // alive in the arena; those must NOT silence this accepted hit.
    if(Number(fx.victim.hp)<fx.hpBefore)continue;
    if(time<fx.at||(this.enemy?.inv||0)>0){
     if((this.enemy?.inv||0)>0)report.waitedForInvincibility++;
     pending.push(fx);continue;
    }
    const hp=Number(fx.victim.hp);
    this.hitTarget('enemy',fx.type,fx.power);
    // Drop fallback after one ORIGINAL hit attempt, including immunities.
    if(Number(fx.victim.hp)<hp)report.missingCollisionRecovered++;
   }
   this.v47MissingCollisions=pending;
  }
  return result;
 };
 // Visible version marker makes cached/older game builds unmistakable on phone.
 const gameVersion=document.getElementById('ptFireSpriteV41Badge');
 if(gameVersion){
  const actualElectric=typeof window.PokemonTorreElectricV46==='function'?window.PokemonTorreElectricV46().version:null;
  gameVersion.textContent='TORRE V65 · '+(actualElectric?'DRENOS ORIGINAIS · PLANTA V64 · ELÉTRICOS V'+actualElectric:'MODO SEGURO · DRENOS V65');
  gameVersion.title='Motor de colisão V47.8; renderizador elétrico: '+(actualElectric||'desativado');
 }
 // Only for a RECOVERED old zero-cost physical move. The Pokémon really
 // approaches the enemy on screen during its contact animation; physics still
 // deals damage via the original hitTarget() in update() (never in draw).
 const v473PhysicalDashDraw=BattleEngine.prototype.draw;
 BattleEngine.prototype.draw=function(now){
  const fx=(this.v47RecoveredDashes||[]).findLast?.(x=>
   x.until>now&&x.owner===current()&&x.victim===foe()&&battle?.active);
  if(!fx||!this.player||!this.enemy)return v473PhysicalDashDraw.call(this,now);
  const p=this.player,originalX=p.x,originalY=p.y;
  const t=Math.max(0,Math.min(1,(now-fx.at)/860));
  const smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)};
  const approach=smooth(t/.40)*(1-smooth((t-.48)/.40));
  const dx=this.enemy.x-fx.start[0],dy=this.enemy.y-fx.start[1];
  const len=Math.hypot(dx,dy)||1,reach=Math.max(0,len-Math.max(37,this.h*.08));
  p.x=fx.start[0]+dx/len*reach*approach;
  p.y=fx.start[1]+dy/len*reach*approach;
  try{return v473PhysicalDashDraw.call(this,now)}
  finally{p.x=originalX;p.y=originalY}
 };
 // Collision recovery for cases where the legacy engine advances the
 // render loop but an older update() wrapper skips the new contact queue.
 // Both update() and draw() invoke the SAME original hitTarget/damage rules.
 // After the first successful collision the queue entry is removed, making
 // it impossible for the two pathways to deal the same hit twice.
 const v475CollisionFrameDraw=BattleEngine.prototype.draw;
 BattleEngine.prototype.draw=function(now){
  report.drawTicks++;
  const result=v475CollisionFrameDraw.call(this,now);
  if(!battle?.active||battle.paused||!this.v47ContactToLand?.length)
   return result;
  const tick=performance.now(),remaining=[];
  report.contactChecks++;
  report.lastContactCheck={source:'draw',time:tick,count:this.v47ContactToLand.length};
  for(const fx of this.v47ContactToLand){
   if(fx.until<=tick||fx.owner!==current()||fx.victim!==foe())continue;
   if(Number(fx.victim.hp)<fx.hpBefore)continue;
   if(tick<fx.at||(this.enemy?.inv||0)>0){
    remaining.push(fx);continue;
   }
   const hp=Number(fx.victim.hp);
   landPhysicalContact(this,fx);
   if(Number(fx.victim.hp)<hp)report.contactFollowThrough++;
   else if(tick<fx.until)remaining.push(fx);
  }
  this.v47ContactToLand=remaining;
  return result;
 };
 window.PokemonTorreCombatV47=()=>({
  ...report,active:!!battle?.active,
  enemyHp:battle?.active?foe()?.hp:null,
  pendingContact:engine?.v47ContactToLand?.length||0,
  pendingMissingCollision:engine?.v47MissingCollisions?.length||0
 });
 // Deterministic real-browser regression harness available ONLY on localhost.
 // No production site visitor can start test battles or alter saved creatures.
 if(/^(localhost|127\.0\.0\.1)$/.test(location.hostname)){
  window.PokemonTorreLocalCombatTestV47={
   start(allyId=25,foeId=143,options={}){
    if(battle?.active)stopTimers();
    save.team=[mon(Number(allyId),76)];
    const target=mon(Number(foeId),85);
    target.hp=target.maxHp*20;target.maxHp=target.hp;
    startBattle([target],'TESTE DE ACERTO',true);
    if(engine){engine.foeDodgeCD=options.allowDodge?0:999;engine.enemy.inv=0;engine.enemy.spawn=0;
      // New battles must never inherit a windup/click queue from the preceding test.
      engine.v33Windup=null;engine.v474QueuedMove=null;
      engine.v47ContactToLand=[];engine.v47MissingCollisions=[];}
    return this.snapshot();
   },
   // Browser-only V84: invoke all four moves in the REAL engine, not just
   // check that their files loaded. Available ONLY on localhost (this QA
   // harness is never installed in the normal published game).
   castPreviewGrassV84(slot=0,foeId=143){
    const labels=['Chicote de Vinha','Folha Navalha','Chicotes em Área','Vine Whip'];
    if(!Number.isInteger(slot)||slot<0||slot>=labels.length)
      return {error:'Invalid V84 preview slot'};
    if(this._grassBaseSkillSet)skillSet=this._grassBaseSkillSet;
    this.start(1,foeId);
    const actor=current(),oldSkillSet=skillSet;
    this._grassBaseSkillSet=oldSkillSet;
    const moves=labels.map((name,i)=>({
      name,kind:'bolt',cat:'physical',type:'grass',power:34+i,
      cost:0,cd:420,level:1,icon:''
    }));
    skillSet=function(mon){return mon===actor?moves:oldSkillSet(mon);};
    const fired=this.cast(slot);
    return {requested:labels[slot],selected:fired.name,
      cast:fired,vfx:window.PokemonTorreGrassFourPreviewV84?.diagnostics(),
      sync:window.PokemonTorreGrassImpactV84?.()};
   },
   // Browser-only regression for actual Grass status moves, not image preload.
   // Battle and team are ephemeral inside headless localhost Chromium only.
   castGrass(name,foeId=143){
    // The move editor's v32Catalogue is private to its OWN IIFE and cannot
    // be read by this battle harness. Equip equivalent real move definitions
    // through the global skillSet hook, but ONLY on localhost QA battles.
    const labels=['Stun Spore','Pó do Sono','Leech Seed','Esporos'];
    if(!labels.includes(name))return {error:'Invalid Grass move '+name};
    if(this._grassBaseSkillSet)skillSet=this._grassBaseSkillSet;
    this.start(150,foeId);
    const actor=current(),oldSkillSet=skillSet;
    this._grassBaseSkillSet=oldSkillSet;
    const moves=labels.map(label=>({
     name:label,kind:'status',cat:'status',type:'grass',power:0,
     cost:24,cd:6800,level:1,icon:''
    }));
    skillSet=function(mon){return mon===actor?moves:oldSkillSet(mon);};
    const equipped=skillSet(actor).map(x=>x.name),slot=labels.indexOf(name);
    const cast=this.cast(slot);
    const conditions=engine?.v25?.stats?.enemy?.conditions?.slice()||[];
    return {requested:name,equipped,cast,conditions,
     visuals:window.PokemonTorrePlantStatusV64?.()||null,
     ready:window.PokemonTorrePlantFourV63?.()||null};
   },
   // V65: exercise the REAL battle engine for the two distinct drain rules.
   // Exists only on localhost in the existing QA harness.
   verifyDrainV65(name='Leech Seed'){
    if(name==='Leech Seed'){
     const result=this.castGrass('Leech Seed',143);
     if(result.error)return result;
     const p=current(),v=foe();
     p.maxHp=500;p.hp=100;
     v.maxHp=800;v.hp=800;
     engine.enemyAttackCD=999;
     engine.v342DamageTicker=1.99;
     engine.update(.025,performance.now());
     return {name,seedApplied:result.conditions.includes('seed'),
      enemyMax:800,enemyAfter:v.hp,
      enemyLost:800-v.hp,playerAfter:p.hp,playerHealed:p.hp-100,
      seedStats:engine.v65SeedStats,
      diagnostics:window.PokemonTorreDrainV65?.()||null};
    }
    const allowed=['Absorver','Mega Dreno','Draining Kiss','Leech Life'];
    if(!allowed.includes(name))return {error:'Unknown drain test '+name};
    if(this._grassBaseSkillSet)skillSet=this._grassBaseSkillSet;
    this.start(3,143);
    const actor=current(),v=foe(),priorSkillSet=skillSet;
    const type=(name==='Draining Kiss'?'fairy':name==='Leech Life'?'bug':'grass');
    skillSet=m=>m===actor?[{name,type,kind:'bolt',cat:'special',
       power:45,cost:20,cd:850,icon:''}]:priorSkillSet(m);
    actor.maxHp=500;actor.hp=100;
    v.maxHp=800;v.hp=800;
    engine.enemy.inv=0;engine.enemyAttackCD=999;
    const cast=this.cast(0);
    // In a freshly spawned arena the enemy can still have invulnerability
    // frames. The regression must measure a LANDED hit, not a legitimate dodge.
    for(let attempt=0;attempt<4&&v.hp===800;attempt++){
     engine.enemy.inv=0;engine.enemy.spawn=0;
     engine.hitTarget('enemy',type,70);
    }
    const lost=800-v.hp,healed=actor.hp-100;
    return {name,accepted:cast.energy<100,
     enemyLost:lost,playerHealed:healed,playerAfter:actor.hp,
     expectedHeal:Math.max(1,Math.floor(lost*(name==='Draining Kiss'?.75:.5))),
     diagnostics:window.PokemonTorreDrainV65?.()||null};
   },
   cast(slot=0,options={}){
    if(!engine||!battle?.active)return {error:'No active battle'};
    // Test harness must not remain in the tutorial/intro pause state.
    battle.paused=false;battle.energy=100;cooldowns[slot]=0;
    const selected=skillSet(current())[slot];
    if(options.staleShot&&engine.projectiles){
     // A slow old projectile can legitimately outlive the next move.
     // Regression: it must not block this cast's own collision.
     engine.projectiles.push({x:engine.w*.18,y:engine.h*.33,
      vx:0,vy:0,life:4,from:'player',tail:[],type:'water',
      power:1,r:1,shape:'orb'});
    }
    if(options.simulateWindup){
     // Simulates the user tapping a valid second move before a heavy attack
     // finishes preparing. It should queue, not disappear silently.
     engine.v33Windup={until:performance.now()+240};
    }
    const before=foe().hp;
    engine.useMove(slot);
    return {name:selected?.name,kind:selected?.kind,type:selected?.type,
     hpBefore:before,hpAfter:foe().hp,...this.snapshot()};
   },
   snapshot(){return {active:!!battle?.active,paused:!!battle?.paused,energy:battle?.energy,
    cooldowns:[...cooldowns],player:current()?.id,
    foe:foe()?.id,foeHp:foe()?.hp,playerHp:current()?.hp,
    moves:battle?.active?skillSet(current()).map(m=>({name:m.name,kind:m.kind,power:m.power,type:m.type})):[],
    projectiles:engine?.projectiles?.length||0,
    running:!!engine?.running,frameTime:engine?.time||0,
    combatClock:performance.now(),
    updateIsPrototype:engine?.update===BattleEngine.prototype.update,
    drawIsPrototype:engine?.draw===BattleEngine.prototype.draw,
    hasOwnUpdate:!!engine&&Object.hasOwn(engine,'update'),
    hasOwnDraw:!!engine&&Object.hasOwn(engine,'draw'),
    contactQueue:(engine?.v47ContactToLand||[]).map(x=>({
     at:x.at,until:x.until,hpBefore:x.hpBefore,
     ownerMatches:x.owner===current(),victimMatches:x.victim===foe()
    })),
    enemyInv:engine?.enemy?.inv||0,
    windup:engine?.v33Windup?.until||null,
    stats:window.PokemonTorreCombatV47()
   };}
  };
 }
})();